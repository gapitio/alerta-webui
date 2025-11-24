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
            <v-col cols="8">
              <span class="header">
                {{ t('Export Options') }}
              </span>
            </v-col>
            <v-col cols="4" align="end">
              <notification-history-filter />
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-text style="overflow-x: hidden">
          <v-row>
            <v-col cols="auto">
              <g-switch
                :model-value="activeFilter.sent"
                :label="t('ShowSent')"
                class="switch-primary"
                @update:model-value="
                  (value: boolean) => store.dispatch('notificationHistory/setActiveFilter', {sent: value})
                "
              />
            </v-col>
            <v-col cols="auto">
              <g-switch
                :model-value="activeFilter.error"
                :label="t('ShowError')"
                color="primary"
                @update:model-value="
                  (value: boolean) => store.dispatch('notificationHistory/setActiveFilter', {error: value})
                "
              />
            </v-col>
            <v-col cols="12">
              <g-text-field v-model="filename" show-header :label="t('Filename')" />
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
import type {NotificationHistory} from '@/plugins/store/types/notificationHistory-types'
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
const filename = ref('Notificatoin_History')
const length = ref(1000)
type Key = 'id' | 'sent' | 'sent_time' | 'message' | 'receiver' | 'sender' | 'channel' | 'alert' | 'rule' | 'error'
const allKeys: Key[] = ['id', 'sent', 'sent_time', 'message', 'receiver', 'sender', 'channel', 'alert', 'rule', 'error']
const keys = ref<Key[]>(JSON.parse(JSON.stringify(allKeys)))

let itemsPerPage = 20
const activeFilter = computed(() => store.state.notificationHistory.activeFilter)
const isLoading = computed(() => store.state.notificationHistory.isLoading)

watch(dialog, val => {
  if (val) itemsPerPage = store.state.notificationHistory.pagination.itemsPerPage
  else store.dispatch('notificationHistory/setPagination', {itemsPerPage, page: 1})
  filename.value = 'Notificatoin_History'
  length.value = 1000
  keys.value = JSON.parse(JSON.stringify(allKeys))
})

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

function toCsv(data: NotificationHistory[]) {
  if (data.length < 1) {
    store.dispatch('notifications/error', {message: 'No data to export', name: 'NoData'})
    return
  }
  const options = mkConfig({
    filename: filename.value,
    quoteCharacter: '"',
    decimalSeparator: 'locale',
    showTitle: true,
    useBom: true,
    useKeysAsHeaders: true
  })
  const csvContent = data.map(item => {
    const o: {[key: string]: any} = {}
    for (const key of keys.value) {
      if (item.hasOwnProperty(key)) o[key] = item[key]
    }
    return o
  })
  download(options)(generateCsv(options)(csvContent))
}

async function apply() {
  await store.dispatch('notificationHistory/setPagination', {itemsPerPage: length.value, page: 1})
  const d = await store.dispatch('notificationHistory/getNotificationHistory')
  toCsv(d)
}
</script>
