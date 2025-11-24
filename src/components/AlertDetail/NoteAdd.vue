<template>
  <v-container fluid>
    <v-row align="start">
      <v-col cols="auto">
        <v-btn v-show="!isWatched" prepend-icon="visibility" variant="outlined" @click="watchAlert">
          {{ t('Watch') }}
        </v-btn>
        <v-btn v-show="isWatched" variant="outlined" prepend-icon="visibility_off" @click="unwatchAlert">
          {{ t('Unwatch') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn prepend-icon="note_add" variant="outlined" @click="editNote = true">
          {{ t('AddNote') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn prepend-icon="delete" variant="outlined" @click="deleteAlert">
          {{ t('Delete') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="editNote" scrollable max-width="540px">
      <v-form ref="form">
        <v-card class="dialog-card">
          <v-card-title>
            <v-col cols="12">
              <span class="header">
                {{ t('AddNote') }}
              </span>
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
              <v-col cols="12">
                <g-select
                  v-model="type"
                  :items="filteredActions"
                  show-header
                  return-object
                  :maxlength="maxNoteLength"
                  :label="t('Type')"
                  :rules="textRules"
                  validate-on="lazy"
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
  </v-container>
</template>

<script lang="ts">
type s = 'take-action' | 'ack-alert' | 'shelve-alert' | 'add-note'
</script>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {VForm} from 'vuetify/components'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  isWatched: {
    type: Boolean,
    required: true
  }
})
type Action = {
  title: string
  value: 'open' | 'close' | 'unack' | 'ack' | 'shelve' | 'unshelve' | 'note'
  action: s
  show?: () => boolean
}

const isAcked = computed(() => ['ack', 'ACKED'].includes(props.status))
const isShelved = computed(() => ['shelved', 'SHLVD'].includes(props.status))
const isClosed = computed(() => props.status == 'closed')
const isAlertAlarmModel = computed(() => !store.getters.getConfig('alarm_model').name.includes('ISA'))

const actions: Action[] = [
  {title: t('Open'), value: 'open', action: 'take-action', show: () => isClosed.value},
  {title: t('Close'), value: 'close', action: 'take-action', show: () => !isClosed.value && isAlertAlarmModel.value},
  {title: t('Unack'), value: 'unack', action: 'take-action', show: () => isAcked.value},
  {
    title: t('Ack'),
    value: 'ack',
    action: 'ack-alert',
    show: () => !isClosed.value && !isAcked.value && !isShelved.value
  },
  {title: t('Shelve'), value: 'shelve', action: 'shelve-alert', show: () => !isShelved.value},
  {title: t('Unshelve'), value: 'unshelve', action: 'take-action', show: () => isShelved.value},
  {title: t('AddNote'), value: 'note', action: 'add-note'}
]

const filteredActions = computed(() => actions.filter(a => (a.show === undefined ? true : a.show())))
const emits = defineEmits([
  'take-action',
  'ack-alert',
  'shelve-alert',
  'add-note',
  'watch-alert',
  'unwatch-alert',
  'delete-alert'
])
const type = ref<Action>({title: t('AddNote'), value: 'note', action: 'add-note'})

const editNote = ref(false)
const text = ref('')
const form = ref<VForm | null>(null)
const maxNoteLength = 200
const textRules = [(v: string) => !!v || t('TextIsRequired')]

watch(editNote, val => {
  if (val) type.value = {title: t('AddNote'), value: 'note', action: 'add-note'}
})

async function validate() {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    save()
  }
}

function save() {
  const actionType = type.value.action
  if (actionType == 'take-action') emits(actionType, props.id, type.value.value, text.value)
  else emits(actionType, props.id, text.value)
  close()
}

const watchAlert = () => emits('watch-alert', props.id)
const unwatchAlert = () => emits('unwatch-alert', props.id)

function deleteAlert() {
  emits('delete-alert', props.id)
}

function close() {
  text.value = ''
  editNote.value = false
}
</script>
