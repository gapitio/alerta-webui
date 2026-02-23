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
        <v-col v-if="detail.value === 'severity'" cols="9">
          <v-chip label size="small" class="chip" :class="[item.previousSeverity]">
            {{ filters.capitalize(item?.previousSeverity) }}
          </v-chip>
          &nbsp;&rarr;&nbsp;
          <v-chip label size="small" class="chip" :class="[item.severity]">
            {{ filters.capitalize(item?.severity) }}
          </v-chip>
        </v-col>
        <v-col v-else-if="['tags', 'customTags'].includes(detail.value)" cols="9">
          <v-chip
            v-for="tag in item[detail.value]"
            :key="tag"
            class="chip"
            variant="flat"
            @click="queryBy(detail.value, tag)"
          >
            {{ filters.capitalize(tag) }}
          </v-chip>
        </v-col>
        <v-col v-else-if="detail.value.includes('Time')" cols="auto">
          <date-time v-if="item[detail.value]" :value="item[detail.value]" hide-tooltip no-break format="longDate" />
        </v-col>
        <v-col v-else-if="detail.searchable" cols="9">
          <div v-if="typeof item[detail.value] === 'object'">
            <v-row style="width: fit-content" dense>
              <v-col
                v-for="i in item[detail.value]"
                :key="i"
                cols="auto"
                class="clickable"
                @click="queryBy(detail.value, item[detail.value])"
              >
                {{ i }}
              </v-col>
            </v-row>
          </div>
          <span v-else class="clickable" @click="queryBy(detail.value, item[detail.value])">
            {{ item[detail.value] }}
          </span>
        </v-col>
        <v-col v-else-if="detail.value == 'text'" cols="9" style="white-space: pre-wrap">
          {{ item[detail.value] }}
        </v-col>
        <v-col v-else cols="9">
          {{ item[detail.value] }}
        </v-col>
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
        <span class="clickable" @click="queryBy(`_.${key}`, value)">{{ value }}</span>
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
  {text: t('Correlate'), value: 'correlate', searchable: true, more: true},
  {text: t('Type'), value: 'type', more: true},
  {text: t('Watchers'), value: 'customTags', searchable: true, more: true}
])

const props = defineProps({showMore: {type: Boolean, required: true}})

const item = computed(() => store.state.alerts.alert)
const notes = computed(() => store.state.alerts.notes)

const queryBy = (attribute: string, value: any) => router.push({path: '/alerts', query: {q: `${attribute}:${value}`}})
const deleteNote = (alertId: string, noteId: string) => store.dispatch('alerts/deleteNote', [alertId, noteId])
</script>
