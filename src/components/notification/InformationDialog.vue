<template>
  <div>
    <v-dialog
      v-model="show"
      max-width="540px"
      scrollable
    >
      <v-card>
        <v-card-title class="infotitle title">
          {{ title }}
        </v-card-title>
        <v-card-text>
          <v-flex xs12>          
            <v-container>
              <div 
                v-for="(i, index) in info"
                :key="i.text"
              >
                <v-flex
                  v-if="i.info !== undefined || $slots[i.text] !== undefined"
                  xs12
                  headerinfo
                >
                  <v-layout wrap>
                    <v-flex 
                      xs3 
                      style="align-self: center;"
                    >
                      {{ i.text }}:
                    </v-flex>
                    <slot :name="i.text">
                      <v-flex 
                        v-if="typeof i.info === 'string'"
                        xs9
                        style="align-self: center;"
                      >
                        {{ i.info }}
                      </v-flex>
                      <v-flex 
                        v-if="typeof i.info === 'object'"
                        xs9
                      >
                        <v-flex
                          v-for="value in i.info"
                          :key="value"
                          xs12
                        >
                          {{ value }}
                        </v-flex>
                      </v-flex>
                    </slot>
                  </v-layout>
                </v-flex>
                <v-divider v-if="index + 1 !== info.length" />
              </div>
            </v-container>
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
  
  props: {
    info: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    }
  },
  data: vm => ({
    show: false
  })
}
</script>

<style>
.infotitle {
  background-color: rgb(238, 238, 238);
  padding: 10px;
}
.container {
  padding-top: 0px;
  /* padding-bottom: 0px; */
}
.headerinfo {
  padding: 10px 0px;
}
</style>
