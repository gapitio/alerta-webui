<template>
  <v-btn class="no-cap-btn btn" variant="outlined" width="247" @click.stop="openDialog">
    {{ t('ShowAlerts') }}
  </v-btn>
  <v-dialog v-model="dialog" scrollable max-width="90vw">
    <v-card>
      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="pagination.itemsPerPage"
          fixed-header
          style="max-height: 85vh"
          :row-props="{class: 'bg-surface-tertiary table-row'}"
          :cell-props="{class: 'table-column'}"
          :headers="headers"
          :items="alerts"
          :loading="alertsIsLoading"
          :items-length="pagination.totalItems!"
          :items-per-page-options="pagination.itemsPerPageOptions"
          disable-initial-sort
          class="table"
          @update:options="setPagination"
        />
      </v-card-text>
      <v-card-actions class="dialog-card-actions">
        <v-col cols="12">
          <v-btn variant="outlined" width="500" class="no-cap-btn btn" @click="dialog = false">
            {{ t('Close') }}
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import type {Pagination} from '@/plugins/store/types/alerts-types'
import type {NotificationRule} from '@/plugins/store/types/notificationRule-types'
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

const {t} = useI18n()
const store: Store = useStore()

const props = defineProps<{rule: Partial<NotificationRule>}>()

const headers = [
  {title: t('Environment'), value: 'environment', sortable: false},
  {title: t('Service'), value: 'service', sortable: false},
  {title: t('Resource'), value: 'resource', sortable: false},
  {title: t('Event'), value: 'event', sortable: false},
  {title: t('Group'), value: 'group', sortable: false},
  {title: t('Tags'), value: 'tags', sortable: false},
  {title: 'Full_Tag', value: 'attributes.Full_tag', sortable: false},
  {title: t('Description'), value: 'text', sortable: false}
]

const alerts = computed(() => store.state.notificationRules.alerts)
const alertsIsLoading = computed(() => store.state.notificationRules.isLoadingAlerts)

const pagination = computed({
  get: () => store.state.notificationRules.alertsPagination,
  set: value => store.dispatch('notificationRules/setAlertsPagination', value)
})

const openDialog = async () => {
  if (props.rule.environment && props.rule.channelId) {
    await getAlerts()
    dialog.value = true
  }
}

const getAlerts = async () => await store.dispatch('notificationRules/getAlerts', props.rule)

function setPagination(value: Pagination) {
  pagination.value = value
  getAlerts()
}

const dialog = ref(false)
</script>
