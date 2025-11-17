<template>
  <g-combobox
    v-model="storeQuery"
    prepend-inner-icon="search"
    append-inner-icon="push_pin"
    :label="t('Search')"
    variant="outlined"
    clearable
    hide-details
    :items="userQueries"
    validate-on="submit"
    style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
    delete-items
    @keydown.enter="(e: any) => setSearch(e.target.value)"
    @click:prepend-inner="setSearch(query)"
    @click:append-inner="saveSearch(query)"
    @click:clear="clearSearch"
    @select-item="(item: any) => setSearch(item.value)"
    @delete-item="(item: any) => deleteSearch(item.value)"
  />
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('History') }}
      </h1>
    </v-col>
    <v-col 
      cols="auto"
      align-self="center"
    >
      <alerts-history-filter />
    </v-col>
  </v-row>
  <v-tabs
    v-model="currentTab"
    slider-color="link-active"
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
  <v-row class="mt-0">
    <template
      v-for="(f, d) in filter"
      :key="d"
    >
      <v-col
        v-if="d == 'dateRange' && f && isDateRange(f)"
        cols="auto"
      >
        <v-chip
          v-if="(f.from ?? 0) < 0"
          variant="flat"
          class="chip"
          size="small"
        >
          {{ d }}: {{ f.from! / -3600 }} hours
        </v-chip>
        <template v-else-if="f.select">
          <v-chip
            v-for="desc in ['from', 'to']"
            :key="desc"
            variant="flat"
            class="chip"
            size="small"
          >
            {{ d }}.{{ desc }}:
            &nbsp;
            <date-time 
              :value="moment.unix(f[desc as 'from' | 'to']!).utc()"
              no-break
            />
          </v-chip>
        </template>
      </v-col>
      <v-col
        v-else-if="typeof(f) == 'object' && ((f as string[])?.length ?? 0) > 0"
        cols="auto"
      >
        <v-chip
          v-for="a in f"
          :key="a"
          variant="flat"
          class="chip"
          size="small"
        >
          {{ d }}: {{ a }}
        </v-chip>
      </v-col>
      <v-col 
        v-else-if="typeof(f) == 'string'"
        cols="auto"
      >
        <v-chip
          variant="flat"
          class="chip"
          size="small"
        >
          {{ d }}: {{ f }}
        </v-chip>
      </v-col>
    </template>
  </v-row>
  <v-data-table-server
    v-model:sort-by="pagination.sortBy"
    v-model:items-per-page="pagination.itemsPerPage"
    :headers="headersMap"
    fixed-header
    style="max-height: calc(99vh - calc(48px + 74px + 64px))"
    :items="history"
    item-value=""
    :items-length="pagination.totalItems!"
    :items-per-page-options="pagination.itemsPerPageOptions"
    multi-sort
    :row-props="rowProps"
    :cell-props="columnsProps"
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
import type { DateRange } from '@/plugins/store/types/notificationHistory-types';
import moment from 'moment';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "History",
    requiresAuth: true
  }
});


const { t } = useI18n()
const store: Store = useStore()
const filters = useFilters()
const router = useRouter()
const route = useRoute()

const pagination = computed({
  get: () => store.state.alerts.historyPagination,
  set: (value) => store.dispatch('alerts/setHistoryPagination', value)
})
const filter = computed(() => store.state.alerts.historyFilter)
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
const interval = computed(() => store.getters.getPreference('refreshInterval'))

const query = ref(storeQuery.value)
const timeout = ref<number | undefined>(undefined)
const userQueries = computed(() => store.getters.getUserQueries.map((q) => ({title: q.q, value: q.q, props: {appendIcon: 'delete'}})))

const headersMap = computed(() => ([
  { title: t('UpdateTime'), key: 'updateTime', sortable: false},
  { title: t('Severity'), key: 'severity' , sortable: false},
  { title: t('Status'), key: 'status' , sortable: false},
  { title: t('Environment'), key: 'environment' , sortable: false},
  { title: t('Resource'), key: 'resource' , sortable: false},
  { title: t('Event'), key: 'event' , sortable: false},
  { title: t('Service'), key: 'service' , sortable: false},
  { title: 'FullTag', value: 'attributes.Full_tag' , sortable: false},
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
  refreshAll()
}

function rowProps({ item }: { item: any }) {
  return {
    style: 'min-height: 40px',
    class: `${item.status == 'open' ? item.severity : item.status == 'ack' ? 'ack' : ''} severity hover-lighten text-no-wrap table-row`,
    onClick: () => selectItem(item),
  }
}

const isDateRange = (date: DateRange | string[]): date is DateRange => !(date instanceof Array)

function selectItem(item: History) {
  router.push({ path: `/alert/${item.id}`, query: { redirect: route.fullPath } })
}

function setEnv(env: string) {
  store.dispatch('alerts/setHistoryFilter', {
    ...filter.value,
    environment: env === 'All' ? null : env
  })
  refreshAll()
}

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  refreshAll()
})


function setSearch(q: string) {
  store.dispatch('alerts/updateQuery', { q })
  router.push({ query: { ...route.query, q } })
  refreshAll()
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

const refreshAll = () => {
  if (timeout.value) clearTimeout(timeout.value)
  getHistory()
  getEnvironments()
  getQueries()
  timeout.value = setTimeout(refreshAll, interval.value)
}

onUnmounted(() => clearTimeout(timeout.value))

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

refreshAll()
</script>