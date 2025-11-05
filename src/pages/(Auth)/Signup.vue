<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col
        cols="12"
        sm="8"
      >
        <p class="text-center text-h5 font-weight-medium">
          {{ t("CreateAccount") }}
        </p>
        <v-form 
          ref="form"
          @submit.prevent="validate"
        >
          <v-row>
            <v-col cols="12">
              <g-text-field
                v-model.trim="name"
                show-header
                type="text"
                required
                :rules="[rules.required]"
                :label="t('FullName')"
              />
            </v-col>
            <v-col cols="12">
              <g-text-field
                v-model.trim="email"
                type="text"
                show-header
                required
                :rules="[rules.required]"
                :label="t('Username')"
                prepend-inner-icon="alternate_email"
              />
            </v-col>

            <v-col cols="12">
              <g-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                :rules="[rules.required, rules.min]"
                show-header
                :label="t('Password')"
                :append-inner-icon="showPassword ? 'visibility_off' : 'visibility'"
                @click:append-inner="showPassword = !showPassword"
              />
            </v-col>

            <v-col cols="12">
              <g-text-field
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                show-header
                :label="t('ConfirmPassword')"
                :rules="[rules.required, rules.passwordMatch]"
                :append-inner-icon="showPassword ? 'visibility_off' : 'visibility'"
                @click:append-inner="showPassword = !showPassword"
              />
            </v-col>

            <v-col cols="12">
              <g-text-field
                v-model="text"
                type="text"
                show-header
                :label="t('Description')"
              />
            </v-col>

            <v-col cols="12">
              <v-btn
                :loading="isSending"
                :disabled="isSending"
                block
                color="primary"
                type="submit"
              >
                {{ t("SignUp") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Store } from '@/plugins/store/types';
import type { AxiosError } from 'axios';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { VForm } from 'vuetify/components';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Sign Up"
  }
});

const { t } = useI18n()
const store: Store = useStore()
const route = useRoute()
const router = useRouter()

const name = ref<string | null>(null)
const email = ref<string | null>(null)
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const text = ref<string | null>(null)
const form = ref<VForm | null>(null)

const rules = {
  required: (v: string) => !!v || t('Required'),
  min: (v: string) => (v && v.length >= 6) || t('Min6Char'),
  passwordMatch: (v: string) =>
    (v && v == password.value) || t('PasswordNotMatch')
}

const isSending = computed(() => store.state.auth.isSending)
const signupEnabled = computed(() => store.getters.getConfig('signup_enabled'))
const emailVerification = computed(() => store.getters.getConfig('email_verification'))

async function validate() {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    signup()
  }
}

async function signup() {
  const creds = {
    name: name.value ?? '',
    email: email.value ?? '',
    password: password.value,
    text: text.value ?? ''
  }
  try {
    await store.dispatch('auth/signup', creds)
    const redirect = !(route.query.redirect instanceof Array) ? route.query.redirect?.toString() : null
    router.push({ path: redirect || '/' })
  } catch (error) {
    if ((error as AxiosError).response?.status === 403 && emailVerification.value) router.push('login')
  }
}

const checkPage = () => {if (!signupEnabled.value) router.push({path: '/'})}
checkPage()

</script>