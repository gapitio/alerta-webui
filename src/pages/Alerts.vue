<template>
  <div class="alerts">
    <v-dialog
      v-model="densityDialog"
      max-width="340px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title class="justify-center">
            <span class="title">
              {{ $t('ChooseDisplayDensity') }}
            </span>
          </v-card-title>
          <v-card-actions class="justify-center">
            <v-btn
              value="comfortable"
              :class="{ primary: displayDensity == 'comfortable' }"
              @click="displayDensity = 'comfortable'"
            >
              {{ $t('Comfortable') }}
            </v-btn>
            <v-btn
              value="compact"
              :class="{ primary: displayDensity == 'compact' }"
              @click="displayDensity = 'compact'"
            >
              {{ $t('Compact') }}
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="ok"
            >
              {{ $t('OK') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <Transition name="expand">
      <div
        v-if="showPanel"
        class="px-1"
      >
        <v-row no-gutters>
          <v-col
            v-for="(indicator, index) in indicators"
            :key="index"
          >
            <alert-indicator
              :title="indicator.text"
              :query="indicator.query"
            />
          </v-col>
        </v-row>
        <v-divider />
      </div>
    </Transition>

    <v-card>
      <v-toolbar>
        <v-toolbar-title :text="$t('Alerts')" />
        {{ $vuetify }}
        <v-text-field />
      </v-toolbar>
      <v-tabs
        v-model="currentTab"
        align-tabs="center"
        grow
      >
        <v-tab
          v-for="env in environments"
          :key="env"
          :value="env"
          @click="setEnv(env)"
        >
          {{ env }}&nbsp;({{ environmentCounts[env] || 0 }})
        </v-tab>
        <v-btn
          flat
          icon
          :class="{ 'filter-active': isActive }"
          @click="sidesheet = !sidesheet"
        >
          <v-icon>mdi-filter-variant</v-icon>
        </v-btn>

        <v-menu
          bottom
          left
        >
          <template #activator="{ props }">
            <v-btn
              flat
              icon
              v-bind="props"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              :disabled="!indicators.length"
              @click="showPanel = !showPanel"
            >
              <v-list-item-title>
                {{ showPanel ? $t('Hide') : $t('Show') }} {{ $t('Panel') }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="densityDialog = true"
            >
              {{ $t('DisplayDensity') }}
            </v-list-item>
            <v-list-item
              @click="toCsv(alerts)"
            >
              {{ $t('DownloadAsCsv') }}
            </v-list-item>
          </v-list>
        </v-menu>
      </v-tabs>
      

      <v-tabs-window v-model="currentTab">
        <v-tabs-window-item
          v-for="env in environments"
          :key="env"
          :value="env"
          class="fill-height"
        >
          <v-container fluid>
            <alert-list
              :filter="filter"
            />
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>

    <alert-list-filter
      :value="sidesheet"
      @close="sidesheet = false"
    />
  </div>
</template>

<script lang="ts">

import {  } from 'export-to-csv'
import utils from '@/common/utils'

export default {
  data: () => ({
    currentTab: null,
    densityDialog: false,
    selectedId: null,
    selectedItem: {},
    sidesheet: false,
    timer: null,
    tab: null,
  }),
  computed: {
    audioURL() {
      return this.$config.audio.new || this.$store.getters.getPreference('audioURL')
    },
    defaultTab() {
      return this.filter.environment ? `${this.filter.environment}` : 'ALL'
    },
    filter() {
      return this.$store.state.alerts.filter
    },
    isActive() {
      return this.filter.text || this.filter.status || this.filter.customer || this.filter.service || this.filter.group || this.filter.dateRange[0] || this.filter.dateRange[1]
    },
    indicators() {
      return this.$config.indicators ? this.$config.indicators.queries  : []
    },
    alerts() {
      if (this.filter.text) {
        return this.$store.getters['alerts/alerts']
          .filter(alert =>
            Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
          )
      } else {
        return this.$store.getters['alerts/alerts'].map((b) => { return {...b, service: b.service.join(', ')}})
      }
    },
    isNewOpenAlerts() {
      return this.alerts
        .filter(alert => this.filter.environment ? this.filter.environment == alert.environment : true)
        .filter(alert => alert.status == 'open')
        .reduce((acc, alert) => acc || !alert.repeat, false)
    },
    showAllowedEnvs() {
      return this.$store.getters.getPreference('showAllowedEnvs')
    },
    environments() {
      return ['ALL'].concat(this.$store.getters['alerts/environments'](this.showAllowedEnvs))
    },
    environmentCounts() {
      return this.$store.getters['alerts/counts']
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    },
    autoRefresh() {
      return true // FIXME: autoRefresh setting comes from server in alert response
    },
    refresh() {
      return this.$store.state.refresh
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
    },
    showPanel: {
      get() {
        return this.$store.state.alerts.showPanel
      },
      set(value) {
        this.$store.dispatch('alerts/toggle', ['showPanel', value])
      }
    },
    displayDensity: {
      get() {
        return (
          this.$store.getters.getPreference('displayDensity') ||
          this.$store.state.alerts.displayDensity
        )
      },
      set(value) {
        if (this.isLoggedIn) {
          this.$store.dispatch('setUserPrefs', {displayDensity: value})
        } else {
          this.$store.dispatch('alerts/set', ['displayDensity', value])
        }
      }
    },
  },
  watch: {
    currentTab() {
      this.setPage(1)
    },
    filter: {
      handler() {
        history.replaceState(history.state, '', this.$store.getters['alerts/getHash'])
        this.currentTab = this.defaultTab
        this.cancelTimer()
        this.refreshAlerts()
      },
      deep: true
    },
    refresh(val) {
      val || this.getAlerts() && this.getEnvironments()
    },
    showPanel() {
      history.replaceState(history.state, '', this.$store.getters['alerts/getHash'])
    }
  },
  created() {
    this.setSearch(this.$route.query)
    if (this.hash) {
      const hashMap = utils.fromHash(this.hash)
      this.setFilter(hashMap)
      this.setSort(hashMap)
      this.setPanel(hashMap)
    }
    this.currentTab = this.defaultTab
    this.setKiosk(this.$route.query.isKiosk)
    this.cancelTimer()
    this.refreshAlerts()
  },
  beforeUnmount() {
    this.cancelTimer()
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('alerts/updateQuery', query)
    },
    setFilter(filter) {
      this.$store.dispatch('alerts/setFilter', {
        environment: filter.environment,
        text: filter.text,
        status: filter.status ? filter.status.split(',') : null,
        customer: filter.customer ? filter.customer.split(',') : null,
        service: filter.service ? filter.service.split(',') : null,
        group: filter.group ? filter.group.split(',') : null,
        dateRange: filter.dateRange ? filter.dateRange.split(',').map(n => n ? parseInt(n) : null) : [null, null]
      })
    },
    setSort(sort) {
      this.$store.dispatch('alerts/setPagination', {
        descending: sort.sd == '1',
        sortBy: sort.sb
      })
    },
    setPage(page) {
      this.$store.dispatch('alerts/setPagination', {page: page})
    },
    setPanel(panel) {
      this.$store.dispatch('alerts/setPanel', panel.asi == '1')
    },
    setKiosk(isKiosk) {
      this.$store.dispatch('alerts/updateKiosk', isKiosk)
    },
    async getAlerts() {
      const res = await this.$store.dispatch('alerts/getAlerts')
      return res
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    playSound() {
      !this.isMute && this.$refs.audio.play()
    },
    setEnv(env) {
      this.$store.dispatch('alerts/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    },
    async refreshAlerts() {
      this.getEnvironments()
      await this.getAlerts()
      this.isNewOpenAlerts && this.playSound()
      this.timer = setTimeout(() => this.refreshAlerts(), this.refreshInterval)
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    ok() {
      this.densityDialog = false
    },
    toCsv(data) {
      const options = {
        fieldSeparator: ',',
        filename: `Alerts_${this.filter.environment || 'ALL'}`,
        quoteStrings: '"',
        decimalSeparator: 'locale',
        showLabels: true,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      }
      const attrs = {}
      data.map(d => Object.keys(d.attributes).forEach((attr) => attrs['attributes.'+attr] = d.attributes[attr]))

      const csvExporter = new ExportToCsv(options)
      csvExporter.generateCsv(data.map(({ correlate, service, tags, rawData, ...item }) => ({
        correlate: correlate.join(','),
        service: service.join(','),
        tags: tags.join(','),
        ...attrs,
        ...item,
        rawData: rawData ? rawData.toString() : ''
      })))
    }
  }
}
</script>

<script setup lang="ts">
  import { useRoute } from 'vue-router';
  definePage({
    meta: {
      requiresAuth: true,
      title: "Alerts",
    },
    
  });
  const route = useRoute();
  const query = route.query
  const isKiosk = route.query.kiosk
  const hash = route.hash
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
