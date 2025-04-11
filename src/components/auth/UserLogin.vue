<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col
        v-if="isBasicAuth"
        cols="12"
        sm="8"
      >
        <p class="text-center text-h5 font-weight-medium pb-4">
          {{ t("LoginToContinue") }}
        </p>
        <v-form @submit.prevent="login">
          <v-row>
            <v-col cols="12">
              <g-text-field
                v-model.trim="username"
                name="login"
                :label="t('Username')"
                prepend-inner-icon="alternate_email"
              />
            </v-col>
            <v-col cols="12">
              <g-text-field
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                :label="t('Password')"
                :append-inner-icon="showPassword ? 'visibility_off' : 'visibility'"
                @click:append-inner="() => showPassword = !showPassword"
              />
            </v-col>
            <v-col cols="12">
              <v-btn
                block
                color="primary"
                type="submit"
              >
                {{ t("LogIn") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <div class="text-center">
          <v-btn
            variant="text"
            color="primary"
            :to="'/signup'"
            :disabled="!signupEnabled"
          >
            {{ t("CreateAccount") }}
          </v-btn>
          <v-btn
            variant="text"
            color="primary"
            :to="'/forgot'"
          >
            {{ t("ForgotPassword") }}
          </v-btn>
        </div>
      </v-col>

      <v-col
        v-else-if="provider === 'saml2'"
        cols="12"
        sm="8"
      >
        <div>
          <p class="text-center text-h5 font-weight-medium">
            SAML2 Authentication uses pop-up windows.
          </p>
          <p class="text-center text-body-1 font-weight-medium">
            Please allow pop-ups from <kbd>{{ host }}</kbd>
          </p>
        </div>
        <div v-if="message && !error">
          <p class="text-center text-h5 font-weight-medium">
            {{ message }}
          </p>
        </div>
        <div v-if="error">
          <p class="text-center text-h5 font-weight-medium">
            {{ t("UnspecifiedProblem") }}
            <a
              href="#"
              @click.prevent="authenticateUsingSAML"
            >
              {{ t("TryAgain") }}
            </a>
          </p>
          <p class="text-center text-body-1 font-weight-medium">
            {{ t("Error") }}: {{ error }}
          </p>
        </div>
      </v-col>

      <v-col
        v-else
        cols="12"
        sm="8"
      >
        <div v-if="message && !error">
          <p class="text-center text-h5 font-weight-medium">
            {{ message }}
          </p>
        </div>
        <div v-if="error">
          <p class="text-center text-h5 font-weight-medium">
            {{ t("UnspecifiedProblem") }}
            <a
              href="#"
              @click.prevent="authenticate"
            >
              {{ t("TryAgain") }}
            </a>
          </p>
          <p class="text-center text-body-1 font-weight-medium">
            {{ t("Error") }}: {{ error }}
          </p>
        </div>
      </v-col>
      <v-col 
        cols="12"
        sm="8"
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Store } from '@/plugins/store/types';
import { AxiosError } from 'axios';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useStore } from 'vuex';

const store: Store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const theme = useTheme()

const host = ref(window.location.origin)
const username = ref<string | null>(null)
const showPassword = ref(false)
const password = ref<string | null>(null)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

const isDark = computed(() => store.getters.getPreference('isDark'))
const provider = computed(() => store.getters.getConfig('provider'))
const isBasicAuth = computed(() => ['basic', 'ldap'].includes(provider.value))
const authProvider = computed(() => {
  const provs = store.getters['auth/getOptions'].providers[provider.value]
  return provs ? provs.name : null
})
const signupEnabled = computed(() => store.getters.getConfig('signup_enabled'))

if (provider.value == 'saml2') authenticateUsingSAML()
else if (authProvider.value) authenticate()

async function login() {
  const creds = {
    username: username.value!,
    password: password.value!
  }
  await store.dispatch('auth/login', creds)
  await store.dispatch('getUserPrefs')
  theme.global.name.value = isDark.value ? 'gapitDark' : 'gapitLight'
  const redirect = !(route.query.redirect instanceof Array) ? route.query.redirect?.toString() : null
  router.push({ path: redirect || '/' })
}

function authenticate(){
  if (authProvider.value) {
    message.value = `Authenticating with ${authProvider.value} ...`
    try {
      store.dispatch('auth/authenticate', provider.value)
    } catch (e) {
      if (e instanceof AxiosError) error.value = (e.response?.data as {message: string}).message
      else throw e
    }
  }
  else {
    message.value = t('AuthNotPossible')
    error.value = `Unknown authentication provider (${provider.value})`
  }
}

function authenticateUsingSAML() {
  const auth_win = window.open(store.getters.getConfig('endpoint') + '/auth/saml', t('AuthInProgress'))
  window.addEventListener('message', async event => {
        if (event.source === auth_win) {
          if (event.data && event.data.status && event.data.status === 'ok' && event.data.token) {
            try {
              await store.dispatch('auth/setToken', event.data)
              const redirect = !(route.query.redirect instanceof Array) ? route.query.redirect?.toString() : null
              router.push({ path: redirect || '/' })
            } catch (e) {
              if (e instanceof AxiosError) error.value = (e.response?.data as {message: string}).message
              else throw e
            }
              
          } else {
            message.value = t('AuthNotPossible')
            error.value = event.data.message ? event.data.message : JSON.stringify(event)
          }
        }
        return
      })
}
</script>
