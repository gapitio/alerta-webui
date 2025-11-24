<template>
  <v-dialog v-model="dialog" scrollable max-width="540px">
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-col cols="12" sm6 md9>
            <span class="header">
              {{ formTitle }}
            </span>
          </v-col>
        </v-card-title>

        <v-card-text style="overflow-x: hidden">
          <v-row>
            <v-col v-if="store.getters.getConfig('customer_views')" cols="12">
              <g-select
                v-model="editedItem.customer"
                show-header
                :items="allowedCustomers"
                :label="t('Customer')"
                :show-eader="true"
                clearable
              />
            </v-col>

            <v-col cols="6">
              <date-edit v-model="editedStartDate" new-date :label="t('StartDate')" show-header />
            </v-col>
            <v-col cols="6">
              <g-combobox v-model="editedItem.period.startTime" show-header :items="times" :label="t('StartTime')" />
            </v-col>
            <v-col cols="6">
              <date-edit v-model="editedEndDate" :label="t('EndDate')" show-header />
            </v-col>
            <v-col cols="6">
              <g-combobox v-model="editedItem.period.endTime" show-header :items="times" :label="t('EndTime')" />
            </v-col>
            <v-col cols="12">
              <g-text-field v-model.trim="editedItem.text" show-header :label="t('Description')" />
            </v-col>

            <v-col cols="12" class="header">
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
              <g-text-field v-model.trim="editedItem.resource" show-header :label="t('Resource')" />
            </v-col>
            <v-col cols="12">
              <g-text-field v-model.trim="editedItem.event" show-header :label="t('Event')" />
            </v-col>
            <v-col cols="12">
              <g-text-field v-model.trim="editedItem.origin" show-header :label="t('Origin')" />
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
              <g-select v-model="editedItem.tags" :items="currentTags" multiple show-header :label="t('Tags')" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="6">
            <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="close(false)">
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
import {computed, ref, watch, type Ref} from 'vue'
import {useStore} from 'vuex'
import {useI18n} from 'vue-i18n'
import type {Store} from '@/plugins/store/types'
import type {VForm} from 'vuetify/components'
import type {Blackout} from '@/plugins/store/types/blackout-types'

const store: Store = useStore()
const {t} = useI18n()
const rules = {
  required: (v: string) => !!v || t('TextIsRequired')
}

const props = defineProps<{
  item: Blackout | undefined
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const defaultItem: Blackout = {
  customer: null,
  environment: '',
  service: [],
  resource: null,
  event: null,
  group: null,
  startTime: '',
  endTime: '',
  text: '',
  origin: null,
  tags: []
}

const form = ref<VForm | null>(null)
const editedItem: Ref<
  Blackout & {
    period: {
      startTime: string
      endTime: string
    }
  }
> = ref({
  ...defaultItem,
  reactivateDate: null,
  reactivateTime: null,
  period: {startTime: '12:00', endTime: '12:00'}
})

const valueStart: Ref<
  Blackout & {
    reactivateDate: string | null
    reactivateTime: string | null
    period: {
      startTime: string
      endTime: string
    }
  }
> = ref({
  ...defaultItem,
  reactivateDate: null,
  reactivateTime: null,
  period: {startTime: '12:00', endTime: '12:00'}
})

const editedStartDate = computed({
  get: () => (editedItem.value.startTime == '' ? new Date() : new Date(editedItem.value.startTime)).toISOString(),
  set: val => (editedItem.value.startTime = new Date(val + ' 12:00').toISOString())
})

const editedEndDate = computed({
  get: () => {
    let date = new Date()
    if (editedItem.value.endTime == '') {
      date.setDate(date.getDate() + 2)
    } else {
      date = new Date(editedItem.value.endTime)
    }
    return date.toISOString()
  },
  set: val => (editedItem.value.endTime = new Date(val).toISOString())
})

const timeFromIsoString = (time: string) => {
  const date = new Date(time)
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${hour < 10 ? 0 : ''}${hour}:${minute < 10 ? 0 : ''}${minute}`
}

const formTitle = computed(() => (props.item?.id !== undefined ? t('EditNotificationRule') : t('NewNotificationRule')))

const dialog = computed({
  get: () => props.dialog,
  set: val => {
    if (!val) close(false)
  }
})

watch(dialog, val => {
  if (val) {
    if (props.item) {
      const obj = {
        ...props.item!,
        period: {
          startTime: timeFromIsoString(props.item.startTime),
          endTime: timeFromIsoString(props.item.endTime)
        }
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    } else {
      const obj = {
        ...(JSON.parse(JSON.stringify(defaultItem)) as Blackout),
        period: {
          startTime: timeFromIsoString(editedStartDate.value),
          endTime: timeFromIsoString(editedEndDate.value)
        }
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})

const times = computed(() =>
  Array.from(
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
  )
)

const allowedCustomers = computed(() => store.getters['customers/customers'])
const allowedEnvironments = computed(() => store.getters['alerts/environments']())
const currentServices = computed(() => store.getters['alerts/services'])
const currentGroups = computed(() => store.getters['alerts/groups'])
const currentTags = computed(() => store.getters['alerts/tags'])

const getData = () => {
  store.dispatch('alerts/getEnvironments')
  store.dispatch('alerts/getServices')
  store.dispatch('alerts/getGroups')
  store.dispatch('alerts/getTags')
}
getData()

async function save() {
  if (editedItem.value.id) {
    await store.dispatch('blackouts/updateBlackout', [
      editedItem.value.id,
      {
        customer: editedItem.value.customer,
        environment: editedItem.value.environment,
        service: editedItem.value.service,
        resource: editedItem.value.resource,
        event: editedItem.value.event,
        group: editedItem.value.group,
        tags: editedItem.value.tags,
        origin: editedItem.value.origin,
        startTime: toISODate(editedStartDate.value, editedItem.value.period.startTime),
        endTime: toISODate(editedEndDate.value, editedItem.value.period.endTime),
        text: editedItem.value.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s')
      }
    ])
  } else {
    await store.dispatch(
      'blackouts/createBlackout',
      Object.assign(editedItem.value, {
        id: null,
        startTime: toISODate(editedStartDate.value, editedItem.value.period.startTime),
        endTime: toISODate(editedEndDate.value, editedItem.value.period.endTime),
        text: editedItem.value.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s')
      })
    )
  }
  close(true)
}

function toISODate(date: string, time: string) {
  const newDate = new Date(date)
  const [hours, minutes] = time.split(':')
  newDate.setHours(Number(hours))
  newDate.setMinutes(Number(minutes))
  return newDate.toISOString()
}

function compareDict(a: any, b: any) {
  if (a === null) return true
  for (const key in a) {
    if (b[key] === undefined) return false
    if (a[key] !== null && typeof a[key] === typeof {}) {
      if (b[key] === null || a[key].length !== b[key].length || !compareDict(a[key], b[key])) return false
    } else if (a[key] !== b[key]) return false
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
