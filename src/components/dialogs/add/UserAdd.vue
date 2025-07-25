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
            sm6
            md9
          >
            <span class="header">
              {{ formTitle }}
            </span>
          </v-col>
        </v-card-title>

        <v-card-text style="overflow-x: hidden;">
          <v-row>
            <v-col 
              cols="9"
              class="pb-0"
            >
              <g-text-field
                v-model.trim="editedItem.name"
                show-details
                show-header
                :rules="[rules.required]"
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
                v-model="editedItem.status"
                true-value="active"
                false-value="inactive"
                :label="t('Active')"
              />
            </v-col>
            <v-col 
              cols="12"
              class="pb-0"
            >
              <g-text-field
                v-model.trim="editedItem.login"
                show-details
                show-header
                :rules="[rules.required]"
                required
                :label="t('Login')"
              />
            </v-col>
            
            <v-col 
              cols="9"
              class="pb-0"
            >
              <g-text-field
                v-model.trim="editedItem.email"
                show-details
                show-header
                :rules="[rules.required]"
                required
                :label="t('Email')"
              />
            </v-col>
            <v-col
              cols="3" 
              align-self="center"
              class="pt-8"
            >
              <g-checkbox
                v-model="editedItem.email_verified"
                :label="t('Verified')"
              />
            </v-col>
            <v-col cols="6">
              <g-select
                v-model.trim="editedItem.country"
                clearable
                show-header
                :items="countryCodes"
                :label="t('CountryCode')"
              />
            </v-col>
            <v-col cols="6">
              <g-text-field
                v-model.trim="editedItem.phoneNumber"
                show-header
                :label="t('PhoneNumber')"
              />
            </v-col>
            
            <v-col 
              cols="6"
              class="pb-0"
            >
              <g-text-field
                v-model="editedItem.password"
                show-details
                show-header
                :rules="[rules.passwordLength]"
                type="password"
                :label="t('Password')"
              />
            </v-col>
            
            <v-col 
              cols="6"
              class="pb-0"
            >
              <g-text-field
                v-model.trim="editedItem.confirmPassword"
                show-header
                show-details
                :rules="[rules.passwordMatch]"
                type="password"
                :label="t('ConfirmPassword')"
              />
            </v-col>

            <v-col cols="12">
              <g-combobox
                v-model="editedItem.roles"
                multiple
                show-header
                :items="roles"
                :label="t('Roles')"
              />
            </v-col>
            
            
            <v-col cols="12">
              <g-text-field
                v-model.trim="editedItem.text"
                show-header
                :label="t('Comment')"
                :placeholder="t('AddComment')"
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
import type { User } from '@/plugins/store/types/users-types'

const store: Store = useStore()
const { t } = useI18n()
const rules = {
  required: (v: string) => !!v || t('Required'),
  passwordMatch: (v: string) => !editedItem.value.password || v === editedItem.value.password || t('PasswordNotMatch'),
  passwordLength: (v: string) => !v || v.length > 5 || t('Min6Char'),
}

const props = defineProps<{
  item: User | undefined
  dialog: boolean
}>()

const emit = defineEmits(['close'])

const defaultItem: User = {
  status: 'active',
  name: null,
  country: null,
  phoneNumber: null,
  email: '',
  email_verified: false,
  login: '',
  roles: [],
  text: null
}


const form = ref<VForm | null>(null)
const editedItem = ref<User & {confirmPassword?: string | null}>({
  ...defaultItem,
})

const valueStart = ref<User>({
  ...defaultItem,
})

const formTitle = computed(() => props.item?.id !== undefined ? t('EditUser') : t('NewUser'))

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
        ...JSON.parse(JSON.stringify(defaultItem)) as User,
      }
      editedItem.value = obj
      valueStart.value = JSON.parse(JSON.stringify(obj))
    }
  }
})


const roles = computed(() => store.getters['perms/roles'])
const countryCodes = computed(() => store.getters['users/countryCodes'])

async function save() {
  if (editedItem.value.id) {
      await store.dispatch('users/updateUser', [
      editedItem.value.id,
      {
        status: editedItem.value.status,
        name: editedItem.value.name,
        country: editedItem.value.country,
        phoneNumber: editedItem.value.phoneNumber,
        email: editedItem.value.email,
        email_verified: editedItem.value.email_verified,
        roles: editedItem.value.roles,
        text: editedItem.value.text,
        password: editedItem.value.password,
      }
    ])
  } else {
    await store.dispatch(
      'users/createUser',
      Object.assign(editedItem.value, {
        id: null,
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
</script>
