import capitalize from './capitalize'
import date from './date'
import days from './days'
import hhmmss from './hhmmss'
import shortId from './shortId'
import splitCaps from './splitCaps'
import timeago from './timeago'
import until from './until'

import type { App } from 'vue'

export function registerFilters (app: App) {
  app.config.globalProperties.$filters = {
    capitalize,
    date,
    days,
    hhmmss,
    shortId,
    splitCaps,
    timeago,
    until
  }
}
