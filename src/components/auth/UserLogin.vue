<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col
        v-if="isBasicAuth"
        cols="12"
        sm="8"
      >
        <p class="text-center text-h5 font-weight-medium">
          {{ $t("LoginToContinue") }}
        </p>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model.trim="username"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="alternate_email"
            variant="outlined"
          />
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-inner-icon="showPassword ? 'visibility_off' : 'visibility'"
            variant="outlined"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            {{ $t("LogIn") }}
          </v-btn>
        </v-form>
        <div class="text-center">
          <v-btn
            variant="text"
            color="primary"
            :to="'/signup'"
            :disabled="!signupEnabled"
          >
            {{ $t("CreateAccount") }}
          </v-btn>
          <v-btn
            variant="text"
            color="primary"
            :to="'/forgot'"
          >
            {{ $t("ForgotPassword") }}
          </v-btn>
        </div>
      </v-col>

      <v-col
        v-else-if="configProvider === 'saml2'"
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
            {{ $t("UnspecifiedProblem") }}
            <a
              href="#"
              @click.prevent="authenticateUsingSAML"
            >
              {{ $t("TryAgain") }}
            </a>
          </p>
          <p class="text-center text-body-1 font-weight-medium">
            {{ $t("Error") }}: {{ error }}
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
            {{ $t("UnspecifiedProblem") }}
            <a
              href="#"
              @click.prevent="authenticate"
            >
              {{ $t("TryAgain") }}
            </a>
          </p>
          <p class="text-center text-body-1 font-weight-medium">
            {{ $t("Error") }}: {{ error }}
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

<script lang="ts">

export default {
  props: [],
  data: () => ({
    host: window.location.origin,
    username: null,
    password: null,
    showPassword: false,
    message: null,
    error: null
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic' || this.$config.provider == 'ldap'
    },
    authProvider() {
      const providers = this.$store.getters['auth/getOptions']['providers']
      return providers[this.$config.provider] ? providers[this.$config.provider].name : null
    },
    signupEnabled() {
      return this.$store.getters.getConfig('signup_enabled')
    }
  },
  created() {
    if (this.$config.provider == 'saml2') {
      this.authenticateUsingSAML()
    } else if (this.authProvider) {
      this.authenticate()
    }
  },
  methods: {
    login() {
      const credentials = {
        username: this.username,
        password: this.password
      }
      this.$store
        .dispatch('auth/login', credentials)
        .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
        .catch(error => console.log(error))
        // .catch(error => this.error = error.response.data.message)
    },
    authenticate() {
      if (this.authProvider) {
        this.message = `Authenticating with ${this.authProvider} ...`
        this.$store
          .dispatch('auth/authenticate', this.$config.provider)
          .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
          .catch(error => this.error = error.response.data.message)
      } else {
        this.message = this.$t('AuthNotPossible')
        this.error = `Unknown authentication provider (${this.$config.provider})`
      }
    },
    authenticateUsingSAML() {
      const auth_win = window.open(this.$config.endpoint + '/auth/saml', this.$t('AuthInProgress'))
      window.addEventListener('message', event => {
        if (event.source === auth_win) {
          if (event.data && event.data.status && event.data.status === 'ok' && event.data.token) {
            this.$store
              .dispatch('auth/setToken', event.data)
              .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
              .catch(error => this.error = error.response.data.message)
          } else {
            this.message = this.$t('AuthNotPossible')
            this.error = event.data.message ? event.data.message : JSON.stringify(event)
          }
        }
        return
      })
    }
  }
}
</script>

<style></style>
