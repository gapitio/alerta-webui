<template>
  <h1>
    {{ t('OnCall') }}
    <information-dialog :title="t('OnCall')" :info="[{title: '', info: t('OnCallInfo')}]" />
    <v-btn
      perms="write:oncalls"
      prepend-icon="add"
      class="no-cap-btn bg-primary-600"
      style="position: absolute; right: 10px"
      :text="t('AddOnCall')"
      @click="dialog = true"
    />
    <on-call-add :dialog="dialog" :item="selectedItem" @close="close" />
  </h1>
  <v-row align="center">
    <v-col cols="auto">
      <g-switch v-model="showCalendar" :label="t('CalendarView')" style="padding-left: 16px" />
    </v-col>
    <template v-if="showCalendar">
      <v-col cols="auto">
        <v-row class="calendar-selector" :class="calendarType" no-gutters>
          <v-col cols="auto" style="text-align: center">
            <v-btn
              class="text-link-active"
              variant="text"
              icon="arrow_back"
              @click="() => calendar?.moveCalendarPage(true)"
            />
          </v-col>
          <v-col align-self="center" style="text-align: center">
            <span style="padding: 0"> {{ calendarHeading() }} </span>
          </v-col>
          <v-col cols="auto" style="text-align: center">
            <v-btn
              class="text-link-active"
              variant="text"
              icon="arrow_forward"
              @click="() => calendar?.moveCalendarPage(false)"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="auto">
        <v-btn @click="() => (calendarType = 'week')" :color="calendarType == 'week' ? 'primary-600' : 'heatmap-5'">
          {{ t('Weekly') }}
        </v-btn>
        <v-btn @click="() => (calendarType = 'month')" :color="calendarType == 'month' ? 'primary-600' : 'heatmap-5'">
          {{ t('Monthly') }}
        </v-btn>
      </v-col>
    </template>
  </v-row>
  <on-call-calendar v-if="showCalendar" v-model="calendarInfo" v-model:calendar-type="calendarType" ref="calendar" />
  <on-call-list @open="open" v-if="!showCalendar" />
</template>

<script lang="ts" setup>
import OnCallCalendar from '@/components/OnCallCalendar.vue'
import type {OnCall, OnCallAdd} from '@/plugins/store/types/onCall-types'
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'

definePage({
  meta: {
    title: 'On Call',
    requiresAuth: true
  }
})

const {t} = useI18n()

const dialog = ref(false)
const calendar = ref<null | typeof OnCallCalendar>(null)
const selectedItem = ref<OnCall | OnCallAdd | null>(null)
const showCalendar = ref(false)
const calendarType = ref<'week' | 'month'>('month')
const calendarInfo = ref<{start?: string; end?: string; title?: string}>({})

function open(item?: OnCallAdd) {
  selectedItem.value = item ?? null
  dialog.value = true
}

function close() {
  dialog.value = false
  selectedItem.value = null
}

const calendarHeading = () => {
  const info = calendarInfo.value
  if (calendarType.value == 'month') return info.title
  const [, , start] = info.start?.split('-') ?? []
  const [, , end] = info.end?.split('-') ?? []
  if (info.title?.includes(' - ')) {
    const [startTitle, endTitle] = info.title.split(' - ')
    return `${start}. ${startTitle} - ${end}. ${endTitle}`
  }
  return `${start}. - ${end}. ${info.title}`
}
</script>
