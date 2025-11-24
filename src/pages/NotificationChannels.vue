<template>
  <g-text-field
    v-model="search"
    prepend-inner-icon="search"
    :label="t('Search')"
    clearable
    hide-details
    style="position: absolute; top: 2.5px; right: calc(25vw); width: 40vw; background: white"
  />
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('NotificationChannels') }}
        <information-dialog :title="t('NotificationChannelsInfo')" :info="headers" />

        <v-btn
          v-has-perms="'write:notification.channel'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px"
          :text="t('AddNotificationChannel')"
          @click="dialog = true"
        />
        <notification-channel-add :dialog="dialog" :item="selectedItem" :copy="copy" @close="close" />

        <notification-channel-send :item="selectedItem" :dialog="sendDialog" @close="closeSend" />
      </h1>
    </v-col>
    <v-col cols="auto" align-self="center">
      <notification-channels-filter />
    </v-col>
  </v-row>
  <v-row class="pt-0 mt-0">
    <div v-for="(f, d) in filter" :key="d">
      <v-col v-if="typeof f == 'object' && (f?.length ?? 0) > 0" cols="auto">
        <v-chip v-for="a in f" :key="a" variant="flat" class="chip" size="small"> {{ d }}: {{ a }} </v-chip>
      </v-col>
      <v-col v-else-if="typeof f == 'string'" cols="auto">
        <v-chip variant="flat" class="chip" size="small"> {{ d }}: {{ f }} </v-chip>
      </v-col>
    </div>
  </v-row>

  <v-data-table
    v-model:sort-by="sortBy"
    class="table"
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    :search="search"
    :headers="headers"
    style="max-height: calc(99vh - calc(43px + 64px))"
    fixed-header
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    :items="items"
  >
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:notificationChannels'"
        icon="play_arrow"
        density="compact"
        variant="text"
        @click="send(item)"
      />
      <v-btn
        v-has-perms.disable="'write:notificationChannels'"
        icon="edit"
        density="compact"
        variant="text"
        @click="editItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:notificationChannels'"
        icon="content_copy"
        density="compact"
        variant="text"
        @click="copyItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:notificationChannels'"
        icon="delete"
        density="compact"
        variant="text"
        @click="deleteItem(item)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {SortBy} from '@/plugins/store/types/alerts-types'
import type {NotificationChannel} from '@/plugins/store/types/notificationChannel-types'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Notification Channels',
    requiresAuth: true
  }
})

const {t} = useI18n()
const store: Store = useStore()

const search = ref('')
const dialog = ref(false)
const sendDialog = ref(false)
const copy = ref(false)
const selectedItem = ref<Partial<NotificationChannel> | null>(null)
const headers = ref<
  {
    title: string
    key: keyof NotificationChannel | 'actions'
    info?: string | string[]
    align?: 'start' | 'end' | 'center' | undefined
  }[]
>([
  {title: t('Name'), key: 'id', info: t('NotificationChannelId')},
  {title: t('Sender'), key: 'sender', info: t('SenderInfo')},
  {title: t('Type'), key: 'type', info: t('NotificationChannelType')},
  {title: t('Host'), key: 'host', info: t('HostInfo')},
  {title: t('Verify'), key: 'verify', info: t('VerifyInfo')},
  {title: t('Actions'), key: 'actions', align: 'end'}
])
const sortBy = ref<SortBy[]>([{key: 'id', order: 'asc'}])

const items = computed(() => store.state.notificationChannels.items)
const refresh = computed(() => store.state.refresh)

watch(refresh, val => {
  if (!val) return
  getItems()
})

function getItems() {
  store.dispatch('notificationChannels/getNotificationChannels')
}
const filter = computed(() => store.state.notificationChannels.filter)

function deleteItem(item: NotificationChannel) {
  confirm(t('ConfirmDelete')) && store.dispatch('notificationChannels/deleteNotificationChannel', item.id)
  getItems()
}

function editItem(item: NotificationChannel) {
  selectedItem.value = item
  dialog.value = true
}

function send(item: NotificationChannel) {
  selectedItem.value = item
  sendDialog.value = true
}

function renumber(name: string): string {
  const replace = name.replace(/_(\d+)$/, (_, n) => `_${+n + 1}`)
  return replace == name ? `${name}_1` : replace
}

function copyItem(item: NotificationChannel) {
  selectedItem.value = {...item, id: renumber(item.id)}
  copy.value = true
  dialog.value = true
}

function close() {
  dialog.value = false
  copy.value = false
  selectedItem.value = null
}

function closeSend() {
  sendDialog.value = false
  selectedItem.value = null
}

getItems()
</script>
