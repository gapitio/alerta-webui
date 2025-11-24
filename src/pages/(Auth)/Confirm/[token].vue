<template>
  <v-container grid-list-sm fill-height>
    <v-layout align-center row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <div v-show="message">
          <p class="text-xs-center headline font-weight-medium">
            {{ t('Thanks') }} {{ message }}{{ t('YouCanNowLogin1') }}
            <a href="/login">
              {{ t('YouCanNowLogin2') }}
            </a>
          </p>
        </div>
        <div v-show="error">
          <p class="text-xs-center headline font-weight-medium">
            {{ t('EmailConfirmFailed') }}
            <a href="/">
              {{ t('TryAgain') }}
            </a>
          </p>
          <p class="text-xs-center subheading font-weight-medium">{{ t('Error') }}: {{ error }}</p>
        </div>
      </v-flex>
      <v-flex xs12 sm8 offset-xs0 offset-sm2 />
    </v-layout>
  </v-container>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {AxiosError} from 'axios'
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import {useStore} from 'vuex'

const store: Store = useStore()
const route = useRoute()
const {t} = useI18n()

const message = ref<string | null>(null)
const error = ref<string | null>(null)

async function confirm() {
  try {
    const res = await store.dispatch('auth/confirm', route.params.token as string)
    message.value = res
  } catch (e) {
    if (e instanceof AxiosError) error.value = e.response?.data.message
    else throw e
  }
}
confirm()
</script>
