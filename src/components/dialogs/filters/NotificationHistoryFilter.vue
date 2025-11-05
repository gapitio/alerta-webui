<template>
  <v-btn
    prepend-icon="filter_list"
    :text="t('Filter')"
    variant="outlined"
    class="no-cap-btn btn"

    @click.stop="dialog = true"
  />
  <v-dialog
    v-model="dialog"
    scrollable
    max-width="540px"
  >
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-row>
            <v-col
              cols="8"
            >
              <span class="header">
                {{ t('Filters') }}
              </span>
            </v-col>
            <v-col
              cols="4"
              align="end"
            >
              <v-btn
                variant="outlined"
                class="no-cap-btn btn"
                width="247"
                @click.stop="reset"
              >
                {{ t('Reset') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-text style="overflow-x: hidden;">
          <v-row>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.message"
                show-header
                :label="t('Message')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.receiver"
                show-header
                :label="t('Receiver')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.channel"
                show-header
                :label="t('Channel')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.rule"
                show-header
                :label="t('Rule')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.alert"
                show-header
                :label="t('Alert')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.error"
                show-header
                :label="t('Error')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-select
                v-model="filterDateRange"
                show-header
                :items="dateRanges"
                :label="t('SelectRange')"
              />
            </v-col>
            <v-col
              v-if="showSelectDate"
              cols="6"
            >
              <date-edit
                v-model="period.startDate"
                show-header
                :label="t('StartDate')"
              />
            </v-col>
            <v-col
              v-if="showSelectDate"
              cols="6"
            >
              <g-combobox
                v-model="period.startTime"
                show-header
                :items="times"
                :label="t('StartTime')"
              />
            </v-col>
            <v-col
              v-if="showSelectDate"
              cols="6"
            >
              <date-edit
                v-model="period.endDate"
                show-header
                :label="t('EndDate')"
              />
            </v-col>
            <v-col
              v-if="showSelectDate"
              cols="6"
            >
              <g-combobox
                v-model="period.endTime"
                show-header
                :items="times"
                :label="t('EndTime')"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="4">
            <v-btn
              variant="outlined"
              width="247"
              class="no-cap-btn btn"
              @click="dialog=false"
            >
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="4">
            <v-btn
              color="primary-600"
              variant="flat"
              class="no-cap-btn"
              width="247"
              @click="() => validate(true)"
            >
              {{ t('OK') }}
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              color="primary-600"
              variant="flat"
              class="no-cap-btn"
              width="247"
              @click="() => validate()"
            >
              {{ t('Apply') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { DateRange, Filter } from '@/plugins/store/types/notificationHistory-types';
import moment from 'moment';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { VForm } from 'vuetify/components';
import { useStore } from 'vuex';


const store: Store = useStore()
const { t } = useI18n()

const dialog = ref(false)
const form = ref<VForm | null>(null)


const times = computed(() => Array.from(
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
))



const filter = computed({
  get: () => store.state.notificationHistory.filter,
  set: (val) => store.dispatch('notificationHistory/setFilter', val)
})
type FilterKey = 'latest' | 'hour' | 'sixHours' | 'twelveHours' | 'selectRange'
const filterDate  = ref<FilterKey>('latest')

const filterDateRange = computed({
  get: () => filterDate.value,
  set: (val) => {
    filterDate.value = val
    editedItem.value.dateRange = dateValues[val]
  }
})
const showSelectDate = computed(() => filterDate.value === 'selectRange')
const dateRanges = ref<{title: string, value: FilterKey}[]>([
  { title: t('Latest'), value: 'latest' },
  { title: t('Hour'), value: 'hour' },
  { title: t('SixHours'), value: 'sixHours' },
  { title: t('TwelveHours'), value: 'twelveHours' },
  { title: t('SelectRange'), value: 'selectRange' },
])

const dateValues: {[key: string]: DateRange} = {
  latest: {},
  hour: {from: -3600},
  sixHours: {from: -3600*6},
  twelveHours: {from: -3600*12},
  selectRange: {select: true}
}

const editedItem= ref<Filter>({
  dateRange: {}
})

watch(dialog, () => {
  editedItem.value = {
    ...JSON.parse(JSON.stringify(filter.value)),
  }
  const fDateRange = filter.value.dateRange
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
    period.value = {
        startDate: t1.format('YYYY-MM-DD'),
        startTime: t1.format('HH:mm'),
        endDate: t2.format('YYYY-MM-DD'),
        endTime: t2.format('HH:mm')
    }
  }
})

const period = ref<{
  startDate: string | null,
  startTime: string | null,
  endDate: string | null,
  endTime: string | null,
}>({
  startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
  startTime: moment().format('HH:mm'),
  endDate: moment().format('YYYY-MM-DD'),
  endTime: moment().format('HH:mm'),
})

function reset() {
  filterDateRange.value = 'latest'
  editedItem.value = JSON.parse(JSON.stringify({dateRange: {}}))
}

function toEpoch(date: string, time: string) {
  const newDate = new Date(date + ' ' + time)
  return newDate.getTime() / 1000
}

const getHistory = () => store.dispatch('notificationHistory/getNotificationHistory')

async function validate(close?: boolean) {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    apply()
    getHistory()
    if (close) dialog.value = false
  }
}

function apply () {
  const item = editedItem.value
  filter.value = {
    ...item,
    dateRange: {
      ...editedItem.value.dateRange,
      from: !editedItem.value.dateRange.select ? editedItem.value.dateRange.from : toEpoch(period.value.startDate!, period.value.startTime!),
      to: !editedItem.value.dateRange.select ? editedItem.value.dateRange.to : toEpoch(period.value.endDate!, period.value.endTime!),
    }
  }
}

</script>