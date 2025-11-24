<template>
  <v-card>
    <h1>
      <v-btn icon="arrow_back" variant="text" @click="router.back()" />
      {{ t('NotificationRuleHistory') }}: {{ rule?.name ?? rule?.id }}
    </h1>
    <g-switch v-model="showAllData" :label="t('ShowAllData')" />
    <v-data-table-server
      v-model:items-per-page="pagination.itemsPerPage"
      fixed-header
      :loading="isLoading"
      style="max-height: calc(99vh - calc(48px + 43px + 64px))"
      :items-length="pagination.totalItems!"
      :items-per-page-options="pagination.itemsPerPageOptions"
      :items="history"
      :row-props="{class: 'bg-surface-tertiary table-row'}"
      :cell-props="{class: 'table-column'}"
      :headers="headers"
      class="table"
      @update:options="setPagination"
    >
      <template #[`item.createTime`]="{item}">
        <div v-if="item.createTime">
          <span style="white-space: nowrap">{{
            filters.date(item.createTime, 'local', store.getters.getConfig('dates').mediumDate)
          }}</span>
          <br />
          ({{ filters.until(item.createTime) }})
        </div>
      </template>
      <template #[`item.data.reactivate`]="{item}">
        <div v-if="item.data.reactivate">
          <span style="white-space: nowrap">{{
            filters.date(item.data.reactivate, 'local', store.getters.getConfig('dates').mediumDate)
          }}</span>
          <br />
          ({{ filters.until(item.data.reactivate) }})
        </div>
      </template>
      <template v-for="desc in ['service', 'receivers', 'days']" #[`item.data.${desc}`]="{item}">
        {{ item.data[desc as 'service']?.join(', ') }}
      </template>
      <template v-for="desc in ['active', 'useOnCall']" #[`item.data.${desc}`]="{item}">
        <v-icon
          v-if="item.data[desc as 'active' | 'useOnCall'] !== undefined"
          :key="desc"
          :color="item.data[desc as 'active' | 'useOnCall'] ? 'primary-600' : 'disabled'"
        >
          {{ item.data[desc as 'active' | 'useOnCall'] ? 'check_box' : 'check_box_outline_blank' }}
        </v-icon>
      </template>
      <template #[`item.data.triggers`]="{item}">
        <v-row v-for="(trigger, index) in item.data.triggers" :key="JSON.stringify(trigger)">
          <v-col v-if="trigger.from_severity.length > 0">
            From:
            {{ trigger.from_severity.join(', ') }}
          </v-col>
          <v-col v-if="trigger.to_severity.length > 0">
            To:
            {{ trigger.to_severity.join(', ') }}
          </v-col>
          <v-col v-if="trigger.status?.length ?? 0 > 0">
            Status:
            {{ trigger.status?.join(', ') }}
          </v-col>
          <v-col v-if="trigger.text">
            Text:
            {{ trigger.text }}
          </v-col>
          <v-divider v-if="index < (item.data.triggers?.length ?? 0) - 1" />
        </v-row>
      </template>
      <template v-for="tagItem in ['tags', 'excludedTags']" #[`item.data.${tagItem}`]="{item}">
        <v-row
          v-for="(tag, index) in item.data[tagItem as 'tags' | 'excludedTags']"
          :key="JSON.stringify(tag)"
          no-gutters
        >
          <v-col v-if="tag.all.length > 0">
            All:
            {{ tag.all.join(', ') }}
          </v-col>
          <v-col v-if="tag.any.length > 0">
            Any:
            {{ tag.any.join(', ') }}
          </v-col>
          <v-divider v-if="index < (item.data[tagItem as 'tags' | 'excludedTags']?.length ?? 0) - 1" />
        </v-row>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup lang="ts">
import {useFilters} from '@/filters'
import router from '@/plugins/router'
import type {Store} from '@/plugins/store/types'
import type {Pagination} from '@/plugins/store/types/alerts-types'
import type {NotificationRule} from '@/plugins/store/types/notificationRule-types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Notification Rule',
    requiresAuth: true
  }
})

const {t} = useI18n()
const store: Store = useStore()
const route = useRoute()
const filters = useFilters()

const showAllData = ref(false)
const isLoading = computed(() => store.state.notificationRules.isLoadingHistory)

interface Header {
  title: string
  key?: string
  align?: 'center'
  sortable?: false
  children?: Header[]
}
const headers = ref<Header[]>([
  {title: t('User'), key: 'user', sortable: false},
  {title: t('Type'), key: 'type', sortable: false},
  {
    title: t('CreateTime'),
    key: 'createTime',
    sortable: false
  },
  {
    title: t('Data'),
    align: 'center',
    children: [
      {title: t('Active'), key: 'data.active', sortable: false},
      {title: t('Reactivate'), key: 'data.reactivate', sortable: false},
      {title: t('Delay'), key: 'data.delay', sortable: false},
      {title: t('Name'), key: 'data.name', sortable: false},
      {title: t('Environment'), key: 'data.environment', sortable: false},
      {title: t('Channel'), key: 'data.channelId', sortable: false},
      {title: t('Receivers'), key: 'data.receivers', sortable: false},
      {title: t('OnCall'), key: 'data.useOnCall', sortable: false},
      {title: t('Triggers'), key: 'data.triggers', sortable: false},
      {title: t('Days'), key: 'data.days', sortable: false},
      {title: t('Start'), key: 'data.startTime', sortable: false},
      {title: t('End'), key: 'data.endTime', sortable: false},
      {title: t('Service'), key: 'data.service', sortable: false},
      {title: t('Resource'), key: 'data.resource', sortable: false},
      {title: t('Event'), key: 'data.event', sortable: false},
      {title: t('Group'), key: 'data.group', sortable: false},
      {title: t('Tags'), key: 'data.tags', sortable: false},
      {title: t('ExcludedTags'), key: 'data.excludedTags', sortable: false},
      {title: 'Text', key: 'data.text', sortable: false}
    ]
  }
])
const history = computed(() => {
  const history = store.state.notificationRules.history
  if (showAllData.value) return history
  let previousData: Partial<NotificationRule> = {}
  return history.map((b, i) => {
    if (i !== 0) {
      const data: Partial<NotificationRule> = {}
      for (const key in b.data) {
        const k = key as keyof NotificationRule
        if (JSON.stringify(previousData[k]) !== JSON.stringify(b.data[k])) (data[k] as any) = b.data[k] as any
      }
      previousData = {...b.data}
      return {...b, data}
    } else {
      previousData = {...b.data}
      return {...b}
    }
  })
})

const rule = computed(() => store.state.notificationRules.item)

const pagination = computed({
  get: () => store.getters['notificationRules/historyPagination'],
  set: value => store.dispatch('notificationRules/setHistoryPagination', value)
})

function getHistory() {
  store.dispatch('notificationRules/getNotificationRuleHistory', route.params.id as string)
}

function getNotificationRule() {
  store.dispatch('notificationRules/getNotificationRule', route.params.id as string)
}

function setPagination(value: Pagination) {
  store.dispatch('notificationRules/setHistoryPagination', value)
  getHistory()
}

getHistory()
getNotificationRule()
</script>
