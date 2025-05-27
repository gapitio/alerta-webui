<template>
  <div>
    <span v-if="showHeader">{{ label }}</span>
    <v-text-field
      :label="label"
      :prepend-inner-icon="prependInnerIcon"
      solo
      :hide-details="!showDetails"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :hint="hint"
      class="g-text-field"
      :value="value"
      @input="$emit('input', $event)"
      @click:prepend-inner="$emit('prepend-inner')"
    />
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    persistentHint: {
      type: Boolean,
      default: true,
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
    prependInnerIcon:{
      type: String,
      default: undefined
    },
    label: {
      type: String,
      required: true,
    },
    hint: {
      type: String,
      default: undefined
    }
  },
  data: vm => ({
    show: false
  })
}
</script>
