<template>
  <div>
    <span v-if="showHeader" class="text-secondary"
      >{{ label }}
      <slot name="infoDialog" />
    </span>
    <span v-if="required" :class="getColorClass()">*</span>
    <v-textarea
      ref="field"
      v-model="model"
      :placeholder="placeholder ?? label"
      variant="outlined"
      hide-details="auto"
      :disabled="disabled"
      :readonly="readonly"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :hint="hint"
      :rows="rows"
      :chips="chips"
      :type="type"
      :small-chips="smallChips"
      class="g-text-field g-input"
      :item-value="itemValue"
      :multiple="multiple"
      :required="required"
      :rules="props.rules"
      :prepend-inner-icon="prependInnerIcon"
      :append-inner-icon="appendInnerIcon"
      @click:append-inner="() => emits('click:appendInner')"
      @click:clear="emits('click:clear')"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import type {VTextField} from 'vuetify/components'

defineSlots()

const emits = defineEmits(['click:appendInner', 'click:clear'])

const model = defineModel<string>()
const field = ref<null | VTextField>(null)
const getColorClass = () => {
  return field.value?.isValid ? 'text-secondary' : 'critical-text'
}
const props = defineProps<{
  itemValue?: string
  multiple?: boolean
  rules?: ((val: string) => boolean)[]
  required?: boolean
  label: string
  placeholder?: string
  prependInnerIcon?: string
  appendInnerIcon?: string
  chips?: boolean
  smallChips?: boolean
  persistentHint?: boolean
  hint?: string
  showHeader?: boolean
  showDetails?: boolean | 'auto'
  clearable?: boolean
  type?: string
  disabled?: boolean
  rows?: number
  readonly?: boolean
}>()
</script>
