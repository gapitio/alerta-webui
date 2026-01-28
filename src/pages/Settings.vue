<template>
  <v-container width="500px" style="margin-left: calc(475px - 325px)">
    <h1 style="padding-left: 0px">{{ t('Application') }}</h1>
    <v-row no-gutters>
      <v-col cols="12">
        <g-checkbox v-model="isDark" :label-right="t('DarkTheme')" />
      </v-col>
      <v-col cols="12">
        <g-checkbox v-model="sound" :label-right="t('PlaySounds')" />
      </v-col>

      <v-col>
        <v-btn
          v-for="desc in Object.keys(descriptions)"
          :key="desc"
          :variant="view === desc ? 'flat' : 'outlined'"
          class="no-cap-btn btn"
          :class="[view === desc ? 'bg-primary' : '']"
          :text="descriptions[desc as keyof typeof descriptions]"
          @click="() => (view = desc)"
        />
      </v-col>
    </v-row>
    <localization v-if="view === 'loc'" />
    <alert-summary v-if="view === 'alert'" />
  </v-container>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useTheme} from 'vuetify'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Settings',
    requiresAuth: true
  }
})

const store: Store = useStore()
const {t} = useI18n()
const theme = useTheme()

const view = ref('loc')
const descriptions = {
  loc: t('Localization'),
  alert: t('AlertSettings')
  // blackout: t('BlackoutSettings')
}

const isDark = computed({
  get: () => store.getters.getPreference('isDark'),
  set: async val => {
    await store.dispatch('toggle', ['isDark', val])
    getPreferences()
  }
})

const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])

const sound = computed({
  get: () => !store.getters.getPreference('isMute'),
  set: val => store.dispatch('toggle', ['isMute', !val])
})

async function getPreferences() {
  await store.dispatch('getUserPrefs')
  theme.global.name.value = isDark.value ? 'gapitDark' : 'gapitLight'
}

if (isLoggedIn.value) getPreferences()
</script>
