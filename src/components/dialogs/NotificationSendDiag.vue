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
              <g-select
                v-model="mailChannel"
                show-header
                item-title="id"
                item-key="id"
                :items="mailChannels"
                :label="t('EmailChannel')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-select
                v-model="smsChannel"
                show-header
                item-title="id"
                item-key="id"
                :items="smsChannels"
                :label="t('SMSChannel')"
              />
            </v-col>
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
import type { NotificationSend, NotificationSendData } from '@/plugins/store/types/notificationSends-types'

const store: Store = useStore()
const { t } = useI18n()

const props = defineProps<{
  items: NotificationSend[]
  dialog: boolean,
}>()

const emit = defineEmits(['close'])
const mailTypes = ['sendgrid', 'smtp']

const mailChannels = computed(() => store.state.notificationChannels.items.filter((a) => mailTypes.includes(a.type)))
const smsChannels = computed(() => store.state.notificationChannels.items.filter((a) => !mailTypes.includes(a.type)))

const defaultItem: NotificationSendData = {
  text: '',
  receivers: [],
  notifications: [],
}

const mailChannel = ref(mailChannels.value[0]?.id ?? '')
const smsChannel = ref(smsChannels.value[0]?.id ?? '')

const form = ref<VForm | null>(null)
const editedItem = ref<NotificationSendData>({
  ...defaultItem,
})

const valueStart = ref<NotificationSendData>({
  ...defaultItem
})

const formTitle = computed(() => t('SendNotification'))
const dialog = computed({
  get: () => props.dialog,
  set: (val) => {if(!val) close(false)}
})


watch(dialog, (val) => {
  if (val) {
    const obj = {
      ...JSON.parse(JSON.stringify(defaultItem)) as NotificationSendData,
    }
    editedItem.value = obj
    valueStart.value = JSON.parse(JSON.stringify(obj))
  }
})


async function send() {
  const mails = {notifications: props.items.filter((a) => a.mail)}
  const sms = {notifications: props.items.filter((a) => a.sms)}
  if (mailChannel.value && mails.notifications.length > 0)
    console.log('sending mails', mails.notifications)
    await store.dispatch(
      'notificationSends/sendNotification',
      [
        mailChannel.value,
        Object.assign(
          editedItem.value,
          mails
        )
      ]
    )
  if (smsChannel.value  && sms.notifications.length > 0)
    console.log('sending sms', sms.notifications)
    await store.dispatch(
      'notificationSends/sendNotification',
      [
        smsChannel.value,
        Object.assign(
          editedItem.value,
          sms
        )
      ]
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

const getChannels = () => store.dispatch('notificationChannels/getNotificationChannels')

getChannels()
</script>
