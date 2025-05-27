<template>
  <div class="about">
    <v-card class="section">
      <manifest />
    </v-card>
    <v-card class="section">
      <status />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Manifest from '@/components/Manifest.vue'
import Status from '@/components/Status.vue'

@Component({
  components: {
    Manifest,
    Status
  }
})
export default class About extends Vue {}
</script>
