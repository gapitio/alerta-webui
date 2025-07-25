<template>
  <h1>{{ t('NotificationHistory') }}</h1>
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
      {{ filters.date(item.sent_time, 'local', mediumDate) }}
    </template>
    <template #[`item.alert`]="{ item }">
      <a :href="`alert/${item.alert}`"> {{ item.alert }}</a>
    </template>
    <template #[`item.rule`]="{ item }">
      <a :href="`notificationrules?q=id:${item.alert}`"> {{ item.alert }}</a>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { useFilters } from '@/filters';
import type { Store } from '@/plugins/store/types';
import type { Pagination } from '@/plugins/store/types/alerts-types';
import type { NotificationHistory } from '@/plugins/store/types/notificationHistory-types';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const store: Store = useStore()
const { t } = useI18n()
const filters = useFilters()

const mediumDate = computed(() => store.getters.getPreference('dates').mediumDate ?? store.getters.getConfig('dates').mediumDate)

const history = computed(() => store.state.notificationHistory.notification_history)
const headers = ref<{title: string, key: keyof NotificationHistory, sortable?: boolean}[]>([
  { title: t('Id'), key: 'id', sortable: false},
  { title: t('Sent'), key: 'sent', sortable: false},
  { title: t('SentTime'), key: 'sent_time', sortable: false},
  { title: t('Message'), key: 'message', sortable: false},
  { title: t('Receiver'), key: 'receiver', sortable: false},
  { title: t('Sender'), key: 'sender', sortable: false},
  { title: t('Channel'), key: 'channel', sortable: false},
  { title: t('Alert'), key: 'alert', sortable: false},
  { title: t('NotificationRule'), key: 'rule', sortable: false},
  { title: t('Error'), key: 'error', sortable: false},
])

const pagination = computed({
  get: () => store.getters['notificationHistory/pagination'],
  set: (value) => store.dispatch('notificationHistory/setPagination', value)
})

function getHistory() {
  store.dispatch('notificationHistory/getNotificationHistory')
}

function setPagination(value: Pagination) {
  store.dispatch('notificationHistory/setPagination', value)
  getHistory()
}

function rowProps({ item }: { item: any }) {
  return {
    class: `${item.sent ? 'normal' : 'critical'} severity text-no-wrap table-row`,
  }
}


getHistory()

</script>