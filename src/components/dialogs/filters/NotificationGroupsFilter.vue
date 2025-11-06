<template>
  <v-btn
    prepend-icon="filter_list"
    :text="t('Filter')"
    variant="outlined"
    class="no-cap-btn btn"

    @click.stop="dialog = true"
  />
  <v-dialog
    v-model="dialog"
    scrollable
    max-width="540px"
  >
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-title>
          <v-row>
            <v-col
              cols="8"
            >
              <span class="header">
                {{ t('Filters') }}
              </span>
            </v-col>
            <v-col
              cols="4"
              align="end"
            >
              <v-btn
                variant="outlined"
                class="no-cap-btn btn"
                width="247"
                @click.stop="reset"
              >
                {{ t('Reset') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-text style="overflow-x: hidden;">
          <v-row>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.name"
                show-header
                :label="t('Name')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-select
                v-model="editedItem.usersEmails"
                show-header
                :items="emails"
                item-title="name"
                item-value="id"
                :label="t('Users')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.phoneNumbers"
                show-header
                :label="t('PhoneNumbers')"
                clearable
                multiple
              />
            </v-col>
            <v-col
              cols="12"
            >
              <g-combobox
                v-model="editedItem.mails"
                show-header
                :label="t('Emails')"
                clearable
                multiple
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="4">
            <v-btn
              variant="outlined"
              width="247"
              class="no-cap-btn btn"
              @click="dialog=false"
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
              @click="() => validate(true)"
            >
              {{ t('OK') }}
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              color="primary-600"
              variant="flat"
              class="no-cap-btn"
              width="247"
              @click="() => validate()"
            >
              {{ t('Apply') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { Store } from '@/plugins/store/types';
import type { Filter } from '@/plugins/store/types/notificationGroup-types';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { VForm } from 'vuetify/components';
import { useStore } from 'vuex';


const store: Store = useStore()
const { t } = useI18n()

const dialog = ref(false)
const form = ref<VForm | null>(null)

const emails = computed(() => store.state.users.emails)
const filter = computed({
  get: () => store.state.notificationGroups.filter,
  set: (val) => store.dispatch('notificationGroups/setFilter', val)
})
const editedItem= ref<Filter>({})

watch(dialog, () => {
  editedItem.value = {
    ...JSON.parse(JSON.stringify(filter.value)),
  }
})

function reset() {
  editedItem.value = JSON.parse(JSON.stringify({}))
}

const getNotificationGroups = () => store.dispatch('notificationGroups/getNotificationGroups')
const getEmails = () => store.dispatch('users/getEmails')
getEmails()

async function validate(close?: boolean) {
  const validation = await form.value?.validate()
  if (validation?.valid) {
    form.value?.resetValidation()
    apply()
    getNotificationGroups()
    if (close) dialog.value = false
  }
}

function apply () {
  const item = editedItem.value
  filter.value = {
    ...item
  }
}

</script>