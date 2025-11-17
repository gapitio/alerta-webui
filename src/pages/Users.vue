<template>
  <g-text-field
    v-model="search"
    prepend-inner-icon="search"
    :label="t('Search')"
    clearable
    hide-details
    style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
  />
  <v-row>
    <v-col cols="auto">
      <h1>
        {{ t('Users') }}
        <v-btn
          v-has-perms="'admin:users'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px;"
          :text="t('AddUser')"
          @click="dialog = true"
        />
      </h1>
    </v-col>
    <v-col 
      cols="auto"
      align-self="center"
    >
      <users-filter />
    </v-col>
  </v-row>
  <v-row class="pt-0 mt-0">
    <div
      v-for="(f, d) in filter"
      :key="d"
    >
      <v-col
        v-if="typeof(f) == 'object' && (f?.length ?? 0) > 0"
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
    </div>
  </v-row>
  <v-row>
    <v-col
      cols="auto"
    >
      <g-switch 
        :model-value="status.active"
        :label="t('ShowActive')"
        class="switch-primary"
        @update:model-value="(value: boolean) => store.dispatch('users/setActiveFilter', {active: value})"
      />
    </v-col>
    <v-col 
      cols="auto"
    >
      <g-switch 
        :model-value="status.inactive"
        :label="t('ShowDeactivated')"
        color="primary"
        @update:model-value="(value: boolean) => store.dispatch('users/setActiveFilter', {inactive: value})"
      />
    </v-col>
  </v-row>
  <user-add 
    :dialog="dialog"
    :item="selectedItem"
    @close="close"
  />
  <v-data-table
    v-model:sort-by="sortBy"
    :headers="headers"
    fixed-header
    style="max-height: calc(100vh - calc(74px + 64px + 64px))"
    :items="users"
    multi-sort
    :search="search"
    :row-props="{class: 'bg-surface-tertiary table-row text-no-wrap'}"
    :cell-props="{class: 'table-column'}"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    class="table"
  >
    <template #[`item.createTime`]="{ item }">
      <date-time :value="item.createTime" />
    </template>
    <template #[`item.status`]="{ item }">
      <g-switch 
        v-model="item.status"
        true-value="active"
        false-value="inactive"
        @update:model-value="(val: string) => setUserStatus([item.id!, val])"
      />
    </template>
    <template #[`item.email_verified`]="{ item }">
      <v-icon
        :icon="item.email_verified ? 'check_box' : 'check_box_outline_blank'"
        :color="'primary-600'"
        style="font-variation-settings: 'FILL' 1;"
      />
    </template>
    <template #[`item.roles`]="{ item }">
      <v-chip
        v-for="role in item.roles"
        :key="role"
        :text="role"
        variant="flat"
        size="x-small"
        class="chip"
      />
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'admin:users'"
        icon="edit"
        density="compact"
        variant="text"
        @click="editItem(item)"
      />
      
      <v-btn
        v-has-perms.disable="'admin:users'"
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
import type { SortBy } from '@/plugins/store/types/alerts-types';
import type { User } from '@/plugins/store/types/users-types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Users",
    requiresAuth: true
  }
});


const { t } = useI18n()
const store: Store = useStore()

const dialog = ref(false)
const selectedItem = ref<User | null>(null)
const search = ref('')
const status = computed(() => store.state.users.activeFilter)
const sortBy = ref<SortBy[]>([{key: 'name', order: 'asc'}])

const filter = computed(() => store.state.users.filter )
const users = computed(() => store.state.users.items)
const headers = computed(():{title: string, key: keyof User | 'actions', align?: 'end'}[] => ([
  {title: t('Name'), key: 'name'},
  {title: t('Status'), key: 'status'},
  {title: t('Login'), key: 'login'},
  {title: t('Email'), key: 'email'},
  {title: t('Phone'), key: 'phoneNumber'},
  {title: t('Verified'), key: 'email_verified'},
  {title: t('Roles'), key: 'roles'},
  {title: t('Created'), key: 'createTime'},
  {title: t('Comment'), key: 'text'},
  {title: t('Actions'), key: 'actions', align: 'end'},
]))

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getUsers()
})


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

function setUserStatus(item: [string, string]) {
  store.dispatch('users/setUserStatus', item)
}

getUsers()
</script>