<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col
        cols="12"
        sm="8"
      >
        <p class="text-center text-h5 font-weight-medium">
          {{ $t("CreateAccount") }}
        </p>
        <v-form @submit.prevent="signup">
          <v-text-field
            v-model.trim="name"
            name="name"
            type="text"
            :label="$t('FullName')"
            variant="outlined"
          />
          <v-text-field
            v-model.trim="email"
            name="email"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="mdi-at"
            variant="outlined"
          />
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-text-field
            v-model="confirmPassword"
            name="confirm"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('ConfirmPassword')"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-text-field
            v-model="text"
            name="description"
            type="text"
            :label="$t('Description')"
            variant="outlined"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            {{ $t("SignUp") }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>


<script lang="ts">
import i18n from '@/plugins/i18n'

export default {
  props: [],
  data: vm => ({
    name: null,
    email: null,
    password: '',
    confirmPassword: '',
    showPassword: false,
    text: null,
    rules: {
      required: v => !!v || i18n.t('Required'),
      min: v => (v && v.length >= 6) || i18n.t('Min6Char'),
      passwordMatch: v =>
        (v && v == vm.password) || i18n.t('PasswordNotMatch')
    }
  }),
  computed: {
    isSending() {
      return this.$store.state.auth.isSending
    },
    signupEnabled() {
      return this.$store.getters.getConfig('signup_enabled')
    },
    emailVerification() {
      return this.$store.getters.getConfig('email_verification')
    }
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.signup()
      }
    },
    signup() {
      const credentials = {
        username: this.name,
        email: this.email,
        password: this.password,
        text: this.text
      }
      this.$store
        .dispatch('auth/signup', credentials)
        .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
        .catch(error => {
          if (error.response.status === 403 && this.emailVerification) {
            this.$router.push({ name: 'login' })
          }
        })
    }
  }
}
</script>

<style></style>
