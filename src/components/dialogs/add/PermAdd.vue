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
                v-model="editedItem.match"
                show-details
                show-header
                :rules="[rules.required]"
                required
                :label="t('Role')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-combobox
                v-model="editedItem.scopes"
                show-header
                multiple
                :items="scopes"
                :label="t('Scopes')"
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
import type { Permission } from '@/plugins/store/types/perms-types'

const store: Store = useStore()
const { t } = useI18n()
const rules = {
  required: (v: string) => !!v || t('Required'),
}

const props = defineProps<{
  item: Permission | undefined
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const defaultItem: Permission = {
  match: '',
  scopes: [],
}


const form = ref<VForm | null>(null)
const editedItem = ref<Permission>({
  ...defaultItem,
})

const valueStart = ref<Permission>({
  ...defaultItem
})

const formTitle = computed(() => props.item?.id !== undefined ? t('EditPermission') : t('NewPermission'))
const scopes = computed(() => store.state.perms.scopes)
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
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
      
    }
    else {
      const obj = {
        ...JSON.parse(JSON.stringify(defaultItem)) as Permission,
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})


async function save() {
  if (editedItem.value.id) {
      await store.dispatch('perms/updatePerm', [
      editedItem.value.id,
      {
        ...editedItem.value,
        id: undefined
      }
    ])
  } else {
    await store.dispatch(
      'perms/createPerm',
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

function getRoles() {
  store.dispatch('perms/getPerms')
}
</script>
