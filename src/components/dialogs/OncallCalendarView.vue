<template>
  <v-btn @click="() => (dialog = true)">
    {{ t('ShowCalendar') }}
  </v-btn>
  <v-dialog v-model="dialog" scrollable max-width="80vw">
    <v-card class="dialog-card">
      <v-card-title>
        <v-row align="center">
          <g-select v-model="calendarType" label="Type" :items="['month', 'week']"></g-select>
          <v-col>
            <v-row align="center" no-gutters justify="center">
              <v-col cols="1" style="text-align: center">
                <v-btn class="ma-2" variant="text" icon="chevron_left" @click="() => moveCalendarPage(true)" />
              </v-col>
              <v-col cols="3" style="text-align: center">
                <h1 style="padding: 0">{{ calendar?.title }}</h1>
              </v-col>
              <v-col cols="1" style="text-align: center">
                <v-btn class="ma-2" variant="text" icon="chevron_right" @click="() => moveCalendarPage(false)" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text style="overflow-x: hidden; height: 85vh">
        <v-calendar
          ref="calendar"
          v-model="value"
          :events="events ?? []"
          :weekdays="[1, 6, 2, 3, 4, 5, 0]"
          :type="calendarType"
          event-overlap-mode="column"
          @change="getEvents"
          @click:event="showEvent"
        >
          <template v-slot:event="{event}">
            <div style="margin-left: 10px; white-space: pre-wrap">
              <span v-if="event.timed">
                <strong>{{ toTime(event.start) }} - {{ toTime(event.end) }}</strong>
              </span>
              {{ event.name }}
            </div>
          </template>
        </v-calendar>
        <v-menu
          v-model="selectedOpen"
          v-if="selectedElement && selectedEvent"
          :activator="selectedElement as Element"
          :close-on-content-click="false"
          location="end"
        >
          <v-card class="dialog-card">
            <v-toolbar :color="selectedEvent.color">
              <v-toolbar-title>{{ selectedEvent.name }}</v-toolbar-title>
            </v-toolbar>
            <v-card-text style="white-space: pre-wrap">
              <v-row no-gutters>
                <v-col cols="auto">
                  <b>{{ t('Start') }}: </b>
                </v-col>
                <v-col>
                  <date-time
                    :value="selectedEvent.start.toUTCString()"
                    format="longDate"
                    no-break
                    style="display: inline-block"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="auto">
                  <b>{{ t('End') }}: </b>
                </v-col>
                <v-col>
                  <date-time
                    :value="selectedEvent.end.toUTCString()"
                    format="longDate"
                    no-break
                    style="display: inline-block"
                  />
                </v-col>
              </v-row>
              <b>{{ t('Duration') }}: </b>{{ eventDuration(selectedEvent) }} <br />
              <b>{{ t('PhoneNumbers') }}: </b> {{ selectedEvent.detail.numbers }} <br />
              <b>{{ t('Mails') }}: </b> {{ selectedEvent.detail.mails }}
            </v-card-text>
            <v-card-actions class="dialog-card-actions">
              <v-col cols="6">
                <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="selectedOpen = false">
                  {{ t('Cancel') }}
                </v-btn>
              </v-col>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-card-text>
      <v-card-actions class="dialog-card-actions">
        <v-col cols="6">
          <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="close">
            {{ t('Cancel') }}
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {useFilters} from '@/filters'
import type {Store} from '@/plugins/store/types'
import moment from 'moment'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {VCalendar} from 'vuetify/components'
import type {CalendarEvent} from 'vuetify/lib/components/VCalendar/types.mjs'
import type {EventSlotScope} from 'vuetify/lib/components/VCalendar/VCalendar.mjs'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()
const filters = useFilters()

const calendar = ref<null | VCalendar>(null)
const selectedElement = ref<EventTarget | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const selectedOpen = ref(false)

const moveCalendarPage = (back: boolean) => {
  if (back) calendar.value?.prev()
  else calendar.value?.next()
}

const dialog = ref(false)

function close() {
  dialog.value = false
}

const dayMap: {[key: string]: number} = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0
}

const monthMap: {[key: string]: number} = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
}

const colors = [
  'minor',
  'primary-600',
  'critical-600',
  'normal',
  'major',
  'chip-major',
  'error',
  'normal-chip',
  'chip-minor',
  'chip-informational'
]

const calendarType = ref<'month' | 'week'>('month')
const value = ref('')
const onCalls = computed(() => store.state.onCalls.items)
const users = computed(() => store.state.users.emails)
const groups = computed(() => store.state.notificationGroups.items)
const events = ref<null | CalendarEvent[]>(null)
const getEvents: (item: {start: {date: string; weekday: number}; end: {date: string; weekday: number}}) => void = ({
  start,
  end
}) => {
  const firstDate = new Date(`${start.date}T00:00:00Z`)
  firstDate.setDate(firstDate.getDate() - start.weekday)
  const lastDate = new Date(`${end.date}T23:59:59Z`)
  lastDate.setDate(lastDate.getDate() + (8 - end.weekday))

  events.value = onCalls.value
    .filter(({startDate, endDate, repeatWeeks, repeatMonths}) => {
      const repeatChecks =
        (repeatMonths.length == 0 ||
          repeatMonths.filter(
            month => monthMap[month] >= firstDate.getMonth() && monthMap[month] <= lastDate.getMonth()
          ).length > 0) &&
        (repeatWeeks.length == 0 ||
          repeatWeeks.filter(week => week <= moment(lastDate).week() && week >= moment(firstDate).week()).length > 0)

      if (!startDate && !endDate) {
        return repeatChecks
      }

      if (!startDate && endDate) {
        const end = new Date(endDate)
        return end >= firstDate
      }

      if (startDate && !endDate) {
        const start = new Date(startDate)
        return start <= lastDate
      }

      const start = new Date(startDate!)
      const end = new Date(endDate!)
      return (
        ((start < lastDate && start > firstDate) ||
          (start < firstDate && end > lastDate) ||
          (end < lastDate && end > firstDate)) &&
        repeatChecks
      )
    })

    .map<CalendarEvent[]>((item, index) => {
      const receiverItems = {
        users: users.value.filter(({email}) => email && item.usersEmails.includes(email)),
        groups: groups.value.filter(({id}) => item.groupIds.includes(id))
      }
      const names = [...receiverItems.users.map(({name}) => name), ...receiverItems.groups.map(({name}) => name)].join(
        ', '
      )
      const mails = [
        ...new Set(
          [
            ...receiverItems.users.map(({email}) => email),
            ...receiverItems.groups.map(({usersEmails, mails, phoneNumbers}) => [
              ...usersEmails,
              ...mails,
              ...phoneNumbers
            ])
          ].flat()
        )
      ].join(', ')
      const numbers = [
        ...new Set([
          ...receiverItems.users.map(({phoneNumber}) => phoneNumber),
          ...users.value.filter(({email}) => email && mails.includes(email)).map(({phoneNumber}) => phoneNumber)
        ])
      ]
        .filter(number => number)
        .join(', ')
      const color = colors[index - colors.length * Math.floor(index / colors.length)]

      const startDate = item.startDate ? new Date(item.startDate + ':') : new Date(firstDate)
      const endDate = item.endDate ? new Date(item.endDate + ':') : new Date(lastDate)

      if (item.startTime || item.endTime || item.repeatDays.length > 0 || item.repeatWeeks.length > 0) {
        const [startHour, startMinute] = item.startTime ? item.startTime.split(':').map(nr => parseInt(nr)) : [0, 0]
        const [endHour, endMinute] = item.endTime ? item.endTime.split(':').map(nr => parseInt(nr)) : [23, 59]

        const _events = []
        for (let actualDate = startDate; actualDate <= endDate; actualDate.setDate(actualDate.getDate() + 1)) {
          // ignore days that is not inside repeat options
          if (
            (item.repeatDays.length > 0 &&
              item.repeatDays.filter(day => actualDate.getDay() == dayMap[day]).length == 0) ||
            (item.repeatWeeks.length > 0 && !item.repeatWeeks.includes(moment(actualDate).week())) ||
            (item.repeatMonths.length > 0 &&
              item.repeatMonths.filter(month => monthMap[month] == actualDate.getMonth()).length == 0)
          ) {
            continue
          }
          actualDate.setHours(0, 0)
          const start = new Date(actualDate)
          const end = new Date(actualDate)
          if (item.startTime || item.endTime) {
            const offset = actualDate.getTimezoneOffset()
            const timezoneBack = ((startHour * 60 + startMinute + item.offset) % (24 * 60)) - offset - item.offset < 0
            if (timezoneBack) {
              const d = start.getDate()
              start.setDate(d - 1)
            }
            const dateBeforeMove = start.getDate()
            const monthBeforeMove = start.getMonth()
            start.setUTCHours(startHour, startMinute)
            start.setMonth(monthBeforeMove, dateBeforeMove)

            const endDateBeforeMove = end.getDate()
            const endMonthBeforeMove = end.getMonth()
            if (endHour * 60 + endMinute - offset > 24 * 60) end.setDate(end.getDate() + 1)
            end.setUTCHours(endHour, endMinute)
            end.setMonth(endMonthBeforeMove, endDateBeforeMove)
          }
          _events.push({
            name: names,
            detail: {numbers, mails},
            start: start,
            end: end,
            color,
            timed: typeof (item.startTime || item.endTime) == 'string'
          })
        }
        return _events
      }
      return [
        {
          name: names,
          detail: {numbers, mails},
          start: startDate,
          end: endDate,
          color,
          timed: false
        }
      ]
    })
    .flat()
}
function toTime(dateString: string) {
  const time = new Date(dateString)
  return `${new String(time.getHours()).padStart(2, '0')}:${new String(time.getMinutes()).padStart(2, '0')}`
}

function showEvent(nativeEvent: Event, {event}: EventSlotScope) {
  selectedOpen.value = false
  selectedEvent.value = event
  selectedElement.value = nativeEvent.target
  requestAnimationFrame(() => requestAnimationFrame(() => (selectedOpen.value = true)))
}

const eventDuration = (event: CalendarEvent): string => {
  const dur = (event.end - event.start + (event.timed ? 0 : 86400000)) / 1000
  if (dur < 86400) return filters.hhmmss(dur)!
  else return filters.days(dur)!
}
</script>
