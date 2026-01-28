<template>
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('NotificationSend') }}

        <v-btn
          v-has-perms="'write:notification.send'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px"
          :text="t('PrepareNotification')"
          @click="dialog = true"
        />
        <notification-send-diag :items="items" :dialog="dialog" @close="close" />
      </h1>
    </v-col>
  </v-row>

  <v-data-table
    v-model:sort-by="sortBy"
    class="table"
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    :headers="headers"
    style="max-height: calc(100vh - calc(74px + 64px))"
    fixed-header
    :items="items"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
  >
    <template v-for="desc in ['sms', 'mail']" #[`item.${desc}`]="{item}" :key="desc">
      <g-checkbox v-model="item[desc as 'sms' | 'mail']" @update="() => updateNotifcationSend(item)" />
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {SortBy} from '@/plugins/store/types/alerts-types'
import type {NotificationSend} from '@/plugins/store/types/notificationSends-types'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Notification Send',
    requiresAuth: true
  }
})

const {t} = useI18n()
const store: Store = useStore()

const dialog = ref(false)
const sortBy = ref<SortBy[]>([{key: 'name', order: 'asc'}])

const headers = ref<
  {
    title: string
    key: keyof NotificationSend
    info?: string | string[]
    align?: 'start' | 'end' | 'center' | undefined
  }[]
>([
  {title: t('Name'), key: 'name'},
  {title: t('Type'), key: 'type'},
  {title: t('Email'), key: 'mail'},
  {title: t('SMS'), key: 'sms'}
])
const items = computed(() => store.state.notificationSends.items)
const refresh = computed(() => store.state.refresh)

watch(refresh, val => {
  if (!val) return
  getItems()
})
function getItems() {
  store.dispatch('notificationSends/getNotificationSends')
}

function updateNotifcationSend(item: NotificationSend) {
  store.dispatch('notificationSends/updateNotificationSend', [
    item.id,
    {
      mail: item.mail,
      sms: item.sms
    }
  ])
}

function close() {
  dialog.value = false
}

getItems()
</script>
