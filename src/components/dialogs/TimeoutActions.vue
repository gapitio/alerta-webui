<template>
  <v-btn :icon="actions[action].icon" variant="text" @click="dialog = true">
    <v-icon>{{ actions[action].icon }}</v-icon>
    <v-tooltip location="bottom" activator="parent" :text="t(actions[action].header)"
  /></v-btn>
  <v-dialog v-model="dialog" scrollable max-width="540px">
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-col cols="12">
            <span class="header"> {{ t(actions[action].header) }} ({{ alerts.length }}) </span>
          </v-col>
        </v-card-title>
        <v-card-text style="overflow-x: hidden">
          <v-row>
            <v-col cols="7">
              <g-text-field
                v-model="timeout"
                show-header
                type="number"
                :rules="[(val: number) => (val >= 0 ? true : t('TimeoutNegative'))]"
                :label="t('Timeout')"
              />
            </v-col>
            <v-col cols="5">
              <g-select v-model="timeoutUnit" :items="Object.keys(timeoutUnits)" show-header :label="t('Unit')" />
            </v-col>
            <v-col cols="12">
              <g-text-field
                v-model.trim="text"
                show-header
                :maxlength="maxNoteLength"
                :label="t(actions[action].text)"
                validate-on="lazy"
                prepend-icon="edit"
                counter
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-card-actions">
          <v-col cols="6">
            <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="close">
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="6">
            <v-btn color="primary-600" variant="flat" class="no-cap-btn" width="247" @click="validate">
              {{ t('Save') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import type {VForm} from 'vuetify/components'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()

const dialog = ref(false)
const text = ref('')
const timeout = ref<null | number>(null)
const timeoutUnit = ref<keyof typeof timeoutUnits>('minutes')
const form = ref<VForm | null>(null)
const maxNoteLength = 200

type Description = {
  header: string
  icon: string
  text: string
}

const actions: {shelve: Description; ack: Description} = {
  shelve: {header: 'Shelve', icon: 'schedule', text: 'Reason'},
  ack: {header: 'Ack', icon: 'check', text: 'Description'}
}

const timeoutUnits = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 24 * 3600
}

const props = defineProps<{action: 'shelve' | 'ack'}>()

const alerts = computed(() => store.state.alerts.selected)

async function validate() {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    save()
  }
}

async function save() {
  const timeoutSeconds = (timeout.value ?? 0) * timeoutUnits[timeoutUnit.value]
  await store.dispatch('alerts/takeActions', [alerts.value, props.action, text.value, timeoutSeconds || undefined])
  store.dispatch('alerts/getAlerts')
  close()
}

function close() {
  text.value = ''
  dialog.value = false
}
</script>
