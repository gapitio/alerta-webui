<template>
  <v-tooltip top>
    <template #activator>
      <span class="text-no-wrap">
        {{ $filters.date(value, displayMode, formatString) }}
      </span>
    </template>
  </v-tooltip>
</template>

<script lang="ts">

import moment from 'moment'
import i18n from '@/plugins/i18n'
moment.locale(i18n.locale)

export default {
  props: {
    value: { type: String, required: true },
    format: { type: String, default: 'mediumDate' }
  },
  computed: {
    displayMode() {
      return this.$store.state.prefs.timezone
    },
    formatString() {
      return (
        this.$store.state.prefs.dates[this.format] ||
        this.$config.dates[this.format]
      )
    }
  }
}
</script>

<style></style>
