<template>
  <h1>
    {{ t('Blackouts') }}
    <g-text-field
      v-model="search"
      prepend-inner-icon="search"
      :label="t('Search')"
      clearable
      hide-details
      style="position: absolute; top: 2.5px; right: calc(25vw); width: 40vw; background: white"
    />
    <v-btn
      v-has-perms:disabled="'write:blackouts'"
      prepend-icon="add"
      class="no-cap-btn bg-primary-600"
      style="position: absolute; right: 10px"
      :text="t('AddBlackout')"
      @click="newDialog = true"
    />
  </h1>
  <blackout-add :dialog="newDialog" :item="selectedItem" @close="closeNew" />
  <v-card variant="flat">
    <v-card-title class="title" style="padding-left: 16px">
      <v-row>
        <v-col cols="auto">
          <g-switch v-model="showActive" :label="t('ShowActive')" class="switch-primary" />
        </v-col>
        <v-col cols="auto">
          <g-switch v-model="showPending" :label="t('ShowPending')" class="switch-primary" />
        </v-col>
        <v-col cols="auto">
          <g-switch v-model="showExpired" :label="t('ShowExpired')" class="switch-primary" />
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
    </v-card-title>

    <v-data-table
      v-model:sort-by="sortBy"
      class="table"
      :search="search"
      :row-props="{class: 'bg-surface-tertiary table-row'}"
      :cell-props="{class: 'table-column'}"
      :headers="computedHeaders"
      style="max-height: calc(100vh - calc(74px + 64px + 54px))"
      fixed-header
      :items="items"
      sort-desc-icon="arrow_drop_down"
      sort-asc-icon="arrow_drop_up"
    >
      <template v-for="desc in ['service', 'tags']" #[`item.${desc}`]="{item}">
        {{ item[desc as 'service'].join(', ') }}
      </template>
      <template #[`item.status`]="{item}">
        <v-icon>{{ getStatusIcon(item) }}</v-icon>
      </template>
      <template v-for="desc in ['startTime', 'endTime']" #[`item.${desc}`]="{item}" :key="desc">
        <date-time :value="item[desc as 'startTime']" />
      </template>
      <template #[`item.actions`]="{item}">
        <v-btn
          v-has-perms.disable="'write:blackouts'"
          icon="edit"
          density="compact"
          variant="text"
          @click="editItem(item)"
        />
        <v-btn
          v-has-perms.disable="'write:blackouts'"
          icon="content_copy"
          density="compact"
          variant="text"
          @click="copyItem(item)"
        />
        <v-btn
          v-has-perms.disable="'write:blackouts'"
          icon="delete"
          density="compact"
          variant="text"
          @click="deleteItem(item)"
        />
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
import {computed, ref, watch, type Ref} from 'vue'
import {useStore} from 'vuex'
import type {Store} from '@/plugins/store/types'
import {useI18n} from 'vue-i18n'
import type {Blackout} from '@/plugins/store/types/blackout-types'
import type {SortBy} from '@/plugins/store/types/alerts-types'

definePage({
  meta: {
    title: 'Blackouts',
    requiresAuth: true
  }
})

const store: Store = useStore()
const {t} = useI18n()

const selectedItem: Ref<Blackout | null> = ref(null)

const search = ref('')
const showActive = ref(true)
const showPending = ref(true)
const showExpired = ref(true)
const newDialog = ref(false)
const bulkDialog = ref(false)
const bulkActivate = ref(false)
const headers = ref<{title: string; key: keyof Blackout | 'actions'; info?: string | string[]; sortable?: boolean}[]>([
  {title: t('Customer'), key: 'customer'},
  {title: t('Status'), key: 'status'},
  {title: t('Environment'), key: 'environment', info: t('EnvironmentInfo')},
  {title: t('Start'), key: 'startTime', info: t('StartTimeInfo')},
  {title: t('End'), key: 'endTime', info: t('EndTimeInfo')},
  {title: t('Service'), key: 'service', info: t('ServicesInfo')},
  {title: t('Resource'), key: 'resource', info: t('ResourceInfo')},
  {title: t('Event'), key: 'event', info: t('EventInfo')},
  {title: t('Group'), key: 'group', info: t('GroupInfo')},
  {title: t('Tags'), key: 'tags'},
  {title: t('User'), key: 'user'},
  {title: 'Description', key: 'text'},
  {title: t('Actions'), key: 'actions', sortable: false}
])
const sortBy = ref<SortBy[]>([{key: 'startTime', order: 'asc'}])

const items = computed(() =>
  store.state.blackouts.items.filter(b => (b.status ? showFilter.value.includes(b.status) : true))
)

const computedHeaders = computed(() =>
  headers.value.filter(h => (store.state.config.customer_views ? true : h.key != 'customer'))
)
const showFilter = computed<('expired' | 'active' | 'pending')[]>(() => {
  const filter: ('expired' | 'active' | 'pending')[] = []
  if (showExpired.value) filter.push('expired')
  if (showActive.value) filter.push('active')
  if (showPending.value) filter.push('pending')
  return filter
})

const selected = computed({
  get: () => store.state.notificationRules.selected,
  set: value => store.dispatch('notificationRules/updateSelected', value)
})
const selectableRows = computed(() => selected.value.length > 0)

const getStatusIcon = (item: Blackout) =>
  item.status == 'expired' ? 'close' : item.status == 'active' ? 'check' : 'pause'

function editItem(item: Blackout) {
  selectedItem.value = item
  newDialog.value = true
}

function copyItem(item: Blackout) {
  selectedItem.value = {...item, id: undefined}
  newDialog.value = true
}

function openBulk(activate: boolean) {
  bulkActivate.value = activate
  bulkDialog.value = true
}

function closeNew() {
  newDialog.value = false
  selectedItem.value = null
}

function deleteItem(item: Blackout) {
  confirm(t('ConfirmDelete')) && store.dispatch('blackouts/deleteBlackout', item.id!)
}
const timeout = ref<number | undefined>(undefined)
const interval = computed(() => store.getters.getPreference('refreshInterval'))
const refresh = computed(() => store.state.refresh)

watch(refresh, val => {
  if (!val) return
  getItems()
})

function getItems() {
  if (timeout.value) clearTimeout(timeout.value)
  store.dispatch('blackouts/getBlackouts')
  timeout.value = setTimeout(getItems, interval.value)
}

getItems()
</script>
