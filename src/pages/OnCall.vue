<template>
  <h1>
    {{ t('OnCall') }}
    <information-dialog 
      :title="t('OnCall')"
      :info="[{title:'', info: t('OnCallInfo')}]"
    />
    
    <v-btn
      perms="write:oncalls"
      prepend-icon="add"
      class="no-cap-btn bg-primary-600"
      style="position: absolute; right: 10px;"
      :text="t('AddOnCall')"
      @click="dialog = true"
    />
    <on-call-add 
      :dialog="dialog"
      :item="selectedItem"
      @close="close"
    />
  </h1>

  <v-data-table-server
    v-model:items-per-page="pagination.itemsPerPage"
    class="table"
    :headers="computedHeaders"
    :items="items"
    :items-length="pagination.totalItems ?? 0"
    :items-per-page-options="pagination.itemsPerPageOptions"
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    @update:options="setPagination"
  >
    <template 
      v-for="desc in ['repeatDays', 'repeatWeeks', 'repeatMonths']"
      #[`item.${desc}`]="{ item }"
    >
      {{ item[desc as 'repeatDays'].join(', ') }}
    </template>
    <template #[`item.userIds`]="{ item }">
      <v-chip
        v-for="user in item.userIds"
        :key="user"
        class="chip"
        size="x-small"
        variant="flat"
        :text="getUserName(user) ?? user"
      />
    </template>
    <template #[`item.groupIds`]="{ item }">
      {{ getGroupNames(item.groupIds).join(', ') }}
    </template>
    <template 
      v-for="desc in ['startTime', 'endTime']"
      #[`item.${desc}`]="{item}"
    >
      {{ item[desc as 'startTime' | 'endTime'] ? filters.hhmmUtcToLocal(item[desc as 'startTime' | 'endTime']!) : null }}
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:on_calls'"
        icon="edit"
        density="compact"
        variant="text"
        @click="editItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:on_calls'"
        icon="content_copy"
        density="compact"
        variant="text"
        @click="copyItem(item)"
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
import { useFilters } from '@/filters';
import type { Store } from '@/plugins/store/types';
import type { Pagination } from '@/plugins/store/types/alerts-types';
import type { OnCall } from '@/plugins/store/types/onCall-types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "On Call",
    requiresAuth: true
  }
});


const { t } = useI18n()
const store: Store = useStore()
const filters = useFilters()

const dialog = ref(false)
const selectedItem = ref<OnCall | null>(null)

const headers = ref<{title: string, key: keyof OnCall | 'actions', info?: string | string[], align?: 'end'}[]>([
  { title: t('Users'), key: 'userIds'},
  { title: t('Groups'), key: 'groupIds'},
  { title: t('Start'), key: 'startTime', },
  { title: t('End'), key: 'endTime' },
  { title: t('StartDate'), key: 'startDate' },
  { title: t('EndDate'), key: 'endDate' },
  { title: t('Days'), key: 'repeatDays' },
  { title: t('Weeks'), key: 'repeatWeeks' },
  { title: t('Months'), key: 'repeatMonths' },
  { title: t('Actions'), key: 'actions', align: 'end' },
])
const items = computed(() => store.state.onCalls.items)
const computedHeaders = computed(() => headers.value.filter(h => store.state.config.customer_views ? true : h.key != 'customer'))

const pagination = computed({
  get:() => store.getters['onCalls/pagination'],
  set: (value) => store.dispatch('onCalls/setPagination', value)
})

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getItems()
})


function getItems() {
  store.dispatch('onCalls/getOnCalls')
}

function setPagination(value: Pagination) {
  store.dispatch('onCalls/setPagination', value)
  getItems()
}

function getUsers() {
  store.dispatch('users/getUsers')
}

function getGroups() {
  store.dispatch('notificationGroups/getNotificationGroups')
}

function getUserName(id: string) {
  const user = store.state.users.items.find((u) => u.id == id)
  return user?.name ?? id
}

function deleteItem(item: OnCall) {
  confirm(t('ConfirmDelete')) &&
  store.dispatch('onCalls/deleteOnCall', item.id!)
  getItems()
}

function editItem(item: OnCall) {
  selectedItem.value =  item
  dialog.value = true
}


function copyItem(item: OnCall) {
  selectedItem.value =  {...item, id: undefined}
  dialog.value = true
}

function getGroupNames(ids: string[]) {
  return ids.map((id) => getGroupName(id))
}

function getGroupName(id: string) {
    const group = store.state.notificationGroups.items.find((u) => u.id == id)
    return group?.name ?? id
}

function close() {
  dialog.value = false
  selectedItem.value = null
}


getItems()
getUsers()
getGroups()
</script>