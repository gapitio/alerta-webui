<template>
  <v-btn icon="note_add" variant="text" @click="dialog = true" />
  <v-dialog v-model="dialog" scrollable max-width="540px">
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-col cols="12">
            <span class="header"> {{ t('AddNote') }} ({{ alerts.length }}) </span>
          </v-col>
        </v-card-title>
        <v-card-text style="overflow-x: hidden">
          <v-row>
            <v-col cols="12">
              <g-text-field
                v-model.trim="text"
                show-header
                :maxlength="maxNoteLength"
                :label="t('Note')"
                :rules="textRules"
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
const form = ref<VForm | null>(null)
const maxNoteLength = 200
const textRules = [(v: string) => !!v || t('TextIsRequired')]

const alerts = computed(() => store.state.alerts.selected)

async function validate() {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    save()
  }
}

async function save() {
  await Promise.all(alerts.value.map(id => store.dispatch('alerts/addNote', [id, text.value])))
  close()
}

function close() {
  text.value = ''
  dialog.value = false
}
</script>
