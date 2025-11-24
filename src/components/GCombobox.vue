<template>
  <div>
    <span v-if="showHeader" class="text-secondary">{{ label }}</span>
    <v-combobox
      v-model="model"
      :placeholder="placeholder ?? label"
      variant="outlined"
      :hide-details="!showDetails"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :hint="hint"
      :chips="chips"
      :disabled="disabled"
      :readonly="readonly"
      :small-chips="smallChips"
      :items="items"
      :item-value="itemValue"
      :item-title="itemTitle"
      :return-object="itemValue === undefined"
      :multiple="multiple"
      :required="required"
      :rules="compProps.rules"
      :append-icon="appendIcon"
      :append-inner-icon="appendInnerIcon"
      :prepend-icon="prependIcon"
      :prepend-inner-icon="prependInnerIcon"
      class="g-input"
      @click:prepend="e => emit('click:prepend', e)"
      @click:prepend-inner="e => emit('click:prepend-inner', e)"
      @click:append="e => emit('click:append', e)"
      @click:append-inner="e => emit('click:append-inner', e)"
      @click:clear="e => emit('click:clear', e)"
    >
      <template v-if="deleteItems" #item="{item, props}">
        <v-list-item v-bind="props" @click.stop="emit('selectItem', item)">
          <template #append>
            <v-icon small class="ml-2" @click.stop="emit('deleteItem', item)"> delete </v-icon>
          </template>
        </v-list-item>
      </template>
      <template #prepend-item>
        <slot name="prepend-item" />
      </template>
    </v-combobox>
  </div>
</template>

<script lang="ts" setup>
const model = defineModel<string | string[]>()
const emit = defineEmits([
  'click:clear',
  'click:prepend',
  'click:prepend-inner',
  'click:append',
  'click:append-inner',
  'selectItem',
  'deleteItem'
])
const compProps = defineProps<{
  items?: any[]
  itemValue?: string
  itemTitle?: string
  multiple?: boolean
  rules?: ((val: string) => boolean)[]
  required?: boolean
  label: string
  placeholder?: string
  chips?: boolean
  smallChips?: boolean
  persistentHint?: boolean
  hint?: string
  showHeader?: boolean
  showDetails?: boolean
  clearable?: boolean
  prependIcon?: string
  prependInnerIcon?: string
  appendIcon?: string
  appendInnerIcon?: string
  deleteItems?: boolean
  disabled?: boolean
  readonly?: boolean
}>()
</script>
