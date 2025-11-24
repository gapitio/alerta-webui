<template>
  <v-row>
    <v-col cols="8" class="header">
      {{ header }}
    </v-col>
    <v-col cols="4" align="end">
      <v-btn icon="add" class="text-primary-600 square-btn-icon" @click="() => (model = [...model!, getNewItem()])" />
      <v-btn
        icon="delete_outline"
        style="color: white"
        class="bg-critical-600 square-btn-icon"
        @click="() => (model = [getNewItem()])"
      />
    </v-col>
  </v-row>
  <v-row v-for="(item, index) in model" :key="index" wrap cols="12">
    <v-col cols="10">
      <v-row>
        <v-col v-for="(setup, key) in items" :key="key" cols="6">
          <g-select
            v-if="setup?.type == 'select'"
            v-model="model![index][key]"
            show-header
            :items="setup?.items"
            :label="setup?.label"
            chips
            multiple
          />
          <g-textarea v-else v-model="item.text" show-header :rows="1" :label="setup?.label" />
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="2" align-self="center" class="pt-8">
      <v-btn
        icon="delete_outline"
        style="color: white"
        class="bg-critical-600 square-btn-icon"
        @click="model?.splice(index, 1)"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
interface Item {
  items?: string[]
  label: string
  type: string
}
const model = defineModel<{[key: string]: string | string[]}[]>()
const props = defineProps<{items: {[key: string]: Item}; header: string}>()

function getNewItem() {
  return Object.fromEntries(Object.keys(props.items).map(key => [key, props.items[key].type == 'select' ? [] : '']))
}
</script>
