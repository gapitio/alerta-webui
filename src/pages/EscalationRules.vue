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
      style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
      @keydown.enter="(e: any) => setSearch(e.target.value)"
      @click:clear="clearSearch"
    />
    <escalation-rule-list @update="getEscalationRules" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Store } from '@/plugins/store/types';
import type { Query } from '@/plugins/store/types/alerts-types';

const { t } = useI18n()
const store: Store = useStore()
const route = useRoute()
const router = useRouter()

definePage({
  meta: {
    title: 'Escalation Rules',
    requiresAuth: true,
  }
})

const tempQuery = ref('')
const query = computed({
  get: () => store.state.escalationRules.query.q ?? null,
  set: (val) => tempQuery.value = val
})


const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  refreshAll()
})

const routeQuery = computed(() => route.query)

watch(routeQuery, (val) => setQuery(val as Query))

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
