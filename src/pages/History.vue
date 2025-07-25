<template>
  <g-combobox
    v-model="storeQuery"
    prepend-inner-icon="search"
    append-inner-icon="push_pin"
    :placeholder="t('Search')"
    variant="outlined"
    clearable
    hide-details
    :items="userQueries"
    validate-on="submit"
    style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
    @keydown.enter="(e: any) => setSearch(e.target.value)"
    @click:prepend-inner="setSearch(query)"
    @click:append-inner="saveSearch(query)"
    @click:clear="clearSearch"
    @select-item="(item: any) => setSearch(item.value)"
    @delete-item="(item: any) => deleteSearch(item.value)"
  />
  <h1>{{ t('History') }}</h1>
  <v-tabs
    v-model="currentTab"
    slider-color="secondary"
  >
    <v-tab
      v-for="env in environments"
      :key="env"
      :value="env"
      class="big-font bold no-cap-btn"
      @click="setEnv(env)"
    >
      {{ env }}&nbsp;({{ environmentCounts[env] || 0 }})
    </v-tab>
  </v-tabs>
  <v-data-table-server
    v-model:items-per-page="pagination.itemsPerPage"
    :headers="headersMap"
    fixed-header
    style="max-height: calc(99vh - calc(48px + 43px + 64px))"
    :items="history"
    item-value=""
    :items-length="pagination.totalItems!"
    :items-per-page-options="pagination.itemsPerPageOptions"
    multi-sort
    :row-props="rowProps"
    :cell-props="columnsProps"
    density="compact"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    class="table"
    @update:options="setPagination"
  >
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
    <template #[`item.updateTime`]="{item}">
      <v-tooltip 
        :text="filters.date(item.updateTime, 'local', store.getters.getConfig('dates').longDate)"
        location="top"
      >
        <template #activator="{ props }">
          <span v-bind="props">
            {{ filters.date(item.updateTime, 'local', store.getters.getConfig('dates').mediumDate) }}
            ({{ filters.until(item.updateTime) }})
          </span>
        </template>
      </v-tooltip>
    </template>
    
    <template 
      v-for="desc in ['service', 'tags']"
      #[`item.${desc}`]="{item}"
    >
      {{ item[desc as 'service' | 'tags']?.join(', ') }}
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { useFilters } from '@/filters';
import type { Store } from '@/plugins/store/types';
import type { History, Pagination } from '@/plugins/store/types/alerts-types';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';


const { t } = useI18n()
const store: Store = useStore()
const filters = useFilters()
const router = useRouter()
const route = useRoute()

const pagination = computed({
  get: () => store.state.alerts.historyPagination,
  set: (value) => store.dispatch('alerts/setHistoryPagination', value)
})
const currentTab = ref<string | null>(null)
const history = computed(() => store.state.alerts.history)
const environmentCounts = computed(() => store.getters['alerts/historyCounts'])
const showAllowedEnvs = computed(() => store.getters.getPreference('showAllowedEnvs'))
const environments = computed(() => ['All', ...store.getters['alerts/environments'](showAllowedEnvs.value)])
const storeQuery = computed({
  get: () => store.state.alerts.query.q,
  set: (q: string) => {
    query.value = q
  },
})
const query = ref(storeQuery.value)
const userQueries = computed(() => store.getters.getUserQueries.map((q) => ({title: q.q, value: q.q, props: {appendIcon: 'delete'}})))

const headersMap = computed(() => ([
  { title: t('UpdateTime'), key: 'updateTime', sortable: false},
  { title: t('Severity'), key: 'severity' , sortable: false},
  { title: t('Status'), key: 'status' , sortable: false},
  { title: t('Environment'), key: 'environment' , sortable: false},
  { title: t('Resource'), key: 'resource' , sortable: false},
  { title: t('Event'), key: 'event' , sortable: false},
  { title: t('Service'), key: 'service' , sortable: false},
  { title: t('FullTag'), value: 'attributes.Full_tag' , sortable: false},
  { title: t('Description'), key: 'text' , sortable: false},
  { title: t('Value'), value: 'value' , sortable: false},
  { title: t('AlertId'), key: 'id' , sortable: false},
  { title: t('Type'), key: 'type' , sortable: false},
  { title: t('Group'), key: 'group' , sortable: false},
  { title: t('Origin'), key: 'origin' , sortable: false},
  { title: t('Tags'), key: 'tags' , sortable: false},
]))

function setPagination(value: Pagination) {
  store.dispatch('alerts/setHistoryPagination', value)
  store.dispatch('alerts/getAlertHistory')
}

function rowProps({ item }: { item: any }) {
  return {
    style: 'min-height: 40px',
    class: `${item.status == 'open' ? item.severity : ''} severity hover-lighten text-no-wrap table-row`,
    onClick: () => selectItem(item),
  }
}

function selectItem(item: History) {
  router.push({ path: `/alert/${item.id}`, query: { redirect: route.fullPath } })
}

function setEnv(env: string) {
  store.dispatch('alerts/setHistoryFilter', {
    environment: env === 'All' ? null : env
  })
  store.dispatch('alerts/getAlertHistory')
}

function setSearch(q: string) {
  store.dispatch('alerts/updateQuery', { q })
  router.push({ query: { ...route.query, q } })
  getHistory()
}

function saveSearch(q: string) {
  store.dispatch('addUserQuery', { q })
}

function deleteSearch(q: string) {
  store.dispatch('removeUserQuery', { q })
}

function clearSearch() {
  store.dispatch('alerts/updateQuery', { q: '' })
}

function columnsProps() {
  return {
    class: `table-column`,
  }
}

function getHistory() {
  store.dispatch('alerts/getAlertHistory')
}

function getEnvironments() {
  store.dispatch('alerts/getEnvironments')
  store.dispatch('alerts/getAlertHistoryCount')
}

function getQueries() {
  store.dispatch('getUserQueries')
}

getHistory()
getEnvironments()
getQueries()
</script>