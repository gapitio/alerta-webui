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
              <g-combobox
                v-model="editedItem.usersEmails"
                :ruels="[rules.length]"
                show-header
                multiple
                item-value="email"
                item-title="name"
                :items="emails"
                :label="t('Users')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.groupIds"
                show-header
                multiple
                item-value="id"
                item-title="name"
                :items="groups"
                :label="t('Groups')"
              />
            </v-col>
            
            <v-col 
              cols="6"
              class="pb-0"
            >
              <date-edit
                v-model="editedItem.startDate"
                show-header
                :label="t('StartDate')"
              />
            </v-col>
            <v-col 
              cols="6"
              class="pb-0"
            >
              <date-edit
                v-model="editedItem.endDate"
                show-header
                :label="t('EndDate')"
              />
            </v-col>
            
            <v-col 
              cols="6"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.period.start"
                show-header
                :items="times"
                :label="t('StartTime')"
              />
            </v-col>
            <v-col 
              cols="6"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.period.end"
                show-header
                item-value="value"
                :items="times"
                :label="t('EndTime')"
              />
            </v-col>
            
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-select
                v-model="editedItem.repeatDays"
                show-header
                multiple
                :items="days"
                :label="t('Days')"
              />
            </v-col>
            
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.repeatWeeks"
                show-header
                multiple
                clearable
                :items="weeks"
                :label="t('Weeks')"
              > 
                <template #prepend-item>
                  <v-list-item 
                    title="OddWeeks" 
                    @click="selectOdd"
                  />
                  <v-list-item 
                    title="EvenWeeks" 
                    @click="selectEven"
                  />
                </template>
              </g-combobox>
            </v-col>
            
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.repeatMonths"
                multiple
                show-header
                :items="months"
                :label="t('EndTime')"
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
import type { OnCall } from '@/plugins/store/types/onCall-types'
import { useFilters } from '@/filters'

const store: Store = useStore()
const { t } = useI18n()
const rules = {
  required: (v: string) => !!v || t('Required'),
  length: (v: string[]) => v.length > 0 || t('Length'),
}
const filters = useFilters()

const props = defineProps<{
  item: OnCall | undefined
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const defaultItem: OnCall = {
  usersEmails: [],
  groupIds: [],
  startTime: null,
  endTime: null,
  startDate: null,
  endDate: null,
  repeatDays: [],
  repeatWeeks: [],
  repeatMonths: [],
}


const form = ref<VForm | null>(null)
const editedItem = ref<OnCall & {period: {start: string | null, end: string | null}}>({
  ...defaultItem,
  period: {start: null, end: null}
})

const valueStart = ref<OnCall & {period: {start: string | null, end: string | null}}>({
  ...defaultItem,
  period: {start: null, end: null}
})
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weeks = [...Array(52).keys()].map(x => x + 1)

const selectOdd = () => editedItem.value.repeatWeeks = Array.from(new Set([...editedItem.value.repeatWeeks, ...weeks.filter((value, index) => index % 2 == 0)]))
const selectEven = () => editedItem.value.repeatWeeks = Array.from(new Set([...editedItem.value.repeatWeeks, ...weeks.filter((value, index) => index % 2 == 1)]))

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const formTitle = computed(() => props.item?.id !== undefined ? t('EditOnCall') : t('NewOnCall'))
const emails = computed(() => store.state.users.emails)
const groups = computed(() => store.state.notificationGroups.items)
const times = computed(() => Array.from(
  {
    length: (24 * 60) / 15 + 1
  },
  (_, i) => {
    if (i == 0) {
      return null
    } else {
      const h = Math.floor(((i - 1) * 15) / 60)
      const m = (i - 1) * 15 - h * 60
      return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2)
    }
  }
))

const dialog = computed({
  get: () => props.dialog,
  set: (val) => {if(!val) close(false)}
})


watch(dialog, (val) => {
  if (val) {
    getRoles()
    if (props.item) {
      const obj = {
        ...props.item!,
        period: {
          start: props.item.startTime ? filters.hhmmUtcToLocal(props.item.startTime) : null,
          end: props.item.endTime ? filters.hhmmUtcToLocal(props.item.endTime) : null,
        }
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
      
    }
    else {
      const obj = {
        ...JSON.parse(JSON.stringify(defaultItem)) as OnCall,
        period: {start: null, end: null}
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})


async function save() {
  const endTime = typeof editedItem.value.period.end == 'string' ? filters.hhmmLocalToUtc(editedItem.value.period.end) : null
  const startTime = typeof editedItem.value.period.start == 'string' ? filters.hhmmLocalToUtc(editedItem.value.period.start) : null
  if (editedItem.value.id) {
      await store.dispatch('onCalls/updateOnCall', [
      editedItem.value.id,
      {
        ...editedItem.value,
        id: undefined,
        endTime: endTime,
        startTime: startTime,
      }
    ])
  } else {
    await store.dispatch(
      'onCalls/createOnCall',
      Object.assign(editedItem.value, {
        id: null,
        endTime: endTime,
        startTime: startTime,
      })
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

function getRoles() {
  store.dispatch('perms/getPerms')
}

const getEmails = () => store.dispatch('users/getEmails')
getEmails()
</script>
