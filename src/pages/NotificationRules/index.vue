<template>
  <div>
    <g-text-field
      v-model="query"
      prepend-inner-icon="search"
      :placeholder="t('Search')"
      :label="t('Search')"
      clearable
      hide-details
      validate-on="submit"
      style="position: absolute; top: 2.5px; right: calc(25vw); width: 40vw; background: white"
      @keydown.enter="(e: any) => setSearch(e.target.value)"
      @click:clear="clearSearch"
    />
    <notification-rule-list />
  </div>
</template>

<script lang="ts" setup>
import {useStore} from 'vuex'
import type {Store} from '../../plugins/store/types'
import {useI18n} from 'vue-i18n'
import {computed, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import type {Query, SortBy} from '@/plugins/store/types/alerts-types'
import utils from '@/common/utils'

const {t} = useI18n()
const store: Store = useStore()
const route = useRoute()
const router = useRouter()

definePage({
  meta: {
    title: 'Notification Rules',
    requiresAuth: true
  }
})

const timeout = ref<number | undefined>(undefined)
const tempQuery = ref('')

const query = computed({
  get: () => store.state.notificationRules.query.q ?? null,
  set: val => (tempQuery.value = val)
})

const routeQuery = computed(() => route.query)
const interval = computed(() => store.getters.getPreference('refreshInterval'))

watch(routeQuery, val => setQuery(val as Query))
function setQuery(q: Query) {
  store.dispatch('notificationRules/updateQuery', q)
  refreshAll()
}

setQuery(route.query as Query)

function setSearch(query: string) {
  setQuery({q: query})
  router.push({query: {...route.query, q: query}})
  refreshAll()
}

function clearSearch() {
  setQuery({q: ''})
  router.push({query: {...route.query, q: undefined}})
  refreshAll()
}
const refresh = computed(() => store.state.refresh)

watch(refresh, val => {
  if (!val) return
  refreshAll()
})
function refreshAll() {
  if (timeout.value) clearTimeout(timeout.value)
  getNotificationRules()
  getNotificationChannels()
  getCustomers()
  getEnvironments()
  getServices()
  getTags()
  getGroups()
  getNotificaitonGroups()
  timeout.value = setTimeout(refreshAll, interval.value)
}

onUnmounted(() => clearTimeout(timeout.value))

function getNotificationRules() {
  store.dispatch('notificationRules/getNotificationRules')
}

function getNotificationChannels() {
  store.dispatch('notificationChannels/getNotificationChannels')
}
function getCustomers() {
  if (store.getters.getConfig('customer_views')) store.dispatch('customers/getCustomers')
}
function getGroups() {
  store.dispatch('groups/getGroups')
}
function getNotificaitonGroups() {
  store.dispatch('notificationGroups/getNotificationGroups')
}
function getEnvironments() {
  store.dispatch('alerts/getEnvironments')
}
function getServices() {
  store.dispatch('alerts/getServices')
}
function getTags() {
  store.dispatch('alerts/getTags')
}

const routeHash = computed(() => route.hash)

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
  const filter = {
    name: val.name,
    environment: val.environment,
    channel: val.channel,
    service: val.service,
    resource: val.resource,
    event: val.event,
    group: val.group,
    text: val.text
  }
  store.dispatch('notificationRules/setFilter', filter)
}

function setSort({sb, sd}: {sb: string; sd: string; [key: string]: string}) {
  const orders = sd.split(',')
  const sortBy: SortBy[] = sb.split(',').map((val, ind) => ({key: val, order: orders[ind] == '1' ? 'desc' : 'asc'}))
  store.dispatch('notificationRules/setPagination', {sortBy})
}

function setHash(val: string) {
  const hash = val.replace(/^#/, '')

  if (hash) {
    const hashMap = utils.fromHash(hash)
    setFilter(hashMap)
    if (typeof hashMap.sd === 'string' && typeof hashMap.sb === 'string') {
      const typedHashMap = {sd: hashMap.sd, sb: hashMap.sb}
      setSort({sd: typedHashMap.sd ?? '', sb: typedHashMap.sb})
    }
  }
}

setHash(routeHash.value)

const pagination = computed(() => store.state.notificationRules.pagination)
watch(pagination, () => router.replace({hash: store.getters['notificationRules/getHash'], query: routeQuery.value}))
watch(routeHash, () => setHash(routeHash.value))
const filter = computed(() => store.state.notificationRules.filter)
watch(filter, () => {
  router.replace({hash: store.getters['notificationRules/getHash'], query: routeQuery.value})
})

refreshAll()
</script>
