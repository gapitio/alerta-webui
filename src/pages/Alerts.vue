<template>
  <audio ref="audio" :src="audioUrl" />
  <g-combobox
    v-model="query"
    prepend-inner-icon="search"
    append-inner-icon="push_pin"
    :label="t('Search')"
    variant="outlined"
    clearable
    hide-details
    :items="userQueries"
    validate-on="submit"
    style="position: absolute; top: 2.5px; right: calc(25vw); width: 40vw; background: white"
    delete-items
    @keydown.enter="(e: any) => setSearch(e.target.value)"
    @click:prepend-inner="setSearch(query ?? '')"
    @click:append-inner="saveSearch(query ?? '')"
    @click:clear="clearSearch"
    @select-item="(item: any) => setSearch(item.value)"
    @delete-item="(item: any) => deleteSearch(item.value)"
  />

  <v-card variant="flat">
    <v-row>
      <v-col cols="auto">
        <h1>{{ t('Alerts') }}</h1>
      </v-col>
      <v-col cols="auto" align-self="center">
        <alerts-filter />
      </v-col>
      <v-col v-if="selected.length > 0" align-self="center">
        <v-btn icon="visibility" variant="text" @click.stop="watchAlerts" />
        <v-btn icon="visibility_off" variant="text" @click.stop="unwatchAlerts" />
        <v-btn icon="check" variant="text" @click.stop="takeAction('ack', ackTimeout)" />
        <v-btn icon="undo" variant="text" @click.stop="takeAction('unack')" />
        <v-btn icon="schedule" variant="text" @click.stop="takeAction('shelve', shelveTimeout)" />
        <v-btn icon="restore" variant="text" @click.stop="takeAction('unshelve')" />
        <v-btn v-if="isAlertAlarmModel" icon="highlight_off" variant="text" @click.stop="takeAction('close')" />
        <v-btn v-if="haveDeleteScope()" icon="delete" variant="text" @click.stop="deleteAlerts" />
        <notes-add />
        <v-btn v-if="haveDeleteScope()" icon="scan_delete" variant="text" @click.stop="removeLasNotes" />
      </v-col>
    </v-row>

    <v-tabs v-model="currentTab" slider-color="link-active">
      <v-tab v-for="env in environments" :key="env" :value="env" class="big-font bold no-cap-btn" @click="setEnv(env)">
        {{ env }}&nbsp;({{ environmentCounts[env] || 0 }})
      </v-tab>
      <div style="position: absolute; right: 0px">
        <v-tooltip :text="t('DownloadAsCsv')">
          <template #activator="{props}">
            <v-btn v-bind="props" icon="download" variant="text" @click="toCsv(alerts)" />
          </template>
        </v-tooltip>
      </div>
    </v-tabs>
    <v-row class="mt-0">
      <template v-for="(f, d) in filter" :key="d">
        <v-col v-if="d == 'dateRange' && f && isDateRange(f)" cols="auto">
          <v-chip v-if="(f.from ?? 0) < 0" variant="flat" class="chip" size="small">
            {{ d }}: {{ f.from! / -3600 }} hours
          </v-chip>
          <template v-else-if="f.select">
            <v-chip v-for="desc in ['from', 'to']" :key="desc" variant="flat" class="chip" size="small">
              {{ d }}.{{ desc }}: &nbsp;
              <date-time :value="moment.unix(f[desc as 'from' | 'to']!).utc()" no-break />
            </v-chip>
          </template>
        </v-col>
        <v-col v-else-if="typeof f == 'object' && ((f as string[])?.length ?? 0) > 0" cols="auto">
          <v-chip v-for="a in f" :key="a" variant="flat" class="chip" size="small"> {{ d }}: {{ a }} </v-chip>
        </v-col>
        <v-col v-else-if="typeof f == 'string'" cols="auto">
          <v-chip variant="flat" class="chip" size="small"> {{ d }}: {{ f }} </v-chip>
        </v-col>
      </template>
    </v-row>

    <alert-list :filter="filter" />
  </v-card>
</template>

<script setup lang="ts">
import {ref, computed, watch, onUnmounted} from 'vue'
import {useStore} from 'vuex'
import {useRoute, useRouter} from 'vue-router'
import {generateCsv, download, mkConfig} from 'export-to-csv'
import {useI18n} from 'vue-i18n'
import utils from '@/common/utils'
import type {Query, SortBy} from '@/plugins/store/types/alerts-types'
import type {State, Store} from '@/plugins/store/types'
import moment from 'moment'
import type {DateRange} from '@/plugins/store/types/notificationHistory-types'

definePage({
  meta: {
    title: 'Alerts',
    requiresAuth: true
  }
})
const store: Store = useStore<State>()
const route = useRoute()
const router = useRouter()
const {t} = useI18n()

const timeout = ref<ReturnType<typeof setTimeout> | undefined>(undefined)
const tab = ref('All')
const audio = ref<null | HTMLAudioElement>(null)
const currentTab = computed(() => store.state.alerts.filter.environment ?? 'All')

const filter = computed(() => store.state.alerts.filter)
const storeQuery = computed(() => store.state.alerts.query.q)
const query = ref<string | null>(null)
const routeHash = computed(() => route.hash)
const routeQuery = computed(() => route.query)
const audioUrl = computed(() => store.getters.getConfig('audio').new ?? store.getters.getPreference('audioURL'))

watch(storeQuery, val => (query.value = val))
watch(routeHash, val => setHash(val))

const isDateRange = (date: DateRange | string[]): date is DateRange => !(date instanceof Array)

watch(routeQuery, val => setQuery(val as Query))

setQuery(route.query as Query)

const userQueries = computed(() =>
  store.getters.getUserQueries.map(q => ({title: q.q, value: q.q, props: {appendIcon: 'delete'}}))
)

const defaultTab = computed(() => filter.value.environment || 'All')

const selected = computed(() => store.state.alerts.selected)
const isAlertAlarmModel = computed(() => !store.getters.getConfig('alarm_model').name.includes('ISA'))

const ackTimeout = computed(() => store.getters.getPreference('ackTimeout'))
const shelveTimeout = computed(() => store.getters.getPreference('shelveTimeout'))

function haveDeleteScope() {
  const scopes = store.getters['auth/scopes']
  const config = store.state.config
  if (config.delete_alert_scope_enforced) {
    return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('delete:alerts')
  } else {
    return scopes.some(s => ['admin', 'admin:alerts', 'write', 'write:alerts', 'delete:alerts'].includes(s))
  }
}

async function takeAction(action: string, timeout?: number | null) {
  await Promise.all(
    selected.value.map(id => store.dispatch('alerts/takeAction', [id, action, '', timeout ?? undefined]))
  )
  getAlerts()
}

async function watchAlerts() {
  await Promise.all(selected.value.map(id => store.dispatch('alerts/watchAlert', id)))
  getAlerts()
}

async function unwatchAlerts() {
  await Promise.all(selected.value.map(id => store.dispatch('alerts/unwatchAlert', id)))
  getAlerts()
}

async function deleteAlerts() {
  if (!confirm(t('ConfirmDeletes'))) return
  await Promise.all(selected.value.map(id => store.dispatch('alerts/deleteAlert', id)))
  store.dispatch('alerts/updateSelected', [])
  getAlerts()
}

async function removeLasNotes() {
  await Promise.all(
    selected.value.map(id => {
      const alert = alerts.value.filter(alert => alert.id == id).pop()
      const note = alert?.history.filter(h => h.type == 'note').pop()
      if (!alert || !note) return
      return store.dispatch('alerts/deleteNote', [alert.id, note.id])
    })
  )
  getAlerts()
}

const alerts = computed(() => {
  const allAlerts = store.getters['alerts/alerts']
  return allAlerts
  // const filterText = filter.value.text
  // return filterText
  //   ? allAlerts.filter(alert =>{
  //       const alertKeys = Object.keys(alert) as [keyof typeof alert]
  //       return alertKeys.some((k: keyof typeof alert) => alert[k]?.toString().toLowerCase().includes(filterText.toLowerCase()))
  //     })
  //   : allAlerts.map(b => ({ ...b, service: b.service?.join(', ') }))
})

const isNewOpenAlerts = computed(() =>
  alerts.value
    .filter(alert => !filter.value.environment || filter.value.environment === alert.environment)
    .filter(alert => alert.status === 'open')
    .some(alert => !alert.repeat)
)

const showAllowedEnvs = computed(() => store.getters.getPreference('showAllowedEnvs'))

const environments = computed(() => ['All', ...store.getters['alerts/environments'](showAllowedEnvs.value)])

const environmentCounts = computed(() => store.getters['alerts/counts'])

const refreshInterval = computed(
  () => store.getters.getPreference('refreshInterval') || store.getters.getConfig('refresh_interval')
)

const isMute = computed(() => store.getters.getPreference('isMute'))
const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])

function setQuery(q: Query) {
  store.dispatch('alerts/updateQuery', q)
  query.value = q.q
  getAlerts()
}

function setSearch(q: string) {
  store.dispatch('alerts/updateQuery', {q})
  router.push({query: {...route.query, q}, hash: store.getters['alerts/getHash']})
  getAlerts()
}

function saveSearch(q: string) {
  store.dispatch('addUserQuery', {q})
}

function deleteSearch(q: string) {
  store.dispatch('removeUserQuery', {q})
}

function clearSearch() {
  store.dispatch('alerts/updateQuery', {q: ''})
  router.push({query: {...route.query, q: undefined}})
  getAlerts()
}

function setFilter(f: any) {
  const val: {[key: string]: any} = {}
  Object.keys(f)
    .filter(key => key && !['sb', 'asi', 'sd'].includes(key))
    .forEach(a => {
      if (a.includes('dateRange')) {
        const [key, child] = a.split('.')
        if (!val.hasOwnProperty(key)) val[key] = {}
        val[key][child] = f[a]
      } else {
        val[a] = f[a].split(',')
      }
    })
  store.dispatch('alerts/setFilter', val)
}

function setSort({sb, sd}: {sb: string; sd: string; [key: string]: string}) {
  const orders = sd.split(',')
  const sortBy: SortBy[] = sb.split(',').map((val, ind) => ({key: val, order: orders[ind] == '1' ? 'desc' : 'asc'}))
  store.dispatch('alerts/setPagination', {sortBy})
}

function setPage(page: number) {
  store.dispatch('alerts/setPagination', {page})
}

function setKiosk(isKiosk: boolean) {
  store.dispatch('alerts/updateKiosk', isKiosk)
}

async function getAlerts() {
  return await store.dispatch('alerts/getAlerts')
}

function getQueries() {
  store.dispatch('getUserQueries')
}

function getUserPrefs() {
  store.dispatch('getUserPrefs')
}

function getEnvironments() {
  store.dispatch('alerts/getEnvironments')
}

function playSound(audioRef: HTMLAudioElement | null) {
  if (!isMute.value && audioRef) audioRef.play()
}

function setEnv(env: string) {
  store.dispatch('alerts/setFilter', {
    ...filter.value,
    environment: env === 'All' ? null : env
  })
}

const refresh = computed(() => store.state.refresh)

watch(refresh, val => {
  if (!val) return
  refreshAlerts(audio.value)
})

async function refreshAlerts(audioRef: HTMLAudioElement | null) {
  if (timeout.value) clearTimeout(timeout.value)
  getEnvironments()
  if (isLoggedIn.value) {
    getQueries()
    getUserPrefs()
  }
  await getAlerts()
  if (isNewOpenAlerts.value) playSound(audioRef)
  timeout.value = setTimeout(() => refreshAlerts(audio.value), refreshInterval.value)
}

function toCsv(data: typeof alerts.value) {
  const options = mkConfig({
    filename: `Alerts_${filter.value.environment || 'All'}`,
    quoteCharacter: '"',
    decimalSeparator: 'locale',
    useBom: true,
    useKeysAsHeaders: true
  })

  const attrs: any = {}
  data.forEach(d =>
    Object.keys(d.attributes).forEach(
      attr =>
        (attrs[`attributes.${attr}`] =
          typeof d.attributes[attr] == 'string' ? d.attributes[attr].replace(/^([=, +])/, "'$1") : d.attributes[attr])
    )
  )
  const csvContent = data.map(({correlate, service, tags, rawData, customTags, ...item}) => {
    const d = {
      correlate: correlate?.join(','),
      service: typeof service == 'object' ? service?.join(',') : service,
      tags: tags?.join(','),
      customTags: customTags?.join(','),
      ...attrs,
      ...item,
      rawData: rawData ? rawData.toString() : ''
    }
    delete d.history
    delete d.attributes
    return d
  })
  download(options)(generateCsv(options)(csvContent))
}
function setHash(val: string) {
  const hash = val.replace(/^#/, '')

  if (hash) {
    const hashMap: {sd?: string; sb?: string; [key: string]: any} = utils.fromHash(hash)
    setFilter(hashMap)
    if (typeof hashMap.sd === 'string' && typeof hashMap.sb === 'string') {
      const typedHashMap = {sd: hashMap.sd, sb: hashMap.sb}
      setSort({sd: typedHashMap.sd ?? '', sb: typedHashMap.sb})
    }
  }
}

setHash(routeHash.value)
// Lifecycle hooks
setQuery(route.query as Query)

setKiosk(route.query.isKiosk === 'true')
refreshAlerts(audio.value)

onUnmounted(() => {
  clearTimeout(timeout.value)
})

const getPrefs = () => store.dispatch('getUserPrefs')
getPrefs()

watch(
  () => tab.value,
  () => {
    setPage(1)
  }
)

watch(
  filter,
  () => {
    router.replace({hash: store.getters['alerts/getHash'], query: routeQuery.value})
    tab.value = defaultTab.value
    refreshAlerts(null)
  },
  {deep: true}
)

const pagination = computed(() => store.state.alerts.pagination)
watch(pagination, () => router.replace({hash: store.getters['alerts/getHash'], query: routeQuery.value}))
</script>
