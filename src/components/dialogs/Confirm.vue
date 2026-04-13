<template>
  <v-dialog v-model="dialog" scrollable max-width="540px" @keydown.enter.prevent="ok">
    <v-form ref="form">
      <v-card class="dialog-card">
        <v-card-text style="overflow-x: hidden; white-space: pre-wrap">
          {{ desc }}
        </v-card-text>

        <v-card-actions class="dialog-card-actions">
          <v-col cols="6">
            <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="cancel">
              {{ t('Cancel') }}
            </v-btn>
          </v-col>

          <v-col cols="6">
            <v-btn color="primary-600" variant="flat" class="no-cap-btn" width="247" @click="ok">
              {{ t('OK') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const desc = ref('')
const dialog = ref(false)
const resolve = ref<((val: boolean) => void) | null>(null)
const reject = ref((reason: any) => reason)

const open = (description: string) => {
  desc.value = description
  dialog.value = true
  return new Promise<boolean>((res, rej) => {
    resolve.value = res
    reject.value = rej
  })
}
const cancel = () => {
  if (resolve.value) resolve.value(false)
  dialog.value = false
}
const ok = () => {
  if (resolve.value) resolve.value(true)
  dialog.value = false
}

defineExpose({open})
</script>
