<template>
  <v-dialog
    v-model="dialog"
    scrollable
    max-width="540px"
  >
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-col cols="12">
            <span class="header">
              {{ formTitle }}
            </span>
          </v-col>
        </v-card-title>

        <v-card-text style="overflow-x: hidden;">
          <v-row>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-textarea
                v-model="editedItem.text"
                show-header
                :label="t('Message')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.receivers"
                multiple
                show-header
                :label="t('Receivers')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.groups"
                multiple
                :items="groups"
                item-title="name"
                item-value="id"
                show-header
                :label="t('Groups')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.users"
                multiple
                :items="emails"
                item-title="name"
                item-value="email"
                show-header
                :label="t('Users')"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="6">
            <v-btn
              variant="outlined"
              width="247"
              class="no-cap-btn btn"
              @click="close(false)"
            >
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="6">
            <v-btn
              color="primary-600"
              variant="flat"
              class="no-cap-btn"
              width="247"
              @click="validate"
            >
              {{ t('Send') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { Store } from '@/plugins/store/types'
import type { VForm } from 'vuetify/components'
import type { NotificationChannel, NotificationSend } from '@/plugins/store/types/notificationChannel-types'

const store: Store = useStore()
const { t } = useI18n()

const props = defineProps<{
  item: NotificationChannel | null
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const emails = computed(() => store.state.users.emails)
const groups = computed(() => store.state.notificationGroups.items)

const defaultItem: NotificationSend = {
  text: '',
  receivers: [],
  users: [],
  groups: []
}

const form = ref<VForm | null>(null)
const editedItem = ref<NotificationSend>({
  ...defaultItem,
})

const valueStart = ref<NotificationSend>({
  ...defaultItem
})

const formTitle = computed(() => t('SendNotificationChannel') + ` ${props.item?.id}`)
const dialog = computed({
  get: () => props.dialog,
  set: (val) => {if(!val) close(false)}
})


watch(dialog, (val) => {
  if (val) {
    const obj = {
      ...JSON.parse(JSON.stringify(defaultItem)) as NotificationSend,
    }
    editedItem.value = obj
    valueStart.value = JSON.parse(JSON.stringify(obj))
  }
})


async function send() {
  await store.dispatch(
    'notificationChannels/testNotificationChannel',
    [props.item!.id, Object.assign(editedItem.value)]
  )
  close(true)
}

function compareDict(a: any, b: any) {
  if (a === null) return true
  for (const key in a) {
    if (b[key] === undefined) return false
    if (a[key] !== null && typeof a[key] === typeof({})) {
      if (b[key] === null || a[key].length !== b[key].length || !compareDict(a[key], b[key])) return false
    }
    else if (a[key] !== b[key]) return false
  }
  return true
}

function close(saved: boolean) {
  const change = !compareDict(editedItem.value, valueStart.value)
  if (saved || !change || confirm('Are you sure you want to close the dialog?')) {
    emit('close')
  }
}

async function validate() {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    send()
  }
}

const getGroups = () => store.dispatch('notificationGroups/getNotificationGroups')
const getEmails = () => store.dispatch('users/getEmails')

getEmails()
getGroups()
</script>
