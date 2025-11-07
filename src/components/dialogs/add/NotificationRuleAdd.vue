<template>
  <v-dialog
    v-model="dialog"
    scrollable
    max-width="540px"
  >
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-col
            cols="12"
          >
            <span class="header">
              {{ formTitle }}
            </span>
          </v-col>
        </v-card-title>

        <v-card-text style="overflow-x: hidden;">
          <v-row>
            <v-col cols="9">
              <g-text-field
                v-model.trim="editedItem.name"
                show-header
                required
                :label="t('Name')"
              />
            </v-col>
            <v-col
              cols="3"
              align-self="center"
              class="pt-8"
            >
              <g-switch
                v-model="editedItem.active"
                :label="t('Active')"
              />
            </v-col>
            <v-col
              v-if="store.getters.getConfig('customer_views')"
              cols="12"
            >
              <g-select
                v-model="editedItem.customer"
                show-header
                :items="allowedCustomers"
                :label="t('Customer')"
                :show-eader="true"
                clearable
              />
            </v-col>
            <v-col
              cols="6"
            >
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
              >
                <template #activator="{ props }">
                  <g-text-field
                    v-model="editedDate"
                    v-bind="props"
                    show-header
                    variant="outlined"
                    :label="t('ReactivateDate')"
                  />
                </template>

                <v-date-picker
                  v-model="editedItem.reactivateDate"
                  hide-header
                  @update:model-value="menu = false"
                />
              </v-menu>
            </v-col>
            <v-col cols="6">
              <g-combobox
                v-model="editedItem.reactivateTime"
                show-header
                variant="outlined"
                :label="t('Time')"
                :items="times"
              />
            </v-col>
            <v-col cols="12">
              <g-select
                v-model="editedItem.channelId"
                show-header
                :label="t('NotificationChannel') + '*'"
                :items="currentChannelsIds"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col cols="6">
              <g-text-field
                v-model.trim="editedItem.timeObj.time"
                show-header
                :label="t('DelayTime')"
              />
            </v-col>
            <v-col cols="6">
              <g-select
                v-model="editedItem.timeObj.interval"
                show-header
                :items="intervals"
                :label="t('Interval')"
              />
            </v-col>
            <v-col cols="12">
              <g-select
                v-model="editedItem.days"
                show-header
                :items="days"
                :label="t('Days')"
                chips
                multiple
              />
            </v-col>
            <v-col cols="6">
              <g-combobox
                v-model="editedItem.period.startTime"
                show-header
                :items="times"
                :label="t('StartTime')"
              />
            </v-col>
            <v-col cols="6">
              <g-combobox
                v-model="editedItem.period.endTime"
                show-header
                :items="times"
                :label="t('EndTime')"
              />
            </v-col>
            <v-col cols="12">
              <g-textarea
                v-model.trim="editedItem.text"
                show-header
                :label="t('Text')"
              >
                <template #infoDialog>
                  <text-information-dialog />
                </template>
              </g-textarea>
            </v-col>

            <v-col
              cols="12"
              class="header"
            >
              {{ t('Receivers') }}
            </v-col>
            <v-col cols="12">
              <g-combobox
                v-model="editedItem.receivers"
                show-header
                :label="t('Receivers')"
                multiple
                chips
              />
            </v-col>
            <v-col cols="12">
              <g-select
                v-model="editedItem.usersEmails"
                show-header
                :items="emails"
                item-title="name"
                item-value="email"
                :label="t('Users')"
                chips
                closable-chips
                multiple
              />
            </v-col>
            <v-col cols="12">
              <g-select
                v-model="editedItem.groupIds"
                show-header
                :items="groups"
                item-title="name"
                item-value="id"
                :label="t('Groups')"
                closable-chips
                clearable
                chips
                multiple
              />
            </v-col>
            
            <v-col cols="12">
              <group-edit
                v-model="editedItem.triggers"
                :items="triggerItems"
                :header="t('Triggers')"
              />
            </v-col>

            <v-col
              cols="12"
              class="header"
            >
              {{ t('AlertFields') }}
            </v-col>
            <v-col cols="12">
              <g-select
                v-model="editedItem.environment"
                show-header
                :items="allowedEnvironments"
                :label="t('Environment') + '*'"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col cols="12">
              <g-text-field
                v-model.trim="editedItem.resource"
                show-header
                :label="t('Resource')"
              />
            </v-col>
            <v-col cols="12">
              <g-text-field
                v-model.trim="editedItem.event"
                show-header
                :label="t('Event')"
              />
            </v-col>
            <v-col cols="12">
              <g-combobox
                v-model="editedItem.service"
                show-header
                :items="currentServices"
                :label="t('Service')"
                chips
                multiple
              />
            </v-col>
            <v-col cols="12">
              <g-combobox
                v-model.trim="editedItem.group"
                show-header
                :items="currentGroups"
                :label="t('Group')"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <group-edit
                v-model="editedItem.tags"
                :items="tagItems"
                :header="t('AlertTags')"
              />
            </v-col>
            
            <v-col cols="12">
              <group-edit
                v-model="editedItem.excludedTags"
                :items="tagItems"
                :header="t('AlertExcludedTags')"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="4">
            <notification-alert-list :rule="editedItem" />
          </v-col>
          <v-col cols="4">
            <v-btn
              variant="outlined"
              width="247"
              class="no-cap-btn btn"
              @click="close(false)"
            >
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="4">
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
import { computed, ref, watch, type Ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { Store } from '@/plugins/store/types'
import type { NotificationRule } from '@/plugins/store/types/notificationRule-types'
import type { VForm } from 'vuetify/components'
import { useFilters } from '@/filters'

const store: Store = useStore()
const { t } = useI18n()
const filters = useFilters()
const rules = {
  required: (v: string) => !!v || t('TextIsRequired'),
}

const compProps = defineProps<{
  item: NotificationRule | undefined
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const defaultItem: NotificationRule = {
  active: true,
  customer: null,
  name: null,
  environment: '',
  receivers: [],
  usersEmails: [],
  groupIds: [],
  useOnCall: false,
  service: [],
  resource: null,
  event: null,
  group: null,
  startTime: '',
  delayTime: null,
  reactivate: null,
  endTime: '',
  text: '',
  days: [],
  triggers: [{from_severity: [], to_severity: [], status: []}],
  channelId: '',
  tags: [{all: [], any: []}],
  excludedTags: [{all: [], any: []}],
}


const form = ref<VForm | null>(null)
const days = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
const intervals = ref(['second','minute', 'hour', 'days'])
const menu = ref(false)
const editedItem: Ref<NotificationRule & {
  reactivateDate: string | null,
  reactivateTime: string | null,
  timeObj: {
    time: number | null,
    interval: string | null
  },
  period: {
    startTime: string,
    endTime: string
  }
}> = ref({
  ...defaultItem,
  reactivateDate: null,
  reactivateTime: null,
  timeObj: {time: null, interval: null},
  period: {startTime:'', endTime:''}
})

const valueStart: Ref<NotificationRule & {
  reactivateDate: string | null,
  reactivateTime: string | null,
  timeObj: {
    time: number | null,
    interval: string | null
  },
  period: {
    startTime: string,
    endTime: string
  }
}> = ref({
  ...defaultItem,
  reactivateDate: null,
  reactivateTime: null,
  timeObj: {time: null, interval: null},
  period: {startTime:'', endTime:''}
})

const editedDate = computed(() => {
  if (editedItem.value.reactivateDate === null) return ''
  const date = new Date(editedItem.value.reactivateDate)
  const month = date.getMonth() + 1
  const dayOfMonth = date.getDate()
  return `${date.getFullYear()}-${month < 10 ? 0 : ''}${month}-${dayOfMonth < 10 ? 0 : ''}${dayOfMonth}`
})

const timeFromIsoString = (time: string | null) => {
  if (!time) return null
  const date = new Date(time)
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${hour < 10 ? 0 : ''}${hour}:${minute < 10 ? 0 : ''}${minute}`
}

const formTitle = computed(() => compProps.item?.id !== undefined ? t('EditNotificationRule') : t('NewNotificationRule'))

const dialog = computed({
  get: () => compProps.dialog,
  set: (val) => {if(!val) close(false)}
})


watch(dialog, (val) => {
  if (val) {
    if (compProps.item) {
      const obj = {
        ...compProps.item!,
        reactivateDate: compProps.item.reactivate,
        reactivateTime: timeFromIsoString(compProps.item.reactivate),
        timeObj: {time: null, interval: null},
        period: {
          startTime: compProps.item.startTime
            ? filters.hhmmUtcToLocal(compProps.item.startTime)
            : '',
          endTime: compProps.item.endTime
            ? filters.hhmmUtcToLocal(compProps.item.endTime)
            : ''
        }
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
      
    }
    else {
      const obj = {
        ...JSON.parse(JSON.stringify(defaultItem)) as NotificationRule,
        reactivateDate: null,
        reactivateTime: null,
        timeObj: {time: null, interval: null},
        period: {startTime:'', endTime:''}
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})

const times = computed(() => Array.from(
  {
    length: (24 * 60) / 15 + 1
  },
  (v, i) => {
    if (i == 0) {
      return null
    } else {
      const h = Math.floor(((i - 1) * 15) / 60)
      const m = (i - 1) * 15 - h * 60
      return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2)
    }
  }
))


const allowedCustomers = computed(() => store.getters['customers/customers'])
const allowedEnvironments = computed(() => store.getters['alerts/environments']())
const currentServices = computed(() => store.getters['alerts/services'])
const currentChannelsIds = computed(() => store.getters['notificationChannels/ids'])
const currentTags = computed(() => store.getters['alerts/tags'])
const currentGroups = computed(() => store.getters['alerts/groups'])
const emails = computed(() => store.state.users.emails)
const groups = computed(() => store.state.notificationGroups.items)
const severities = computed(() => Object.keys(store.getters.getConfig('alarm_model').severity))
const statuses = computed(() => Object.keys(store.getters.getConfig('alarm_model').status))
const tagItems = computed(() => ({
  all: {label: t('AND'), items: currentTags.value, type: 'select'},
  any: {label: t('OR'), items: currentTags.value, type: 'select'}
}))
const triggerItems = computed(() => ({
  from_severity: {label: t('PreviousSeverity'), items: severities.value, type: 'select'},
  to_severity: {label: t('CurrentSeverity'), items: severities.value, type: 'select'},
  status: {label: t('Status'), items: statuses.value, type: 'select'},
  text: {label: t('Text')}
}))

async function save() {
  let sTimeStr = null
  let eTimeStr = null
  if (
    editedItem.value.period.startTime !== '' &&
    editedItem.value.period.endTime !== ''
  ) {
    sTimeStr = filters.hhmmLocalToUtc(editedItem.value.period.startTime)
    eTimeStr = filters.hhmmLocalToUtc(editedItem.value.period.endTime)
  }
  if (editedItem.value.id) {
      await store.dispatch('notificationRules/updateNotificationRule', [
      editedItem.value.id,
      {
        active: editedItem.value.active,
        customer: editedItem.value.customer,
        name: editedItem.value.name,
        environment: editedItem.value.environment,
        delayTime: editedItem.value.timeObj.time ? `${editedItem.value.timeObj.time} ${editedItem.value.timeObj.interval}` : null,
        receivers: editedItem.value.receivers,
        usersEmails: editedItem.value.usersEmails,
        groupIds: editedItem.value.groupIds,
        useOnCall: editedItem.value.useOnCall,
        service: editedItem.value.service,
        resource: editedItem.value.resource,
        event: editedItem.value.event,
        group: editedItem.value.group,
        tags: editedItem.value.tags,
        excludedTags: editedItem.value.excludedTags,
        startTime: sTimeStr,
        endTime: eTimeStr,
        text: editedItem.value.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s'),
        days: editedItem.value.days,
        channelId: editedItem.value.channelId,
        triggers: editedItem.value.triggers.map(b => {return {...b, text: b.text !== undefined ? b.text?.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s') : b.text}}),
        reactivate: editedItem.value.reactivateDate && editedItem.value.reactivateTime ? toISODate(
          editedDate.value,
          editedItem.value.reactivateTime
        ) : null
      }
    ])
  } else {
    await store.dispatch(
      'notificationRules/createNotificationRule',
      Object.assign(editedItem.value, {
        id: null,
        startTime: sTimeStr,
        endTime: eTimeStr,
        delayTime: editedItem.value.timeObj.time ? `${editedItem.value.timeObj.time} ${editedItem.value.timeObj.interval}` : null,
        text: editedItem.value.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s'),
        triggers: editedItem.value.triggers.map(b => {return {...b, text: b.text !== undefined ? b.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s') : b.text}}),
        reactivate: editedItem.value.reactivateDate && editedItem.value.reactivateTime ? toISODate(
          editedDate.value,
          editedItem.value.reactivateTime
        ) : null
      })
    )
  }
  close(true)
}


function toISODate(date: string, time: string) {
  return new Date(date + ' ' + time).toISOString()
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

const getEmails = () => store.dispatch('users/getEmails')
getEmails()
</script>
