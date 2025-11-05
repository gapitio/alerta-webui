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
            :text="t('EmailVerified')"
          >
            <template #activator="{ props }">
              <v-icon 
                icon="verified_user"
                v-bind="props"
              />
            </template>
          </v-tooltip>
          <v-tooltip 
            v-else
            location="top"
            :text="t('EmailNotVerified')"
          >
            <template #activator="{ props }">
              <v-icon 
                icon="person_cancel"
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
        v-if="customerViews"
        :items="customers"
        :title="t('Customers')"
      />
      
      <profile-info
        v-if="profile.orgs" 
        :items="profile.orgs"
        :title="t('Organizations')"
      />

      <profile-info
        v-if="profile.groups" 
        :items="profile.groups"
        :title="t('Groups')"
      />

      <profile-info
        v-if="profile.roles" 
        :items="profile.roles"
        :title="t('Roles')"
      />

      <profile-info
        :items="scopes"
        :title="t('Scopes')"
      />
    </v-list>

    <v-card-actions>
      <v-spacer />

      <v-btn
        flat
        @click="close"
      >
        {{ t('Cancel') }}
      </v-btn>
      <v-btn
        color="primary"
        flat
        @click="logout()"
      >
        {{ t('LogOut') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { Payload } from '@/plugins/store/types/auth-types';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store: Store = useStore()
const { t } = useI18n()
const router = useRouter()

defineProps<{profile: Payload}>()

const provider = {
  basic: { icon: 'badge', text: 'BasicAuth' },
  ldap: { icon: 'badge', text: 'LDAP' },
  azure: { icon: 'badge', text: 'Azure OAuth2' },
  cognito: { icon: 'badge', text: 'Amazon Cognito' },
  github: { icon: 'badge', text: 'GitHub OAuth2' },
  gitlab: { icon: 'badge', text: 'GitLab OAuth2' },
  google: { icon: 'badge', text: 'Google OAuth2' },
  keycloak: { icon: 'badge', text: 'Keycloak' },
  openid: { icon: 'badge', text: 'OpenID Connect' },
  pingfederate: { icon: 'badge', text: 'PingFederate' },
  saml2: { icon: 'badge', text: 'SAML2' }
}

const scopes = computed(() => store.getters['auth/scopes'])
const customers = computed(() => store.getters['auth/customers'])
const customerViews = computed(() => store.getters.getConfig('customer_views'))

const emits = defineEmits(['close'])

const close = () => emits('close')

function logout() {
  store.dispatch('clearUserPrefs')
  store
    .dispatch('auth/logout')
    .then(response => {
      if (response.data.logoutUrl) {
        const provider = store.getters.getConfig('provider')
        const redirectUrl =
          (provider == 'keycloak'
            ? 'redirect_uri='
            : 'post_logout_redirect_url=') +
          store.getters['auth/getOptions']['providers'][provider]['redirectUri'] +
          '/logout'
        window.location.href = response.data.logoutUrl + '?' + redirectUrl
      } else {
        router.push({ path: '/login' })
      }
    })
  close()
}
</script>
