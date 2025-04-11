<template>
  <v-app id="alerta">
    <div vi-if="!isKiosk">
      <v-navigation-drawer v-model="drawer">
        <v-toolbar>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
          <v-toolbar-title>
            <router-link
              to="/"
              class="toolbar-title"
            >
              <img
                v-if="$config.site_logo_url"
                :src="$config.site_logo_url"
                height="48"
              >
              <v-toolbar-title
                v-else
                class="logo"
              >
                alerta
              </v-toolbar-title>
            </router-link>
          </v-toolbar-title>
        </v-toolbar>
        <v-divider />
        <v-list-item
          v-for="item in paths"
          :key="item.path"
          v-has-perm="item.perms"
          link
          :to="item.path"
          :title="item.text"
          :prepend-icon="'mdi-' + item.icon"
        />
        <v-divider />
        <v-list-item
          v-for="item in settingsPaths"
          :key="item.path"
          link
          :to="item.path"
          :title="item.text"
          :prepend-icon="'mdi-' + item.icon"
        />
      </v-navigation-drawer>

      <v-toolbar
        flat
        class="mb-1"
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

        <router-link
          to="/"
          class="toolbar-title"
        >
          <img
            v-if="$config.site_logo_url"
            :src="$config.site_logo_url"
            height="48"
          >
          <v-toolbar-title
            v-else
            class="logo"
          >
            alerta
          </v-toolbar-title>
        </router-link>

        <v-spacer />

        <v-btn
          v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
          icon
          @click="toggleFullScreen"
        >
          <v-icon :icon="isFullscreen() ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" />
          <v-tooltip
            location="bottom"
            activator="parent"
            :text="$t('FullScreen')"
          />
        </v-btn>

        <v-btn
          v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
          icon
          @click="refresh"
        >
          <v-icon icon="mdi-refresh" />
          <v-tooltip
            location="bottom"
            activator="parent"
            :text="$t('Refresh')"
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
                  icon="mdi-account-circle"
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
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            rounded="xl"
            variant="elevated"
            color="primary"
            to="/login"
            class="ma-2"
          >
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>
    </div>
    <v-main>
      <banner />
      <router-view />
      <snackbar />
    </v-main>
  </v-app>
</template>

<script lang="ts">
export default {
  data: () => ({
    drawer: false,
    menu: false,
  }),
  computed: {
    settingsPaths(): {icon: string, icon_alt?: string, text: string, path:string, perms:string | null, show: boolean}[] {
      return [
        // {
        //   icon: 'account-circle',
        //   text: this.$t('Profile'),
        //   path: '/profile',
        //   perms: null,
        //   show: this.isLoggedIn
        // },
        // {
        //   icon: 'cog',
        //   text: this.$t('Settings'),
        //   path: '/settings',
        //   perms: null,
        //   show: this.isLoggedIn
        // },
        // {
        //   icon: 'help-circle',
        //   text: this.$t('Help'),
        //   path: '/help',
        //   appendIcon: 'open_in_new',
        //   perms: null,
        //   show: true
        // },
        // {
        //   icon: 'information',
        //   text: this.$t('About'),
        //   path: '/about',
        //   perms: 'read:management',
        //   show: true
        // }
      ]
    },
    paths(): {icon: string, icon_alt?: string, text: string, path:string, perms:string, show: boolean}[] {
      return [
        {
          icon: 'alert',
          text: this.$t('Alerts'),
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        // {
        //   icon: 'history',
        //   text: this.$t('History'),
        //   path: '/history',
        //   perms: 'read:alerts',
        //   show: true
        // },
        // {
        //   icon: 'history',
        //   text: this.$t('NotificationHistory'),
        //   path: '/notificationhistory',
        //   perms: 'read:notification_history',
        //   show: true
        // },
        // {
        //   icon: 'av-timer',
        //   text: this.$t('NotificationDelays'),
        //   path: '/notificationdelays',
        //   perms: 'read:notification_rules',
        //   show: true
        // },
        // {
        //   icon: 'arrow-up',
        //   text: this.$t('Escalation Rules'),
        //   path: '/escalationrules',
        //   perms: 'read:escalation_rules',
        //   show: true
        // },
        // {
        //   icon: 'chevron-down',
        //   icon_alt: 'expand-more',
        //   text: this.$t('Searches'),
        //   model: false,
        //   queries: this.queries
        // },
        // {
        //   icon: 'timer-outline',
        //   text: this.$t('Heartbeats'),
        //   path: '/heartbeats',
        //   perms: 'read:heartbeats',
        //   show: true
        // },
        // {
        //   icon: 'account',
        //   text: this.$t('Users'),
        //   path: '/users',
        //   perms: 'admin:users',
        //   show: true
        // },
        // {
        //   icon: 'account-group',
        //   text: this.$t('Groups'),
        //   path: '/groups',
        //   perms: 'read:groups',
        //   show: this.$config.provider == 'basic'
        // },
        // {
        //   icon: 'account-group',
        //   text: this.$t('NotificationGroups'),
        //   path: '/notificationgroups',
        //   perms: 'read:notification_groups',
        //   show: true
        // },
        // {
        //   icon: 'phone',
        //   text: this.$t('On Call'),
        //   path: '/oncall',
        //   perms: 'read:notification_rules',
        //   show: true
        // },
        // {
        //   icon: 'domain',
        //   text: this.$t('Customers'),
        //   path: '/customers',
        //   perms: 'read:customers',
        //   show: this.$config.customer_views
        // },
        // {
        //   icon: 'bell-off',
        //   text: this.$t('Blackouts'),
        //   path: '/blackouts',
        //   perms: 'read:blackouts',
        //   show: true
        // },
        // {
        //   icon: 'bell',
        //   text: this.$t('NotificationChannels'),
        //   path: '/notificationchannels',
        //   perms: 'read:notification_channels',
        //   show: true
        // },
        // {
        //   icon: 'bell',
        //   text: this.$t('NotificationRules'),
        //   path: '/notificationrules',
        //   perms: 'read:notification_rules',
        //   show: true
        // },
        // {
        //   icon: 'security',
        //   text: this.$t('Permissions'),
        //   path: '/perms',
        //   perms: 'read:perms',
        //   show: true
        // },
        // {
        //   icon: 'key',
        //   text: this.$t('APIKeys'),
        //   path: '/keys',
        //   perms: 'read:keys',
        //   show: this.isLoggedIn || !this.isAuthRequired
        // },
        // {
        //   icon: 'chart-box',
        //   text: this.$t('Reports'),
        //   path: '/reports',
        //   perms: 'read:alerts',
        //   show: true
        // },
      ]
    },
    isDark() {
      return true
    },
    isLoggedIn(): boolean {
      return this.$store.getters['auth/isLoggedIn']
    },
    isAuthRequired(): boolean {
      return this.$config.auth_required
    },
    profile() {
      return this.$store.state.auth.payload || {}
    },
    avatar() {
      return this.$store.getters['auth/getAvatar']
    },
    isSignupEnabled() {
      return this.$config.signup_enabled
    },
  },
  methods: {
    toggleFullScreen() {
      const elem = document.getElementById('alerta')
      if (!this.isFullscreen()) {
        elem.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    isFullscreen() {
      return document.fullscreenElement
    },
    refresh() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
    }
  }
}
</script>
<style>

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
</style>
