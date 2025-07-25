<template>
  <div>
    <span
      v-if="showHeader" 
      class="secondary-text"
    >{{ label }}</span>
    <v-text-field
      v-model="model"
      :placeholder="placeholder ?? label"
      variant="outlined"
      :hide-details="!showDetails"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :hint="hint"
      :chips="chips"
      :type="type"
      :small-chips="smallChips"
      class="g-text-field"
      :item-value="itemValue"
      :multiple="multiple"
      :required="required"
      :rules="props.rules"
    />
  </div>
</template>

<script lang="ts" setup>

const model = defineModel<string>()

const props = defineProps<{
  itemValue?: string;
  multiple?: boolean;
  rules?: ((val: string)=> boolean)[];
  required?: boolean;
  label: string;
  placeholder?: string;
  chips?: boolean;
  smallChips?: boolean;
  persistentHint?: boolean;
  hint?: string;
  showHeader?: boolean;
  showDetails?: boolean | 'auto';
  clearable?: boolean;
  type?: string;
}>()

</script>

