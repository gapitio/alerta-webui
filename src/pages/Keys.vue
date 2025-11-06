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
        {{ t('APIKeys') }}
        
        <v-btn
          v-has-perms="'write:keys'"
          prepend-icon="add"
          class="no-cap-btn bg-primary-600"
          style="position: absolute; right: 10px;"
          :text="t('AddApiKey')"
          @click="dialog = true"
        />
        <key-add 
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
      <keys-filter />
    </v-col>
  </v-row>
  

  <g-switch 
    v-model="showExpired"
    :label="t('ShowExpired')"
    class="switch-primary"
  />

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
    <template #[`item.key`]="{item}">
      {{ item.key }}
      <v-btn
        variant="text"
        icon
        @click.stop="() => copyKey(item)"
      >
        <v-icon>content_copy</v-icon>
        <v-tooltip 
          :text="keyTooltip"
          activator="parent"
          location="top"
        />
      </v-btn>
    </template>
    <template #[`item.status`]="{item}">
      <v-icon :icon="item.status === 'active' ? 'check' : 'close' " />
    </template>
    
    <template
      v-for="desc in ['expireTime', 'lastUsedTime']"
      #[`item.${desc}`]="{item}"
      :key="desc"
    >
      <date-time
        :value="item[desc as 'expireTime' | 'lastUsedTime']"
      />
    </template>
    <template #[`item.scopes`]="{item}">
      <v-chip
        v-for="scope in item.scopes"
        :key="scope"
        outline
        size="small"
        variant="flat"
        class="chip"
      >
        {{ scope }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn
        v-has-perms.disable="'write:keys'"
        icon="edit"
        density="compact"
        variant="text"
        @click="editItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:keys'"
        icon="content_copy"
        density="compact"
        variant="text"
        @click="copyItem(item)"
      />
      <v-btn
        v-has-perms.disable="'write:keys'"
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
import type { Key } from '@/plugins/store/types/keys-types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "API Keys",
    requiresAuth: true
  }
});

const { t } = useI18n()
const store: Store = useStore()

const dialog = ref(false)
const selectedItem = ref<Partial<Key> | null>(null)
const showExpired = ref(true)
const keyTooltip = ref(t('Copy'))
const search = ref('')

const headers = ref<{title: string, key: keyof Key | 'actions', info?: string | string[], maxWidth?: number}[]>([
  { title: t('APIKey'), key: 'key'},
  { title: t('Active') + '?', key: 'status'},
  { title: t('Scopes'), key: 'scopes'},
  { title: t('Description'), key: 'text'},
  { title: t('Expires'), key: 'expireTime'},
  { title: t('Count'), key: 'count'},
  { title: t('LastUsed'), key: 'lastUsedTime'},
  { title: t('Actions'), key: 'actions' }
])
const items = computed(() => store.state.keys.items.filter((h) => showExpired.value || h.status ==='active'))
const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getItems()
})

function getItems() {
  store.dispatch('keys/getKeys')
}

async function copyKey(item: Key) {
  try {
    await navigator.clipboard.writeText(item.key!)
    keyTooltip.value = t('Copied')
  } catch (error) {
    console.error('Failed to copy key: ', error)
    keyTooltip.value = t('CopyFail')
  }
  setTimeout(() => keyTooltip.value = t('Copy'), 2000)
}


function deleteItem(item: Key) {
  confirm(t('ConfirmDelete')) &&
  store.dispatch('keys/deleteKey', item.id!)
  getItems()
}

function editItem(item: Key) {
  selectedItem.value =  item
  dialog.value = true
}


function copyItem(item: Key) {
  selectedItem.value =  {...item, id: undefined, key: undefined}
  dialog.value = true
}

function close() {
  dialog.value = false
  selectedItem.value = null
}


getItems()
</script>