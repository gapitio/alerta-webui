<template>
  <v-data-table-server
    v-model:items-per-page="pagination.itemsPerPage"
    v-model="selected"
    show-select
    fixed-header
    style="max-height: calc(99vh - calc(48px + 43px + 64px + 58px))"
    :headers="customHeaders"
    :items="alerts"
    :items-length="pagination.totalItems!"
    :items-per-page-options="pagination.itemsPerPageOptions"
    :loading="isSearching"
    :row-props="rowProps"
    :cell-props="columnsProps"
    multi-sort
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    class="table"
    @update:options="setPagination"
  >
    <template
      v-for="timeObj in ['lastReceiveTime', 'createTime', 'receiveTime']"
      :key="timeObj"
      #[`item.${timeObj}`]="{item}"
    >
      <date-time :value="item[timeObj as 'lastReceiveTime']" />
    </template>
    <template
      v-for="desc in ['service', 'tags']"
      :key="desc"
      #[`item.${desc}`]="{item}"
    >
      {{ item[desc as 'service'].join(', ') }}
    </template>
    <template #[`item.note`]="{item}">
      {{ lastNote(item) }}
    </template>
    <template #[`item.timeout`]="{item}">
      {{ filters.hhmmss(item.timeout) }}
    </template>
    <template #[`item.timeoutLeft`]="{item}">
      {{ filters.hhmmss(timeoutLeft(item)) }}
    </template>
    <template #[`item.severity`]="{item}">
      <v-chip
        :class="[item.severity]"
        class="chip"
        label
        variant="flat"
        size="small"
      >
        {{ item.severity }}
      </v-chip>
    </template>
    <template #[`item.status`]="{item}">
      <v-chip 
        class="chip"
        label
        variant="flat"
        size="small"
      >
        {{ item.status }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{item}">
      <div
        class="action-buttons"
      >
        <v-btn
          v-if="isAcked(item.status) || isClosed(item.status)"
          density="compact"
          variant="text"
          icon="refresh"
          @click.stop="takeAction(item.id, 'open')"
        />
        <v-btn
          v-if="!isWatched(item.customTags)"
          density="compact"
          variant="text"
          icon="visibility"
          @click.stop="watchAlert(item.id)"
        />
        <v-btn
          v-if="isWatched(item.customTags)"
          density="compact"
          variant="text"
          icon="visibility_off"
          @click.stop="unwatchAlert(item.id)"
        />
        <v-btn
          v-if="isOpen(item.status)"
          density="compact"
          variant="text"
          icon="check"
          @click.stop="ackAlert(item.id)"
        />
        <v-btn
          v-if="isAcked(item.status)"
          density="compact"
          variant="text"
          icon="undo"
          @click.stop="takeAction(item.id, 'unack')"
        />
        <v-btn
          v-if="isOpen(item.status) || isAcked(item.status)"
          density="compact"
          variant="text"
          icon="schedule"
          @click.stop="shelveAlert(item.id)"
        />
        <v-btn
          v-if="isShelved(item.status)"
          density="compact"
          variant="text"
          icon="restore"
          @click.stop="takeAction(item.id, 'unshelve')"
        />
        <v-btn
          v-if="!isClosed(item.status) && isAlertAlarmModel()"
          density="compact"
          variant="text"
          icon="highlight_off"
          @click.stop="takeAction(item.id, 'close')"
        />
        <v-btn
          v-if="haveDeleteScope()"
          density="compact"
          variant="text"
          icon="delete"
          @click.stop="deleteAlert(item.id)"
        />
      </div>
    </template>            
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import debounce from 'lodash/debounce'
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import type { Store } from '@/plugins/store/types'
import { useFilters } from '@/filters'
import type { Alert, Pagination } from '@/plugins/store/types/alerts-types'


const store: Store = useStore()
const filters = useFilters()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const headersMap = computed(() => ({
  id: { title: t('AlertId'), key: 'id' },
  resource: { title: t('Resource'), key: 'resource' },
  event: { title: t('Event'), key: 'event' },
  environment: { title: t('Environment'), key: 'environment' },
  severity: { title: t('Severity'), key: 'severity' },
  correlate: { title: t('Correlate'), key: 'correlate' },
  status: { title: t('Status'), key: 'status' },
  service: { title: t('Service'), key: 'service' },
  group: { title: t('Group'), key: 'group' },
  value: { title: t('Value'), value: 'value' },
  tags: { title: t('Tags'), key: 'tags' },
  attributes: { title: t('Attribute'), key: 'attributes' },
  origin: { title: t('Origin'), key: 'origin' },
  type: { title: t('Type'), key: 'type' },
  createTime: { title: t('CreateTime'), key: 'createTime' },
  timeout: { title: t('Timeout'), key: 'timeout' },
  timeoutLeft: { title: t('TimeoutLeft'), key: 'timeoutLeft' },
  customer: { title: t('Customer'), key: 'customer' },
  duplicateCount: { title: t('Dupl'), key: 'duplicateCount' },
  repeat: { title: t('Repeat'), key: 'repeat' },
  previousSeverity: { title: t('PrevSeverity'), key: 'previousSeverity' },
  trendIndication: { title: t('TrendIndication'), key: 'trendIndication' },
  receiveTime: { title: t('ReceiveTime'), key: 'receiveTime' },
  duration: { title: t('Duration'), key: 'duration' },
  lastReceiveId: { title: t('LastReceiveId'), key: 'lastReceiveId', headerProps: { class: 'text-no-wrap' } },
  lastReceiveTime: { title: t('LastReceiveTime'), key: 'lastReceiveTime', headerProps: { class: 'text-no-wrap' } },
  text: { title: t('Description'), key: 'text' },
  note: { title: t('LastNote'), key: 'note', sortable: false },
  actions: { title: t('Actions'), key: 'actions', sortable: false, align: 'end'},
}))

const alerts = computed(() => {
  const alertList = store.getters['alerts/alerts']
  // if (props.filter.text) {
  //   const text = props.filter.text.toLowerCase()
  //   return alertList.filter((alert: Record<string, any>) =>
  //     Object.keys(alert).some((k) => alert[k]?.toString().toLowerCase().includes(text))
  //   )
  // } else {
    return alertList
  // }
})

const isSearching = computed(() => (store.state.alerts.isSearching ? 'primary' : false))
const pagination = computed({
  get: () => (store.state.alerts.pagination),
  set: (value) => store.dispatch('alerts/setPagination', value)
})

const lastNote = (item: Alert) => {
  const note = item.history.filter(h => ['note', 'dismiss'].includes(h.type)).pop()
  return note?.type == 'note' ? note.text : ''
}

const customHeaders = computed(() => {
  const configHeaders = store.state.config.columns.map(
    (c) => headersMap.value[c as keyof typeof headersMap.value] ?? { title: c.charAt(0).toUpperCase() + c.slice(1), value: 'attributes.' + c }
  )
  return [...configHeaders, headersMap.value.actions]
})

const selected = computed({
  get: () => store.state.alerts.selected,
  set: (value) => store.dispatch('alerts/updateSelected', value),
})

const ackTimeout = computed(() => store.getters.getPreference('ackTimeout'))
const shelveTimeout = computed(() => store.getters.getPreference('shelveTimeout'))
const username = computed(() => store.getters['auth/getUsername'])

function setPagination(value: Pagination) {
  store.dispatch('alerts/setPagination', value)
  store.dispatch('alerts/getAlerts')
  store.dispatch('alerts/getTags')
}

function timeoutLeft(item: any) {
  const ackedOrShelved = isShelved(item.status) || isAcked(item.status)
  const lastModified = ackedOrShelved && item.updateTime ? item.updateTime : item.lastReceiveTime
  const expireTime = moment(lastModified).add(item.timeout, 'seconds')
  return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
}

function rowProps({ item }: { item: any }) {
  return {
    class: `${item.status == 'open' ? item.severity : ''} severity hover-lighten text-no-wrap table-row`,
    onClick: () => selectItem(item),
  }
}

function columnsProps() {
  return {
    class: `table-column`,
  }
}

function selectItem(item: any) {
  if (!selected.value.length) {
    router.push({ path: `/alert/${item.id}`, query: { redirect: route.fullPath } })
  }
}

function isOpen(status: string) {
  return ['open', 'unack', 'NORM', 'UNACK', 'RTNUN'].includes(status)
}

function isWatched(tags: string[]) {
  return tags?.includes(`watch:${username.value}`)
}

function isAcked(status: string) {
  return ['ack', 'ACKED'].includes(status)
}

function isShelved(status: string) {
  return ['shelved', 'SHLVD'].includes(status)
}

function isClosed(status: string) {
  return status === 'closed'
}

function haveDeleteScope() {
  const scopes = store.getters['auth/scopes']
  const config = store.state.config
  if (config.delete_alert_scope_enforced) {
    return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('delete:alerts')
  } else {
    return scopes.some(s =>
      ['admin', 'admin:alerts', 'write', 'write:alerts', 'delete:alerts'].includes(s)
    )
  }
}

function isAlertAlarmModel() {
  return store.state.config.alarm_model.name.includes('ISA 18')
}

// Debounced methods
const takeAction = debounce((id: string, action: string) => {
  store.dispatch('alerts/takeAction', [id, action, ''])
    .then(() => store.dispatch('alerts/getAlerts'))
}, 200, { leading: true, trailing: false })

const ackAlert = debounce((id: string) => {
  store.dispatch('alerts/takeAction', [id, 'ack', '', ackTimeout.value!])
    .then(() => store.dispatch('alerts/getAlerts'))
}, 200, { leading: true, trailing: false })

const shelveAlert = debounce((id: string) => {
  store.dispatch('alerts/takeAction', [id, 'shelve', '', shelveTimeout.value!])
    .then(() => store.dispatch('alerts/getAlerts'))
}, 200, { leading: true, trailing: false })

const watchAlert = debounce((id: string) => {
  store.dispatch('alerts/watchAlert', id)
    .then(() => store.dispatch('alerts/getAlerts'))
}, 200, { leading: true, trailing: false })

const unwatchAlert = debounce((id: string) => {
  store.dispatch('alerts/unwatchAlert', id)
    .then(() => store.dispatch('alerts/getAlerts'))
}, 200, { leading: true, trailing: false })

const deleteAlert = debounce((id: string) => {
  if (confirm(t('ConfirmDelete'))) {
    store.dispatch('alerts/deleteAlert', id)
      .then(() => store.dispatch('alerts/getAlerts'))
  }
}, 200, { leading: true, trailing: false })

</script>
