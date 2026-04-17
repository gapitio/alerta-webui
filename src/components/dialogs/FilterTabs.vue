<template>
  <v-btn
    v-has-perms="'admin:alerts'"
    prepend-icon="filter_list"
    :text="t('EditTabs')"
    variant="outlined"
    class="no-cap-btn btn"
    @click.stop="openDialog"
  />
  <v-dialog v-model="dialog" max-width="1097px" min-height="732px">
    <v-card>
      <v-card-title>
        <v-col cols="12">
          <span class="header">
            {{ t('EditTabs') }}
          </span>
        </v-col>
      </v-card-title>
      <v-card-text style="overflow-x: hidden; padding-right: 0px">
        <v-data-table-virtual
          :items="items"
          fixed-header
          :headers="headers"
          style="max-height: 70vh"
          hide-default-footer
          disable-sort
          :header-props="{style: 'box-shadow: none;'}"
          :cell-props="{class: `table-column`}"
          :row-props="rowProps"
          :sort-by="[{key: 'index'}]"
          class="table scrollbar-offset"
        >
          <template #[`item.actions`]="{index, item}">
            <v-row align="center" no-gutters align-content="end">
              <v-col cols="4">
                <filter-tab-add :item="item" @save="updateItem" :names="names.filter(v => v != item.name)" />
              </v-col>
              <v-col cols="4">
                <v-btn icon="delete" variant="text" size="x-small" @click="deleteItem(index)" />
              </v-col>
              <v-col cols="4">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-btn
                      icon="keyboard_arrow_up"
                      variant="text"
                      size="xx-small"
                      :disabled="index == 0"
                      @click="moveItem(index, index - 1)"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-btn
                      icon="keyboard_arrow_down"
                      variant="text"
                      size="xx-small"
                      :disabled="index == items.length - 1"
                      @click="moveItem(index, index + 1)"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>
          <template #[`item.filter`]="{item}">
            <v-row style="margin-top: 0px; margin-bottom: 0px; min-height: 60px" align="center">
              <template v-for="(f, d) in item.filter" :key="d">
                <v-col v-if="d == 'dateRange' && f && isDateRange(f) && f.from" cols="auto">
                  <v-chip v-if="(f.from ?? 0) < 0" variant="flat" class="chip" size="small">
                    {{ d }}: {{ f.from! / -3600 }} hours
                  </v-chip>
                  <template v-else-if="f.select">
                    <v-chip v-for="desc in ['from', 'to']" :key="desc" variant="flat" class="chip" size="small">
                      {{ d }}.{{ desc }}: &nbsp;
                      <date-time :value="moment.unix(f[desc as 'from' | 'to']!).utc()" no-break />
                    </v-chip>
                  </template>
                </v-col>
                <v-col v-else-if="typeof f == 'object' && ((f as string[])?.length ?? 0) > 0" cols="auto">
                  <v-chip variant="flat" class="chip" size="small"> {{ d }}: {{ f.join(', ') }} </v-chip>
                </v-col>
                <v-col v-else-if="typeof f == 'string'" cols="auto">
                  <v-chip variant="flat" class="chip" size="small"> {{ d }}: {{ f }} </v-chip>
                </v-col>
              </template>
            </v-row>
          </template>
        </v-data-table-virtual>
      </v-card-text>
      <v-card-actions class="dialog-card-actions">
        <v-col cols="3">
          <filter-tab-add @save="addItem" :names="names" />
        </v-col>
        <v-col cols="3">
          <v-btn variant="outlined" width="247" class="no-cap-btn btn" @click="close">
            {{ t('Cancel') }}
          </v-btn>
        </v-col>

        <v-col cols="3">
          <v-btn :disabled="!change" color="primary-600" variant="flat" class="no-cap-btn" width="247" @click="save">
            {{ t('Save') }}
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {FilterTab} from '@/plugins/store/types/filterTabs-types'
import type {DateRange} from '@/plugins/store/types/notificationHistory-types'
import moment from 'moment'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

const store: Store = useStore()
const {t} = useI18n()

const dialog = ref(false)
const isDateRange = (date: DateRange | string[]): date is DateRange => !(date instanceof Array)

const headers: {title: string; key: keyof FilterTab | 'actions'; align?: 'start' | 'center' | 'end'}[] = [
  {title: t('Name'), key: 'name'},
  {title: t('Filter'), key: 'filter'},
  {title: t('Actions'), key: 'actions', align: 'end'}
]

const deletes = ref<string[]>([])
const updates = ref<FilterTab[]>([])
const adds = ref<FilterTab[]>([])
const orderChange = ref(false)
const change = computed(
  () => deletes.value.length > 0 || updates.value.length > 0 || adds.value.length > 0 || orderChange.value
)

const store_items = computed(() => store.state.filterTabs.items)
const items = ref<FilterTab[]>([])
const names = computed(() => items.value.map(({name}) => name))

function openDialog() {
  items.value = JSON.parse(JSON.stringify(store_items.value)) as FilterTab[]
  dialog.value = true
}
function moveItem(fromIndex: number, toIndex: number) {
  orderChange.value = true
  const [item] = items.value.splice(fromIndex, 1)
  items.value.splice(toIndex, 0, item)
}

function updateItem(item: FilterTab) {
  updates.value.push(item)
}

function addItem(item: FilterTab) {
  items.value.push(item)
  adds.value.push(item)
}

function deleteItem(index: number) {
  const [item] = items.value.splice(index, 1)
  deletes.value.push(item.name)
}

function rowProps() {
  return {
    class: `bg-surface-tertiary table-row`
  }
}

async function save() {
  if (deletes.value.length > 0) await store.dispatch('filterTabs/deleteFilterTabs', deletes.value)
  if (adds.value.length > 0) await store.dispatch('filterTabs/createFilterTabs', adds.value)
  if (updates.value.length > 0) await store.dispatch('filterTabs/updateFilterTabs', updates.value)
  if (orderChange.value)
    await store.dispatch(
      'filterTabs/updateFilterTabIndexes',
      items.value.map((item, index) => ({name: item.name, index}))
    )
  close()
}

function close() {
  dialog.value = false
  deletes.value = []
  adds.value = []
  updates.value = []
  orderChange.value = false
}

const getTags = () => store.dispatch('alerts/getTags')
const getEnvironments = () => store.dispatch('alerts/getEnvironments')
const getServices = () => store.dispatch('alerts/getServices')

const getData = () => {
  getTags()
  getEnvironments()
  getServices()
}
getData()
</script>
