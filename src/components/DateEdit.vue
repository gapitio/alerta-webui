<template>
  <span
    v-if="showHeader" 
    class="secondary-text"
  >{{ label }}</span>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
        v-model="editedDate"
        variant="outlined"
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
import { computed, ref, watch } from 'vue';

const value = defineModel<string>()

defineProps<{disabled?: boolean, placeholder?: string, label: string, showHeader?: boolean}>()

const editDate = ref<string | null>(null)
const menu = ref(false)
const editedDate = computed(() => {
  if (editDate.value === null) return ''
  const date = new Date(editDate.value)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
})

watch(editedDate, (val) => value.value = val)
</script>