<template>
  <div>
    <v-container
      v-if="!showForm"
      class="pa-1"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-btn
            v-show="!isWatched"
            outline
            color="grey darken-2"
            @click="watchAlert"
          >
            <v-icon>visibility</v-icon>&nbsp;{{ t('Watch') }}
          </v-btn>

          <v-btn
            v-show="isWatched"
            outline
            color="grey darken-2"
            @click="unwatchAlert"
          >
            <v-icon>visibility_off</v-icon>&nbsp;{{ t('Unwatch') }}
          </v-btn>

          <v-btn
            v-if="!showForm"
            outline
            color="grey darken-2"
            @click="showForm = true"
          >
            <v-icon>note_add</v-icon>&nbsp;{{ t('AddNote') }}
          </v-btn>

          <v-btn
            outline
            color="grey darken-2"
            @click="deleteAlert"
          >
            <v-icon>delete_forever</v-icon>&nbsp;{{ t('Delete') }}
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>


    <v-container
      v-if="showForm"
      class="pa-1"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit="addNote"
          >
            <v-card>
              <v-card-text>
                <v-text-field
                  v-model.trim="text"
                  :counter="maxNoteLength"
                  :maxlength="maxNoteLength"
                  :minlength="minNoteLength"
                  :rules="textRules"
                  :label="t('AddNote')"
                  prepend-icon="edit"
                  required
                />
              </v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="!isAcked && !isClosed"
                  color="green"
                  class="white--text"
                  @click="takeAction('open')"
                >
                  <v-icon>refresh</v-icon>&nbsp;{{ t('Open') }}
                </v-btn>

                <v-btn
                  v-show="!isAcked"
                  :disabled="!isOpen"
                  color="blue darken-2"
                  class="white--text"
                  @click="ackAlert()"
                >
                  <v-icon>check_circle_outline</v-icon>&nbsp;{{ t('Ack') }}
                </v-btn>

                <v-btn
                  v-show="isAcked"
                  color="blue darken-2"
                  class="white--text"
                  @click="takeAction('unack')"
                >
                  <v-icon>check_circle_outline</v-icon>&nbsp;{{ t('Unack') }}
                </v-btn>

                <v-btn
                  v-show="!isShelved"
                  :disabled="!isOpen && !isAcked"
                  color="blue"
                  class="white--text"
                  @click="shelveAlert()"
                >
                  <v-icon>schedule</v-icon>&nbsp;{{ t('Shelve') }}
                </v-btn>

                <v-btn
                  v-show="isShelved"
                  color="blue"
                  class="white--text"
                  @click="takeAction('unshelve')"
                >
                  <v-icon>schedule</v-icon>&nbsp;{{ t('Unshelve') }}
                </v-btn>

                <v-btn
                  :disabled="isClosed"
                  color="orange"
                  class="white--text"
                  @click="takeAction('close')"
                >
                  <v-icon>highlight_off</v-icon>&nbsp;{{ t('Close') }}
                </v-btn>

                <v-btn
                  color="white"
                  :class="{'black--text': isDark}"
                  @click="addNote"
                >
                  <v-icon>note_add</v-icon>&nbsp;{{ t('AddNote') }}
                </v-btn>

                <v-spacer />

                <v-btn
                  icon
                  @click="close"
                >
                  <v-icon
                    color="grey darken-1"
                  >
                    delete
                  </v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import debounce from 'lodash/debounce'
import { computed, ref, defineProps } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { Store } from '@/plugins/store/types'

const store: Store = useStore()
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

const showForm = ref(false)
const valid = ref(true)
const text = ref('')
const maxNoteLength = ref(10)
const minNoteLength = ref(0)
const textRules = ref(
   [
    (v: string) => !!v || t('TextIsRequired'),
    (v: string) => (v && v.length <= maxNoteLength.value) || `${t('TextMustBeLessThan')} ${maxNoteLength.value} ${t('characters')}`
  ]
)

const isDark = computed(() => store.getters.getPreference('isDark'))
const isOpen = computed(() => ['open', 'NORM', 'UNACK', 'RTNUN'].includes(props.status) )
const isAcked = computed(() => ['ack', 'ACKED'].includes(props.status) )
const isShelved = computed(() => ['shelved', 'SHLVD'].includes(props.status) )
const isClosed = computed(() => props.status == 'closed' )

const emit = defineEmits([
  'take-action',
  'ack-alert',
  'shelve-alert',
  'watch-alert',
  'unwatch-alert',
  'add-note',
  'delete-alert',
])

function close() {
  text.value = ''
  showForm.value = false
}

const takeAction = debounce((action) => {
  emit('take-action', props.id, action, text.value)
  close()
}, 200, {leading: true, trailing: false})

const ackAlert = debounce(() => {
  emit('ack-alert', props.id, text.value)
  close()
}, 200, {leading: true, trailing: false})

const shelveAlert = debounce(() => {
  emit('shelve-alert', props.id, text.value)
  close()
}, 200, {leading: true, trailing: false})

const watchAlert = debounce(() => {
  emit('watch-alert', props.id)
}, 200, {leading: true, trailing: false})

const unwatchAlert = debounce(() => {
  emit('unwatch-alert', props.id)
}, 200, {leading: true, trailing: false})

const addNote = debounce(() => {
  emit('add-note', props.id, text.value)
  close()
}, 200, {leading: true, trailing: false})

const deleteAlert = debounce(() => {
  emit('delete-alert', props.id)
}, 200, {leading: true, trailing: false})

</script>

<style></style>
