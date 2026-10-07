<template>
  <v-row style="margin: 16px">
    <v-calendar
      ref="calendar"
      style="height: 85vh; width: 100%"
      v-model="value"
      :events="events ?? []"
      :weekdays="[1, 6, 2, 3, 4, 5, 0]"
      :type="calendarType"
      event-overlap-mode="column"
      @change="getEvents"
      @click:event="showEvent"
    >
      <template v-slot:event="{event}">
        <div style="margin-left: 10px; white-space: pre-wrap; text-align: center">
          <span v-if="event.timed">
            <strong>{{ toTime(event.start) }} - {{ toTime(event.end) }}</strong>
          </span>
          <br v-if="calendarType == 'week' && event.timed" />
          {{ event.name }}
        </div>
      </template>
    </v-calendar>
  </v-row>

  <v-dialog
    v-model="selectedOpen"
    v-if="selectedElement && selectedEvent"
    :activator="selectedElement as Element"
    :close-on-content-click="false"
    location="end"
    width="574"
  >
    <v-card class="dialog-card">
      <v-card-title>
        <v-col cols="12">
          <span class="header"> {{ t('OnCall') }} {{ selectedEvent.header }} </span>
        </v-col>
      </v-card-title>

      <v-card-text style="white-space: pre-wrap">
        <v-row>
          <v-col cols="12" v-if="selectedEvent.detail.users">
            <b>{{ t('Users') }}</b>
            <br />{{ selectedEvent.detail.users }}
          </v-col>
          <v-col cols="12" v-if="selectedEvent.detail.groups">
            <b>{{ t('Groups') }}</b>
            <br />{{ selectedEvent.detail.groups || ' ' }}
          </v-col>

          <v-col cols="12">
            <b>{{ t('Emails') }}: </b>
            <br />
            {{ selectedEvent.detail.mails }}
          </v-col>
          <v-col cols="12">
            <b>{{ t('PhoneNumbers') }}: </b>
            <br />
            {{ selectedEvent.detail.numbers }}
          </v-col>

          <v-col cols="6">
            <b>{{ t('StartTime') }}</b>
            <br />{{ toTime(selectedEvent.start) }}
          </v-col>
          <v-col cols="6">
            <div>
              <b>{{ t('EndTime') }}</b>
              <br />{{ toTime(selectedEvent.end) }}
            </div>
          </v-col>
          <v-col cols="6">
            <b>{{ t('StartDate') }}: </b>
            <br />{{ selectedEvent.start.toLocaleDateString() }}
          </v-col>
          <v-col cols="6">
            <b>{{ t('EndDate') }}: </b>
            <br />{{ selectedEvent.end.toLocaleDateString() }}
          </v-col>
          <v-col cols="12">
            <b>{{ t('Duration') }}: </b>
            <br />
            {{ eventDuration(selectedEvent) }}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-card-actions">
        <v-col cols="6">
          <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="selectedOpen = false">
            {{ t('Close') }}
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
import {computed, onUnmounted, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {VCalendar} from 'vuetify/components'
import type {CalendarEvent} from 'vuetify/lib/components/VCalendar/types.mjs'
import type {EventSlotScope} from 'vuetify/lib/components/VCalendar/VCalendar.mjs'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()
const filters = useFilters()

const calendar = ref<null | VCalendar>()
const selectedElement = ref<EventTarget | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const selectedOpen = ref(false)
const calendarInfo = computed(() => {
  return {
    end: calendar.value?.end?.toString(),
    start: calendar.value?.start?.toString(),
    title: calendar.value?.title
  }
})

const model = defineModel<{start?: string; end?: string; title?: string}>()
watch(calendarInfo, val => (model.value = val))

const moveCalendarPage = (back: boolean) => {
  if (back) calendar.value?.prev()
  else calendar.value?.next()
}
defineExpose({moveCalendarPage})

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

const calendarType = defineModel<'month' | 'week'>('calendarType')
const value = ref('')
const onCalls = computed(() => store.state.onCalls.items)
const users = computed(() => store.state.users.emails)
const groups = computed(() => store.state.notificationGroups.items)
const events = ref<null | CalendarEvent[]>(null)

type CalendarRange = {start: {date: string; weekday: number}; end: {date: string; weekday: number}}
const lastRange = ref<CalendarRange | null>(null)

const timeout = ref<number | undefined>(undefined)
const interval = computed(
  () => store.getters.getPreference('refreshInterval') ?? store.getters.getConfig('refresh_interval')
)

function getItems() {
  if (timeout.value) clearTimeout(timeout.value)
  store.dispatch('onCalls/getOnCalls')
  timeout.value = setTimeout(getItems, interval.value)
}

onUnmounted(() => clearTimeout(timeout.value))

watch(onCalls, () => {
  if (lastRange.value) getEvents(lastRange.value)
})

getItems()

function parseDate(date: string): Date {
  return moment(date, 'YYYY-MM-DD').toDate()
}

const getEvents = (range: CalendarRange) => {
  lastRange.value = range
  const {start, end} = range
  const firstDate = parseDate(start.date)
  firstDate.setDate(firstDate.getDate() - start.weekday)
  const lastDate = parseDate(end.date)
  lastDate.setDate(lastDate.getDate() + (6 - end.weekday))
  lastDate.setHours(23, 59, 59)

  const visibleMonths = [lastDate.getMonth(), firstDate.getMonth()]
  const nrOfMonths = visibleMonths[0] - visibleMonths[1]
  if (nrOfMonths == -10) visibleMonths.push(visibleMonths[1] == 11 ? 0 : visibleMonths[1] + 1)
  if (nrOfMonths == 2) visibleMonths.push(visibleMonths[0] - 1)

  const visibleWeeks = new Set()
  for (const day = new Date(firstDate); day <= lastDate; day.setDate(day.getDate() + 7)) {
    visibleWeeks.add(moment(day).isoWeek())
  }

  events.value = onCalls.value
    .filter(({startDate, endDate, repeatWeeks, repeatMonths}) => {
      const repeatChecks =
        (repeatMonths.length == 0 || repeatMonths.some(month => visibleMonths.includes(monthMap[month]))) &&
        (repeatWeeks.length == 0 || repeatWeeks.some(week => visibleWeeks.has(week)))

      if (!startDate && !endDate) {
        return repeatChecks
      }

      if (!startDate && endDate) {
        const end = parseDate(endDate)
        return end >= firstDate
      }

      if (startDate && !endDate) {
        const start = parseDate(startDate)
        return start <= lastDate
      }

      const start = parseDate(startDate!)
      const end = parseDate(endDate!)
      return start <= lastDate && end >= firstDate && repeatChecks
    })

    .map<CalendarEvent[]>((item, index) => {
      const receiverItems = {
        users: users.value.filter(({email}) => email && item.usersEmails.includes(email)),
        groups: groups.value.filter(({id}) => item.groupIds.includes(id))
      }
      const usersDetails = receiverItems.users.map(({name}) => name).join(', ')
      const groupsDetails = receiverItems.groups.map(({name}) => name).join(', ')
      const name = [usersDetails, groupsDetails].filter(a => a !== '').join(', ')
      const userEmails = [
        ...receiverItems.users.map(({email}) => email),
        ...receiverItems.groups.flatMap(({usersEmails}) => usersEmails)
      ]
      const mails = [
        ...new Set([...userEmails, ...receiverItems.groups.flatMap(({mails}) => mails)].filter(mail => mail))
      ].join(', ')
      const numbers = [
        ...new Set(
          [
            ...users.value.filter(({email}) => email && userEmails.includes(email)).map(({phoneNumber}) => phoneNumber),
            ...receiverItems.groups.flatMap(({phoneNumbers}) => phoneNumbers)
          ].filter(number => number)
        )
      ].join(', ')
      const color = colors[index - colors.length * Math.floor(index / colors.length)]
      const detail = {numbers, mails, users: usersDetails, groups: groupsDetails}

      const startDate = item.startDate ? parseDate(item.startDate) : new Date(firstDate)
      const endDate = item.endDate ? parseDate(item.endDate) : new Date(lastDate)

      if (item.startTime || item.endTime || item.repeatDays.length > 0 || item.repeatWeeks.length > 0) {
        const offset = item.offset ?? 0
        const toLocalMinutes = (utc: string) => {
          const [hours, minutes] = utc.split(':').map(nr => parseInt(nr))
          return (((hours * 60 + minutes + offset) % 1440) + 1440) % 1440
        }
        const startMinutes = item.startTime ? toLocalMinutes(item.startTime) : 0
        let endMinutes = item.endTime ? toLocalMinutes(item.endTime) : 23 * 60 + 59
        if (endMinutes <= startMinutes) endMinutes += 1440

        const _events = []
        for (let actualDate = startDate; actualDate <= endDate; actualDate.setDate(actualDate.getDate() + 1)) {
          if (
            (item.repeatDays.length > 0 &&
              item.repeatDays.filter(day => actualDate.getDay() == dayMap[day]).length == 0) ||
            (item.repeatWeeks.length > 0 && !item.repeatWeeks.includes(moment(actualDate).isoWeek())) ||
            (item.repeatMonths.length > 0 &&
              item.repeatMonths.filter(month => monthMap[month] == actualDate.getMonth()).length == 0)
          ) {
            continue
          }
          actualDate.setHours(0, 0)
          let start = new Date(actualDate)
          let end = new Date(actualDate)
          if (item.startTime || item.endTime) {
            const dayStart =
              Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate()) - offset * 60000
            start = new Date(dayStart + startMinutes * 60000)
            end = new Date(dayStart + endMinutes * 60000)
          }
          _events.push({
            name,
            detail,
            start: start,
            end: end,
            color,
            timed: typeof (item.startTime || item.endTime) == 'string'
          })
        }
        return _events
      }
      if (item.repeatMonths.length > 0) {
        const months = new Set(item.repeatMonths.map(month => monthMap[month]))
        const _events = []
        let runStart: Date | null = null
        let runEnd: Date | null = null
        for (const day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
          if (months.has(day.getMonth())) {
            if (!runStart) runStart = new Date(day)
            runEnd = new Date(day)
          } else if (runStart && runEnd) {
            _events.push({name, detail, start: runStart, end: runEnd, color, timed: false})
            runStart = runEnd = null
          }
        }
        if (runStart && runEnd) _events.push({name, detail, start: runStart, end: runEnd, color, timed: false})
        return _events
      }
      return [
        {
          name,
          detail,
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
  const element = nativeEvent.target as HTMLElement
  selectedElement.value = element
  selectedEvent.value = {...event, ...{header: (element.offsetParent as HTMLElement)?.dataset.date}}
  requestAnimationFrame(() => requestAnimationFrame(() => (selectedOpen.value = true)))
}

const eventDuration = (event: CalendarEvent): string => {
  const dur = (event.end - event.start + (event.timed ? 0 : 86400000)) / 1000
  if (dur < 86400) return filters.hhmmss(dur)!
  else return filters.days(dur)!
}
</script>
