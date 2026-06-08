<template>
  <audio ref="audio" :src="audioUrl" />
  <confirm ref="confirm" />
  <v-container style="position: absolute; top: 0px; right: calc(25vw - 115px - 48px)">
    <v-row align="center">
      <v-spacer></v-spacer>
      <v-col>
        <g-combobox
          v-if="showSearchBar"
          v-model="query"
          prepend-inner-icon="search"
          append-inner-icon="push_pin"
          :label="t('Search')"
          variant="outlined"
          clearable
          hide-details
          :items="userQueries"
          validate-on="submit"
          style="position: relative; top: -12px; width: 40vw; background: white"
          delete-items
          @keydown.enter="(e: any) => setSearch(e.target.value)"
          @click:prepend-inner="setSearch(query ?? '')"
          @click:append-inner="saveSearch(query ?? '')"
          @click:clear="clearSearch"
          @select-item="(item: any) => setSearch(item.value)"
          @delete-item="(item: any) => deleteSearch(item.value)"
        />
      </v-col>
    </v-row>
  </v-container>

  <v-card variant="flat">
    <v-row>
      <v-col cols="auto">
        <h1>{{ t('Alerts') }}</h1>
      </v-col>
      <v-col cols="auto" align-self="center">
        <alerts-filter />
      </v-col>
      <v-col cols="auto" align-self="center">
        <filter-tabs />
      </v-col>
      <v-col cols="auto" align-self="center">
        <alerts-export />
      </v-col>
      <v-col cols="auto" align-self="center">
        <g-switch v-model="isWatch" :label="t('Watch')" />
      </v-col>
      <v-col v-if="selected.length > 0" align-self="center">
        <v-btn icon="visibility" variant="text" @click.stop="watchAlerts">
          <v-icon icon="visibility" />
          <v-tooltip location="bottom" activator="parent" :text="t('Watch')" />
        </v-btn>
        <v-btn icon="visibility_off" variant="text" @click.stop="unwatchAlerts">
          <v-icon icon="visibility_off" />
          <v-tooltip location="bottom" activator="parent" :text="t('Unwatch')" />
        </v-btn>
        <timeout-actions v-if="ackIsTimeout" action="ack" />
        <v-btn v-else icon="check" variant="text" @click.stop="takeAction('ack')">
          <v-icon icon="check" />
          <v-tooltip location="bottom" activator="parent" :text="t('Ack')" />
        </v-btn>
        <v-btn icon="undo" variant="text" @click.stop="takeAction('unack')">
          <v-icon icon="undo" />
          <v-tooltip location="bottom" activator="parent" :text="t('Unack')" />
        </v-btn>
        <timeout-actions action="shelve" />
        <v-btn icon="restore" variant="text" @click.stop="takeAction('unshelve')">
          <v-icon icon="restore" />
          <v-tooltip location="bottom" activator="parent" :text="t('Unshelve')" />
        </v-btn>
        <v-btn v-if="closeIsAllowed" icon="highlight_off" variant="text" @click.stop="closeAlerts">
          <v-icon icon="highlight_off" />
          <v-tooltip location="bottom" activator="parent" :text="t('Close')" />
        </v-btn>
        <v-btn v-if="haveDeleteScope()" icon="delete" variant="text" @click.stop="deleteAlerts">
          <v-icon icon="delete" />
          <v-tooltip location="bottom" activator="parent" :text="t('Delete')" />
        </v-btn>
        <notes-add />
        <v-btn v-if="haveDeleteScope()" icon="scan_delete" variant="text" @click.stop="removeLasNotes">
          <v-icon icon="scan_delete" />
          <v-tooltip location="bottom" activator="parent" :text="t('RemoveLastNote')" />
        </v-btn>
        <v-btn icon="clear" variant="text" @click.stop="clearSelected">
          <v-icon icon="clear" />
          <v-tooltip location="bottom" activator="parent" :text="t('ClearSelected')" />
        </v-btn>
      </v-col>
    </v-row>

    <v-tabs v-model="currentTab" slider-color="link-active" style="padding-left: 16px">
      <v-tab
        v-for="tab in filterTabsItems"
        :key="tab.name"
        :value="tab.name"
        class="big-font bold no-cap-btn"
        style="padding: 0px; margin-right: 26px"
        @click="setFilterTab(tab.filter)"
      >
        {{ tab.name }}&nbsp;({{ getTabCount(tab.name) }})
      </v-tab>
      <v-tab
        style="padding: 0px; margin-right: 26px"
        class="big-font bold no-cap-btn"
        value="user-defined"
        @click="setFilterTab(filter)"
      >
        user-defined ({{ pagination.totalItems }})
      </v-tab>
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

    <alert-list />
  </v-card>
</template>

<script setup lang="ts">
import {ref, computed, watch, onUnmounted} from 'vue'
import {useStore} from 'vuex'
import {useRoute, useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'
import utils from '@/common/utils'
import type {Filter, Query, SortBy} from '@/plugins/store/types/alerts-types'
import type {State, Store} from '@/plugins/store/types'
import moment from 'moment'
import type {DateRange} from '@/plugins/store/types/notificationHistory-types'
import Confirm from '@/components/dialogs/Confirm.vue'

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
const audio = ref<null | HTMLAudioElement>(null)
const confirm = ref<InstanceType<typeof Confirm> | null>(null)
const currentTab = computed({
  get: () => {
    return store.state.filterTabs.currentTab
  },
  set: val => store.dispatch('filterTabs/setCurrentTab', val)
})

const filter = computed(() => store.state.alerts.filter)
const storeQuery = computed(() => store.state.alerts.query.q)
const query = ref<string | null>(null)
const routeHash = computed(() => route.hash)
const routeQuery = computed(() => route.query)
const audioUrl = computed(() => store.getters.getConfig('audio').new ?? store.getters.getPreference('audioURL'))
const showSearchBar = computed(() => store.getters.getPreference('showSearchBar'))
const pagination = computed(() => store.state.alerts.pagination)

const isWatch = computed({
  get: () => store.state.alerts.isWatch,
  set: val => store.dispatch('alerts/toggle', ['isWatch', val])
})

const isDateRange = (date: DateRange | string[]): date is DateRange => !(date instanceof Array)

const userQueries = computed(() =>
  store.getters.getUserQueries.map(q => ({title: q.q, value: q.q, props: {appendIcon: 'delete'}}))
)

const selected = computed(() => store.state.alerts.selected)
const closeIsAllowed = computed(() => store.getters.getConfig('alarm_model').name.toLowerCase().includes('alerta'))

function clearSelected() {
  store.dispatch('alerts/updateSelected', [])
}

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
  const splittedItems: string[][] = []
  const max_bulk_size = store.getters.getConfig('bulk_size') ?? 1
  for (let index = 0; index < selected.value.length; index++) {
    const sp_index = Math.floor(index / max_bulk_size)
    if (!splittedItems[sp_index]) splittedItems[sp_index] = []
    splittedItems[sp_index].push(selected.value[index])
  }
  await Promise.all(
    splittedItems.map(ids => store.dispatch('alerts/takeActions', [ids, action, '', timeout ?? undefined]))
  )
  refreshAlerts(audio.value)
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
  if (confirm.value && (await confirm.value.open(t('ConfirmDeletes')))) {
    await store.dispatch('alerts/deleteAlerts', selected.value)
    store.dispatch('alerts/updateSelected', [])
    refreshAlerts(audio.value)
  }
}

async function closeAlerts() {
  if (confirm.value && (await confirm.value.open(t('ConfirmCloses')))) {
    await takeAction('close')
  }
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

const alerts = computed(() => store.state.alerts.alerts)

const isNewOpenAlerts = computed(() =>
  alerts.value
    .filter(alert => !filter.value.environment || filter.value.environment === alert.environment)
    .filter(alert => alert.status === 'open')
    .some(alert => !alert.repeat)
)

const ackIsTimeout = computed(() => store.getters.getConfig('ack_timeout'))
const filterTabsItems = computed(() => store.state.filterTabs.items)
const tabCounts = computed(() => store.state.filterTabs.counts)

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

function getTabCount(tabname: string) {
  return tabCounts.value[tabname] || 0
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

function setFilterTab(tab: Filter) {
  if (JSON.stringify(tab) !== JSON.stringify(filter.value)) {
    store.dispatch('alerts/setFilter', tab)
  }
  router.replace({hash: store.getters['alerts/getHash'], query: routeQuery.value})
}

function setFilter(f: any) {
  const val: {[key: string]: any} = {}
  Object.keys(f)
    .filter(key => key && !['sb', 'asi', 'sd', 'ct'].includes(key))
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
  refreshAlerts(audio.value)
}

function setSort({sb, sd}: {sb: string; sd: string; [key: string]: string}) {
  const orders = sd.split(',')
  const sortBy: SortBy[] = sb.split(',').map((val, ind) => ({key: val, order: orders[ind] == '1' ? 'desc' : 'asc'}))
  store.dispatch('alerts/setPagination', {sortBy})
}

function setPage(page: number) {
  store.dispatch('alerts/setPagination', {page})
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

async function getFilterTabs(tab: string) {
  await store.dispatch('filterTabs/getFilterTabs')
  if (tab !== 'user-defined') {
    const [filterTab] = filterTabsItems.value.filter(({name}) => name == tab)
    setFilterTab(filterTab.filter)
  }
}

function playSound(audioRef: HTMLAudioElement | null) {
  if (!isMute.value && audioRef) audioRef.play()
}

const refresh = computed(() => store.state.refresh)

async function refreshAlerts(audioRef: HTMLAudioElement | null) {
  if (timeout.value) clearTimeout(timeout.value)
  getEnvironments()
  getFilterTabs(currentTab.value)
  if (isLoggedIn.value) {
    getQueries()
    getUserPrefs()
  }
  await getAlerts()
  if (isNewOpenAlerts.value) playSound(audioRef)
  timeout.value = setTimeout(() => refreshAlerts(audio.value), refreshInterval.value)
}

function setHash(val: string) {
  const hash = val.replace(/^#/, '')

  if (hash) {
    const hashMap: {sd?: string; sb?: string; ct?: string; [key: string]: any} = utils.fromHash(hash)
    if (typeof hashMap.ct === 'string') {
      if (hashMap.ct == 'user-defined') setFilter(hashMap)
      currentTab.value = hashMap.ct
    } else {
      setFilter(hashMap)
    }
    if (typeof hashMap.sd === 'string' && typeof hashMap.sb === 'string') {
      const typedHashMap = {sd: hashMap.sd, sb: hashMap.sb}
      setSort({sd: typedHashMap.sd ?? '', sb: typedHashMap.sb})
    }
  }
}
const getPrefs = () => store.dispatch('getUserPrefs')

setHash(routeHash.value)
router.replace({query: route.query, hash: store.getters['alerts/getHash']})
setQuery(route.query as Query)
refreshAlerts(audio.value)
watch(refresh, val => {
  if (!val) return
  refreshAlerts(audio.value)
})
watch(routeHash, val => setHash(val))
watch(isWatch, () => refreshAlerts(audio.value))
watch(storeQuery, val => (query.value = val))
watch(routeQuery, val => setQuery(val as Query))
watch(filter, () => router.replace({hash: store.getters['alerts/getHash'], query: routeQuery.value}))

onUnmounted(() => {
  clearTimeout(timeout.value)
})

getPrefs()

watch(currentTab, () => setPage(1))

const sortBy = computed(() => pagination.value.sortBy)

watch(sortBy, () => router.replace({hash: store.getters['alerts/getHash'], query: routeQuery.value}))
</script>
