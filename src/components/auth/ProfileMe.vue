<template>
  <v-card
    max-width="350"
  >
    <v-list>
      <v-list-item>
        <v-list-item-title>{{ profile.name }}</v-list-item-title>
        <v-list-item-subtitle>
          <span>
            <span
              v-if="profile.preferred_username && !profile.preferred_username.includes('@')"
            >@</span>{{ profile.preferred_username }}
          </span>
        </v-list-item-subtitle>

        <template #append>
          <v-tooltip 
            v-if="profile.provider && profile.provider != 'basic'"
            location="top"
            :text="provider[profile.provider].text"
          >
            <template #activator="{ props }">
              <v-icon 
                :icon="provider[profile.provider].icon"
                v-bind="props"
              />
            </template>
          </v-tooltip>
          <v-tooltip 
            v-else-if="profile.email_verified"
            location="top"
            :text="$t('EmailVerified')"
          >
            <template #activator="{ props }">
              <v-icon 
                icon="mdi-account-check"
                v-bind="props"
              />
            </template>
          </v-tooltip>
          <v-tooltip 
            v-else
            location="top"
            :text="$t('EmailNotVerified')"
          >
            <template #activator="{ props }">
              <v-icon 
                icon="mdi-account-alert"
                v-bind="props"
              />
            </template>
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list>
      <profile-info 
        v-if="$config.customer_views"
        :items="customers"
        :title="$t('Customers')"
      />
      
      <profile-info
        v-if="profile.orgs" 
        :items="profile.orgs"
        :title="$t('Organizations')"
      />

      <profile-info
        v-if="profile.groups" 
        :items="profile.groups"
        :title="$t('Groups')"
      />

      <profile-info
        v-if="profile.roles" 
        :items="profile.roles"
        :title="$t('Roles')"
      />

      <profile-info
        :items="scopes"
        :title="$t('Scopes')"
      />
    </v-list>

    <v-card-actions>
      <v-spacer />

      <v-btn
        flat
        @click="close"
      >
        {{ $t('Cancel') }}
      </v-btn>
      <v-btn
        color="primary"
        flat
        @click="logout()"
      >
        {{ $t('LogOut') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">

export default {
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  data: () => ({
    provider: {
      basic: { icon: 'fas fa-id-card', text: 'BasicAuth' },
      ldap: { icon: 'fas fa-id-card', text: 'LDAP' },
      azure: { icon: 'fab fa-windows', text: 'Azure OAuth2' },
      cognito: { icon: 'fab fa-aws', text: 'Amazon Cognito' },
      github: { icon: 'fab fa-github', text: 'GitHub OAuth2' },
      gitlab: { icon: 'fab fa-gitlab', text: 'GitLab OAuth2' },
      google: { icon: 'fab fa-google', text: 'Google OAuth2' },
      keycloak: { icon: 'fas fa-key', text: 'Keycloak' },
      openid: { icon: 'fab fa-openid', text: 'OpenID Connect' },
      pingfederate: { icon: 'fas fa-id-badge', text: 'PingFederate' },
      saml2: { icon: 'fas fa-id-badge', text: 'SAML2' }
    }
  }),
  computed: {
    scopes() {
      return this.$store.getters['auth/scopes']
    },
    customers() {
      return this.$store.getters['auth/customers']
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('clearUserPrefs')
      this.$store
        .dispatch('auth/logout')
        .then(response => {
          if (response.data.logoutUrl) {
            const redirectUrl =
              (this.$config.provider == 'keycloak'
                ? 'redirect_uri='
                : 'post_logout_redirect_url=') +
              this.$store.getters['auth/getOptions']['providers'][this.$config.provider]['redirectUri'] +
              '/logout'
            window.location.href = response.data.logoutUrl + '?' + redirectUrl
          } else {
            this.$router.push({ name: 'logout' })
          }
        })
      this.close()
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.v-list__item__title {
  height: 40px;
}
</style>
