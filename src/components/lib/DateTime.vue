<template>
  <v-tooltip 
    :text="filters.date(value, displayMode, store.getters.getConfig('dates').longDate)"
    location="top"
  >
    <template #activator="{ props }">
      <div v-bind="props">
        <span style="white-space: nowrap;">
          {{ filters.date(value, displayMode, formatString) }}
          <br v-if="!noBreak">
          ({{ filters.until(value) }})
        </span>
      </div>
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { useFilters } from '@/filters'
import type { Store } from '@/plugins/store/types'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store: Store = useStore()
const filters = useFilters()

const compProps = defineProps<{value: string, format?: 'mediumDate' | 'longDate' | 'shortTime', noBreak?: boolean}>()

const format = computed(() => compProps.format ?? 'mediumDate')
const displayMode = computed(() => store.getters.getPreference('timezone'))
const formatString = computed(() => store.getters.getPreference('dates')[format.value] ?? store.getters.getConfig('dates')[format.value])

</script>
