<template>
  <h1 class="mt-2 pl-0">
    {{ t('Localization') }}
  </h1>
  <v-row>
    <v-col cols="12">
      <g-select v-model="language" show-header :items="langs" :label="t('Language')" />
    </v-col>
    <v-col cols="12">
      <g-select v-model="longDate" show-header :items="DateFormats" :label="t('LongDate')" />
    </v-col>
    <v-col cols="12">
      <g-select v-model="mediumDate" show-header :items="DateFormats" :label="t('MediumDate')" />
    </v-col>
    <v-col cols="12">
      <g-select v-model="shortTime" show-header :items="timeFormat" :label="t('ShortTime')" />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import moment from 'moment'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

const {t, locale} = useI18n()
const store: Store = useStore()

const langs = [
  {title: t('English'), value: 'en'},
  {title: t('French'), value: 'fr'},
  {title: t('German'), value: 'de'},
  {title: t('Turkish'), value: 'tr'}
]

const mediumFormats = ['l', 'L', 'll', 'LL', 'ddd D MMM HH:mm', 'lll', 'llll', 'LLL', 'LLLL']
const longFormats = [
  'ddd D MMM, YYYY HH:mm:ss.SSS Z',
  'l hh:mm:ss.SSS A',
  'YYYY-MM-DD HH:mm:ss.SSS Z',
  'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
]
const timeFormats = ['LT', 'LTS', 'hh:mm:ss.SSS A', 'HH:mm', 'HH:mm:ss', 'HH:mm:ss.SSS', 'HH:mm:ss.SSS Z']

const DateFormats = computed(() => {
  moment.locale(locale.value)
  const allDateFormats = [
    ...new Set([
      store.getters.getConfig('dates').mediumDate,
      ...mediumFormats,
      store.getters.getConfig('dates').longDate,
      ...longFormats
    ])
  ]
  return allDateFormats.map(f => ({title: moment().format(f), value: f}))
})

const timeFormat = computed(() => {
  moment.locale(locale.value)
  return timeFormats.map(f => ({title: moment().format(f), value: f}))
})

const language = computed({
  get: () => store.getters.getPreference('languagePref'),
  set: val => store.dispatch('setUserPrefs', {languagePref: val})
})

const longDate = computed({
  get: () => store.getters.getPreference('dates').longDate,
  set: val => store.dispatch('setUserPrefs', {dates: {longDate: val}})
})
const mediumDate = computed({
  get: () => store.getters.getPreference('dates').mediumDate,
  set: val => store.dispatch('setUserPrefs', {dates: {mediumDate: val}})
})
const shortTime = computed({
  get: () => store.getters.getPreference('dates').shortTime,
  set: val => store.dispatch('setUserPrefs', {dates: {shortTime: val}})
})
</script>
