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
            <v-col cols="12" align-self="center" class="pt-8">
              <g-switch v-model="editedItem.active" :label="t('Active')" />
            </v-col>
            <v-col cols="6">
              <g-text-field v-model.trim="editedItem.timeObj.time" show-header :label="t('Time')" />
            </v-col>
            <v-col cols="6">
              <g-select v-model="editedItem.timeObj.interval" show-header :items="intervals" :label="t('Interval')" />
            </v-col>
            <v-col cols="12">
              <g-select v-model="editedItem.days" show-header :items="days" :label="t('Days')" chips multiple />
            </v-col>
            <v-col cols="6">
              <g-combobox v-model="editedItem.period.startTime" show-header :items="times" :label="t('StartTime')" />
            </v-col>
            <v-col cols="6">
              <g-combobox v-model="editedItem.period.endTime" show-header :items="times" :label="t('EndTime')" />
            </v-col>

            <v-col cols="12">
              <group-edit v-model="editedItem.triggers" :items="triggerItems" :header="t('Triggers')" />
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
              <group-edit v-model="editedItem.tags" :items="tagItems" :header="t('AlertTags')" />
            </v-col>

            <v-col cols="12">
              <group-edit v-model="editedItem.excludedTags" :items="tagItems" :header="t('AlertExcludedTags')" />
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
import {useFilters} from '@/filters'
import type {EscalationRule} from '@/plugins/store/types/escalationRule-types'

const store: Store = useStore()
const {t} = useI18n()
const filters = useFilters()
const rules = {
  required: (v: string) => !!v || t('TextIsRequired')
}

const props = defineProps<{
  item: EscalationRule | undefined
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const defaultItem: EscalationRule = {
  active: true,
  customer: null,
  environment: '',
  service: [],
  resource: null,
  event: null,
  group: null,
  startTime: '',
  endTime: '',
  time: '',
  days: [],
  triggers: [{from_severity: [], to_severity: []}],
  tags: [{all: [], any: []}],
  excludedTags: [{all: [], any: []}]
}

const form = ref<VForm | null>(null)
const days = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
const intervals = ref(['second', 'minute', 'hour', 'days'])
const editedItem: Ref<
  EscalationRule & {
    timeObj: {
      time: string | null
      interval: string | null
    }
    period: {
      startTime: string
      endTime: string
    }
  }
> = ref({
  ...defaultItem,
  timeObj: {time: null, interval: null},
  period: {startTime: '', endTime: ''}
})

const valueStart: Ref<
  EscalationRule & {
    timeObj: {
      time: string | null
      interval: string | null
    }
    period: {
      startTime: string
      endTime: string
    }
  }
> = ref({
  ...defaultItem,
  timeObj: {time: null, interval: null},
  period: {startTime: '', endTime: ''}
})

const formTitle = computed(() => (props.item?.id !== undefined ? t('EscalationRule') : t('EscalationRule')))

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
        timeObj: {time: props.item.time, interval: 'second'},
        period: {
          startTime: props.item.startTime ? filters.hhmmUtcToLocal(props.item.startTime) : '',
          endTime: props.item.endTime ? filters.hhmmUtcToLocal(props.item.endTime) : ''
        }
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    } else {
      const obj = {
        ...(JSON.parse(JSON.stringify(defaultItem)) as EscalationRule),
        timeObj: {time: null, interval: null},
        period: {startTime: '', endTime: ''}
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
const currentTags = computed(() => store.getters['alerts/tags'])
const currentGroups = computed(() => store.getters['alerts/groups'])
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
  if (editedItem.value.period.startTime !== '' && editedItem.value.period.endTime !== '') {
    sTimeStr = filters.hhmmLocalToUtc(editedItem.value.period.startTime)
    eTimeStr = filters.hhmmLocalToUtc(editedItem.value.period.endTime)
  }
  if (editedItem.value.id) {
    await store.dispatch('escalationRules/updateEscalationRule', [
      editedItem.value.id,
      {
        active: editedItem.value.active,
        customer: editedItem.value.customer,
        environment: editedItem.value.environment,
        service: editedItem.value.service,
        resource: editedItem.value.resource,
        event: editedItem.value.event,
        group: editedItem.value.group,
        tags: editedItem.value.tags,
        excludedTags: editedItem.value.excludedTags,
        time: editedItem.value.timeObj.time
          ? `${editedItem.value.timeObj.time} ${editedItem.value.timeObj.interval}`
          : null,
        startTime: sTimeStr,
        endTime: eTimeStr,
        days: editedItem.value.days,
        triggers: editedItem.value.triggers
      }
    ])
  } else {
    await store.dispatch(
      'escalationRules/createEscalationRule',
      Object.assign(editedItem.value, {
        id: null,
        startTime: sTimeStr,
        endTime: eTimeStr,
        time: editedItem.value.timeObj.time
          ? `${editedItem.value.timeObj.time} ${editedItem.value.timeObj.interval}`
          : null,
        triggers: editedItem.value.triggers
      })
    )
  }
  close(true)
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
