<template>
  <v-btn
    prepend-icon="filter_list"
    :text="t('Filter')"
    variant="outlined"
    class="no-cap-btn btn"
    @click.stop="dialog = true"
  />
  <v-dialog v-model="dialog" scrollable max-width="540px">
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-row>
            <v-col cols="8">
              <span class="header">
                {{ t('Filters') }}
              </span>
            </v-col>
            <v-col cols="4" align="end">
              <v-btn variant="outlined" class="no-cap-btn btn" width="247" @click.stop="reset">
                {{ t('Reset') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <alerts-filter-fields v-model="editedItem" ref="fields" />

        <v-card-actions class="dialog-card-actions">
          <v-col cols="4">
            <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="dialog = false">
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="4">
            <v-btn color="primary-600" variant="flat" class="no-cap-btn" width="247" @click="() => validate(true)">
              {{ t('OK') }}
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn color="primary-600" variant="flat" class="no-cap-btn" width="247" @click="() => validate()">
              {{ t('Apply') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {FilterEdit} from '@/plugins/store/types/alerts-types'
import moment from 'moment'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {VForm} from 'vuetify/components'
import {useStore} from 'vuex'

const store: Store = useStore()
const {t} = useI18n()

const dialog = ref(false)
const form = ref<VForm | null>(null)
const fields = ref<any | null>()

const defaultFilter = computed(() => store.getters.getConfig('filter'))
const storeFilter = computed({
  get: () => store.state.alerts.filter,
  set: val => store.dispatch('alerts/setFilter', val)
})

const editedItem = ref<FilterEdit>({
  filter: {dateRange: {}},
  period: {
    startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    startTime: moment().format('HH:mm'),
    endDate: moment().format('YYYY-MM-DD'),
    endTime: moment().format('HH:mm')
  }
})

watch(dialog, () => {
  editedItem.value.filter = {
    ...JSON.parse(JSON.stringify(storeFilter.value))
  }
})

function reset() {
  editedItem.value.filter = JSON.parse(JSON.stringify(defaultFilter.value))
  if (fields.value) fields.value.reset()
}

function toEpoch(date: string, time: string) {
  return new Date(date + ' ' + time).getTime() / 1000
}

async function validate(close?: boolean) {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    apply()
    if (close) dialog.value = false
  }
}

function compareDict(a: any, b: any) {
  if (a === null) return true
  for (const key in a) {
    if (b[key] === undefined) return false
    if (a[key] !== null && typeof a[key] === typeof {}) {
      if (b[key] === null || a[key].length !== b[key].length || !compareDict(a[key], b[key])) return false
    } else if (a[key] !== b[key]) return false
  }
  return true
}

function apply() {
  const {filter, period} = editedItem.value
  if (!compareDict(filter, storeFilter.value)) store.dispatch('filterTabs/setCurrentTab', 'user-defined')
  storeFilter.value = {
    ...filter,
    environment: (filter.environment?.length ?? 0 > 0) ? filter.environment : undefined,
    dateRange: {
      ...filter.dateRange,
      from: !filter.dateRange.select ? filter.dateRange.from : toEpoch(period.startDate!, period.startTime!),
      to: !filter.dateRange.select ? filter.dateRange.to : toEpoch(period.endDate!, period.endTime!)
    }
  }
}

const getTags = () => store.dispatch('alerts/getTags')
const getEnvironments = () => store.dispatch('alerts/getEnvironments')
const getServices = () => store.dispatch('alerts/getServices')

const getData = () => {
  getTags()
  getEnvironments()
  getServices()
}
getData()
</script>
