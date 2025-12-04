<template>
  <h1 class="mt-2">
    {{ t('AlertSettings') }}
  </h1>

  <v-row>
    <v-col cols="12">
      <g-checkbox
        v-model="allowedEnv"
        :label-right="t('ShowAllowedEnvs')"
      />
    </v-col>
    <v-col cols="12">
      <g-checkbox
        v-model="noteIcon"
        :label-right="t('ShowNotesIcon')"
      />
    </v-col>
    <v-col cols="12">
      <g-select 
        v-model="refreshInterval"
        show-header
        :items="refreshOptions"
        :label="t('RefreshInterval')"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Store } from '@/plugins/store/types';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const { t } = useI18n()
const store: Store = useStore()

const refreshOptions = [2, 5, 10, 30, 60]
const allowedEnv = computed({
  get: () => store.getters.getPreference('showAllowedEnvs'),
  set: (val) => store.dispatch('toggle', ['showAllowedEnvs', val])
})


const refreshInterval = computed({
  get: () => (store.getters.getPreference('refreshInterval') || store.getters.getConfig('refresh_interval')) / 1000,
  set: (val) => store.dispatch('setUserPrefs', {refreshInterval: val * 1000})
})

const noteIcon = computed({
  get: () => store.getters.getPreference('showNotesIcon'),
  set: val => store.dispatch('setUserPrefs', {showNotesIcon: val})
})
</script>