<template>
  <v-app>
    <div vi-if="!isKiosk">
      <navigation-drawer />

      <v-toolbar
        flat
        class="toolbar bg-surface-tertiary"
      >
        <v-spacer />

        <v-btn
          v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
          icon
          @click="toggleFullScreen"
        >
          <v-icon :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" />
          <v-tooltip
            location="bottom"
            activator="parent"
            :text="t('FullScreen')"
          />
        </v-btn>

        <v-btn
          v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
          icon
          @click="refresh"
        >
          <v-icon icon="refresh" />
          <v-tooltip
            location="bottom"
            activator="parent"
            :text="t('Refresh')"
          />
        </v-btn>
        <v-menu
          v-if="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
            >
              <v-avatar
                size="32px"
              >
                <img
                  v-if="avatar && !error"
                  :src="avatar"
                  @error="error = true"
                >
                <v-icon
                  v-else
                  icon="account_circle"
                />
              </v-avatar>
            </v-btn>
          </template>

          <profile-me
            v-if="profile"
            :profile="profile"
            @close="menu = false"
          />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            rounded="xl"
            variant="outlined"
            color="primary"
            to="/signup"
            class="ma-2"
          >
            {{ t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            rounded="xl"
            variant="elevated"
            color="primary"
            to="/login"
            class="ma-2"
          >
            {{ t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>
    </div>
    <v-main>
      <router-view />
      <snackbar />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { Store } from '@/plugins/store/types'
import { useTheme } from 'vuetify'

const store: Store = useStore()
const { t } = useI18n()
const theme = useTheme()

const isDark = computed(() => {return store.state.prefs.isDark})

const error = ref(false)
const menu = ref(false)
const isFullscreen = ref(document.fullscreenElement !== null)

const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
const isAuthRequired = computed(() => store.state.config.auth_required)
const isAllowReadonly = computed(() => store.state.config.allow_readonly)
const profile = computed(() => store.state.auth.payload || {})
const avatar = computed(() => store.getters['auth/getAvatar'])
const isSignupEnabled = computed(() => store.state.config.signup_enabled)



function toggleFullScreen() {
  const elem = document.getElementById('app')
  if (document.fullscreenElement === null) {
    elem?.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

async function getPreferences() {
  await store.dispatch('getUserPrefs')
  theme.global.name.value = isDark.value ? 'gapitDark' : 'gapitLight'
}

if (isLoggedIn.value) getPreferences()

function refresh() {
  store.dispatch('set', ['refresh', true])
  setTimeout(() => {
    setTimeout(() => {
      store.dispatch('set', ['refresh', false])
    })
  })
}
</script>
<style lang="scss">
@use "@/styles/main.scss";
</style>

<!-- <style>

@import "./assets/css/fonts.css";

.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}

.logo {
  font-family: "Sonsie One", cursive;
  font-size: 26px;
}

.btn--plain {
  padding: 0;
  opacity: 0.6;
}
.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}
.btn--plain:hover {
  opacity: 1;
}
</style> -->
