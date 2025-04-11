<template>
  <v-container fluid>
    <v-row v-if="!editNote" align="start">
      <v-col cols="auto">
        <v-btn 
          v-show="!isWatched"
          prepend-icon="mdi-eye"
          variant="outlined"
          @click="watchAlert"
        >
          {{ $t('Watch') }}
        </v-btn>
        <v-btn 
          v-show="isWatched"
          variant="outlined"
          prepend-icon="mdi-eye-off"
          @click="unwatchAlert"
        >
          {{ $t('Unwatch') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          prepend-icon="mdi-note-plus"
          variant="outlined"
          @click="editNote = true"
        >
          {{ $t('AddNote') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          prepend-icon="mdi-delete"
          variant="outlined"
          @click="deleteAlert"
        >
          {{ $t('Delete') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-text-field 
          v-model.trim="text"
          :maxlength="maxNoteLength"
          :label="$t('AddNote')"
          :rules="textRules"
          validate-on="lazy"
          prepend-icon="mdi-pencil"
          counter
        />
      </v-col>

      <v-col cols="auto">
        <v-btn
          :disabled="!isAcked && !isClosed"
          color="green"
          prepend-icon="mdi-refresh"
          variant="tonal"
          @click="takeAction('open')"
        >
          {{ $t('Open') }}
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          v-show="!isAcked"
          :disabled="!isOpen"
          color="blue"
          prepend-icon="mdi-check"
          variant="tonal"
          @click="ackAlert()"
        >
          {{ $t('Ack') }}
        </v-btn>
        
        <v-btn
          v-show="isAcked"
          color="blue"
          prepend-icon="mdi-undo"
          variant="tonal"
          @click="takeAction('unack')"
        >
          {{ $t('Unack') }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn
          v-show="!isShelved"
          :disabled="!isOpen && !isAcked"
          color="blue-lighten-2"
          prepend-icon="mdi-clock"
          variant="tonal"
          @click="shelveAlert()"
        >
          {{ $t('Shelve') }}
        </v-btn>
        
        <v-btn
          v-show="isShelved"
          color="blue-lighten-2"
          prepend-icon="mdi-restore"
          variant="tonal"
          @click="takeAction('unshelve')"
        >
          {{ $t('Unshelve') }}
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          :disabled="isClosed"
          color="orange"
          prepend-icon="mdi-close-circle-outline"
          variant="tonal"
          @click="takeAction('close')"
        >
          {{ $t('Close') }}
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          color="white"
          prepend-icon="mdi-note-plus"
          variant="tonal"
          @click="addNote"
        >
          {{ $t('AddNote') }}
        </v-btn>
      </v-col>
      <v-col align="end">
        <v-btn
          icon="mdi-delete"
          variant="tonal"
          @click="close"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
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
  },
  data: vm => ({
    editNote: false,
    valid: true,
    text: '',
    maxNoteLength: 200,
    minNoteLength: 0,
    textRules: [
      v => !!v || vm.$t('TextIsRequired')
    ]
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isOpen(status) {
      return this.status == 'open' || this.status == 'NORM' || this.status == 'UNACK' || this.status == 'RTNUN'
    },
    isAcked() {
      return this.status == 'ack' || this.status == 'ACKED'
    },
    isShelved() {
      return this.status == 'shelved' || this.status == 'SHLVD'
    },
    isClosed() {
      return this.status == 'closed'
    }
  },
  methods: {
    takeAction(action) {
      this.$emit('take-action', this.id, action, this.text)
      this.close()
    },
    ackAlert() {
      this.$emit('ack-alert', this.id, this.text)
      this.close()
    },
    shelveAlert() {
      this.$emit('shelve-alert', this.id, this.text)
      this.close()
    },
    watchAlert() {
      this.$emit('watch-alert', this.id)
    },
    unwatchAlert() {
      this.$emit('unwatch-alert', this.id)
    },
    addNote() {
      this.$emit('add-note', this.id, this.text)
      this.close()
    },
    deleteAlert() {
      this.$emit('delete-alert', this.id)
    },
    close() {
      this.text = null
      this.editNote = false
    }
  }
}
</script>