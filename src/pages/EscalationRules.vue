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
    <escalation-rule-list @update="getEscalationRules" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Store } from '@/plugins/store/types';

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

const query = computed(() => store.state.notificationRules.query.q ?? null)

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getEscalationRules()
  getNotificationChannels()
  getCustomers()
  getEnvironments()
  getServices()
  getTags()
  getUsers()
  getGroups()
  getNotificaitonGroups()
})

function setSearch(query: string) {
  store.dispatch('notificationRules/updateQuery', {q: query})
  router.push({query: {...route.query, q: query}})
  refreshAll()
}

function clearSearch() {
  store.dispatch('notificationRules/updateQuery', {q: ''})
  router.push({query: {...route.query, q: undefined}})
  refreshAll()
}

function refreshAll() {
  store.dispatch('set', ['refresh', true])
  setTimeout(() => {
    store.dispatch('set', ['refresh', false])
  }, 300)
}

function getEscalationRules() {
  store.dispatch('escalationRules/getEscalationRules')
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
