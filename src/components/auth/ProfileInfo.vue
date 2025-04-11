<template>
  <v-list-item>
    <v-list-item-title>{{ title }}</v-list-item-title>
    <v-list-item-subtitle>
      <span
        v-for="(item, index) in items"
        :key="index"
      >
        <v-chip
          v-if="index < length"
          :variant="variant"
          size="small"
        >
          {{ item }}
        </v-chip>
        <v-tooltip 
          v-if="index === length"
          :text="items.slice(length).toString()"
        >
          <template #activator="{ props }">
            <span
              v-bind="props" 
              style="white-space:nowrap;"
            >
              (+{{ items.length - length }} {{ $t('others') }})
            </span>
          </template>
        </v-tooltip>
        
      </span>
    </v-list-item-subtitle>
  </v-list-item>
</template>


<script lang="ts">
  export default {
  
  props: {
    items: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    length: {
      type: Number,
      default: 3,
    },
    variant: {
      type: String,
      default: 'flat',
    }
  },
}
</script>