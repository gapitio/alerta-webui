<template>
  <div style="display: inline-flex;">
    <v-dialog
      v-model="show"
      scrollable
      max-width="640px"
    >
      <v-card>
        <v-card-title class="title">
          <v-toolbar>
            <v-toolbar-title>{{ $t('NotificationText') }}</v-toolbar-title>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-flex
              xs12
            >
              {{ $t('TextExplained') }}
            </v-flex>
            <ul>
              <li>
                <v-flex 
                  xs12 
                  style="align-self: center;"
                >
                  {{ $t('TextTrigger') }}
                </v-flex>
              </li>
              <li>
                <v-flex 
                  xs10 
                  style="align-self: center;"
                >
                  {{ $t('TextNotificationRule') }}
                </v-flex>
              </li>
              <li>
                <v-flex 
                  xs10 
                  style="align-self: center;"
                >
                  {{ $t('TextBothEmpty') }}
                </v-flex>
              </li>
            </ul>

            <v-flex 
              xs12 
              style="align-self: center;"
            >
              {{ $t('TextFields') }}
            </v-flex>

            <ul>
              <li>
                {{ $t('TextFieldObject') }}
              </li>
              <li>
                {{ $t('TextFieldFullObject') }}
              </li>
              <li>
                {{ $t('TextFieldArray') }}
              </li>
              <li>
                {{ $t('TextFieldFullArray') }}
              </li>
            </ul>

            <v-container 
              fluid
              grid-list-md
              style="padding:0px"
            >
              <v-layout wrap>
                <v-flex xs12>
                  <v-card>
                    <v-card-title><h4>{{ $t('AlertDetailExample') }}</h4></v-card-title>
                    <v-list 
                      dense 
                      subheader
                    >
                      <v-list-tile 
                        v-for="[key, value] in Object.entries(alert)" 
                        :key="key"
                      >
                        <v-list-tile-content>
                          {{ key }}:
                        </v-list-tile-content>
                        <v-list-tile-content style="align-items: end;">
                          {{ value }}
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>

            <v-flex
              xs12
            >
              {{ $t('TextExamples') }}
            </v-flex>
            <v-flex
              v-for="(value, index) in showcase"
              :key="index"
              xs12
              headerinfo
            >
              <v-flex 
                xs10 
                style="align-self: center;"
              >
                {{ $t('Example') }} {{ index + 1 }} 
                <ul>
                  <li>
                    <v-flex 
                      xs10
                      style="align-self: center;"
                    >                        
                      {{ $t('TextFromTrigger') }}:
                      <v-chip small>
                        {{ value.triggerText }}
                      </v-chip>
                    </v-flex>
                  </li>
                  <li>
                    <v-flex 
                      xs10
                      style="align-self: center;"
                    >                        
                      {{ $t('TextFromNotificationRule') }}:
                      <v-chip small>
                        {{ value.notificationRuleText }}
                      </v-chip>
                    </v-flex>
                  </li>
                </ul>
              </v-flex>  
              <v-flex 
                xs10 
                style="align-self: center;"
              >
                {{ $t('Result') }}: {{ results[index] }}
              </v-flex>
            </v-flex>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-icon 
      @click="() => show = true"
    >
      help_outline
    </v-icon>
  </div>
</template>

<script>

export default {  
  data: vm => ({
    show: true,
    alert: {
      attributes: { 'ip': '127.0.0.1' },
      correlate: [],
      createTime: '2025-01-30T14:22:22.632Z',
      customer: '',
      duplicateCount: 0,
      environment: 'Production',
      event: 'server failure',
      group: 'group0',
      history: [],
      href: 'http://localhost:8080/api/alert/8a601c4d-cb49-4f68-bcd5-ee773013db2b',
      id: '8a601c4d-cb49-4f68-bcd5-ee773013db2b',
      lastReceiveId: '04097aca-4ff1-4ae7-acac-a514ffa8fea8',
      lastReceiveTime: '2025-01-30T14:22:22.646Z',
      origin: 'origin',
      previousSeverity: 'normal',
      rawData: '',
      receiveTime: '2025-01-30T14:22:22.646Z',
      repeat: 'false',
      resource: 'many0fk4',
      service: [ '172.10.14.63', 'server' ],
      severity: 'critical',
      status: 'open',
      tags: [ 'test', 'a', 'b' ],
      text: 'This is the text(description) field from the alert',
      timeout: '0',
      trendIndication: 'moreSevere',
      type: 'type',
      updateTime: '2025-01-30T14:22:22.646Z',
      value: ''
    },
    showcase: [
      {triggerText: '', notificationRuleText: ''},
      {triggerText: '{default}', notificationRuleText: 'This is the default text'},
      {triggerText: 'Got alarm {default} with {severity} severity', notificationRuleText: 'from {resource}'},
      {triggerText: '{tags} {resource} got {severity} {event} alarm from {attributes.ip}', notificationRuleText: 'from {resource} with {event}'},
    ],
    results: [
      'Production: critical alert for 172.10.14.63, server - many0fk4 is server failure',
      'This is the default text',
      'Got alarm from many0fk4 with critical severity',
      'test, a, b many0fk4 got Critical server failure alarm from 127.0.0.1',
    ]
  }),
}
</script>

<style>
.container {
  padding-top: 0px;
  /* padding-bottom: 0px; */
}
.headerinfo {
  padding: 10px 0px;
}
.title {
  padding: 0px;
}
.model {
  padding: 20px 0px;
}
</style>
