<template>
  <v-dialog v-model="show" scrollable max-width="574px">
    <v-card class="dialog-card">
      <v-card-title>
        <span class="headline">
          {{ t('NotificationText') }}
        </span>
      </v-card-title>
      <v-card-text>
        <v-row style="margin-bottom: 40px" no-gutters>
          <v-col cols="12">
            {{ t('TextExplained') }}
          </v-col>
          <v-col cols="12" style="position: relative; left: 20px">
            <li>{{ t('TextTrigger') }}{default}</li>
            <li>{{ t('TextNotificationRule') }}{default}</li>
            <li>{{ t('TextBothEmpty', {environment: '{environment}'}) }}</li>
          </v-col>
        </v-row>
        <v-row style="margin-bottom: 40px" no-gutters>
          <v-col cols="12">
            {{ t('TextFields') }}
          </v-col>
          <v-col cols="12" style="position: relative; left: 20px">
            <li>{{ t('TextFieldObject') }}</li>
            <li>{{ t('TextFieldFullObject') }}</li>
            <li>{{ t('TextFieldArray') }}</li>
            <li>{{ t('TextFieldFullArray') }}</li>
          </v-col>
        </v-row>
        <v-card style="margin-bottom: 40px">
          <v-card-title>{{ t('AlertDetail') }}</v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <template v-for="(value, key) in data" :key="key">
                <v-col cols="4"> {{ key }}: </v-col>
                <v-col cols="8">
                  {{ value }}
                </v-col>
              </template>
            </v-row>
          </v-card-text>
        </v-card>
        <v-row style="margin-bottom: 20px" no-gutters>
          <v-col cols="12">
            {{ t('TextExamples') }}
          </v-col>
        </v-row>
        <v-row v-for="(e, index) in examples" :key="e.triggerText" no-gutters style="margin-bottom: 20px">
          <v-col cols="2" align-self="center" style="justify-items: center">
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
              {{ index + 1 }}
            </div>
          </v-col>
          <v-col cols="10">
            <v-row no-gutters>
              <v-col cols="12"> {{ t('TextFromTrigger') }}: {{ e.triggerText }} </v-col>
              <v-col cols="12"> {{ t('TextFromNotificationRule') }}: {{ e.notificationRuleText }} </v-col>
              <v-col cols="12"> {{ t('Result') }}: {{ e.result }} </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="dialog-card-actions">
        <v-btn variant="outlined" :width="526" class="no-cap-btn btn" @click="() => (show = false)">
          {{ t('Close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-icon size="x-small" @click="() => (show = true)"> help_outline </v-icon>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const data = ref({
  attributes: {ip: '127.0.0.1'},
  correlate: [],
  createTime: '2025-01-30T14:22:22.632Z',
  duplicateCount: 0,
  environment: 'Production',
  event: 'server failure',
  group: 'group0',
  history: [],
  id: '8a601c4d-cb49-4f68-bcd5-ee773013db2b',
  lastReceiveId: '04097aca-4ff1-4ae7-acac-a514ffa8fea8',
  lastReceiveTime: '2025-01-30T14:22:22.646Z',
  origin: 'origin',
  previousSeverity: 'normal',
  receiveTime: '2025-01-30T14:22:22.646Z',
  repeat: 'false',
  resource: 'many0fk4',
  service: ['172.10.14.63', 'server'],
  severity: 'critical',
  status: 'open',
  tags: ['test', 'a', 'b'],
  text: 'This is the text(description) field from the alert',
  timeout: '0',
  type: 'type',
  updateTime: '2025-01-30T14:22:22.646Z',
  value: '99'
})
const examples = [
  {
    triggerText: '',
    notificationRuleText: '',
    result: 'Production: critical alert for 172.10.14.63, server - many0fk4 is server failure'
  },
  {triggerText: '{default}', notificationRuleText: 'This is the default text', result: 'This is the default text'},
  {
    triggerText: 'Got alarm {default} with {severity} severity',
    notificationRuleText: 'from {resource}',
    result: 'Got alarm from many0fk4 with critical severity'
  },
  {
    triggerText: '{tags} {resource} got {severity} {event} alarm from {attributes.ip}',
    notificationRuleText: 'from {resource} with {event}',
    result: 'test, a, b many0fk4 got Critical server failure alarm from 127.0.0.1'
  }
]

const show = ref(false)
</script>
