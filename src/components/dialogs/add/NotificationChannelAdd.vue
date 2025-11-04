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
              <g-text-field
                v-model="editedItem.id"
                show-details
                show-header
                :rules="[rules.required]"
                required
                :label="t('Name')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-text-field
                v-model="editedItem.sender"
                show-details
                show-header
                :rules="[rules.required]"
                required
                :label="t('Sender')"
              />
            </v-col>
          </v-row>
          
          <v-row v-if="!edit">
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-select
                v-model="editedItem.type"
                show-details
                show-header
                :items="types"
                :label="t('Type')"
              />
            </v-col>
            
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-text-field
                v-if="editedItem.type !== 'sendgrid'"
                v-model="editedItem.apiSid"
                show-details
                show-header
                :type="labels[editedItem.type].sid != t('Username') ? 'password' : ''"
                :rules="[rules.required]"
                required
                :label="labels[editedItem.type].sid"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-text-field
                v-model="editedItem.apiToken"
                show-details
                show-header
                type="password"
                :rules="[rules.required]"
                required
                :label="labels[editedItem.type].token"
              />
            </v-col>
          </v-row>
          <v-row v-if="['link_mobility_xml', 'smtp'].includes(editedItem.type)">
            <v-col 
              cols="9"
              class="pb-0"
            >
              <g-text-field
                v-model="editedItem.host"
                show-details
                show-header
                :rules="[rules.required]"
                required
                :label="t('Host')"
              />
            </v-col>
            <v-col 
              cols="3"
              class="pb-0"
              style="position: relative; top: 11px;"
              align-self="center"
            >
              <g-checkbox
                v-model="editedItem.verify"
                :label="t('Verify')"
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
              {{ t('Save') }}
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
import type { NotificationChannel, NotificationChannelType } from '@/plugins/store/types/notificationChannel-types'

const store: Store = useStore()
const { t } = useI18n()
const rules = {
  required: (v: string) => !!v || t('Required'),
}

const props = defineProps<{
  item: NotificationChannel | undefined
  dialog: boolean,
  copy: false
}>()

const emit = defineEmits(['close'])

const types: {title: string, value: NotificationChannelType }[] = [
  { title: 'sendgrid (email)', value: 'sendgrid' },
  { title: 'smtp (email)', value: 'smtp' },
  { title: 'twilio (sms)', value: 'twilio_sms' },
  { title: 'twilio (call + sms)', value: 'twilio_call' },
  { title: 'link moblity xml (sms)', value: 'link_mobility_xml' },
  { title: 'my link (sms)', value: 'my_link' }
]

const defaultItem: NotificationChannel = {
  id: '',
  type: types[0].value,
  host: null,
  sender: '',
  verify: null
}

const labels = {
  sendgrid: {token: t('APIKey')},
  smtp: {token: t('Password'), sid: t('Username')},
  link_mobility_xml: {token: t('Password'), sid: t('Username')},
  twilio_call: {token: t('ApiToken'), sid: t('ApiSid')},
  twilio_sms: {token: t('ApiToken'), sid: t('ApiSid')},
  my_link: {token: t('ClientSecret'), sid: t('ClientID')}
}

const edit = ref(false)


const form = ref<VForm | null>(null)
const editedItem = ref<NotificationChannel>({
  ...defaultItem,
})

const valueStart = ref<NotificationChannel>({
  ...defaultItem
})

const formTitle = computed(() => props.item?.id !== undefined ? t('EditNotificationChannel') : t('NewNotificationChannel'))
const dialog = computed({
  get: () => props.dialog,
  set: (val) => {if(!val) close(false)}
})


watch(dialog, (val) => {
  if (val) {
    if (props.item) {
      const obj = {
        ...props.item!,
      }
      edit.value = !props.copy
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
      
    }
    else {
      const obj = {
        ...JSON.parse(JSON.stringify(defaultItem)) as NotificationChannel,
      }
      edit.value = false
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})


async function save() {
  if (edit.value) {
      await store.dispatch('notificationChannels/updateNotificationChannel', [
      editedItem.value.id,
      {
        ...editedItem.value,
      }
    ])
  } else {
    await store.dispatch(
      'notificationChannels/createNotificationChannel',
      Object.assign(editedItem.value)
    )
  }
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
    save()
  }
}
</script>
