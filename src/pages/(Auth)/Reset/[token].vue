<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-layout
      align-center
      row
      wrap
    >
      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <p class="text-xs-center headline font-weight-medium">
          <span>{{ t('ChooseNewPassword') }}</span>
        </p>
        <v-form @submit.prevent="reset()">
          <g-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="t('Password')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            @click:append="showPassword = !showPassword"
          />
          <g-text-field
            v-model="confirmPassword"
            name="confirm-password"
            :type="showPassword ? 'text' : 'password'"
            :label="t('ConfirmPassword')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            @click:append="showPassword = !showPassword"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            {{ t('ResetPassword') }}
          </v-btn>
        </v-form>
        <div class="text-xs-center">
          <span class="body-2">
            {{ t('AlreadyHaveAccount') }}
          </span>
          <v-btn
            flat
            color="primary"
            to="/login"
          >
            {{ t('SignIn') }}
          </v-btn>
        </div>
      </v-flex>
      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      />
    </v-layout>
  </v-container>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

definePage({
  meta: {
    title: "Login"
  }
});

const store: Store = useStore()
const route = useRoute()
const { t } = useI18n()

const password = ref<string | null>(null)
const confirmPassword = ref<string | null>(null)
const showPassword = ref(false)

function reset() {
  if (password.value) store.dispatch('auth/reset', [route.params.token as string, password.value] )
}

</script>
