<template>
  <div>
    <v-text-field
      v-model="query"
      prepend-inner-icon="search"
      :placeholder="t('Search')"
      variant="outlined"
      clearable
      hide-details
      validate-on="submit"
      style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
      @keydown.enter="(e: any) => setSearch(e.target.value)"
      @click:clear="clearSearch"
    />
    <notification-rule-list @update="getNotificationRules" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';
import type { Store } from '../../plugins/store/types'
import { useI18n } from 'vue-i18n';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Query } from '@/plugins/store/types/alerts-types';

const { t } = useI18n()
const store: Store = useStore()
const route = useRoute()
const router = useRouter()

definePage({
  meta: {
    title: 'Notification Rules',
    requiresAuth: true,
  }
})

const query = computed(() => store.state.notificationRules.query.q ?? null)

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getNotificationRules()
  getNotificationChannels()
  getCustomers()
  getEnvironments()
  getServices()
  getTags()
  getUsers()
  getGroups()
  getNotificaitonGroups()
})

const routeQuery = computed(() => route.query)

watch(routeQuery, (val) => setQuery(val as Query))
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

function refreshAll() {
  store.dispatch('set', ['refresh', true])
  setTimeout(() => {
    store.dispatch('set', ['refresh', false])
  }, 300)
}

function getNotificationRules() {
  store.dispatch('notificationRules/getNotificationRules')
}

function getNotificationChannels() {
  store.dispatch('notificationChannels/getNotificationChannels')
}
function getCustomers() {
  store.dispatch('customers/getCustomers')
}
function getUsers() {
  store.dispatch('users/getUsers')
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

refreshAll()

</script>
