<template>
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('EscalationRule') }}
        <information-dialog 
          :info="headers"
          :title="t('EscalationRuleInfo')"
        >
          <template #tags>
            <tags-information />
          </template>
          <template #triggers>
            <trigger-information />
          </template>
        </information-dialog>
        <v-btn
          v-has-perms="'write:escalation_rules'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          color=""
          style="position: absolute; right: 10px;"
          :text="t('AddEscalationRule')"
          @click="newDialog = true"
        />
      </h1>
    </v-col>
    <v-col
      cols="auto"
      align-self="center"
    >
      <escalation-rules-filter />
    </v-col>
  </v-row>
  
  <change-active-state
    v-if="selectedItem"
    :dialog="activeDialog"
    :item="selectedItem"
    update="er"
    hide-time
    @close="closeActive"
  />
  <escalation-rule-add
    :dialog="newDialog"
    :item="selectedItem"
    @close="closeNew"
  />
  <change-active-state-bulk 
    :dialog="bulkDialog"
    :activate="bulkActivate"
    type="er"
    hide-time
    @close="closeBulk"
  />
  <v-card variant="flat">
    <v-card-title class="title">
      <v-row>
        <v-col
          cols="auto"
        >
          <g-switch 
            :model-value="status.active"
            :label="t('ShowActive')"
            class="switch-primary"
            @update:model-value="(value: boolean) => store.dispatch('escalationRules/setActiveFilter', {active: value})"
          />
        </v-col>
        <v-col 
          cols="auto"
        >
          <g-switch 
            :model-value="status.inactive"
            :label="t('ShowDeactivated')"
            color="primary"
            @update:model-value="(value: boolean) => store.dispatch('escalationRules/setActiveFilter', {inactive: value})"
          />
        </v-col>
        <v-col cols="2" />
        <v-col 
          v-if="selectableRows"
          cols="8"
        >
          <span
            class="subheading"
            style="margin-left: 10px;"
          >
            {{ selected.length }} {{ t('selected') }}
          </span>
          <v-tooltip :text="t('Activate')">
            <template #activator="{props}">
              <v-btn
                icon="check"
                variant="text"
                v-bind="props"
                @click="openBulk(true)"
              />
            </template>
          </v-tooltip>
          
          <v-tooltip :text="t('Deactivate')">
            <template #activator="{props}">
              <v-btn
                icon="highlight_off"
                variant="text"
                v-bind="props"
                @click="openBulk(false)"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-title>

    <v-data-table-server
      v-model:sort-by="pagination.sortBy"
      v-model:items-per-page="pagination.itemsPerPage"
      v-model="selected"
      show-select
      fixed-header
      fixed-footer
      style="max-height: 85vh;"
      :headers="computedHeaders"
      :items="escalationRules"
      :items-length="pagination.totalItems ?? 0"
      :items-per-page-options="pagination.itemsPerPageOptions"
      :loading="isLoading"
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
          v-has-perms.disable="'write:escalation_rules'"
          @update:model-value="(val: boolean) => editActive({...item, active: val})"
        />
      </template>
      
      <template #[`item.triggers`]="{item}">
        <v-container
          v-for="(trigger, index) in item.triggers"
          :key="index"
          grid-list-md
          style="padding: 1px;"
        >
          <v-row no-gutters>
            <v-col
              v-if="!emptyArray(trigger.from_severity)"
              cols="12"
            >
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
            <v-col
              v-if="!emptyArray(trigger.to_severity)"
              cols="12"
            >
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
          </v-row>
          <v-divider 
            v-if="index < item.triggers.length - 1"
            class="border-secondary mt-1 mb-1"
          />
        </v-container>
      </template>
      
      <template
        v-for="chipItem in ['days', 'service']"
        #[`item.${chipItem}`]="{item}"
      >
        <v-chip
          v-for="chip in item[chipItem as 'days' | 'service']"
          :key="chip"
          outline
          size="x-small"
        >
          {{ chip }}
        </v-chip>
      </template>

      <template 
        v-for="tagItem in ['tags', 'excludedTags']"
        #[`item.${tagItem}`]="{item}"
      >
        <v-container
          v-for="(tag, index) in item[tagItem as 'tags' | 'excludedTags']"
          :key="index"
          grid-list-md
          style="padding: 1px;"
        >
          <v-row>
            <v-col
              v-if="!emptyArray(tag.all)"
              cols="12"
            >
              AND:
              <v-chip
                v-for="allTag in tag.all"
                :key="allTag"
                size="x-small"
              >
                {{ allTag }}
              </v-chip>
            </v-col>
            <v-col
              v-if="!emptyArray(tag.any)"
              cols="12"
            >
              OR:
              <v-chip
                v-for="anyTag in tag.any"
                :key="anyTag"
                size="x-small"
              >
                {{ anyTag }}
              </v-chip>
            </v-col>
          </v-row>
          <v-divider v-if="index < item[tagItem as 'tags' | 'excludedTags'].length - 1" />
        </v-container>
      </template>
      <template 
        v-for="desc in ['startTime', 'endTime']"
        #[`item.${desc}`]="{item}"
      >
        {{ item[desc as 'startTime' | 'endTime'] ? filters.hhmmUtcToLocal(item[desc as 'startTime' | 'endTime']!) : null }}
      </template>
      <template #[`item.actions`]="{item}">
        <v-btn
          v-has-perms.disable="'write:escalation_rules'"
          icon="edit"
          density="compact"
          variant="text"
          @click="editItem(item)"
        />
        <v-btn
          v-has-perms.disable="'write:escalation_rules'"
          icon="content_copy"
          density="compact"
          variant="text"
          @click="copyItem(item)"
        />
        <v-btn
          v-has-perms.disable="'write:escalation_rules'"
          icon="delete"
          density="compact"
          variant="text"
          @click="deleteItem(item)"
        />
      </template>
      <!-- <template #no-data>
        <v-alert
          :value="true"
          color="error"
          icon="warning"
        >
          {{ t('NoDisplay') }}
        </v-alert>
      </template> -->
    </v-data-table-server>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch, type Ref } from 'vue'
import { useStore } from 'vuex';
import type { Store } from '@/plugins/store/types';
import { useFilters } from '@/filters';
import { useI18n } from 'vue-i18n';
import type { Pagination } from '@/plugins/store/types/alerts-types';
import type { EscalationRule } from '@/plugins/store/types/escalationRule-types';

const store: Store = useStore()
const filters = useFilters()
const { t } = useI18n()

const emit=defineEmits(['update'])

const selectedItem: Ref<EscalationRule | null> = ref(null)

const status = computed(() => store.state.escalationRules.activeFilter)
const activeDialog = ref(false)
const newDialog = ref(false)
const bulkDialog = ref(false)
const bulkActivate = ref(false)
const headers = ref<{title: string, key: keyof EscalationRule | 'actions', info?: string | string[], sortable?: false}[]>([
  { title: t('Active'), key: 'active', info: [t('EscalationActiveInfoTrue'), t('EscalationActiveInfoFalse') ] },
  { title: t('Customer'), key: 'customer' },
  { title: t('Environment'), key: 'environment', info: t('EscalationEnvironmentInfo') },
  { title: t('Time'), key: 'time', info: t('EscalationTimeInfo') },
  { title: t('Triggers'), key: 'triggers' },
  { title: t('Days'), key: 'days', info: t('EscalationDaysInfo') },
  { title: t('Start'), key: 'startTime', info: t('EscalationStartTimeInfo') },
  { title: t('End'), key: 'endTime', info: t('EscalationEndTimeInfo') },
  { title: t('Service'), key: 'service', info: t('EscalationServicesInfo') },
  { title: t('Resource'), key: 'resource', info: t('EscalationResourceInfo') },
  { title: t('Event'), key: 'event', info: t('EscalationEventInfo') },
  { title: t('Group'), key: 'group', info: t('EscalationGroupInfo') },
  { title: t('Tags'), key: 'tags' },
  { title: t('ExcludedTags'), key: 'excludedTags', info: t('ExcludedTagsInfo') },
  { title: t('User'), key: 'user'},
  { title: t('Actions'), key: 'actions', sortable: false }
])
const editedId = ref('')

const escalationRules = computed(() =>
  store.state.escalationRules.items
    .map(b => {
      const period = {
        startTime: '',
        endTime: ''
      }
      if (b.startTime !== null && b.endTime !== null) {
        const sTime = new Date()
        const eTime = new Date()
        sTime.setUTCHours(
          parseInt(b.startTime.substr(0, 2)),
          parseInt(b.startTime.substr(3))
        )
        eTime.setUTCHours(
          parseInt(b.endTime.substr(0, 2)),
          parseInt(b.endTime.substr(3))
        )
        period.startTime = `${('0' + sTime.getHours()).slice(-2)}:${(
          '0' + sTime.getMinutes()
        ).slice(-2)}`
        period.endTime = `${('0' + eTime.getHours()).slice(-2)}:${(
          '0' + eTime.getMinutes()
        ).slice(-2)}`
      }

      return Object.assign(
        { ...b },
        {
          period: period,
        },
      )
    })
)
const pagination = computed({
  get:() => store.getters['escalationRules/pagination'],
  set: (value) => store.dispatch('escalationRules/setPagination', value)
})
const computedHeaders = computed(() => headers.value.filter(h => store.state.config.customer_views ? true : h.key != 'customer'))
const isLoading = computed(() => store.state.escalationRules.isLoading)

const selected = computed({
  get: () => store.state.escalationRules.selected,
  set: (value) => store.dispatch('escalationRules/updateSelected', value)
})
const selectableRows = computed(() => selected.value.length > 0)




watch(pagination, ()=> emit('update'), {deep: true})

function emptyArray(arr: any[]) {
  for (const _ in arr) {
    return false
  }
  return true
}

function editActive(item: EscalationRule) {
  editedId.value = item.id!
  selectedItem.value =  item
  activeDialog.value = true
}

function editItem(item: EscalationRule) {
  editedId.value = item.id!
  selectedItem.value =  item
  newDialog.value = true
}

function copyItem(item: EscalationRule) {
  editedId.value = item.id!
  selectedItem.value =  {...item, id: undefined}
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

function deleteItem(item: EscalationRule) {
  confirm(t('ConfirmDelete')) &&
  store.dispatch(
    'escalationRules/deleteEscalationRule',
    item.id!
  )
}

function setPagination(value: Pagination) {
  store.dispatch('escalationRules/setPagination', value)
  store.dispatch('escalationRules/getEscalationRules')
}

</script>
