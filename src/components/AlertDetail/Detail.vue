<template>
  <v-container style="position: sticky; top: 6px" class="bg-primary-surface pa-0 ma-0">
    <v-alert
      v-for="note in notes"
      :key="note.id"
      :text="note.text"
      closable
      type="info"
      style="margin: 6px"
      border="top"
      variant="tonal"
      density="compact"
      @click:close="deleteNote(item?.id!, note.id)"
    >
      <template #title>
        <span>
          <b>{{ note.user || 'Anonymous' }}</b> {{ t('addedNoteOn') }}</span
        >
        &nbsp;
        <b><date-time :value="note.updateTime || note.createTime" format="longDate" no-break /></b>
      </template>
    </v-alert>
  </v-container>

  <v-container v-if="item?.id" fluid>
    <template v-for="detail in alertDetails" :key="detail.text">
      <v-row v-if="!detail.more || props.showMore" dense>
        <v-col cols="3" class="text-grey">
          {{ detail.text }}
        </v-col>
        <v-col v-if="detail.value === 'severity'" cols="9" style="z-index: -1">
          <v-chip label size="small" class="chip" :class="[item.previousSeverity]">
            {{ filters.capitalize(item?.previousSeverity) }}
          </v-chip>
          &nbsp;&rarr;&nbsp;
          <v-chip label size="small" class="chip" :class="[item.severity]">
            {{ filters.capitalize(item?.severity) }}
          </v-chip>
        </v-col>
        <v-col v-else-if="['tags', 'customTags'].includes(detail.value)" cols="9" style="z-index: -1">
          <v-chip
            v-for="tag in item[detail.value as 'tags' | 'customTags']"
            :key="tag"
            class="chip"
            variant="flat"
            @click="(e: MouseEventInit) => queryBy(detail.value, tag, e.shiftKey)"
          >
            {{ filters.capitalize(tag) }}
          </v-chip>
        </v-col>
        <v-col v-else-if="detail.value.includes('Time')" cols="auto">
          <date-time v-if="item[detail.value]" :value="item[detail.value]" hide-tooltip no-break format="longDate" />
        </v-col>
        <v-col v-else-if="detail.searchable" cols="9">
          <template v-if="Array.isArray(item[detail.value])">
            <v-row style="width: fit-content" dense>
              <v-col
                v-for="i in item[detail.value] as [string]"
                :key="i"
                cols="auto"
                class="clickable"
                @click="(e: MouseEventInit) => queryBy(detail.value, i, e.shiftKey)"
              >
                {{ i }}
              </v-col>
            </v-row>
          </template>
          <span
            v-else
            class="clickable"
            @click="(e: MouseEventInit) => queryBy(detail.value, item![detail.value], e.shiftKey)"
          >
            {{ item[detail.value] }}
          </span>
        </v-col>
        <v-col v-else-if="detail.value == 'text'" cols="9" style="white-space: pre-wrap">
          <div
            ref="text"
            style="max-height: 66px"
            :style="textShowMore && textOverflow ? {overflow: 'visible', maxHeight: 'none'} : {overflow: 'hidden'}"
          >
            {{ item[detail.value] }}
          </div>
          <div v-if="textOverflow" text small @click="textShowMore = !textShowMore" class="clickable">
            {{ textShowMore ? t('SeeLess') : t('SeeMore') }}
          </div>
        </v-col>
        <v-col v-else cols="9"> {{ item[detail.value] }} </v-col>
      </v-row>
    </template>
    <v-row dense>
      <v-col>
        <span> {{ t('Attributes') }}</span>
      </v-col>
    </v-row>
    <v-divider />
    <v-row v-for="(value, key) in item?.attributes" :key="key" dense>
      <v-col cols="3" class="text-grey">
        {{ key }}
      </v-col>
      <v-col cols="9">
        <span class="clickable" @click="(e: MouseEventInit) => queryBy(`attributes.${key}`, value, e.shiftKey)">{{
          value
        }}</span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {computed, ref, type Ref} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Store} from '@/plugins/store/types'
import {useRouter} from 'vue-router'
import {useStore} from 'vuex'
import type {Alert} from '@/plugins/store/types/alerts-types'
import {useFilters} from '@/filters'

const store: Store = useStore()
const router = useRouter()
const {t} = useI18n()
const filters = useFilters()

const text = ref<[HTMLDivElement] | null>(null)
const textShowMore = ref(false)
const textOverflow = computed(() => {
  if (text.value) {
    const [el] = text.value
    return el.scrollHeight > el.clientHeight
  }
  return false
})

const alertDetails: Ref<{text: string; value: keyof Alert; searchable?: boolean; more?: boolean}[]> = ref([
  {text: t('Severity'), value: 'severity'},
  {text: t('Description'), value: 'text'},
  {text: t('Tags'), value: 'tags', searchable: true},
  {text: t('Status'), value: 'status'},
  {text: t('Value'), value: 'value'},
  {text: t('DuplicateCount'), value: 'duplicateCount'},
  {text: t('Event'), value: 'event', searchable: true},
  {text: t('Origin'), value: 'origin', searchable: true},
  {text: t('Environment'), value: 'environment', searchable: true},
  {text: t('Resource'), value: 'resource', searchable: true},
  {text: t('Service'), value: 'service', searchable: true},
  {text: t('ReceiveTime'), value: 'receiveTime'},
  {text: t('CreateTime'), value: 'createTime', more: true},
  {text: t('LastReceiveTime'), value: 'lastReceiveTime', more: true},
  {text: t('AlertId'), value: 'id', more: true},
  {text: t('LastReceiveAlertId'), value: 'lastReceiveId', more: true},
  {text: t('Timeout'), value: 'timeout', more: true},
  {text: t('Watchers'), value: 'customTags', searchable: true, more: true}
])

const props = defineProps({showMore: {type: Boolean, required: true}})

const item = computed(() => store.state.alerts.alert)
const notes = computed(() => store.state.alerts.notes)
const alertFilter = computed(() => store.state.alerts.filter)

const queryBy = (attribute: string, value: any, shift?: boolean) => {
  if ((typeof value === 'string' && value.startsWith('http://')) || value.startsWith('https://')) {
    window.open(value, '_blank')
    return
  }
  const filter = shift
    ? {[attribute]: value}
    : {
        ...alertFilter.value,
        [attribute]: [...new Set([...(attribute in alertFilter.value ? alertFilter.value[attribute] : []), value])]
      }
  store.dispatch('filterTabs/setCurrentTab', 'user-defined')
  store.dispatch('alerts/setFilter', filter)
  router.push({path: '/alerts'})
}
const deleteNote = (alertId: string, noteId: string) => store.dispatch('alerts/deleteNote', [alertId, noteId])
</script>
