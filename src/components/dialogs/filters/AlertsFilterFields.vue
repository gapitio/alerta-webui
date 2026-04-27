<template>
  <v-card-text style="overflow-x: hidden">
    <v-row>
      <v-col cols="12">
        <g-select
          v-model="model.filter.environments"
          show-header
          :items="envs"
          :label="t('Environment')"
          clearable
          multiple
        />
      </v-col>
      <v-col cols="12">
        <g-combobox
          v-model="model.filter.severity"
          show-header
          :items="severities"
          :label="t('Severity')"
          clearable
          multiple
        />
      </v-col>
      <v-col cols="12">
        <g-select v-model="model.filter.status" show-header :items="statuses" :label="t('Status')" clearable multiple />
      </v-col>
      <v-col cols="12">
        <g-select
          v-model="model.filter.service"
          show-header
          :items="services"
          :label="t('Service')"
          clearable
          multiple
        />
      </v-col>
      <v-col cols="12">
        <g-select v-model="filterDateRange" show-header :items="dateRanges" :label="t('SelectRange')" />
      </v-col>
      <v-col v-if="showSelectDate" cols="6">
        <date-edit v-model="model.period.startDate" show-header :label="t('StartDate')" />
      </v-col>
      <v-col v-if="showSelectDate" cols="6">
        <g-combobox v-model="model.period.startTime" show-header :items="times" :label="t('StartTime')" />
      </v-col>
      <v-col v-if="showSelectDate" cols="6">
        <date-edit v-model="model.period.endDate" show-header :label="t('EndDate')" />
      </v-col>
      <v-col v-if="showSelectDate" cols="6">
        <g-combobox v-model="model.period.endTime" show-header :items="times" :label="t('EndTime')" />
      </v-col>

      <v-col cols="6">
        <g-combobox
          v-model="model.filter.tags"
          show-header
          :items="tags"
          :label="t('Tags') + ' - ' + t('OR')"
          clearable
          multiple
        />
      </v-col>
      <v-col cols="6">
        <g-combobox
          v-model="model.filter.tag"
          show-header
          :items="tags"
          :label="t('Tags') + ' - ' + t('AND')"
          clearable
          multiple
        />
      </v-col>
      <v-col cols="12" class="pb-0">
        <g-combobox
          v-model="model.filter.resource"
          show-header
          show-details
          :label="t('Resource')"
          clearable
          multiple
        />
      </v-col>
      <v-col cols="12" class="pb-0">
        <g-combobox v-model="model.filter.event" show-header show-details :label="t('Event')" clearable multiple />
      </v-col>
      <v-col cols="12" class="pb-0">
        <g-combobox v-model="model.filter.text" show-header show-details :label="t('Description')" clearable multiple />
      </v-col>
      <v-col cols="12" class="pb-0">
        <g-combobox v-model="model.filter.value" show-header show-details :label="t('Value')" clearable multiple />
      </v-col>
      <v-col v-for="col in columns" :key="col" cols="12" class="pb-0">
        <g-combobox v-model="model.filter[col]" show-header show-details :label="col" clearable multiple />
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {FilterEdit} from '@/plugins/store/types/alerts-types'
import type {DateRange} from '@/plugins/store/types/notificationHistory-types'
import moment from 'moment'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

const store: Store = useStore()
const {t} = useI18n()

const model = defineModel<FilterEdit>({
  default: {
    filter: {dateRange: {}},
    period: {
      startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      startTime: moment().format('HH:mm'),
      endDate: moment().format('YYYY-MM-DD'),
      endTime: moment().format('HH:mm')
    }
  }
})
const times = computed(() =>
  Array.from(
    {
      length: (24 * 60) / 15 + 1
    },
    (v, i) => {
      if (i == 0) {
        return null
      } else {
        const h = Math.floor(((i - 1) * 15) / 60)
        const m = (i - 1) * 15 - h * 60
        return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2)
      }
    }
  )
)

const showSelectDate = computed(() => filterDate.value === 'selectRange')
const dateRanges = ref<{title: string; value: FilterKey}[]>([
  {title: t('Latest'), value: 'latest'},
  {title: t('Hour'), value: 'hour'},
  {title: t('SixHours'), value: 'sixHours'},
  {title: t('TwelveHours'), value: 'twelveHours'},
  {title: t('SelectRange'), value: 'selectRange'}
])

const alarmModel = computed(() => store.getters.getConfig('alarm_model'))
const severities = computed(() => Object.keys(alarmModel.value.severity))
const statuses = computed(() => Object.keys(alarmModel.value.status))
const services = computed(() => store.getters['alerts/services'])
const tags = computed(() => store.getters['alerts/tags'])
const envs = computed(() => {
  const e = store.getters.getConfig('environments')
  return [...e, ...e.map(val => '!' + val)]
})

type FilterKey = 'latest' | 'hour' | 'sixHours' | 'twelveHours' | 'selectRange'
const filterDate = ref<FilterKey>('latest')

const dateValues: {[key: string]: DateRange} = {
  latest: {},
  hour: {from: -3600},
  sixHours: {from: -3600 * 6},
  twelveHours: {from: -3600 * 12},
  selectRange: {select: true}
}
const filterDateRange = computed({
  get: () => filterDate.value,
  set: val => {
    filterDate.value = val
    model.value.filter.dateRange = dateValues[val]
  }
})

const knownCols = [
  'id',
  'resource',
  'event',
  'environment',
  'severity',
  'correlate',
  'status',
  'service',
  'group',
  'value',
  'text',
  'tag',
  'tags',
  'customTags',
  'attributes',
  'origin',
  'type',
  'createTime',
  'timeout',
  'rawData',
  'customer',
  'duplicateCount',
  'repeat',
  'previousSeverity',
  'trendIndication',
  'receiveTime',
  'lastReceiveId',
  'lastReceiveTime',
  'updateTime',
  'note'
]

const columns = computed(() =>
  store.getters
    .getConfig('columns')
    .filter(c => !knownCols.includes(c))
    .map(a => 'attributes.' + a)
)

const assignFilterDateRange = () => {
  const fDateRange = model.value.filter.dateRange
  if (fDateRange.from === undefined) filterDate.value = 'latest'
  else if (fDateRange.select) filterDate.value = 'selectRange'
  else {
    for (const key in dateValues) {
      const typedKey = key as FilterKey
      if (fDateRange.from == dateValues[typedKey].from) filterDate.value = typedKey
    }
  }
  if (fDateRange.select) {
    const t1 = moment.unix(fDateRange.from!)
    const t2 = moment.unix(fDateRange.to!)
    model.value.period = {
      startDate: t1.format('YYYY-MM-DD'),
      startTime: t1.format('HH:mm'),
      endDate: t2.format('YYYY-MM-DD'),
      endTime: t2.format('HH:mm')
    }
  }
}

defineExpose({reset: () => (filterDateRange.value = 'latest')})
assignFilterDateRange()
</script>
