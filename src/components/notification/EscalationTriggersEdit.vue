<template>
  <v-card class="info-section">
    <v-card-title class="headline">
      {{ title }}
      <slot name="information" />
      <v-spacer />

      <v-btn
        color="primary"
        class="btn-icon"
        @click="$emit('input', [...value, { all: [], any: []}])"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-btn
        color="#D92D20"
        class="btn-icon"
        @click="$emit('input', [{ all: [], any: []}])"
      >
        <v-icon>
          delete_forever
        </v-icon>
      </v-btn>
    </v-card-title>
    <v-layout
      v-for="(trigger, index) in value"
      :key="index"
    >
      <v-flex xs10>
        <v-layout> 
          <v-flex xs6>
            <g-combobox 
              v-model="trigger.from_severity"
              :show-header="value.indexOf(trigger) === 0"
              :items="items"
              :label="$t('PreviousSeverity')"
              tooltip="test"
              chips
              multiple
              xs4
            />
          </v-flex>
          <v-flex xs6>
            <g-combobox
              v-model="trigger.to_severity"
              :show-header="value.indexOf(trigger) === 0"
              :items="items"
              :label="$t('CurrentSeverity')"
              chips
              multiple
            />
          </v-flex>         
        </v-layout>
      </v-flex>                                              
      <v-flex 
        xs2
        align-self-end
      >
        <v-btn
          color="#D92D20"
          class="btn-icon mt-0"
          style="margin-bottom:6px"
          @click="deleteRow(index)"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>

import GCombobox from '../GCombobox.vue'

export default {
  components: {
    GCombobox,
  },
  props: {
    title: {
      type: String,
      default: null
    },
    value: {
      type: Array,
      default: null
    },
    items: {
      type: Array,
      default: null
    },
  },
  methods: {
    deleteRow(index) {
      const val = [...this.value]
      val.splice(index, 1)
      this.$emit('input', val.length > 0 ? val : [{ all: [], any: []}])
    }
  }
}
</script>