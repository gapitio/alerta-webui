<template>
  <v-navigation-drawer
    v-if="isLoggedIn || !isAuthRequired || isAllowReadonly"
    v-model="show"
    :clipped="$vuetify.breakpoint.lgAndUp"
    disable-resize-watcher
    fixed
    app
  >
    <v-layout style="width: 100%; text-align: center;">
      <v-flex style="margin: 30px 0px;">
        <router-link
          to="/"
          class="toolbar-title"
        >
          <img
            src="gapit/gapit-logo.svg"
            alt="GapitLogo"
            width="200"
          >
        </router-link>
      </v-flex>
    </v-layout>

    <v-list 
      dense
      expand
      style="overflow-y: auto; max-height: calc(100vh - 65px); margin: 0px 20px;"
    >
      <template v-for="item in items">
        <v-list-tile
          v-if="item.icon && item.show"
          :key="item.text"
          v-has-perms="item.perms"
          :to="item.path"
          class="outline"
          active-class="active-group"
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title style="font-weight: bold;">
              {{ item.text }}
              <v-icon
                v-if="item.appendIcon"
                small
              >
                {{ item.appendIcon }}
              </v-icon>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-group
          v-else-if="item.items"
          v-show="showGroup(item.text)"
          :key="item.text"
          :ref="item.text"
          class="outline"
          :prepend-icon="item.icon"
          :append-icon="item.model ? item.icon : item['icon-alt']"
          active-class=""
          no-action
        >
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title style="font-weight: bold;">
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile
            v-for="i in item.items"
            :key="i.text"
            v-has-perms="i.perms"
            :to="i.path"
            active-class="active-group"
          >
            <v-list-tile-action>
              <v-icon class="outline"> 
                {{ i.icon }}
              </v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ i.text }}
                <v-icon
                  v-if="i.appendIcon"
                  small
                >
                  {{ i.appendIcon }}
                </v-icon>
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>

        <v-list-group
          v-else-if="item.queries && item.queries.length > 0"
          :key="item.text"
          :prepend-icon="item.model ? item.icon : item['icon-alt']"
          sub-group
          no-action
        >
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile
            v-for="(q, i) in item.queries"
            :key="i"
            @click="submitSearch(q.query)"
          >
            <v-list-tile-title v-text="q.text" />
            <v-list-tile-action>
              <v-icon
                small
                @click.stop="deleteSearch(q)"
                v-text="q.icon"
              />
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
        <v-list-tile
          v-else-if="item.divider"
          :key="item.text"
          class="no-background"
        />
      </template>
    </v-list>
    <v-layout
      wrap
      style="position: absolute; bottom:0px; text-align: center; width: 100%;"
    >
      <v-flex
        xs12
        class="mb-3"
        style="color: #98A2B3"
      >
        Version {{ gapitVersion }}
      </v-flex>
      <v-flex xs12>
        <v-divider />
      </v-flex>
      <v-flex
        xs12
        class="mt-3 mb-3"
      >
        <img
          :src="isDark ? 'gapit/gapit-nordics-cts-group-blue-white.svg' : 'gapit/gapit-nordics-cts-group-regular.svg'"
          alt="GapitLogo"
          width="150"
        >
      </v-flex>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  data: vm => ({
    show: true
  }),
  computed: {
    items() {
      return [
        {
          icon: 'alarm',
          text: i18n.t('Alerts'),
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'expand_less',
          'icon-alt': 'expand_more',
          text: i18n.t('Searches'),
          model: false,
          queries: this.queries
        },
        {
          icon: 'history',
          text: i18n.t('Historical'),
          model: false,
          items: [
            {
              icon: 'history',
              text: i18n.t('History'),
              path: '/history',
              perms: 'read:alerts',
              show: true
            },
            {
              icon: 'manage_history',
              text: i18n.t('NotificationHistory'),
              path: '/notificationhistory',
              perms: 'read:notification_history',
              show: true
            },
          ]
        },
        {
          icon: 'import_export',
          text: i18n.t('EscalationRules'),
          path: '/escalationrules',
          perms: 'read:escalation_rules',
          show: true
        },
        {
          icon: 'monitor_heart',
          text: i18n.t('Heartbeats'),
          path: '/heartbeats',
          perms: 'read:heartbeats',
          show: true
        },
        {
          icon: 'people',
          text: i18n.t('Management'),
          model: false,
          items: [
            {
              icon: 'person',
              text: i18n.t('Users'),
              path: '/users',
              perms: 'admin:users',
              show: true
            },
            {
              icon: 'people',
              text: i18n.t('Groups'),
              path: '/groups',
              perms: 'read:groups',
              show: this.$config.provider == 'basic'
            },
            {
              icon: 'phone',
              text: i18n.t('OnCall'),
              path: '/oncall',
              perms: 'read:notification_rules',
              show: true
            },
            {
              icon: 'domain',
              text: i18n.t('Customers'),
              path: '/customers',
              perms: 'read:customers',
              show: this.$config.customer_views
            },
            {
              icon: 'security',
              text: i18n.t('Permissions'),
              path: '/perms',
              perms: 'read:perms',
              show: true
            },
            {
              icon: 'vpn_key',
              text: i18n.t('APIKeys'),
              path: '/keys',
              perms: 'read:keys',
              show: this.isLoggedIn || !this.isAuthRequired
            },
          ]
        },
        {
          icon: 'notifications',
          text: i18n.t('Notifications'),
          model: false,
          items: [
            {
              icon: 'people',
              text: i18n.t('NotificationGroups'),
              path: '/notificationgroups',
              perms: 'read:notification_groups',
              show: true
            },
            {
              icon: 'playlist_add_check',
              text: i18n.t('NotificationChannels'),
              path: '/notificationchannels',
              perms: 'read:notification_channels',
              show: true
            },
            {
              icon: 'send',
              text: i18n.t('NotificationSend'),
              path: '/notificationsend',
              perms: 'read:notification_channels',
              show: true
            },
            {
              icon: 'notifications_off',
              text: i18n.t('Blackouts'),
              path: '/blackouts',
              perms: 'read:blackouts',
              show: true
            },
            {
              icon: 'add_alert',
              text: i18n.t('NotificationRules'),
              path: '/notificationrules',
              perms: 'read:notification_rules',
              show: true
            },
            {
              icon: 'snooze',
              text: i18n.t('NotificationDelays'),
              path: '/notificationdelays',
              perms: 'read:notification_rules',
              show: true
            },
          ]
        },
        {
          icon: 'assessment',
          text: i18n.t('Reports'),
          path: '/reports',
          perms: 'read:alerts',
          show: true
        },
        { divider: true},
        {
          icon: 'account_circle',
          text: i18n.t('Profile'),
          path: '/profile',
          perms: null,
          show: this.isLoggedIn
        },
        {
          icon: 'settings',
          text: i18n.t('Settings'),
          path: '/settings',
          perms: null,
          show: this.isLoggedIn
        },
        // { icon: 'chat_bubble', text: 'Send feedback' },
        {
          icon: 'help',
          text: i18n.t('Help'),
          path: '/help',
          appendIcon: 'open_in_new',
          perms: null,
          show: true
        },
        {
          icon: 'info',
          text: i18n.t('About'),
          path: '/about',
          perms: 'read:management',
          show: true
        }
      ]
    },
    gapitVersion() {
      const version = this.$config.version
      return version == 'dev' ? version : version.replace('v', '') || 'dev'
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isAuthRequired() {
      return this.$config.auth_required
    },
    isAllowReadonly() {
      return this.$config.allow_readonly
    },
    queries() {
      return this.$store.getters.getUserQueries.map(query => (
        {
          icon: 'remove_circle_outline',
          text: query.text,
          path: '/alerts',
          query: query.q,
          perms: 'read:alerts',
          show: true
        }))
    },
  },
  methods: {
    submitSearch(query) {
      this.$store.dispatch('alerts/updateQuery', { q: query })
      this.$router.push({
        query: { ...this.$router.query, q: query },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    showGroup(ref) {
      if (this.$refs[ref] !== undefined) {
        const [el] = this.$refs[ref]
        if (el === undefined) return true
        return el.$children.filter(i=>i.$children.length > 0 && i.$el.style.display !== 'none').length > 0
      }
      return true
    },
    deleteSearch(query) {
      this.$store.dispatch('removeUserQuery', query)
    },
  }
}
</script>