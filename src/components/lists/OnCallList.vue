<template>
  <confirm ref="confirm_ref" />
  <v-data-table-server
    v-model:sort-by="pagination.sortBy"
    v-model:items-per-page="pagination.itemsPerPage"
    class="table"
    :headers="computedHeaders"
    :items="items"
    style="max-height: calc(100vh - calc(64px + 74px))"
    :items-length="pagination.totalItems ?? 0"
    :items-per-page-options="pagination.itemsPerPageOptions"
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    @update:options="setPagination"
  >
    <template v-for="desc in ['repeatDays', 'repeatWeeks', 'repeatMonths']" #[`item.${desc}`]="{item}">
      {{ item[desc as 'repeatDays']?.join(', ') ?? '' }}
    </template>
    <template #[`item.usersEmails`]="{item}">
      <v-chip
        v-for="email in item.usersEmails.filter(e => emails[e] !== undefined)"
        :key="email"
        class="chip"
        size="x-small"
        variant="flat"
        :text="emails[email]"
      />
      <v-chip
        v-for="email in item.usersEmails.filter(e => emails[e] === undefined)"
        :key="email"
        class="chip critical"
        size="x-small"
        variant="flat"
        :text="email"
      />
    </template>
    <template #[`item.groupIds`]="{item}">
      {{ getGroupNames(item.groupIds).join(', ') }}
    </template>
    <template v-for="desc in ['startTime', 'endTime']" #[`item.${desc}`]="{item}">
      {{
        item[desc as 'startTime' | 'endTime'] ? filters.hhmmUtcToLocal(item[desc as 'startTime' | 'endTime']!) : null
      }}
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:on_calls'"
        icon="edit"
        density="compact"
        variant="text"
        @click="emit('open', item)"
      />
      <v-btn
        v-has-perms.disable="'write:on_calls'"
        icon="content_copy"
        density="compact"
        variant="text"
        @click="
          () => {
            const {id, ...copy} = item
            emit('open', copy)
          }
        "
      />
      <v-btn
        v-has-perms.disable="'write:on_calls'"
        icon="delete"
        density="compact"
        variant="text"
        @click="deleteItem(item)"
      />
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import {useFilters} from '@/filters'
import type {Pagination} from '@/plugins/store/types/alerts-types'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Store} from '@/plugins/store/types'
import {useStore} from 'vuex'
import type {OnCall} from '@/plugins/store/types/onCall-types'
import type Confirm from '../dialogs/Confirm.vue'

const store: Store = useStore()
const {t} = useI18n()
const filters = useFilters()

const emit = defineEmits(['open'])

const confirm_ref = ref<InstanceType<typeof Confirm> | null>(null)

const headers = ref<{title: string; key: keyof OnCall | 'actions'; info?: string | string[]; align?: 'end'}[]>([
  {title: t('Users'), key: 'usersEmails'},
  {title: t('Groups'), key: 'groupIds'},
  {title: t('Start'), key: 'startTime'},
  {title: t('End'), key: 'endTime'},
  {title: t('StartDate'), key: 'startDate'},
  {title: t('EndDate'), key: 'endDate'},
  {title: t('Days'), key: 'repeatDays'},
  {title: t('Weeks'), key: 'repeatWeeks'},
  {title: t('Months'), key: 'repeatMonths'},
  {title: t('Actions'), key: 'actions', align: 'end'}
])

const refresh = computed(() => store.state.refresh)
const items = computed(() => store.state.onCalls.items)
const computedHeaders = computed(() =>
  headers.value.filter(h => (store.state.config.customer_views ? true : h.key != 'customer'))
)
const emails = computed(() => Object.fromEntries(store.state.users.emails.map(e => [e.email, e.name])))

const pagination = computed({
  get: () => store.getters['onCalls/pagination'],
  set: value => store.dispatch('onCalls/setPagination', value)
})

function setPagination(value: Pagination) {
  store.dispatch('onCalls/setPagination', value)
  getItems()
}

async function deleteItem(item: OnCall) {
  confirm_ref.value &&
    (await confirm_ref.value.open(t('ConfirmDelete'))) &&
    store.dispatch('onCalls/deleteOnCall', item.id!)
  getItems()
}

function getGroupNames(ids: string[]) {
  return ids.map(id => getGroupName(id))
}

function getGroupName(id: string) {
  const group = store.state.notificationGroups.items.find(u => u.id == id)
  return group?.name ?? id
}

watch(refresh, val => {
  if (!val) return
  getItems()
})

function getItems() {
  store.dispatch('onCalls/getOnCalls')
}

function getEmails() {
  store.dispatch('users/getEmails')
}

function getGroups() {
  store.dispatch('notificationGroups/getNotificationGroups')
}

getItems()
getEmails()
getGroups()
</script>
