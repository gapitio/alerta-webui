<template>
  <v-dialog v-model="show" scrollable max-width="574px">
    <v-card class="dialog-card">
      <v-card-title>
        <span class="headline">
          {{ title }}
        </span>
      </v-card-title>
      <v-card-text>
        <template v-for="i in info" :key="i.title">
          <v-row v-if="i.info !== undefined || $slots[i.key] !== undefined" style="margin-bottom: 40px" no-gutters>
            <v-col cols="12" class="big-font bold">
              {{ i.title }}
            </v-col>
            <slot :name="i.key">
              <v-col v-if="typeof i.info === 'string'" cols="12" style="align-self: center">
                {{ i.info }}
              </v-col>
              <template v-if="typeof i.info === 'object'">
                <v-col v-for="value in i.info" :key="value" cols="12">
                  {{ value }}
                </v-col>
              </template>
            </slot>
          </v-row>
        </template>
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

const show = ref(false)

interface Info {
  title: string
  key: string
  info?: string
}

defineProps<{
  info: Info[]
  title: string
}>()
</script>
