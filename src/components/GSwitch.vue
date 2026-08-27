<template>
  <v-row>
    <v-col v-if="label !== '' && label !== undefined" cols="auto" class="label">
      {{ label }}
    </v-col>
    <v-col cols="auto" class="pt-0 pb-0">
      <v-switch
        v-model="model"
        density="compact"
        hide-details
        :true-value="trueValue"
        :false-value="falseValue"
        color="primary-600"
        inset
        :disabled="disabled"
        flat
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
const model = defineModel<boolean | string>()

defineProps<{
  label?: string
  class?: string
  trueValue?: any
  falseValue?: any
  disabled?: boolean
}>()
</script>
