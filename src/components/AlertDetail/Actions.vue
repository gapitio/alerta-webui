<template>
  <v-container fluid>
    <v-row 
      v-if="!editNote" 
      align="start"
    >
      <v-col cols="auto">
        <v-btn 
          v-show="!isWatched"
          prepend-icon="visibility"
          variant="outlined"
          @click="watchAlert"
        >
          {{ t('Watch') }}
        </v-btn>
        <v-btn 
          v-show="isWatched"
          variant="outlined"
          prepend-icon="visibility_off"
          @click="unwatchAlert"
        >
          {{ t('Unwatch') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          prepend-icon="note_add"
          variant="outlined"
          @click="editNote = true"
        >
          {{ t('AddNote') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          prepend-icon="delete"
          variant="outlined"
          @click="deleteAlert"
        >
          {{ t('Delete') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-text-field 
          v-model.trim="text"
          :maxlength="maxNoteLength"
          :label="t('AddNote')"
          :rules="textRules"
          validate-on="lazy"
          prepend-icon="edit"
          counter
        />
      </v-col>

      <v-col cols="auto">
        <v-btn
          :disabled="!isAcked && !isClosed"
          color="green"
          prepend-icon="refresh"
          variant="tonal"
          @click="takeAction('open')"
        >
          {{ t('Open') }}
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          v-show="!isAcked"
          :disabled="!isOpen"
          color="blue"
          prepend-icon="check"
          variant="tonal"
          @click="ackAlert()"
        >
          {{ t('Ack') }}
        </v-btn>
        
        <v-btn
          v-show="isAcked"
          color="blue"
          prepend-icon="undo"
          variant="tonal"
          @click="takeAction('unack')"
        >
          {{ t('Unack') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn
          v-show="!isShelved"
          :disabled="!isOpen && !isAcked"
          color="blue-lighten-2"
          prepend-icon="schedule"
          variant="tonal"
          @click="shelveAlert()"
        >
          {{ t('Shelve') }}
        </v-btn>
        
        <v-btn
          v-show="isShelved"
          color="blue-lighten-2"
          prepend-icon="restore"
          variant="tonal"
          @click="takeAction('unshelve')"
        >
          {{ t('Unshelve') }}
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          :disabled="isClosed"
          color="orange"
          prepend-icon="cancel"
          variant="tonal"
          @click="takeAction('close')"
        >
          {{ t('Close') }}
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          color="white"
          prepend-icon="note_add"
          variant="tonal"
          @click="addNote"
        >
          {{ t('AddNote') }}
        </v-btn>
      </v-col>
      <v-col align="end">
        <v-btn
          icon="delete"
          variant="tonal"
          @click="close"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

const emit = defineEmits(['take-action', 'ack-alert', 'shelve-alert', 'watch-alert', 'unwatch-alert', 'add-note', 'delete-alert'])

const editNote = ref(false)
const text = ref('')
const maxNoteLength = 200
const textRules = [
  (v: string) => !!v || t('TextIsRequired')
]

const isOpen = computed(() => ['open', 'NORM', 'UNACK', 'RTNUN'].includes(props.status))
const isAcked = computed(() => ['ack', 'ACKED'].includes(props.status))
const isShelved = computed(() => ['shelved', 'SHLVD'].includes(props.status))
const isClosed = computed(() => props.status == 'closed')

function takeAction(action: string) {
  emit('take-action', props.id, action, text.value)
  close()
}

function ackAlert() {
  emit('ack-alert', props.id, text.value)
  close()
}

function shelveAlert() {
  emit('shelve-alert', props.id, text.value)
}

const watchAlert = () => emit('watch-alert', props.id)
const unwatchAlert = () => emit('unwatch-alert', props.id)

function addNote() {
  emit('add-note', props.id, text.value)
  close()
}

function deleteAlert() {
  emit('delete-alert', props.id)
}

function close() {
  text.value = ''
  editNote.value = false
}
</script>