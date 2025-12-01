<template>
  <div>
    <g-text-field
      v-model="query"
      prepend-inner-icon="search"
      :label="t('Search')"
      :placeholder="t('Search')"
      variant="outlined"
      clearable
      hide-details
      validate-on="submit"
      style="position: absolute; top: 2.5px; right: calc(25vw); width: 40vw; background: white"
      @keydown.enter="(e: any) => setSearch(e.target.value)"
      @click:clear="clearSearch"
    />
    <escalation-rule-list @update="getEscalationRules" />
  </div>
</template>

<script lang="ts" setup>
import {useStore} from 'vuex'
import {useI18n} from 'vue-i18n'
import {computed, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import type {Store} from '@/plugins/store/types'
import type {Query, SortBy} from '@/plugins/store/types/alerts-types'
import utils from '@/common/utils'

const {t} = useI18n()
const store: Store = useStore()
const route = useRoute()
const router = useRouter()

definePage({
  meta: {
    title: 'Escalation Rules',
    requiresAuth: true
  }
})

const tempQuery = ref('')
const query = computed({
  get: () => store.state.escalationRules.query.q ?? null,
  set: val => (tempQuery.value = val)
})

const refresh = computed(() => store.state.refresh)

watch(refresh, val => {
  if (!val) return
  refreshAll()
})

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
    environment: val.environment,
    service: val.service,
    resource: val.resource,
    event: val.event,
    group: val.group,
    user: val.user,
    tags: val.tags
  }
  store.dispatch('escalationRules/setFilter', filter)
}

function setSort({sb, sd}: {sb: string; sd: string; [key: string]: string}) {
  const orders = sd.split(',')
  const sortBy: SortBy[] = sb.split(',').map((val, ind) => ({key: val, order: orders[ind] == '1' ? 'desc' : 'asc'}))
  store.dispatch('escalationRules/setPagination', {sortBy})
}

function setHash(val: string) {
  const hash = val.replace(/^#/, '')

  if (hash) {
    const hashMap: {sd?: string; sb?: string; [key: string]: string | undefined} = utils.fromHash(hash)
    setFilter(hashMap)
    if (typeof hashMap.sd === 'string' && typeof hashMap.sb === 'string') {
      const typedHashMap = {sd: hashMap.sd, sb: hashMap.sb}
      setSort({sd: typedHashMap.sd ?? '', sb: typedHashMap.sb})
    }
  }
}

setHash(routeHash.value)

const routeQuery = computed(() => route.query)
const pagination = computed(() => store.state.escalationRules.pagination)
watch(pagination, () => router.replace({hash: store.getters['escalationRules/getHash'], query: routeQuery.value}))

watch(routeQuery, val => setQuery(val as Query))
watch(routeHash, () => setHash(routeHash.value))
const filter = computed(() => store.state.escalationRules.filter)
watch(filter, () => {
  router.replace({hash: store.getters['escalationRules/getHash'], query: routeQuery.value})
})

function setQuery(q: Query) {
  store.dispatch('escalationRules/updateQuery', q)
  refreshAll()
}

function setSearch(query: string) {
  store.dispatch('escalationRules/updateQuery', {q: query})
  router.push({query: {...route.query, q: query}})
  refreshAll()
}

function clearSearch() {
  store.dispatch('escalationRules/updateQuery', {q: ''})
  router.push({query: {...route.query, q: undefined}})
  refreshAll()
}

const timeout = ref<number | undefined>(undefined)
const interval = computed(() => store.getters.getPreference('refreshInterval'))

function refreshAll() {
  if (timeout.value) clearTimeout(timeout.value)
  getEscalationRules()
  getCustomers()
  getEnvironments()
  getServices()
  getTags()
  timeout.value = setTimeout(refreshAll, interval.value)
}

onUnmounted(() => clearTimeout(timeout.value))

function getEscalationRules() {
  store.dispatch('escalationRules/getEscalationRules')
}

function getCustomers() {
  store.dispatch('customers/getCustomers')
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

setQuery(route.query as Query)
refreshAll()
</script>
