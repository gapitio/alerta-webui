<template>
  <v-col
    cols="12"
  >
    {{ t('TriggerInfo') }}
  </v-col>
  <v-col 
    cols="12"
    style="position: relative; left: 20px;"
  >
    <li>{{ t('TriggerFromSeverity') }}</li>
    <li>{{ t('TriggerToSeverity') }}</li>
    <li v-if="status">
      {{ t('TriggerStatus') }}
    </li>
    <li v-if="status">
      {{ t('TriggerText') }}
    </li>
  </v-col>
  <v-col
    cols="12" 
    align="center"
  >
    {{ t('Alert') }} {{ t('Severity') }}:
    <v-chip
      label
      size="small"
      class="chip normal"
    >
      Normal
    </v-chip>
    &nbsp;&rarr;&nbsp;
    <v-chip
      label
      size="small"
      class="chip critical"
      align="center"
    >
      Critical
    </v-chip>
  </v-col>
  <v-col
    cols="12"
  > 
    <v-row
      v-for="example, index in examples"
      :key="index"
    >
      <v-col
        cols="1"
        align-self="center"
        style="position: relative; top: 10px;"
      >
        <v-icon 
          :icon="example.check ? 'check': 'close'"
          :class="example.check ? 'text-normal-chip': 'text-critical-chip'"
        />
      </v-col>
      <v-col
        cols="1"
        align-self="center"
        style="position: relative; top: 10px; justify-items: center;"
      >
        <div 
          disabled
          class="bg-surface-tertiary border-secondary text-disabled"
          variant="outlined"
          style="width: 36px;height: 36px; align-content: center; text-align: center; border: 1px solid; border-radius: 4.1px;"
        >
          {{ index }}
        </div>
      </v-col>
      <v-col cols="5">
        <g-combobox
          v-model="example.previuos"
          show-header
          multiple
          disabled
          placeholder=""
          :label="t('PreviousSeverity')"
        />
      </v-col>
      <v-col cols="5">
        <g-combobox
          v-model="example.current"
          show-header
          placeholder=""
          multiple
          disabled
          :label="t('CurrentSeverity')"
        />    
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

defineProps<{status?: boolean}>()

const examples = ref([
  {previuos: ['minor'], current: [], status: null, check: false},
  {previuos: [], current: ['critical'], status: null, check: true},
  {previuos: ['normal'], current: ['critical', 'major'], status: null, check: true},
  {previuos: ['normal'], current: ['major'], status: null, check: false},
  {previuos: ['minor'], current: ['critical'], status: null, check: false},
])

</script>