<template>
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('NotificationRules') }}
        <information-dialog :info="headers" :title="t('NotificationRulesInfo')">
          <template #tags>
            <tags-information />
          </template>
          <template #triggers>
            <trigger-information status />
          </template>
        </information-dialog>
        <v-btn
          v-has-perms="'write:notification.rules'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px"
          :text="t('AddNotificationRule')"
          @click="newDialog = true"
        />
      </h1>
    </v-col>
    <v-col cols="auto" align-self="center">
      <notification-rules-filter />
    </v-col>
  </v-row>

  <change-active-state
    v-if="selectedItem"
    :dialog="activeDialog"
    :item="selectedItem"
    update="nr"
    @close="closeActive"
  />
  <notification-rule-add :dialog="newDialog" :item="selectedItem" @close="closeNew" />
  <change-active-state-bulk :dialog="bulkDialog" :activate="bulkActivate" type="nr" @close="closeBulk" />
  <v-card variant="flat">
    <v-card-title class="title">
      <v-row>
        <v-col cols="auto">
          <g-switch
            :model-value="status.active"
            :label="t('ShowActive')"
            class="switch-primary"
            @update:model-value="
              (value: boolean) => store.dispatch('notificationRules/setActiveFilter', {active: value})
            "
          />
        </v-col>
        <v-col cols="auto">
          <g-switch
            :model-value="status.inactive"
            :label="t('ShowDeactivated')"
            color="primary"
            @update:model-value="
              (value: boolean) => store.dispatch('notificationRules/setActiveFilter', {inactive: value})
            "
          />
        </v-col>
        <v-col cols="2" />
        <v-col v-if="selectableRows" cols="8">
          <span class="subheading" style="margin-left: 10px"> {{ selected.length }} {{ t('selected') }} </span>
          <v-tooltip :text="t('Activate')">
            <template #activator="{props}">
              <v-btn icon="check" variant="text" v-bind="props" @click="openBulk(true)" />
            </template>
          </v-tooltip>

          <v-tooltip :text="t('Deactivate')">
            <template #activator="{props}">
              <v-btn icon="highlight_off" variant="text" v-bind="props" @click="openBulk(false)" />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row class="pt-0 mt-0">
        <div v-for="(f, d) in filter" :key="d">
          <v-col v-if="typeof f == 'object' && (f?.length ?? 0) > 0" cols="auto">
            <v-chip v-for="a in f" :key="a" variant="flat" class="chip" size="small"> {{ d }}: {{ a }} </v-chip>
          </v-col>
          <v-col v-else-if="typeof f == 'string'" cols="auto">
            <v-chip variant="flat" class="chip" size="small"> {{ d }}: {{ f }} </v-chip>
          </v-col>
        </div>
      </v-row>
    </v-card-title>

    <v-data-table-server
      v-model:sort-by="pagination.sortBy"
      v-model:items-per-page="pagination.itemsPerPage"
      v-model="selected"
      show-select
      fixed-header
      fixed-footer
      style="max-height: 85vh"
      :headers="computedHeaders"
      :items="notificationRules"
      :items-length="pagination.totalItems ?? 0"
      :items-per-page-options="pagination.itemsPerPageOptions"
      :row-props="{class: 'bg-surface-tertiary table-row'}"
      :cell-props="{class: 'table-column'}"
      multi-sort
      sort-desc-icon="arrow_drop_down"
      sort-asc-icon="arrow_drop_up"
      class="table"
      @update:options="setPagination"
    >
      <template #[`item.active`]="{item}">
        <g-switch
          v-model="item.active"
          v-has-perms.disable="'write:notification.rules'"
          @update:model-value="(val: boolean) => editActive({...item, active: val})"
        />
      </template>
      <template #[`item.receivers`]="{item}">
        <v-chip
          v-for="number in [
            ...item.receivers,
            ...item.usersEmails.filter(e => emails[e] !== undefined).map(e => emails[e]),
            // ...users.filter(b => item.userIds.includes(b.id!)).map(b => b.name),
            ...groups.filter(b => item.groupIds.includes(b.id!)).map(b => b.name)
          ]"
          :key="number!"
          class="chip"
          size="small"
          variant="flat"
        >
          {{ number }}
        </v-chip>
        <v-chip
          v-for="rec in [
            ...item.groupIds.filter(id => !groups.map(({id}) => id).includes(id)),
            ...item.usersEmails.filter(e => emails[e] === undefined)
            // ...item.userIds.filter(id => !users.map(({id}) => id).includes(id))
          ]"
          :key="rec"
          class="chip critical"
          variant="flat"
          size="small"
        >
          {{ rec }}
        </v-chip>
      </template>

      <template #[`item.triggers`]="{item}">
        <v-container v-for="(trigger, index) in item.triggers" :key="index" grid-list-md style="padding: 1px">
          <v-row no-gutters>
            <v-col v-if="!emptyArray(trigger.from_severity)" cols="12">
              From:
              <v-chip
                v-for="severity in trigger.from_severity"
                :key="severity"
                class="severity chip"
                :class="severity"
                size="small"
              >
                {{ severity }}
              </v-chip>
            </v-col>
            <v-col v-if="!emptyArray(trigger.to_severity)" cols="12">
              To:
              <v-chip
                v-for="severity in trigger.to_severity"
                :key="severity"
                class="severity chip"
                :class="severity"
                size="small"
              >
                {{ severity }}
              </v-chip>
            </v-col>
            <v-col v-if="!emptyArray(trigger.status!)" cols="12">
              Status:
              <v-chip v-for="severity in trigger.status" :key="severity" class="chip" outline size="small">
                {{ severity }}
              </v-chip>
            </v-col>
            <v-col v-if="trigger.text"> Text: {{ trigger.text }} </v-col>
          </v-row>
          <v-divider v-if="index < item.triggers.length - 1" class="border-secondary mt-1 mb-1" />
        </v-container>
      </template>

      <template v-for="chipItem in ['days', 'service']" #[`item.${chipItem}`]="{item}">
        <v-chip v-for="chip in item[chipItem as 'days' | 'service']" :key="chip" outline size="x-small">
          {{ chip }}
        </v-chip>
      </template>

      <template #[`item.reactivate`]="{item}">
        <div v-if="item.reactivate">
          <span style="white-space: nowrap">{{
            filters.date(item.reactivate, 'local', store.getters.getConfig('dates').mediumDate)
          }}</span>
          <br />
          ({{ filters.until(item.reactivate) }})
        </div>
      </template>

      <template v-for="tagItem in ['tags', 'excludedTags']" #[`item.${tagItem}`]="{item}">
        <v-container
          v-for="(tag, index) in item[tagItem as 'tags' | 'excludedTags']"
          :key="index"
          grid-list-md
          style="padding: 1px"
        >
          <v-row>
            <v-col v-if="!emptyArray(tag.all)" cols="12">
              AND:
              <v-chip v-for="allTag in tag.all" :key="allTag" size="x-small">
                {{ allTag }}
              </v-chip>
            </v-col>
            <v-col v-if="!emptyArray(tag.any)" cols="12">
              OR:
              <v-chip v-for="anyTag in tag.any" :key="anyTag" size="x-small">
                {{ anyTag }}
              </v-chip>
            </v-col>
          </v-row>
          <v-divider v-if="index < item[tagItem as 'tags' | 'excludedTags'].length - 1" />
        </v-container>
      </template>
      <template v-for="desc in ['startTime', 'endTime']" #[`item.${desc}`]="{item}">
        {{
          item[desc as 'startTime' | 'endTime'] ? filters.hhmmUtcToLocal(item[desc as 'startTime' | 'endTime']!) : null
        }}
      </template>
      <template #[`item.actions`]="{item}">
        <v-btn
          v-has-perms.disable="'write:notification.rules'"
          icon="edit"
          density="compact"
          variant="text"
          @click="editItem(item)"
        />
        <v-btn
          v-has-perms.disable="'write:notification.rules'"
          icon="content_copy"
          density="compact"
          variant="text"
          @click="copyItem(item)"
        />
        <v-btn
          v-has-perms.disable="'write:notification.rules'"
          icon="delete"
          density="compact"
          variant="text"
          @click="deleteItem(item)"
        />
        <v-btn
          v-has-perms.disable="'read:notification.rules'"
          icon="history"
          density="compact"
          variant="text"
          @click="router.push({path: `/notificationrules/${item.id}`})"
        />
      </template>
      <!-- <template #no-data>
        <v-alert
          :value="true"
          class="alert"
          icon="warning"
        >
          {{ t('NoDisplay') }}
        </v-alert>
      </template> -->
    </v-data-table-server>
  </v-card>
</template>

<script lang="ts" setup>
import moment from 'moment'
import {computed, ref, type Ref} from 'vue'
import {useStore} from 'vuex'
import type {Store} from '@/plugins/store/types'
import {useFilters} from '@/filters'
import {useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'
import type {Pagination} from '@/plugins/store/types/alerts-types'
import type {NotificationRule} from '@/plugins/store/types/notificationRule-types'

const store: Store = useStore()
const filters = useFilters()
const router = useRouter()
const {t} = useI18n()

const selectedItem: Ref<NotificationRule | null> = ref(null)

const status = computed(() => store.state.notificationRules.activeFilter)
const activeDialog = ref(false)
const newDialog = ref(false)
const bulkDialog = ref(false)
const bulkActivate = ref(false)
const headers = ref([
  {title: t('Active'), key: 'active', info: [t('ActiveInfoTrue'), t('ActiveInfoFalse')]},
  {title: t('Reactivate'), key: 'reactivate', info: t('ReactivateDateInfo')},
  {title: t('Customer'), key: 'customer'},
  {title: t('Delay'), key: 'delay', info: t('DelayTimeInfo')},
  {title: t('Name'), key: 'name', info: t('NameInfo')},
  {title: t('Environment'), key: 'environment', info: t('EnvironmentInfo')},
  {title: t('Channel'), key: 'channelId', info: t('NotificationHistoryChannel')},
  {title: t('Receivers'), key: 'receivers', info: t('ReceiversInfo')},
  {title: t('OnCall'), key: 'useOnCall', info: [t('UseOnCallInfoTrue'), t('UseOnCallInfoFalse')]},
  {title: t('Triggers'), key: 'triggers'},
  {title: t('Days'), key: 'days', info: t('DaysInfo')},
  {title: t('Start'), key: 'startTime', info: t('StartTimeInfo')},
  {title: t('End'), key: 'endTime', info: t('EndTimeInfo')},
  {title: t('Service'), key: 'service', info: t('ServicesInfo')},
  {title: t('Resource'), key: 'resource', info: t('ResourceInfo')},
  {title: t('Event'), key: 'event', info: t('EventInfo')},
  {title: t('Group'), key: 'group', info: t('GroupInfo')},
  {title: t('Tags'), key: 'tags'},
  {title: t('ExcludedTags'), key: 'excludedTags'},
  {title: t('User'), key: 'user'},
  {title: 'Text', key: 'text'},
  {title: t('Actions'), key: 'actions', sortable: false}
])

const filter = computed(() => store.state.notificationRules.filter)

const notificationRules = computed(() =>
  store.state.notificationRules.items.map(b => {
    const period = {
      startTime: '',
      endTime: ''
    }
    if (b.startTime !== null && b.endTime !== null) {
      const sTime = new Date()
      const eTime = new Date()
      sTime.setUTCHours(parseInt(b.startTime.substr(0, 2)), parseInt(b.startTime.substr(3)))
      eTime.setUTCHours(parseInt(b.endTime.substr(0, 2)), parseInt(b.endTime.substr(3)))
      period.startTime = `${('0' + sTime.getHours()).slice(-2)}:${('0' + sTime.getMinutes()).slice(-2)}`
      period.endTime = `${('0' + eTime.getHours()).slice(-2)}:${('0' + eTime.getMinutes()).slice(-2)}`
    }
    const reactivate = b.reactivate ? moment(b.reactivate) : null

    return Object.assign(
      {...b},
      {
        period: period,
        timeObj: {
          time: b.delayTime,
          interval: 'second'
        },
        text: b.text === null ? '' : b.text.replace(/%\(([\w\[\]\. ]*)\)s/g, '{$1}'),
        triggers: b.triggers.map(a => {
          return {...a, text: a.text !== null ? a.text!.replace(/%\(([\w\[\]\. ]*)\)s/g, '{$1}') : a.text}
        })
      },
      reactivate ? {reactivateDate: reactivate.format('YYYY-MM-DD'), reactivateTime: reactivate.format('HH:mm')} : {}
    )
  })
)

const pagination = computed({
  get: () => store.getters['notificationRules/pagination'],
  set: value => store.dispatch('notificationRules/setPagination', value)
})
const groups = computed(() => store.state.notificationGroups.items)
const computedHeaders = computed(() =>
  headers.value.filter(h => (store.state.config.customer_views ? true : h.key != 'customer'))
)
const emails = computed(() => Object.fromEntries(store.state.users.emails.map(e => [e.email, e.name])))
const selected = computed({
  get: () => store.state.notificationRules.selected,
  set: value => store.dispatch('notificationRules/updateSelected', value)
})
const selectableRows = computed(() => selected.value.length > 0)

function emptyArray(arr: any[]) {
  for (const _ in arr) {
    return false
  }
  return true
}

function editActive(item: NotificationRule) {
  selectedItem.value = item
  activeDialog.value = true
}

function editItem(item: NotificationRule) {
  selectedItem.value = item
  newDialog.value = true
}

function copyItem(item: NotificationRule) {
  selectedItem.value = {...item, id: undefined}
  newDialog.value = true
}

function closeActive() {
  activeDialog.value = false
  selectedItem.value = null
}

function openBulk(activate: boolean) {
  bulkActivate.value = activate
  bulkDialog.value = true
}

function closeBulk() {
  bulkDialog.value = false
  selected.value = []
}

function closeNew() {
  newDialog.value = false
  selectedItem.value = null
}

function deleteItem(item: NotificationRule) {
  confirm(t('ConfirmDelete')) && store.dispatch('notificationRules/deleteNotificationRule', item.id!)
}

const paginationTimeout = ref(0)
async function setPagination(value: Pagination) {
  if (paginationTimeout.value) clearTimeout(paginationTimeout.value)
  if (store.state.notificationRules.isLoading) {
    paginationTimeout.value = setTimeout(() => setPagination(value), 10)
    return
  }
  await store.dispatch('notificationRules/setPagination', value)
}
</script>
