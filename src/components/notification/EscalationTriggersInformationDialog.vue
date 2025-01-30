<template>
  <div>
    <v-dialog
      v-model="show"
      scrollable
      max-width="540px"
    >
      <v-card>
        <v-card-title class="title">
          <v-toolbar>
            <v-toolbar-title>{{ $t('Triggers') }}</v-toolbar-title>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-flex
              xs12
            >
              {{ $t('EscalationTriggerInfo') }}
            </v-flex>
            <ul>
              <li>
                <v-flex 
                  xs12 
                  style="align-self: center;"
                >
                  {{ $t('TriggerFromSeverity') }}
                </v-flex>
              </li>
              <li>
                <v-flex 
                  xs10 
                  style="align-self: center;"
                >
                  {{ $t('TriggerToSeverity') }}
                </v-flex>
              </li>
              <li>
                <v-flex 
                  xs10 
                  style="align-self: center;"
                >
                  {{ $t('EscalationTriggerAnd') }}
                </v-flex>
              </li>
              <li>
                <v-flex 
                  xs10 
                  style="align-self: center;"
                >
                  {{ $t('TagsGroupsOr') }}
                </v-flex>
              </li>
            </ul>
            
            <v-flex
              xs12 
              model
            >
              <v-card>
                <v-container>
                  <v-layout wrap>
                    <v-flex   
                      xs2
                      align-self-center
                    >
                      Groups
                    </v-flex>
                    
                    <v-flex xs1>
                      <v-divider vertical />
                    </v-flex>
                    <v-flex xs9>
                      <v-layout
                        v-for="(trigger, index) in showcaseGroups"
                        :key="index"
                        wrap
                      >
                        <v-flex   
                          xs2
                          align-self-center
                        >
                          Group {{ index + 1 }}
                        </v-flex>
                        <v-flex xs10>
                          <v-layout 
                            wrap 
                            align-center
                          >
                            <v-flex 
                              xs12
                              triggerfield
                            >
                              <v-combobox
                                v-model="trigger.fromSeverity"
                                :label="$t('FromSeverity')"
                                chips
                                multiple
                                xs4
                                disabled
                              />
                            </v-flex>
                            <v-flex
                              xs12
                              triggerfield
                            >
                              <v-combobox
                                v-model="trigger.toSeverity"
                                :label="$t('ToSeverity')"
                                chips
                                multiple
                                disabled
                              />
                            </v-flex>
                            <v-flex x1 />
                          </v-layout>
                        </v-flex>
                        <v-flex xs12>
                          <v-divider />
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>

            <v-flex
              xs12
            >
              {{ $t('EscalationTriggerGroupsInfo') }}
            </v-flex>
            <v-flex
              v-for="(_, index) in showcaseGroups"
              :key="index"
              xs12
              headerinfo
            >
              <v-flex 
                xs10 
                style="align-self: center;"
              >
                {{ $t('Group') }} {{ index + 1 }} {{ $t('TagGroup') }}
                <ul>
                  <li 
                    v-for="triggers in groupTriggers[index]"
                    :key="triggers.severity + triggers.previuosSeverity + triggers.s"
                    style="padding-bottom: 5px"
                  >
                    <v-flex 
                      xs10
                      triggerexplanation
                    >
                      {{ $t('PreviousSeverity') }}:
                      <v-chip small>
                        {{ triggers.previuosSeverity }} 
                      </v-chip>
                    </v-flex>
                    <v-flex 
                      xs10
                      triggerexplanation
                    >
                      {{ $t('Severity') }}:
                      <v-chip small>
                        {{ triggers.severity }}
                      </v-chip>
                    </v-flex>
                  </li>
                </ul>
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
    show: false,
    showcaseGroups: [
      {fromSeverity:['normal'], toSeverity:['warning','major','critical'], },
      {fromSeverity:[], toSeverity:['normal'], },
      {fromSeverity:['major'], toSeverity:[], },
      {fromSeverity:[], toSeverity:[], },
    ],
    groupTriggers: [
      [
        {severity: 'critical', previuosSeverity: 'normal'},
        {severity: 'major', previuosSeverity: 'normal'},
        {severity: 'warning', previuosSeverity: 'normal'},
      ],
      [
        {severity: 'normal', previuosSeverity: 'AnySeverity',}
      ],
      [
        {severity: 'AnySeverity', previuosSeverity: 'major', },
      ],
      [
        {severity: 'AnySeverity', previuosSeverity: 'AnySeverity', },
      ],

    ]
  })
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
.triggerfield {
  padding: 5px 5px;
}
.triggerexplanation {
  align-self: center;
  padding: 0px;
}
</style>
