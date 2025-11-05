<template>
  <g-combobox
    v-model="search"
    prepend-inner-icon="search"
    :label="t('Search')"
    variant="outlined"
    clearable
    hide-details
    style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
  />
  <h1>{{ t('Heartbeats') }}</h1>
  <v-data-table
    class="table"
    :row-props="{class: 'table-row bg-surface-tertiary'}"
    :cell-props="{class: 'table-column'}"
    :headers="headers"
    fixed-header
    :search="search"
    sort-desc-icon="arrow_drop_down"
    sort-asc-icon="arrow_drop_up"
    style="max-height: calc(100vh - calc(64px + 74px));"
    :items="items"
  >
    <template 
      v-for="desc in ['receiveTime', 'createTime']"
      :key="desc"
      #[`item.${desc}`]="{ item }"
    >
      <date-time :value="item[desc as 'receiveTime' | 'createTime']" />
    </template>
    <template #[`item.latency`]="{ item }">
      {{ item.latency }} ms
    </template>
    <template #[`item.tags`]="{ item }">
      {{ item.tags.join(', ') }}
    </template>
    <template #[`item.status`]="{ item }">
      <v-chip
        label
        class="chip"
        :class="item.status"
      >
        {{ item.status }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{item}">
      <v-btn 
        icon="delete" 
        variant="text"
        @click="deleteItem(item.id)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const { t } = useI18n()
const store: Store = useStore()

const search = ref('')

const headers = computed(() => ([
  {title: t('Origin'), key: 'origin'},
  {title: t('Tags'), key: 'tags'},
  {title: t('Attributes'), key: 'attributes'},
  {title: t('CreateTime'), key: 'createTime'},
  {title: t('ReceiveTime'), key: 'receiveTime'},
  {title: t('Latency'), key: 'latency'},
  {title: t('Timeout'), key: 'timeout'},
  {title: t('Status'), key: 'status'},
  {title: t('Actions'), key: 'actions', sortable: false},
]))

const items = computed(() => store.state.heartbeats.items)
definePage({
  meta: {
    requiresAuth: true,
    title: 'Heartbeats'
  }
})

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getItems()
})



const timeout = ref<number | undefined>(undefined)
const interval = computed(() => store.getters.getPreference('refreshInterval'))

function getItems() {
  if(timeout.value) clearTimeout(timeout.value)
  store.dispatch('heartbeats/getHeartbeats')
  timeout.value = setTimeout(getItems, interval.value)
}

function deleteItem(id: string) {
  store.dispatch('heartbeats/deleteHeartbeat', id)
}

onUnmounted(() => clearTimeout(timeout.value))

getItems()

</script>