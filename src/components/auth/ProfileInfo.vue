<template>
  <v-list-item>
    <v-list-item-title>{{ title }}</v-list-item-title>
    <span v-for="(item, index) in items" :key="index">
      <v-chip v-if="showAll || index < length" label size="small" class="chip" variant="flat">
        <div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 270px">{{ item }}</div>
      </v-chip>
      <v-tooltip v-if="!showAll && index === length" :text="items.slice(length).toString()">
        <template #activator="{props}">
          <span v-bind="props" style="white-space: nowrap; cursor: pointer" @click="() => (showAll = true)">
            (+{{ items.length - length }} {{ t('others') }})
          </span>
        </template>
      </v-tooltip>
    </span>
  </v-list-item>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {ref} from 'vue'

const {t} = useI18n()

const showAll = ref(false)

defineProps({
  items: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    default: 3
  }
})
</script>
