<template>
  <div>
    <v-dialog
      v-model="show"
      scrollable
      max-width="540px"
    >
      <v-card class="dialog-section">
        <v-card-title>
          <span class="headline">
            {{ $t('Tags') }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-flex
            xs12
          >
            {{ $t('TagsInfo') }}
          </v-flex>
          <ul>
            <li>
              <v-flex 
                xs12 
                style="align-self: center;"
              >
                {{ $t('TagsAnd') }}
              </v-flex>
            </li>
            <li>
              <v-flex 
                xs10 
                style="align-self: center;"
              >
                {{ $t('TagsOr') }}
              </v-flex>
            </li>
            <li>
              <v-flex 
                xs10 
                style="align-self: center;"
              >
                {{ $t('TagsFunctionAnd') }}
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
            <v-card class="info-section">
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
                    v-for="(tag, index) in showcaseGroups"
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
                        <v-flex xs5>
                          {{ 'AND ' + $t('Function') }}
                        </v-flex>
                        <v-flex xs7>
                          <v-combobox
                            v-model="tag.all"
                            :label="$t('AND')"
                            chips
                            multiple
                            xs4
                            disabled
                          />
                        </v-flex>

                        <v-flex xs5>
                          {{ 'OR ' + $t('Function') }}
                        </v-flex>
                        <v-flex xs7>
                          <v-combobox
                            v-model="tag.any"
                            :label="$t('OR')"
                            chips
                            multiple
                            disabled
                          />
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12>
                      <v-divider />
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-card>
          </v-flex>

          <v-flex
            xs12
          >
            {{ $t('TagsGroupsInfo') }}
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
                  v-for="tags in groupTriggers[index]"
                  :key="tags"
                >
                  <v-flex 
                    xs10
                    style="align-self: center;"
                  >                        
                    {{ $t('Tags') }}:
                    <v-chip small>
                      {{ tags }}
                    </v-chip>
                  </v-flex>
                </li>
              </ul>
            </v-flex>
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            flat
            @click="() => show = false"
          >
            {{ $t('Close') }}
          </v-btn>
        </v-card-actions>
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
      {all:['a', 'b'], any:['c','d']},
      {all:['a'], any:['e', 'h']},
      {all:['a', 'd'], any:[]},
      {all:[], any:['f', 'g']},
    ],
    groupTriggers: [
      ['[a, b, c, x]', '[a, b, d, x]', '[a, b, c, d, x]'],
      ['[a, e, x]', '[a, h, x]', '[a, e, h, x]'],
      ['[a, d, x]'],
      ['[f, x]', '[g, x]', '[f, g, x]'],

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
</style>
