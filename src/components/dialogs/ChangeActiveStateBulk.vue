<template>
  <v-dialog
    v-model="dialog"
    max-width="540px"
  >
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-col
            cols="12"
          >
            <span class="headline">
              {{ activate ? t('Activate') : t('Deactivate') }} {{ types[type].title }}
            </span>
          </v-col>
        </v-card-title>

        <v-card-text>
          <v-row v-if="!hideTime && !activate">
            <v-col
              cols="6"
            >
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
              >
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="editedDate"
                    variant="outlined"
                    :placeholder="t('ReactivateDate')"
                  />
                </template>
                
                <v-date-picker
                  v-model="item.date"
                  hide-header
                  @update:model-value="menu = false"
                />
              </v-menu>
            </v-col>

            <v-col
              cols="6"
            >
              <v-combobox
                v-model="item.time"
                variant="outlined"
                placeholder="time"
                :items="times"
              />
            </v-col>
          </v-row>
          <span> {{ types[type].title }} {{ t('Deactivated') }}: </span>
          <ul>
            <li
              v-for="object in selected"
              :key="object.id"
            >
              {{ object.name ?? object.id }}
            </li>
          </ul>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="6">
            <v-btn
              variant="outlined"
              class="no-cap-btn btn"
              width="247"
              @click="emit('close')"
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
              @click="changeBulkState()"
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
import type { Actions, Store } from '@/plugins/store/types'
import { computed, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { t } = useI18n()
const store: Store = useStore()

interface Type {
  value: keyof Actions
  title: string
  store: any
}

const types: {nr: Type, er: Type} = {
  nr: {value: 'notificationRules/updateNotificationRule', title: t('NotificationRules'), store: store.state.notificationRules},
  er: {value: 'escalationRules/updateEscalationRule', title: t('EscalationRules'), store: store.state.escalationRules}
}

const compProps = defineProps<{activate: boolean, dialog: boolean, type: keyof typeof types, hideTime?: boolean}>()
const emit = defineEmits(['close'])
const selected = computed(() => types[compProps.type].store.items.filter(({id}: {id: string}) => types[compProps.type].store.selected.includes(id)))


const dialog = computed({
  get: () => compProps.dialog,
  set: (val) => {if(!val) emit('close')}
})

watch(dialog, (val) => {
  if (val) {
    item.value = {
      date: null,
      time: null
    }
  }
})

const menu = ref(false)

interface bulkItem {
  date: string | null,
  time: string | null,
}

const item: Ref<bulkItem> = ref({
  date: null,
  time: null,
})

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

const editedDate = computed(() => {
  if (item.value.date === null) return ''
  const date = new Date(item.value.date)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
})

function toISODate(date: string, time: string) {
  return new Date(date + ' ' + time).toISOString()
}

function changeBulkState() {
  selected.value.map(({id}: {id: string, [key: string]: any}) => {
    store
      .dispatch(types[compProps.type].value, [
        id,
        {
          active: compProps.activate,
          reactivate: item.value.date && item.value.time && !compProps.activate ? toISODate(
          editedDate.value,
          item.value.time
          ) : null
        }
      ])
  })
  emit('close')
}
</script>