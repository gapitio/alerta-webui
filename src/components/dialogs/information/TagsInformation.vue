<template>
  <v-col cols="12">
    {{ t('TagsInfo') }}
  </v-col>
  <v-col cols="12" style="position: relative; left: 20px">
    <li>{{ t('TagsAnd') }}</li>
    <li>{{ t('TagsOr') }}</li>
    <li>{{ t('TagsFunctionAnd') }}</li>
    <li>{{ t('TagsGroupsOr') }}</li>
  </v-col>
  <v-col cols="12" align="center">
    {{ t('Alert') }} {{ t('Tags') }}:
    <v-chip label size="small" class="chip"> h, f, t </v-chip>
  </v-col>
  <v-col cols="12">
    <v-row v-for="(example, index) in examples" :key="index">
      <v-col cols="1" align-self="center" style="position: relative; top: 10px">
        <v-icon
          :icon="example.check ? 'check' : 'close'"
          :class="example.check ? 'text-normal-chip' : 'text-critical-chip'"
        />
      </v-col>
      <v-col cols="1" align-self="center" style="position: relative; top: 10px; justify-items: center">
        <div
          disabled
          class="bg-surface-tertiary border-secondary text-disabled"
          variant="outlined"
          style="
            width: 36px;
            height: 36px;
            align-content: center;
            text-align: center;
            border: 1px solid;
            border-radius: 4.1px;
          "
        >
          {{ index }}
        </div>
      </v-col>
      <v-col cols="5">
        <g-combobox v-model="example.and" show-header multiple disabled placeholder="" :label="t('AND')" />
      </v-col>
      <v-col cols="5">
        <g-combobox v-model="example.or" show-header placeholder="" multiple disabled :label="t('OR')" />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const examples = ref([
  {and: ['a,b'], or: ['d', 'e'], check: false},
  {and: ['h'], or: ['f', 'g', 'i', 'j', 'k', 't', 's', 'r'], check: true},
  {and: ['h', 'y'], or: ['f', 'p', 'q'], check: false},
  {and: ['h', 'f'], or: [], check: true},
  {and: [], or: ['h', 'a', 'b'], check: true}
])
</script>
