<template>
  <v-card @click="selectAsi()">
    <v-container fluid>
      <v-row>
        <v-col :style="{'background-color': severityColor(maxSeverity)}" align="center" cols="12">
          {{ title }}
        </v-col>
      </v-row>
      <v-row v-if="counts">
        <v-col
          v-for="severity in store.state.config.indicators.severity"
          :key="severity"
          align="center"
          :style="{'background-color': severityColor(severity)}"
        >
          {{ counts[severity] || 0 }}
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts" setup>
import AlertsApi from '../services/api/alert.service'
import {computed, ref, defineProps, watch, onBeforeUnmount, type Ref} from 'vue'
import {useStore} from 'vuex'
import type {Store} from '@/plugins/store/types'
import type {Query} from '@/plugins/store/types/alerts-types'

const store: Store = useStore()

const props = defineProps<{
  title: string
  query: Query
}>()

const counts: Ref<{[key: string]: number}> = ref({})
const maxSeverity = ref('')
const timer: Ref<number | null> = ref(null)

const refresh = computed(() => store.state.refresh)
const timeout = ref<number | undefined>(undefined)
const refreshInterval = computed(
  () => store.getters.getPreference('refreshInterval') || store.getters.getConfig('refresh_interval')
)

watch(refresh, () => {
  refreshList()
})
onBeforeUnmount(() => cancelTimer())
cancelTimer()
refreshCounts()

function selectAsi() {
  // setSearch(new URLSearchParams(this.query))
  setFilter(new URLSearchParams(props.query))
  refreshList()
}

// function setSearch(query: Query) {
//   store.dispatch('alerts/updateQuery', query)
// }

function setFilter(filter: URLSearchParams) {
  store.dispatch('alerts/setFilter', {
    environment: filter.get('environment'),
    text: filter.get('text'),
    status: filter.has('status') ? filter.getAll('status') : null,
    customer: filter.has('customer') ? filter.getAll('customer') : null,
    service: filter.has('service') ? filter.getAll('service') : null,
    group: filter.has('group') ? filter.getAll('group') : null,
    dateRange: {}
  })
}

function severityColor(severity: string) {
  return counts.value && counts.value[severity] > 0
    ? store.getters.getConfig('alarm_model').colors.severity[severity]
    : 'transparent'
}

function getCounts() {
  return AlertsApi.getCounts(new URLSearchParams(props.query)).then(
    response => (counts.value = response.severityCounts)
  )
}

function getMostSevere() {
  const paramsWithOpenStatus = new URLSearchParams(props.query)
  paramsWithOpenStatus.append('status', 'open')

  AlertsApi.getCounts(paramsWithOpenStatus).then(response => {
    maxSeverity.value = store.state.config.alarm_model.defaults.normal_severity
    for (const sev of store.state.config.indicators.severity) {
      if (response.severityCounts[sev] > 0) {
        maxSeverity.value = sev
        break
      }
    }
  })
}

function refreshCounts() {
  getMostSevere()
  getCounts().then(() => (timer.value = setTimeout(() => refreshCounts(), refreshInterval.value)))
}

function refreshList() {
  if (timeout.value) clearTimeout(timeout.value)
  getMostSevere()
  getCounts()
  timeout.value = setTimeout(refreshList)
}

function cancelTimer() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}
</script>
