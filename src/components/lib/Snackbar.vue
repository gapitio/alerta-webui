<template>
  <v-snackbar
    v-model="show"
    :color="snackbar.type"
  >
    <v-row>
      <v-col cols="12">
        {{ filters.capitalize(snackbar.text) }}
      </v-col>
      <v-col 
        cols="12" 
        style="text-align: center;"
      >
        <v-btn
          variant="text"
          @click="close"
        >
          {{ snackbar.action }}
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { Store } from '@/plugins/store/types'
import { useFilters } from '@/filters'

const store: Store = useStore()
const filters = useFilters()

const show = ref(false)

const snackbar = computed(() => store.state.notifications.snackbars[0] || {})

watch(snackbar, () => {
  if (store.getters['notifications/hasSnackbar']) {
    nextTick(() => show.value = true)
  }
})

watch(show, (val) => {
  val || close()
})

function close() {
  show.value = false
  store.dispatch('notifications/closeSnackbar')
}

</script>
