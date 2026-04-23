<template>
  <v-btn v-if="!item" variant="outlined" width="247" class="no-cap-btn btn" @click="dialog = true">
    {{ t('AddTab') }}
  </v-btn>
  <v-btn v-else icon="edit" variant="text" size="x-small" @click="dialog = true" />
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
            <v-col cols="12" class="pb-0">
              <g-text-field
                v-model.trim="editedItem.name"
                show-details
                show-header
                :rules="[rules.required, rules.uniqueName]"
                required
                :label="t('Name')"
              />
            </v-col>
            <v-col cols="12" class="header">
              {{ t('Filter') }}
            </v-col>
            <alerts-filter-fields v-model="editedFilter" />
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
import {computed, ref, watch} from 'vue'
import {useStore} from 'vuex'
import {useI18n} from 'vue-i18n'
import type {Store} from '@/plugins/store/types'
import type {VForm} from 'vuetify/components'
import type {FilterTab} from '@/plugins/store/types/filterTabs-types'
import type {Filter} from '@/plugins/store/types/alerts-types'
import moment from 'moment'

const store: Store = useStore()
const {t} = useI18n()

const props = defineProps<{
  item?: FilterTab
  names: string[]
}>()

const rules = {
  required: (v: string) => !!v || t('Required'),
  uniqueName: (v: string) => !props.names.includes(v) || v + t('AlreadyExists')
}
const dialog = ref(false)

const emit = defineEmits(['save'])
const newIndex = computed(() => store.state.filterTabs.items.length + 1)

const defaultItem: FilterTab = {
  name: '',
  index: newIndex.value,
  filter: {dateRange: {}}
}

const form = ref<VForm | null>(null)
const editedItem = ref<FilterTab & {confirmPassword?: string | null}>({
  ...(JSON.parse(JSON.stringify(defaultItem)) as FilterTab)
})

function toEpoch(date: string, time: string) {
  return new Date(date + ' ' + time).getTime() / 1000
}

const period = ref({
  startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
  startTime: moment().format('HH:mm'),
  endDate: moment().format('YYYY-MM-DD'),
  endTime: moment().format('HH:mm')
})

const editedFilter = computed({
  get: () => ({
    filter: editedItem.value.filter,
    period: period.value
  }),
  set: val => {
    editedItem.value.filter = val.filter
    period.value = val.period
  }
})

const valueStart = ref<FilterTab>({
  ...(JSON.parse(JSON.stringify(defaultItem)) as FilterTab)
})

const formTitle = computed(() => (props.item?.name !== undefined ? t('EditFilterTab') : t('NewFilterTab')))

watch(dialog, val => {
  if (val) {
    getRoles()
    if (props.item) {
      const obj = {
        ...props.item!
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    } else {
      const obj = {
        ...(JSON.parse(JSON.stringify(defaultItem)) as FilterTab),
        index: newIndex.value,
        filter: {...(JSON.parse(JSON.stringify(store.state.alerts.filter)) as Filter)}
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})

async function save() {
  const tab = editedItem.value
  const filter = tab.filter
  emit('save', {
    ...tab,
    filter: {
      ...filter,
      dateRange: {
        ...filter.dateRange,
        from: !filter.dateRange.select
          ? filter.dateRange.from
          : toEpoch(period.value.startDate!, period.value.startTime!),
        to: !filter.dateRange.select ? filter.dateRange.to : toEpoch(period.value.endDate!, period.value.endTime!)
      }
    }
  })
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
    dialog.value = false
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
</script>
