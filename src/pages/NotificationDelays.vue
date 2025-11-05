<template>
  <h1>
    {{ t('NotificationDelays') }}
  </h1>

  <v-data-table-server
    v-model:items-per-page="pagination.itemsPerPage"
    class="table"
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    :headers="headers"
    :items-length="pagination.totalItems ?? 0"
    :items-per-page-options="pagination.itemsPerPageOptions"
    style="max-height: calc(99vh - calc(43px + 64px))"
    fixed-header
    :items="items"
    @update:options="setPagination"
  >
    <template #[`item.delay_time`]="{item}">
      <date-time :value="item.delay_time" />
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:perms'"
        icon="delete"
        density="compact"
        variant="text"
        @click="deleteItem(item)"
      />
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { NotificationDelay } from '@/plugins/store/types/notificationDelay-types';
import type { Pagination } from '@/plugins/store/types/alerts-types';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Notification Delays",
    requiresAuth: true
  }
});

const { t } = useI18n()
const store: Store = useStore()

const headers = ref<{
  title: string,
  sortable: false,
  key: keyof NotificationDelay | 'actions',
  info?: string | string[],
  align?: "start" | "end" | "center"
  }[]>
([
  { title: t('Alert'), key: 'alert_id', sortable: false},
  { title: t('NotificationRule'), key: 'notification_rule_id', sortable: false},
  { title: t('Time'), key: 'delay_time', sortable: false},
  { title: t('Actions'), key: 'actions', align:'end', sortable: false }
])
const items = computed(() => store.state.notificationDelays.items)
const timeout = ref<number | undefined>(undefined)
const interval = computed(() => store.getters.getPreference('refreshInterval') ?? store.getters.getConfig('refresh_interval'))

const pagination = computed({
  get:() => store.getters['notificationDelays/pagination'],
  set: setPagination
})

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getItems()
})

function getItems() {
  if (timeout.value) clearTimeout(timeout.value)
  store.dispatch('notificationDelays/getNotificationDelays')
  timeout.value = setTimeout(getItems, interval.value)
}

onUnmounted(() => clearTimeout(timeout.value))

function deleteItem(item: NotificationDelay) {
  confirm(t('ConfirmDelete')) &&
  store.dispatch('notificationDelays/deleteNotificationDelay', item.id)
  getItems()
}

function setPagination(value: Pagination) {
  store.dispatch('notificationDelays/setPagination', value)
  getItems()
}

getItems()
</script>