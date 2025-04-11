<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <g-text-field
        v-model="editedDate"
        v-bind="props"
        :label="label"
        :show-header="showHeader"
        prepend-inner-icon="calendar_month"
        :disabled="disabled"
        :placeholder="placeholder ?? label"
      />
    </template>
    
    <v-date-picker
      v-model="editDate"
      hide-header
      @update:model-value="menu = false"
    />
  </v-menu>
</template>

<script lang="ts" setup>
import moment from 'moment';
import { computed, ref, watch } from 'vue';

const value = defineModel<string>()

const componentProps = defineProps<{disabled?: boolean, placeholder?: string, label: string, showHeader?: boolean, newDate?: boolean}>()

const editDate = ref<string | null>(value.value == '' ? null : value.value ?? null)
const menu = ref(false)
const editedDate = computed(() => {
  if (editDate.value === null && !componentProps.newDate) return ''
  return moment(editDate.value).format('YYYY-MM-DD')
})

watch(editedDate, (val) => value.value = val)
</script>