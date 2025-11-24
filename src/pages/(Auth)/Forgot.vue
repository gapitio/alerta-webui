<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <p class="text-center text-h5 font-weight-medium pb-4">
          {{ t('ResetLink') }}
        </p>
        <v-form @submit.prevent="forgot()">
          <v-row>
            <v-col cols="12">
              <g-text-field
                v-model.trim="email"
                show-header
                :label="t('Username')"
                prepend-inner-icon="alternate_email"
                outline
              />
            </v-col>
            <v-col cols="12">
              <v-btn :loading="isSending" :disabled="isSending" block color="primary" type="submit">
                {{ t('Send') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <v-col cols="12">
          <div class="text-xs-center">
            <span class="body-2">
              {{ t('AlreadyHaveAccount') }}
            </span>
            <v-btn flat color="primary" to="/login">
              {{ t('SignIn') }}
            </v-btn>
          </div>
        </v-col>
      </v-col>

      <v-col cols="12" sm8 offset-xs0 offset-sm2 />
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Forgot'
  }
})

const {t} = useI18n()
const store: Store = useStore()

const email = ref<string | null>(null)
const sent = ref(false)

const isSending = computed(() => store.state.auth.isSending)

async function forgot() {
  if (email.value) {
    await store.dispatch('auth/forgot', email.value)
    store.dispatch('notifications/success', t('ResetEmailSent'))
    sent.value = true
  }
}
</script>
