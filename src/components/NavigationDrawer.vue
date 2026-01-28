<template>
  <v-navigation-drawer
    v-if="isLoggedIn || !isAuthRequired || isAllowReadonly"
    permanent
    disable-resize-watcher
    class="sidebar bg-primary-surface"
    width="325"
    location="left"
    :rail="rail"
    @update:rail="val => (rail = val)"
  >
    <v-row style="text-align: center">
      <v-col style="margin: 30px 0px" v-if="!rail">
        <router-link to="/" class="toolbar-title">
          <img v-if="isDark" src="@/assets/logo-white.svg" alt="GapitLogo" width="200" />
          <img v-else src="@/assets/logo.svg" alt="GapitLogo" width="200" />
        </router-link>
      </v-col>
      <v-col style="margin: 33px 0px" v-else>
        <router-link to="/" class="toolbar-title">
          <img src="@/assets/logo-small.svg" alt="GapitLogo" width="35" />
        </router-link>
      </v-col>
    </v-row>

    <v-list density="compact" style="height: calc(100vh - 85px - 130px - 48px); overflow-y: auto" slim>
      <template v-for="item in items">
        <v-list-item
          v-if="item.icon && item.show && show(item.path)"
          :key="item.text"
          v-has-perms="item.perms"
          :to="item.path"
          class="outline"
          active-class="active-group"
          :title="item.text"
          :prepend-icon="item.icon"
        />

        <v-list-group
          v-else-if="item.items"
          v-show="showGroup(item.text)"
          :key="'items' + item.text"
          :ref="item.text"
          class="outline"
          no-action
        >
          <template v-for="i in item.items" :key="i.text">
            <v-list-item
              v-if="show(i.path)"
              v-show="!rail"
              v-has-perms="i.perms"
              :to="i.path"
              active-class="active-group"
              :prepend-icon="i.icon"
              :title="i.text"
            />
          </template>
          <template #activator="{props}">
            <v-menu
              v-if="rail"
              v-show="showGroup(item.text)"
              :key="'menuItems' + item.text"
              location="right"
              :ref="item.text"
              class="outline"
              v-bind="props"
              no-action
            >
              <template #activator="{props}">
                <v-list-item v-bind="props" :prepend-icon="item.icon" />
              </template>
              <v-list>
                <v-list-item :title="item.text" />
                <v-divider />
                <template v-for="i in item.items" :key="i.text">
                  <v-list-item
                    v-if="show(i.path)"
                    v-has-perms="i.perms"
                    :to="i.path"
                    active-class="active-group"
                    :prepend-icon="i.icon"
                    :title="i.text"
                  />
                </template>
              </v-list>
            </v-menu>

            <v-list-item v-else v-bind="props" :prepend-icon="item.icon" :title="item.text" />
          </template>
        </v-list-group>

        <v-list-item v-else-if="item.divider" :key="'divider' + item.text" />
      </template>
    </v-list>
    <v-row no-gutters style="position: absolute; bottom: 0px; text-align: center; width: 100%">
      <v-col align="start">
        <v-btn
          variant="text"
          :icon="rail ? 'arrow_menu_open' : 'arrow_menu_close'"
          @click.stop="() => (rail = !rail)"
        />
      </v-col>
      <v-col cols="12" class="mb-3" style="color: #98a2b3"> Version {{ gapitVersion }} </v-col>
      <!-- <v-col cols="12">
        <v-divider 
          class="border-secondary"
        />
      </v-col> -->
      <v-col class="pt-4 pb-3 border-secondary" style="border-top: 1px solid" v-if="!rail">
        <img v-if="isDark" src="@/assets/gapit/gapit-nordics-cts-group-blue-white.svg" alt="GapitLogo" width="150" />
        <img v-else src="@/assets/gapit/gapit-nordics-cts-group-regular.svg" alt="GapitLogo" width="150" />
      </v-col>
      <v-col class="pt-4 pb-3 border-secondary" style="border-top: 1px solid" v-else>
        <img src="@/assets/gapit/gapit-logo-small.svg" alt="GapitLogo" width="35" />
      </v-col>
    </v-row>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import {useStore} from 'vuex'
import type {State, Store} from '@/plugins/store/types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import config from '@/services/config'
import {checkPerms} from '@/directives/hasPerms'

const store: Store = useStore<State>()
const {t} = useI18n()
const $config = config.$get()

const rail = ref(true)
const hiddenPages = computed(() => store.getters.getConfig('hidden_pages'))
const show = (path: string) => !hiddenPages.value.includes(path.replace('/', ''))
const items = computed(() => [
  {
    icon: 'alarm',
    text: t('Alerts'),
    path: '/alerts',
    perms: 'read:alerts',
    show: true
  },
  {
    icon: 'history',
    text: t('Historical'),
    model: false,
    items: [
      {
        icon: 'history',
        text: t('History'),
        path: '/history',
        perms: 'read:alerts',
        show: true
      },
      {
        icon: 'manage_history',
        text: t('NotificationHistory'),
        path: '/notificationhistory',
        perms: 'read:notification.history',
        show: true
      }
    ]
  },
  {
    icon: 'rule',
    text: t('EscalationRules'),
    path: '/escalationrules',
    perms: 'read:escalation_rules',
    show: true
  },
  {
    icon: 'vital_signs',
    text: t('Heartbeats'),
    path: '/heartbeats',
    perms: 'read:heartbeats',
    show: true
  },
  {
    icon: 'people',
    text: t('Management'),
    model: false,
    items: [
      {
        icon: 'person',
        text: t('Users'),
        path: '/users',
        perms: 'admin:users',
        show: true
      },
      {
        icon: 'phone',
        text: t('OnCall'),
        path: '/oncall',
        perms: 'read:on_calls',
        show: true
      },
      // {
      //   icon: 'domain',
      //   text: t('Customers'),
      //   path: '/customers',
      //   perms: 'read:customers',
      //   show: $config.customer_views
      // },
      {
        icon: 'security',
        text: t('Permissions'),
        path: '/perms',
        perms: 'read:perms',
        show: true
      },
      {
        icon: 'vpn_key',
        text: t('APIKeys'),
        path: '/keys',
        perms: 'read:keys',
        show: isLoggedIn.value || !isAuthRequired.value
      }
    ]
  },
  {
    icon: 'notifications',
    text: t('Notifications'),
    model: false,
    items: [
      {
        icon: 'people',
        text: t('NotificationGroups'),
        path: '/notificationgroups',
        perms: 'read:notification.groups',
        show: true
      },
      {
        icon: 'playlist_add_check',
        text: t('NotificationChannels'),
        path: '/notificationchannels',
        perms: 'read:notification.channels',
        show: true
      },
      {
        icon: 'send',
        text: t('NotificationSend'),
        path: '/notificationsend',
        perms: 'write:notification.sends',
        show: true
      },
      {
        icon: 'notifications_off',
        text: t('Blackouts'),
        path: '/blackouts',
        perms: 'read:blackouts',
        show: true
      },
      {
        icon: 'add_alert',
        text: t('NotificationRules'),
        path: '/notificationrules',
        perms: 'read:notification.rules',
        show: true
      },
      {
        icon: 'snooze',
        text: t('NotificationDelays'),
        path: '/notificationdelays',
        perms: 'read:notification.rules',
        show: true
      }
    ]
  },
  {
    icon: 'assessment',
    text: t('Reports'),
    path: '/reports',
    perms: 'read:alerts',
    show: true
  },
  {divider: true},
  {
    icon: 'account_circle',
    text: t('Profile'),
    path: '/profile',
    perms: null,
    show: isLoggedIn.value
  },
  {
    icon: 'settings',
    text: t('Settings'),
    path: '/settings',
    perms: null,
    show: isLoggedIn.value
  }
  // { icon: 'chat_bubble', text: 'Send feedback' },
  // {
  //   icon: 'help',
  //   text: t('Help'),
  //   path: 'https://docs.alerta.io',
  //   appendIcon: 'open_in_new',
  //   perms: null,
  //   show: true
  // },
  // {
  //   icon: 'info',
  //   text: t('About'),
  //   path: '/about',
  //   perms: 'read:management',
  //   show: true
  // }
])

const gapitVersion = computed(() => {
  const version = $config?.version ?? 'dev'
  return version == 'dev' ? version : version.replace('v', '') || 'dev'
})

const isDark = computed(() => store.getters.getPreference('isDark'))
const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
const isAuthRequired = computed(() => store.getters.getConfig('auth_required'))
const isAllowReadonly = computed(() => store.getters.getConfig('allow_readonly'))

function showGroup(ref: string) {
  for (const item of items.value) {
    if (item.text === ref) {
      if (item.items === undefined) return true
      return item.items.filter(i => i.show && checkPerms(store, i.perms)).length > 0
    }
  }
}
</script>
