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
        {{ t('Permissions') }}
        
        <v-btn
          perms="write:perms"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px;"
          :text="t('AddPermission')"
          @click="dialog = true"
        />
        <perm-add 
          :dialog="dialog"
          :item="selectedItem"
          @close="close"
        />
      </h1>
    </v-col>
    <v-col
      cols="auto"
      align-self="center"
    >
      <perms-filter />
    </v-col>
  </v-row>

  <v-data-table
    class="table"
    :row-props="{class: 'bg-surface-tertiary table-row'}"
    :cell-props="{class: 'table-column'}"
    :search="search"
    :headers="headers"
    style="max-height: calc(99vh - calc(43px + 64px))"
    fixed-header
    :items="items"
  >
    <template #[`item.match`]="{item}">
      {{ item.match }}
      <v-icon
        v-if="isDefault(item.match)" 
        icon="lock"
      />
    </template>
    <template #[`item.scopes`]="{item}">
      <v-chip
        v-for="scope in item.scopes"
        :key="scope"
        outline
        variant="flat"
        size="small"
        class="chip"
      >
        {{ scope }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:perms'"
        :disabled="isDefault(item.match)"
        icon="edit"
        density="compact"
        variant="text"
        @click="editItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:perms'"
        icon="content_copy"
        density="compact"
        variant="text"
        @click="copyItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:perms'"
        :disabled="isDefault(item.match)"
        icon="delete"
        density="compact"
        variant="text"
        @click="deleteItem(item)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { Permission } from '@/plugins/store/types/perms-types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Perms",
    requiresAuth: true
  }
});


const { t } = useI18n()
const store: Store = useStore()


const dialog = ref(false)
const selectedItem = ref<Partial<Permission> | null>(null)
const search = ref('')

const headers = ref<{title: string, key: keyof Permission | 'actions', info?: string | string[], maxWidth?: number}[]>([
  { title: t('Role'), key: 'match'},
  { title: t('Scopes'), key: 'scopes'},
  { title: t('Actions'), key: 'actions', maxWidth: 20 }
])
const items = computed(() => store.state.perms.items)
const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getItems()
})

function getItems() {
  store.dispatch('perms/getPerms')
}

// FIXME: these can be changed by backend config! Should be fetched from backend
const isDefault = (match: string) => ['user', 'admin', 'guest'].includes(match)

function getScopes() {
  store.dispatch('perms/getScopes')
}

function deleteItem(item: Permission) {
  confirm(t('ConfirmDelete')) &&
  store.dispatch('perms/deletePerm', item.id!)
  getItems()
}

function editItem(item: Permission) {
  selectedItem.value =  item
  dialog.value = true
}


function copyItem(item: Permission) {
  selectedItem.value =  {...item, id: undefined}
  dialog.value = true
}

function close() {
  dialog.value = false
  selectedItem.value = null
}


getItems()
getScopes()
</script>