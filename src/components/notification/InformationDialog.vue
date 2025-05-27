<template>
  <div>
    <v-dialog
      v-model="show"
      scrollable
      max-width="560px"
    >
      <v-card class="dialog-section">
        <v-card-title>
          <span class="headline">
            {{ title }}
          </span>
        </v-card-title>
        <v-flex
          xs12
          style="overflow: auto; padding-right:15px;"
        >
          <div
            v-for="i in info"
            :key="i.text"
          >
            <v-card
              v-if="i.info !== undefined || $slots[i.text] !== undefined"
              class="info-section"
            >
              <v-flex
                xs12
              >
                <v-layout wrap>
                  <v-flex
                    xs12
                    style="align-self: center;"
                    class="font-semibold"
                  >
                    {{ i.text }}
                  </v-flex>
                  <slot :name="i.text">
                    <v-flex
                      v-if="typeof i.info === 'string'"
                      xs12
                      style="align-self: center;"
                    >
                      {{ i.info }}
                    </v-flex>
                    <v-flex
                      v-if="typeof i.info === 'object'"
                      xs12
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
            </v-card>
          </div>
        </v-flex>

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
.container {
  padding-top: 0px;
  /* padding-bottom: 0px; */
}
.headerinfo {
  padding: 10px 0px;
}
</style>
