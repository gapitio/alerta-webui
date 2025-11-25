<template>
  <v-btn
    prepend-icon="download"
    :text="t('Export')"
    variant="outlined"
    class="no-cap-btn btn"
    @click.stop="dialog = true"
  />
  <v-dialog v-model="dialog" scrollable max-width="540px">
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-row>
            <v-col cols="6">
              <span class="header">
                {{ t('ExportOptions') }}
              </span>
            </v-col>
            <v-col cols="3" align="end">
              <alerts-history-filter />
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-text style="overflow-x: hidden">
          <v-row>
            <v-col cols="12">
              <g-text-field v-model="filename" show-header :label="t('Filename')" />
            </v-col>
            <v-col cols="6" align="center">
              <v-btn :text="t('SelectAllHeaders')" variant="outlined" class="no-cap-btn btn" @click.stop="selectAll" />
            </v-col>
            <v-col cols="6" align="center">
              <v-btn
                :text="t('SelectCustomHeaders')"
                variant="outlined"
                class="no-cap-btn btn"
                @click.stop="selectCustom"
              />
            </v-col>
            <v-col cols="12">
              <g-select v-model="keys" show-header :items="allKeys" :label="t('Headers')" clearable multiple />
            </v-col>
            <v-col cols="12">
              <g-text-field
                v-model="length"
                :rules="[(a: string) => (toNumber(a) > 0 ? true : 'Please enter a number')]"
                show-header
                :label="t('MaxLength')"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="4">
            <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="dialog = false">
              {{ t('Cancel') }}
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              color="primary-600"
              :loading="isLoading"
              variant="flat"
              class="no-cap-btn"
              width="247"
              @click="() => validate()"
            >
              {{ t('Export') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {History} from '@/plugins/store/types/alerts-types'
import {generateCsv, download, mkConfig} from 'export-to-csv'
import {toNumber} from 'lodash'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {VForm} from 'vuetify/components'
import {useStore} from 'vuex'

const store: Store = useStore()
const {t} = useI18n()

const dialog = ref(false)
const form = ref<VForm | null>(null)
const filename = ref('History')
const length = ref(1000)
type Key = keyof History
const defaultKeys: Key[] = [
  'id',
  'href',
  'environment',
  'resource',
  'event',
  'origin',
  'customer',
  'severity',
  'group',
  'status',
  'value',
  'text',
  'type',
  'service',
  'tags',
  'updateTime',
  'user',
  'timeout'
]
const attributes = computed<Set<string>>(
  () => new Set(...store.state.alerts.alerts.map(a => Object.keys(a.attributes).map(a => `attributes.${a}`)))
)
const allKeys = computed<(Key | string)[]>(() => [...defaultKeys, ...attributes.value])
const customKeys: (Key | 'attributes.Full_tag')[] = [
  'updateTime',
  'severity',
  'status',
  'environment',
  'resource',
  'event',
  'service',
  'attributes.Full_tag',
  'text',
  'value',
  'id',
  'type',
  'group',
  'origin',
  'tags'
]
const keys = ref<(Key | string)[]>(JSON.parse(JSON.stringify(customKeys)))

let itemsPerPage = 20
const isLoading = computed(() => store.state.notificationHistory.isLoading)

watch(dialog, val => {
  if (val) itemsPerPage = store.state.alerts.historyPagination.itemsPerPage
  else store.dispatch('alerts/setHistoryPagination', {itemsPerPage, page: 1})
  filename.value = 'History'
  length.value = 1000
  keys.value = JSON.parse(JSON.stringify(customKeys))
})

const getHistory = () => {
  store.dispatch('alerts/getAlertHistory')
  store.dispatch('alerts/getAlerts')
}
const selectAll = () => (keys.value = allKeys.value)
const selectCustom = () => (keys.value = customKeys)

async function validate(close?: boolean) {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    apply()
    getHistory()
    if (close) dialog.value = false
  }
}

function toCsv(data: History[]) {
  console.log(data)
  if (data.length < 1) {
    store.dispatch('notifications/error', {message: 'No data to export', name: 'NoData'})
    return
  }
  const options = mkConfig({
    filename: filename.value,
    quoteCharacter: '"',
    decimalSeparator: 'locale',
    useKeysAsHeaders: true
  })
  const csvContent = data.map(item => {
    const o: {[key: string]: any} = {}
    for (const key of keys.value) {
      const [isAttribute, clKey] = key.includes('attributes') ? [true, key.replace('attributes.', '')] : [false, key]
      if (isAttribute && item['attributes'].hasOwnProperty(clKey))
        o[key] =
          typeof item['attributes'][clKey] == 'string'
            ? item['attributes'][clKey].replace(/^([=, +])/, "'$1")
            : item['attributes'][clKey]
      else if (item.hasOwnProperty(key)) {
        const typedKey = clKey as Key
        if (item[typedKey] === null || item[typedKey] === undefined) o[key] = ''
        else
          switch (Object.prototype.toString.call(item[typedKey])) {
            case '[object Array]':
              o[key] = (item[typedKey] as Array<any>).join(',')
              break
            case '[object Object]':
              o[key] = JSON.stringify(item[typedKey])
              break
            default:
              o[key] = item[typedKey]
          }
      }
    }
    return o
  })
  console.log('content', csvContent)
  download(options)(generateCsv(options)(csvContent))
}

async function apply() {
  await store.dispatch('alerts/setHistoryPagination', {itemsPerPage: length.value, page: 1})
  const d = await store.dispatch('alerts/getAlertHistory')
  store.dispatch('alerts/setHistoryPagination', {itemsPerPage, page: 1})
  toCsv(d)
}
</script>
