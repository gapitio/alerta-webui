<template>
  <h1>
    {{ t('Reports') }}

    <v-btn
      flat
      :href="'data:text/csv;,' + report"
      type="text/csv"
      download
    >
      Export
    </v-btn>
  </h1>
  <div style="height: 90vh; overflow: auto;">
    <v-tabs
      v-model="currentTab"
      slider-color="link-active"
    >
      <v-tab
        v-for="type in reportTypes"
        :key="type.value"
        :value="type.value"
        class="big-font bold no-cap-btn"
      >
        {{ type.title }}
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item
        value="flapping" 
        :transition="false"
        :reverse-transition="false"
      >
        <top
          :items="topFlapping"
          :title="t('Flapping')"
          :info="t('TopFlappingDescription')"
        />
      </v-tabs-window-item>
      <v-tabs-window-item
        value="offenders"
        :transition="false"
        :reverse-transition="false"
      >
        <top
          :items="topOffenders"
          :title="t('Offenders')"
          :info="t('TopOffendersDescription')"
        />
      </v-tabs-window-item>
      <v-tabs-window-item
        value="standing"
        :transition="false"
        :reverse-transition="false"
      >
        <top
          :items="topStanding"
          :title="t('Standing')"
          :info="t('TopStandingDescription')"
        />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import type { Store } from '@/plugins/store/types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Reports",
    requiresAuth: true
  }
});

const store: Store = useStore()
const { t } = useI18n()

type ReportType = 'flapping' | 'offenders' | 'standing'

const currentTab = ref<ReportType>('flapping')

const reportTypes: {title: string, value: ReportType}[] = [
  {title: t('Flapping'), value: 'flapping'},
  {title: t('Offenders'), value: 'offenders'},
  {title: t('Standing'), value: 'standing'},
]


const topFlapping = computed(() => store.state.reports.flapping)
const topStanding = computed(() => store.state.reports.standing)
const topOffenders = computed(() => store.state.reports.offenders)
const report = computed(() => store.state.reports.report)

const rowsPerPage = computed(() => store.state.reports.pagination.itemsPerPage)
watch(rowsPerPage, () => getItems())

const refresh = computed(() => store.state.refresh)

watch(refresh, (val) => {
  if (!val) return
  getItems()
})

const getItems = () => {
  getTopFlapping()
  getTopStanding()
  getTopOffenders()
  getReport()
}

const getTopFlapping = () => store.dispatch('reports/getTopFlapping')
const getTopStanding = () => store.dispatch('reports/getTopStanding')
const getTopOffenders = () => store.dispatch('reports/getTopOffenders')
const getReport = () => store.dispatch('reports/getReport')

getItems()
</script>