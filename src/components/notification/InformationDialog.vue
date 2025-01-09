<template>
  <div>
    <v-dialog
      v-model="show"
      max-width="540px"     
    >
      <v-flex xs12>
        <v-card>
          <v-toolbar>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <div 
              v-for="(i, index) in info"
              :key="i"
            >
              <v-flex
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
                  <v-flex 
                    v-if="typeof i.info === 'string'"
                    xs9
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
                </v-layout>
              </v-flex>
              <v-divider v-if="index + 1 !== info.length" />
            </div>
          </v-container>
        </v-card>
      </v-flex>
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
      type: Object,
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
.container {
  padding-top: 0px;
  /* padding-bottom: 0px; */
}
.headerinfo {
  padding: 10px 0px;
}
</style>
