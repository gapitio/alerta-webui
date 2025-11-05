<template>
  <g-text-field
    v-model="query"
    prepend-inner-icon="search"
    :label="t('Search')"
    :placeholder="t('Search')"
    clearable
    hide-details
    validate-on="submit"
    style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
    @keydown.enter="(e: any) => setSearch(e.target.value)"
    @click:clear="() => clearSearch()"
  />
  <v-row class="pb-0">
    <v-col cols="auto">
      <h1>
        {{ t('NotificationHistory') }}
        <information-dialog 
          :info="headers"
          :title="t('NotificationHistoryInfo')"
        />
      </h1>
    </v-col>
    <v-col
      cols="auto"
      align-self="center"
    >
      <notification-history-filter />
    </v-col>
  </v-row>
  <v-row>
    <v-col
      cols="auto"
    >
      <g-switch 
        :model-value="activeFilter.sent"
        :label="t('ShowSent')"
        class="switch-primary"
        @update:model-value="(value: boolean) => store.dispatch('notificationHistory/setActiveFilter', {sent: value})"
      />
    </v-col>
    <v-col 
      cols="auto"
    >
      <g-switch 
        :model-value="activeFilter.error"
        :label="t('ShowError')"
        color="primary"
        @update:model-value="(value: boolean) => store.dispatch('notificationHistory/setActiveFilter', {error: value})"
      />
    </v-col>
  </v-row>
  <v-row class="pt-0 mt-0">
    <template
      v-for="(f, d) in filter"
      :key="d"
    >
      <v-col
        v-if="d == 'dateRange' && f && isDateRange(f)"
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
    v-model:items-per-page="pagination.itemsPerPage"
    :headers="headers"
    fixed-header
    style="max-height: calc(99vh - calc(43px + 64px))"
    :items="history"
    :items-length="pagination.totalItems!"
    :items-per-page-options="pagination.itemsPerPageOptions"
    class="table"
    :row-props="rowProps"
    :cell-props="{class: 'table-column'}"
    @update:options="setPagination"
  >
    <template #[`item.sent_time`]="{ item }">
      <date-time :value="item.sent_time" />
    </template>
    <template #[`item.sent`]="{ item }">
      <v-icon :icon="item.sent ?'check': 'close'" />
    </template>
    <template #[`item.alert`]="{ item }">
      <a 
        v-if="item.alert !== 'Test Notification Channel'"
        :href="`alert/${item.alert}`"
      > {{ item.alert }} </a>
      <template v-else>
        Test Notification Channel
      </template>
    </template>
    <template #[`item.rule`]="{ item }">
      <a 
        v-if="item.alert !== 'Test Notification Channel'"
        :href="`notificationrules?q=id:${item.rule}`"
      > {{ getRule(item) }} </a>
      <template v-else>
        Test Notification Channel
      </template>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { Pagination, Query } from '@/plugins/store/types/alerts-types';
import type { DateRange, NotificationHistory } from '@/plugins/store/types/notificationHistory-types';
import moment from 'moment';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Notification History",
    requiresAuth: true
  }
});

const isDateRange = (date: DateRange | string[]): date is DateRange => !(date instanceof Array) 

const store: Store = useStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const timeout = ref<number | undefined>(undefined)
const interval = computed(() => store.getters.getPreference('refreshInterval'))
const history = computed(() => store.state.notificationHistory.notification_history)
const filter = computed(() => store.state.notificationHistory.filter)
const activeFilter = computed(() => store.state.notificationHistory.activeFilter)
const headers = ref<{title: string, key: keyof NotificationHistory, sortable?: boolean, info?: string | string[]}[]>([
  { title: t('ID'), key: 'id', sortable: false, info: t('NotificationHistoryId')},
  { title: t('Sent'), key: 'sent', sortable: false, info: [t('NotificationHistorySentTrue'), t('NotificationHistorySentFalse')]},
  { title: t('SentTime'), key: 'sent_time', sortable: false, info: t('NotificationHistorySentTime')},
  { title: t('Message'), key: 'message', sortable: false, info: t('NotificationHistoryMessage')},
  { title: t('Receiver'), key: 'receiver', sortable: false, info: t('NotificationHistoryReceiver')},
  { title: t('Sender'), key: 'sender', sortable: false, info: t('SenderInfo')},
  { title: t('Channel'), key: 'channel', sortable: false, info: t('NotificationHistoryChannel')},
  { title: t('Alert'), key: 'alert', sortable: false, info: t('NotificationHistoryAlert')},
  { title: t('NotificationRule'), key: 'rule', sortable: false, info: t('NotificationHistoryRule')},
  { title: t('Error'), key: 'error', sortable: false, info: t('NotificationHistoryError')},
])

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getHistory()
})


const tempQuery = ref('')
const query = computed({
  get: () => store.state.notificationHistory.query.q,
  set: (val) => tempQuery.value = val
})
const routeQuery = computed(() => route.query)

watch(routeQuery, (val) => (val as Query))

function setQuery(q: Query) {
  store.dispatch('notificationHistory/updateQuery', q)
  getHistory()
}

setQuery(route.query as Query)

const pagination = computed({
  get: () => store.getters['notificationHistory/pagination'],
  set: (value) => store.dispatch('notificationHistory/setPagination', value)
})

function getHistory() {
  if (timeout.value) clearTimeout(timeout.value)
  store.dispatch('notificationHistory/getNotificationHistory')
  timeout.value = setTimeout(getHistory, interval.value)
}

onUnmounted(() => clearTimeout(timeout.value))

const rules = ref<{id: string, name: string}[]>([])
const fetchedIds: string[] = []

const getRule = ({rule, alert}: NotificationHistory) => {
  if (alert == 'Test Notification Channel') return 'Test Notification Channel'
  const id = rule
  const r = rules.value.filter((a) => id == a.id)
  if (fetchedIds.filter((a) => a == id).length == 0) {
    fetchRule(id)
    fetchedIds.push(id)
  } 

  if (r.length > 0) return r[0].name
  else return id
}

const fetchRule = async (id: string) => {
  const r = await store.dispatch('notificationRules/getNotificationRule', id)
  rules.value.push({id: id, name: r.name ?? id})
}

function setSearch(query: string) {
  store.dispatch('notificationHistory/updateQuery', {q: query})
  router.push({query: {...route.query, q: query}})
  getHistory()
}

function clearSearch() {
  store.dispatch('notificationHistory/updateQuery', {q: ''})
  router.push({query: {...route.query, q: undefined}})
  getHistory()
}

function setPagination(value: Pagination) {
  store.dispatch('notificationHistory/setPagination', value)
  getHistory()
}

function rowProps({ item }: { item: any }) {
  return {
    class: `${item.sent ? '' : 'critical'} severity text-no-wrap table-row`,
  }
}


getHistory()

</script>