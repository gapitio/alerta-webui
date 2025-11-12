<template>
  <div class="tab-item-wrapper">
    <v-data-table
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="history"
      :row-props="rowProps"
      :cell-props="columnsProps"
      fixed-header
      style="max-height: calc(80vh - 74px); overflow: auto"
      item-value="index"
    >
      <template #[`header.updateTime`]="{column}">
        {{ column.title }}
        <v-icon icon="arrow_drop_down" />
      </template>
      <template #[`item.id`]="{item}">
        <td>
          <span class="console-text">{{ filters.shortId(item.id) }}</span>
        </td>
      </template>
      <template #[`item.updateTime`]="{item}">
        <td
          class="text-no-wrap"
        >
          <date-time
            :value="item.updateTime"
            format="mediumDate"
          />
        </td>
      </template>
      <template 
        v-for="col in ['status', 'type']"
        #[`item.${col}`]="{item}"
        :key="col"
      >
        <td
          class="text-no-wrap"
        >
          <v-chip
            size="small"
            variant="flat"
            class="chip"
          >
            {{ filters.capitalize(item[col as 'status' | 'type']) }}
          </v-chip>
        </td>
      </template>
      <template #[`item.severity`]="{item}">
        <td
          class="text-no-wrap"
        >
          <v-chip
            size="small"
            variant="flat"
            class="chip"
            :class="[`${item.severity}`]"
          >
            {{ filters.capitalize(item.severity) }}
          </v-chip>
        </td>
      </template>
      <template #[`item.timeout`]="{item}">
        <td
          class="text-no-wrap"
        >
          {{ filters.hhmmss(item.timeout) }}
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" setup>
import type { Alert, SortBy } from '@/plugins/store/types/alerts-types';
import { computed, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFilters } from '@/filters';

const { t } = useI18n()
const filters = useFilters()

const props = defineProps<{alert: Alert}>()

const headers = ref([
  { title: t('AlertOrNoteId'), value: 'id' },
  { title: t('UpdateTime'), value: 'updateTime' },
  { title: t('Severity'), value: 'severity' },
  { title: t('Status'), value: 'status' },
  { title: t('Timeout'), value: 'timeout' },
  { title: t('Type'), value: 'type' },
  { title: t('Event'), value: 'event' },
  { title: t('Value'), value: 'value' },
  { title: t('User'), value: 'user' },
  { title: t('Text'), value: 'text' }
])

const sortBy: Ref<SortBy[]> = ref([
  {
    key:'updateTime',
    order: 'desc'
  }
])

const history = computed(() => 
  props.alert.history.map((h, index) => ({ index: index, ...h }))
)

function rowProps({ item }: { item: any }) {
  return {
    class: `${item.status == 'open' ? item.severity : item.status == 'ack' ? 'ack' : ''} severity hover-lighten text-no-wrap table-row`,
  }
}

function columnsProps() {
  return {
    class: `table-column`,
  }
}

</script>
