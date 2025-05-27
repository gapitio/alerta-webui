<template>
  <div>
    <span v-if="showHeader">{{ label }}</span>
    <v-select
      :label="label"
      :placeholder="placeholder"
      solo
      :hide-details="!showDetails"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :hint="hint"
      :chips="chips"
      :small-chips="smallChips"
      class="g-text-field"
      :items="items"
      :value="value"
      :item-value="itemValue"
      :multiple="multiple"
      :required="required"
      :rules="rules"
      @input="$emit('input', $event)"
    />
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: [String, Array],
      default: null
    },
    items: {
      type: Array,
      required: true
    },  
    itemValue: {
      type: String,
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
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
  },
  data: vm => ({
    show: false
  })
}
</script>

