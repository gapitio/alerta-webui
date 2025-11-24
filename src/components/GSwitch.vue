<template>
  <v-row no-gutters>
    <v-col v-if="label !== ''" cols="auto" class="label pr-2">
      {{ label }}
    </v-col>
    <v-col>
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
