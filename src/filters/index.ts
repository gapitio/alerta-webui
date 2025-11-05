import capitalize from './capitalize'
import date from './date'
import days from './days'
import {hhmmss, hhmmLocalToUtc, hhmmUtcToLocal} from './hhmmss'
import shortId from './shortId'
import splitCaps from './splitCaps'
import until from './until'
import {getCurrentInstance} from 'vue'

import type {App} from 'vue'

interface Filters {
  capitalize: typeof capitalize
  date: typeof date
  days: typeof days
  hhmmss: typeof hhmmss
  hhmmLocalToUtc: typeof hhmmLocalToUtc
  hhmmUtcToLocal: typeof hhmmUtcToLocal
  shortId: typeof shortId
  splitCaps: typeof splitCaps
  until: typeof until
}

export function registerFilters(app: App) {
  const filters = {
    capitalize,
    date,
    days,
    hhmmss,
    hhmmLocalToUtc,
    hhmmUtcToLocal,
    shortId,
    splitCaps,
    until
  }
  app.config.globalProperties.$filters = filters
}

export function useFilters() {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useConfig must be used within setup()')
  }
  return instance.proxy!.$filters
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $filters: Filters
  }
}
