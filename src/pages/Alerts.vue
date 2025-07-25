<template>
  <g-combobox
    v-model="query"
    prepend-inner-icon="search"
    append-inner-icon="push_pin"
    :label="t('Search')"
    variant="outlined"
    clearable
    hide-details
    :items="userQueries"
    validate-on="submit"
    style="position: absolute; top: 2.5px;right: calc(25vw); width: 40vw; background: white;"
    delete-items
    @keydown.enter="(e: any) => setSearch(e.target.value)"
    @click:prepend-inner="setSearch(query ?? '')"
    @click:append-inner="saveSearch(query ?? '')"
    @click:clear="clearSearch"
    @select-item="(item: any) => setSearch(item.value)"
    @delete-item="(item: any) => deleteSearch(item.value)"
  />

  <v-card variant="flat">
    <h1> {{ t('Alerts') }} </h1>
    <v-tabs
      v-model="currentTab"
      slider-color="secondary"
    >
      <v-tab
        v-for="env in environments"
        :key="env"
        :value="env"
        class="big-font bold no-cap-btn"
        @click="setEnv(env)"
      >
        {{ env }}&nbsp;({{ environmentCounts[env] || 0 }})
      </v-tab>
      <div style="position: absolute; right: 0px;">
        <v-btn
          flat
          icon
          :class="{ 'filter-active': isActive }"
          @click="sidesheet = !sidesheet"
        >
          <v-icon>filter_list</v-icon>
        </v-btn>

        <v-tooltip :text="t('DownloadAsCsv')">
          <template #activator="{props}">
            <v-btn 
              v-bind="props" 
              icon="download"
              variant="text"
              @click="toCsv(alerts)"
            />
          </template>
        </v-tooltip>
      </div>
    </v-tabs>
    <alert-list
      :filter="filter"
    />
  </v-card>

  <alert-list-filter
    :value="sidesheet"
    @close="sidesheet = false"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { generateCsv, download, mkConfig } from 'export-to-csv'
import { useI18n } from 'vue-i18n'
// import utils from '@/common/utils'
import type { Query } from '@/plugins/store/types/alerts-types'
import type { State, Store } from '@/plugins/store/types'

definePage({
  meta: {
    title: "Alerts",
    requiresAuth: true
  }
});
const store: Store = useStore<State>()
const route = useRoute()
const router = useRouter()
const {t} = useI18n()

const currentTab = ref('')
const sidesheet = ref(false)
const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const tab = ref('All')

const filter = computed(() => store.state.alerts.filter)
const storeQuery = computed(() => store.state.alerts.query.q)
const query = ref<string | null>(null)
const routeQuery = computed(() => route.query)

watch(storeQuery, (val) => query.value = val)


watch(routeQuery, (val) => setQuery(val as Query))

setQuery(route.query as Query)

const userQueries = computed(() => store.getters.getUserQueries.map(
  (q) => ({title: q.q, value: q.q, props: {appendIcon: 'delete'}})
))


const defaultTab = computed(() => filter.value.environment || 'All')

const isActive = computed(() =>
  filter.value.text || filter.value.status || filter.value.customer ||
  filter.value.service || filter.value.group || filter.value.dateRange[0] || filter.value.dateRange[1]
)

const alerts = computed(() => {
  const allAlerts = store.getters['alerts/alerts']
  const filterText = filter.value.text
  return filterText
    ? allAlerts.filter(alert =>{
        const alertKeys = Object.keys(alert) as [keyof typeof alert]
        return alertKeys.some((k: keyof typeof alert) => alert[k]?.toString().toLowerCase().includes(filterText.toLowerCase()))
      })
    : allAlerts.map(b => ({ ...b, service: b.service?.join(', ') }))
})

const isNewOpenAlerts = computed(() =>
  alerts.value
    .filter(alert => !filter.value.environment || filter.value.environment === alert.environment)
    .filter(alert => alert.status === 'open')
    .some(alert => !alert.repeat)
)

const showAllowedEnvs = computed(() => store.getters.getPreference('showAllowedEnvs'))

const environments = computed(() => ['All', ...store.getters['alerts/environments'](showAllowedEnvs.value)])

const environmentCounts = computed(() => store.getters['alerts/counts'])

const refreshInterval = computed(() =>
  store.getters.getPreference('refreshInterval') ||
  store.getters.getConfig('refresh_interval')
)

const refresh = computed(() => store.state.refresh)
const isMute = computed(() => store.getters.getPreference('isMute'))

const showPanel = computed({
  get: () => store.state.alerts.showPanel,
  set: (val: boolean) => store.dispatch('alerts/toggle', ['showPanel', val])
})

function setQuery(q: Query) {
  store.dispatch('alerts/updateQuery', q)
  getAlerts()
}

function setSearch(q: string) {
  store.dispatch('alerts/updateQuery', { q })
  router.push({ query: { ...route.query, q } })
  getAlerts()
}

function saveSearch(q: string) {
  store.dispatch('addUserQuery', { q })
}

function deleteSearch(q: string) {
  store.dispatch('removeUserQuery', { q })
}

function clearSearch() {
  store.dispatch('alerts/updateQuery', { q: '' })
  router.push({ query: { ...route.query, q: undefined } })
  getAlerts()
}

// function setFilter(f: any) {
//   store.dispatch('alerts/setFilter', {
//     environment: f.environment,
//     text: f.text,
//     status: f.status ? f.status.split(',') : null,
//     customer: f.customer ? f.customer.split(',') : null,
//     service: f.service ? f.service.split(',') : null,
//     group: f.group ? f.group.split(',') : null,
//     dateRange: f.dateRange ? f.dateRange.split(',').map(n => (n ? parseInt(n) : null)) : [null, null]
//   })
// }

function setPage(page: number) {
  store.dispatch('alerts/setPagination', { page })
}

function setKiosk(isKiosk: boolean) {
  store.dispatch('alerts/updateKiosk', isKiosk)
}

async function getAlerts() {
  return await store.dispatch('alerts/getAlerts')
}

function getQueries() {
  store.dispatch('getUserQueries')
}


function getEnvironments() {
  store.dispatch('alerts/getEnvironments')
}

function playSound(audioRef: HTMLAudioElement | null) {
  if (!isMute.value && audioRef) audioRef.play()
}

function setEnv(env: string) {
  store.dispatch('alerts/setFilter', {
    environment: env === 'All' ? null : env
  })
}

async function refreshAlerts(audioRef: HTMLAudioElement | null) {
  getEnvironments()
  getQueries()
  await getAlerts()
  if (isNewOpenAlerts.value) playSound(audioRef)
  timer.value = setTimeout(() => refreshAlerts(audioRef), refreshInterval.value)
}

function cancelTimer() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

function toCsv(data: typeof alerts.value) {
  const options = mkConfig({
    filename: `Alerts_${filter.value.environment || 'All'}`,
    quoteCharacter: '"',
    decimalSeparator: 'locale',
    showTitle: true,
    useBom: true,
    useKeysAsHeaders: true,
  })

  const attrs: any = {}
  data.forEach(d => Object.keys(d.attributes).forEach(attr => attrs[`attributes.${attr}`] = d.attributes[attr]))
  const csvContent = data.map(
    ({ correlate, service, tags, rawData, ...item }) => ({
      correlate: correlate?.join(','),
      service: typeof service == 'object' ? service?.join(',') : service,
      tags: tags?.join(','),
      ...attrs,
      ...item,
      rawData: rawData ? rawData.toString() : ''
    })
  )
  download(options)(generateCsv(options)(csvContent))
}

// Lifecycle hooks
onMounted(() => {
  setQuery(route.query as Query)
  // const hash = route.hash?.replace(/^#/, '')
  // if (hash) {
  //   const hashMap = utils.fromHash(hash)
  //   setFilter(hashMap)
  //   setSort(hashMap)
  //   setPanel(hashMap.asi === '1')
  // }
  setKiosk(route.query.isKiosk === 'true')
  cancelTimer()
  refreshAlerts(null)
})

onBeforeUnmount(() => {
  cancelTimer()
})

watch(() => tab.value, () => {
  setPage(1)
})

watch(filter, () => {
  history.replaceState(history.state, '', store.getters['alerts/getHash'])
  tab.value = defaultTab.value
  cancelTimer()
  refreshAlerts(null)
}, { deep: true })

watch(refresh, async (val) => {
  if (!val) {
    await getAlerts()
    getEnvironments()
  }
})

watch(showPanel, () => {
  history.replaceState(history.state, '', store.getters['alerts/getHash'])
})
</script>

<style>
.filter-active::after {
  background-color: rgb(255, 82, 82);
  border-radius: 50%;
  box-sizing: border-box;
  content: " ";
  height: 8px;
  position: absolute;
  right: 7px;
  top: 9px;
  width: 8px;
}
</style>
