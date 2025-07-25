<template>
  <h1>
    {{ t('Users') }}
    <v-btn
      perms="write:notification_rules"
      prepend-icon="add"
      class="no-cap-btn bg-primary-600"
      style="position: absolute; right: 10px;"
      :text="t('AddUser')"
      @click="dialog = true"
    />
  </h1>
  <user-add 
    :dialog="dialog"
    :item="selectedItem"
    @close="close"
  />
  <v-data-table
    :headers="headers"
    fixed-header
    style="max-height: calc(100vh - calc(48px + 68px))"
    :items="users"
    item-value=""
    multi-sort
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    density="compact"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    class="table"
  >
    <template #[`item.createTime`]="{ item }">
      <date-time :value="item.createTime" />
    </template>
    <template #[`item.roles`]="{ item }">
      <v-chip
        v-for="role in item.roles"
        :key="role"
        :text="role"
        label
        size="x-small"
        class="chip"
      />
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:notification_rules'"
        icon="edit"
        density="compact"
        variant="text"
        @click="editItem(item)"
      />
      
      <v-btn
        v-has-perms.disable="'write:notification_rules'"
        icon="delete"
        density="compact"
        variant="text"
        @click="deleteUser(item.id!)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { User } from '@/plugins/store/types/users-types';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const { t } = useI18n()
const store: Store = useStore()

const dialog = ref(false)
const selectedItem = ref<User | null>(null)

const users = computed(() => store.state.users.items)
const headers = computed(():{title: string, key: keyof User | 'actions'}[] => ([
  {title: t('Name'), key: 'name'},
  {title: t('Status'), key: 'status'},
  {title: t('Login'), key: 'login'},
  {title: t('Email'), key: 'email'},
  {title: t('Phone'), key: 'phoneNumber'},
  {title: t('Verified'), key: 'email_verified'},
  {title: t('Roles'), key: 'roles'},
  {title: t('Created'), key: 'createTime'},
  {title: t('Comment'), key: 'text'},
  {title: t('Actions'), key: 'actions'},
]))

function getUsers() {
  store.dispatch('users/getUsers')
  selectedItem.value = null
}

function deleteUser(id: string) {
  if (confirm(t('ConfirmDelete'))) store.dispatch('users/deleteUser', id)
}

function editItem(item: User) {
  selectedItem.value =  item
  dialog.value = true
}

function close() {
  dialog.value = false
  selectedItem.value =  null
}

getUsers()
</script>