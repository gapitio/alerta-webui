<template>
  <div>
    <span
      v-if="showHeader" 
      class="secondary-text"
    >{{ label }}</span>
    <v-select
      v-model="model"
      :placeholder="label"
      variant="outlined"
      :hide-details="!showDetails"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :hint="hint"
      :chips="chips"
      :small-chips="smallChips"
      :items="items"
      :item-value="itemValue"
      :item-title="itemTitle"
      :multiple="multiple"
      :rules="props.rules"
    />
  </div>
</template>

<script lang="ts" setup>

const model = defineModel<string>()

const props = defineProps({
  items: {
    type: Array,
    required: true
  },  
  itemValue: {
    type: String,
    default: undefined
  },
  itemTitle: {
    type: String,
    default: undefined
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array<(val: string)=>boolean>,
    default: () => []
  }, 
  required: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  chips: {
    type: Boolean,
    default: false,
  },
  smallChips: {
    type: Boolean,
    default: false,
  },
  persistentHint: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: undefined
  },
  showHeader: {
    type: Boolean,
    default: false
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
})

</script>

