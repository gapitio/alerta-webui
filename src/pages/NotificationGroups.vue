<template>
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('NotificationGroups') }}

        <v-btn
          v-has-perms="'write:notification.groups'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px"
          :text="t('AddNotificationGroup')"
          @click="dialog = true"
        />
        <notification-group-add :dialog="dialog" :item="selectedItem" @close="close" />
      </h1>
    </v-col>
    <v-col cols="auto" align-self="center">
      <notification-groups-filter />
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
    :headers="headers"
    style="max-height: calc(99vh - calc(43px + 64px))"
    fixed-header
    :items="items"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
  >
    <template #[`item.usersEmails`]="{item}">
      <v-chip v-for="email in item.usersEmails" :key="email" outline size="small" variant="flat" class="chip">
        {{ emails[email] ?? email }}
      </v-chip>
    </template>
    <template v-for="desc in ['phoneNumbers', 'mails']" #[`item.${desc}`]="{item}" :key="desc">
      {{ item[desc as 'phoneNumbers' | 'mails'].join(', ') }}
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn v-has-perms.disable="'write:perms'" icon="edit" density="compact" variant="text" @click="editItem(item)" />
      <v-btn
        v-has-perms.disable="'write:perms'"
        icon="content_copy"
        density="compact"
        variant="text"
        @click="copyItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:perms'"
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
import type {NotificationGroup} from '@/plugins/store/types/notificationGroup-types'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Notification Groups',
    requiresAuth: true
  }
})

const {t} = useI18n()
const store: Store = useStore()

const dialog = ref(false)
const selectedItem = ref<Partial<NotificationGroup> | null>(null)
const sortBy = ref<SortBy[]>([{key: 'name', order: 'asc'}])

const headers = ref<
  {
    title: string
    key: keyof NotificationGroup | 'actions'
    info?: string | string[]
    align?: 'start' | 'end' | 'center' | undefined
  }[]
>([
  {title: t('Name'), key: 'name'},
  {title: t('Users'), key: 'usersEmails'},
  {title: t('PhoneNumbers'), key: 'phoneNumbers'},
  {title: t('Emails'), key: 'mails'},
  {title: t('Actions'), key: 'actions', align: 'end'}
])
const items = computed(() => store.state.notificationGroups.items)
const filter = computed(() => store.state.notificationGroups.filter)
const refresh = computed(() => store.state.refresh)
const emails = computed(() => Object.fromEntries(store.state.users.emails.map(e => [e.email, e.name])))
watch(refresh, val => {
  if (!val) return
  getItems()
})

function getItems() {
  store.dispatch('notificationGroups/getNotificationGroups')
}

async function deleteItem(item: NotificationGroup) {
  const res = await store.dispatch('notificationRules/getNoificationRulesGroup', item.id)
  const rules = res.notificationRules.map(({id, name}) => name ?? id)
  confirm(`${t('ConfirmDelete')}\nNotification Rules affected:\n - ${rules.join('\n  - ')}`) &&
    store.dispatch('notificationGroups/deleteNotificationGroup', item.id)
  getItems()
}

function editItem(item: NotificationGroup) {
  selectedItem.value = item
  dialog.value = true
}

function renumber(name: string): string {
  const replace = name.replace(/_(\d+)$/, (_, n) => `_${+n + 1}`)
  return replace == name ? `${name}_1` : replace
}

function copyItem(item: NotificationGroup) {
  selectedItem.value = {...item, id: undefined, name: renumber(item.name)}
  dialog.value = true
}

function close() {
  dialog.value = false
  selectedItem.value = null
}

getItems()
</script>
