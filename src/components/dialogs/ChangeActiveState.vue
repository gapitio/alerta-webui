<template>
  <v-dialog v-model="dialog" max-width="574px">
    <v-form>
      <v-card class="dialog-card">
        <v-card-title>
          {{ editedItem.active ? 'Activate' : 'Deactivate' }} {{ editedItem.name ? editedItem.name : editedItem.id }}
        </v-card-title>

        <v-card-text>
          <v-row wrap>
            <v-col cols="12">
              <g-switch v-model="editedItem.active" :label="t('Active')" />
            </v-col>
            <template v-if="!hideTime">
              <v-col cols="6">
                <date-edit
                  v-model="editedDate"
                  show-header
                  :label="t('ReactivateDate')"
                  :disabled="editedItem.active"
                />
              </v-col>

              <v-col cols="6">
                <g-combobox
                  v-model="editedItem.reactivateTime"
                  :disabled="editedItem.active"
                  show-header
                  variant="outlined"
                  :label="t('Time')"
                  :items="times"
                />
              </v-col>
            </template>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="6">
            <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="close(false)">
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="6">
            <v-btn color="primary-600" variant="flat" class="no-cap-btn" width="247" @click="changeState(editedItem)">
              {{ t('Save') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {computed, ref, watch, type Ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()

interface Item {
  active: boolean
  id: string
  [key: string]: any
}

const updates: {[key: string]: 'notificationRules/updateNotificationRule' | 'escalationRules/updateEscalationRule'} = {
  nr: 'notificationRules/updateNotificationRule',
  er: 'escalationRules/updateEscalationRule'
}

const props = defineProps<{
  item: Item
  dialog: boolean
  hideTime?: boolean
  update: keyof typeof updates
}>()

const emit = defineEmits(['close'])

const editedItem: Ref<Item & {reactivateDate: string | null; reactivateTime: string | null}> = ref({
  ...props.item,
  reactivateDate: null,
  reactivateTime: null
})
const dialog = computed({
  get: () => props.dialog,
  set: val => {
    if (!val) close(false)
  }
})

watch(dialog, val => {
  if (val) {
    editedItem.value = {
      ...props.item,
      active: props.item.active,
      reactivateDate: null,
      reactivateTime: null
    }
  }
})

const times = computed(() =>
  Array.from(
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
  )
)

const editedDate = ref('')

function toISODate(date: string, time: string) {
  return new Date(date + ' ' + time).toISOString()
}

function close(saved: boolean) {
  if (!saved) {
    // FIXME: force reload of component
    store.dispatch(updates[props.update], [props.item.id!, {priority: props.item.priority}])
  }
  emit('close')
}

function changeState(item: Item) {
  store.dispatch(updates[props.update], [
    item.id,
    {
      active: item.active,
      reactivate:
        editedDate.value != '' && editedItem.value.reactivateTime && !item.active
          ? toISODate(editedDate.value, editedItem.value.reactivateTime)
          : null
    }
  ])
  close(false)
}
</script>
