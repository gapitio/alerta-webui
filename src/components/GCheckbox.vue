<template>
  <v-row no-gutters>
    <v-col
      v-if="label ?? '' !== ''"
      cols="auto"
      class="big-font label pr-2"
    >
      {{ label }}
    </v-col>
    <v-col cols="auto">
      <v-checkbox 
        v-model="model"
        hide-details
        density="compact"
        :true-value="trueValue"
        :false-value="falseValue"
        color="primary-600"
        inset
        :disabled="disabled"
        flat
        style="font-variation-settings: 'FILL' 1;"
        @update:model-value="emit('update')"
      />
    </v-col>
    <v-col
      v-if="labelRight ?? '' !== '' "
      cols="auto"
      class="big-font label"
    >
      {{ labelRight }}
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>()

const emit = defineEmits(['update'])

defineProps<{
  label?: string,
  labelRight?: string,
  class?: string,
  trueValue?: any,
  falseValue?: any,
  disabled?: boolean
}>()

</script>