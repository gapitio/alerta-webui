<template>
  <v-card>
    <v-card-title primary-title style="padding-left: 16px">
      <div>
        <div class="headline">{{ t('Top') }} {{ pagination.itemsPerPage }} {{ title }}</div>
        <br />
        <span class="grey--text">{{ info }}</span>
      </div>
      <v-spacer />
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      fixed-header
      style="max-height: calc(99vh - calc(48px + 74px + 84px + 64px))"
      :items-per-page="pagination.itemsPerPage"
      :items-per-page-options="pagination.itemsPerPageOptions"
      class="px-2"
      :row-props="{class: 'bg-surface-tertiary table-row'}"
      :cell-props="{class: 'table-column'}"
      hide-actions
      @update:options="updateRowsPerPage"
    >
      <template #[`item.event`]="{item}">
        <span style="white-space: nowrap">{{ item.event }}</span>
      </template>
      <template v-for="desc in ['environments', 'services']" :key="desc" #[`item.${desc}`]="{item}">
        {{ item[desc as 'environments'].join(', ') }}
      </template>
      <template #[`item.resources`]="{item}">
        <v-row class="mt-1 mb-1">
          <v-col v-for="a in item.resources" :key="a.id" cols="auto" class="pb-0 pt-0">
            <router-link :to="`/alert/${a.id}`">
              {{ a.resource }}
            </router-link>
          </v-col>
        </v-row>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type {Store} from '@/plugins/store/types'
import type {Report} from '@/plugins/store/types/reports-types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()

defineProps<{items: Report[]; title: string; info: string}>()

const updateRowsPerPage = (val: any) => store.dispatch('reports/setPageSize', val.itemsPerPage)

const headers = ref([
  {title: t('Event'), value: 'event', sortable: false},
  {title: t('Count'), value: 'count', sortable: false},
  {title: t('DuplCount'), value: 'duplicateCount', sortable: false},
  {title: t('Environments'), value: 'environments', sortable: false},
  {title: t('Services'), value: 'services', sortable: false},
  {title: t('Resources'), value: 'resources', sortable: false}
])

const pagination = computed(() => store.state.reports.pagination)
</script>
