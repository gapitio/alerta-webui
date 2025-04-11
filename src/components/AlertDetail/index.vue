<template>
  <v-card
    flat
  >
    <v-card
      tile
      flat
    >
      <h1>{{ t('Alert') }}</h1>
      <v-btn
        variant="text"
        icon="arrow_back"
        @click="router.push(route.query.redirect as string || '/alerts')"
      />

      <v-btn
        :disabled="!isAcked(item?.status!) && !isClosed(item?.status!)"
        variant="text"
        icon
        @click="takeAction(item?.id!, 'open')"
      >
        <v-icon icon="refresh" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Open')"
        />
      </v-btn>
      
      <v-btn
        v-show="!isWatched(item?.customTags!)"
        variant="text"
        icon
        @click="watchAlert(item?.id!)"
      >
        <v-icon icon="visibility" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Watch')"
        />
      </v-btn>
      
      <v-btn
        v-show="isWatched(item?.customTags!)"
        variant="text"
        icon
        @click="unwatchAlert(item?.id!)"
      >
        <v-icon icon="visibility_off" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Unwatch')"
        />
      </v-btn>
      
      <v-btn
        v-show="!isAcked(item?.status!)"
        :disabled="!isOpen(item?.status!)"
        variant="text"
        icon
        @click="ackAlert(item?.id!, '')"
      >
        <v-icon icon="check" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Ack')"
        />
      </v-btn>
      
      <v-btn
        v-show="isAcked(item?.status!)"
        variant="text"
        icon
        @click="takeAction(item?.id!, 'unack', '')"
      >
        <v-icon icon="undo" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Unack')"
        />
      </v-btn>
      
      <v-btn
        v-show="!isShelved(item?.status!)"
        :disabled="!isOpen(item?.status!) && !isAcked(item?.status!)"
        variant="text"
        icon
        @click="shelveAlert(item?.id!)"
      >
        <v-icon icon="schedule" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Shelve')"
        />
      </v-btn>
      
      <v-btn
        v-show="isShelved(item?.status!)"
        variant="text"
        icon
        @click="takeAction(item?.id!, 'unshelve')"
      >
        <v-icon icon="restore" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Unshelve')"
        />
      </v-btn>
      
      <v-btn
        v-if="isAlertAlarmModel()"
        :disabled="isClosed(item?.status!)"
        variant="text"
        icon
        @click="takeAction(item?.id!, 'close')"
      >
        <v-icon icon="cancel" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Close')"
        />
      </v-btn>
      
      <v-btn
        v-if="haveDeleteScope()"
        variant="text"
        icon
        @click="deleteAlert(item?.id!)"
      >
        <v-icon icon="delete" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="t('Delete')"
        />
      </v-btn>
      
      <v-btn
        :key="copyIconText"
        variant="text"
        icon
        @click="clipboardCopy(item)"
      >
        <v-icon icon="content_copy" />
        <v-tooltip
          location="bottom"
          activator="parent"
          :text="copyIconText"
        />
      </v-btn>

      <v-card>
        <v-tabs
          v-model="active"
          grow
          slider-color="link-active"
        >
          <v-tab value="detail">
            <v-icon
              size="x-large"
              icon="info"
            />
            &nbsp;
            {{ t('Details') }}
          </v-tab>
          <v-tab value="history">
            <v-icon
              icon="history"
              size="x-large"
            />
            &nbsp;
            {{ t('History') }}
          </v-tab>
          <v-tab value="data">
            <v-icon
              icon="analytics"
              size="x-large" 
            /> 
            &nbsp;
            {{ t('Data') }}
          </v-tab>
        </v-tabs>
        <v-tabs-window v-model="active">
          <v-tabs-window-item
            value="detail"
            :transition="false"
            :reverse-transition="false"
            style="max-height: 80vh; overflow: auto;"
          >
            <detail />
          </v-tabs-window-item>

          <v-tabs-window-item
            value="history"
            :transition="false"
            :reverse-transition="false"
          >
            <history :alert="item" />
          </v-tabs-window-item>
          <v-tabs-window-item
            value="data"
            :transition="false"
            :reverse-transition="false"
          >
            <v-card
              color=""
              class="mx-1"
              style="overflow-x: auto;"
              flat
            >
              <v-card-text>
                <span class="console-text">{{ item?.rawData || 'no raw data' }}</span>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
      <note-add 
        v-if="item?.id"
        :id="item.id"
        :status="item?.status"
        :is-watched="isWatched(item?.tags)"
        @take-action="takeAction"
        @ack-alert="ackAlert"
        @shelve-alert="shelveAlert"
        @watch-alert="watchAlert"
        @unwatch-alert="unwatchAlert"
        @add-note="addNote"
        @delete-alert="deleteAlert"
      />
    </v-card>
  </v-card>
</template>

<script lang="ts" setup>
import debounce from 'lodash/debounce'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Store } from '@/plugins/store/types'
import { useRoute, useRouter } from 'vue-router'
import type { Alert } from '@/plugins/store/types/alerts-types'
import { useStore } from 'vuex'

const store: Store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const active= ref(false)

const copyIconText = ref(t('Copy'))

const item = computed(() => store.state.alerts.alert)
const ackTimeout = computed(() => store.getters.getPreference('ackTimeout'))
const shelveTimeout = computed(() => store.getters.getPreference('shelveTimeout'))
const username = computed(() => store.getters['auth/getUsername'])
const timeout = ref<number | undefined>(undefined)
const interval = computed(() => store.getters.getPreference('refreshInterval'))

const refresh = () => {
  if(timeout.value) clearTimeout(timeout.value)
  getAlert()
  getNotes()
  timeout.value = setTimeout(refresh, interval.value)
}
function getAlert() {
  store.dispatch('alerts/getAlert', props.id)
}

function getNotes() {
  store.dispatch('alerts/getNotes', props.id)
  getAlert()
}

function haveDeleteScope(){
  const scopes = store.getters['auth/scopes']
  if (store.state.config.delete_alert_scope_enforced) return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('delete:alerts')
  else return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('write') || scopes.includes('write:alerts') || scopes.includes('delete:alerts')
}

function isAlertAlarmModel(){
  return !store.state.config.alarm_model.name.includes('ISA 18')
}

function isOpen(status: string) {
  return status == 'open' || status == 'NORM' || status == 'UNACK' || status == 'RTNUN' || status == 'unack'
}

function isWatched(tags: string[]) {
  const tag = `watch:${username.value}`
  return tags ? tags.indexOf(tag) > -1 : false
}

function isAcked(status: string) {
  return status == 'ack' || status == 'ACKED'
}

function isShelved(status: string) {
  return status == 'shelved' || status == 'SHLVD'
}

function isClosed(status: string) {
  return status == 'closed'
}

const takeAction = debounce((id: string, action: string, text?: string) => {
  store.dispatch('alerts/takeAction', [id, action, text ?? ''])
  .then(() => getAlert())
}, 200, {leading: true, trailing: false})

const ackAlert = debounce((id: string, text: string) => {
  store.dispatch('alerts/takeAction', [id, 'ack', text, ackTimeout.value!])
  .then(() => getAlert())
}, 200, {leading: true, trailing: false})

const shelveAlert = debounce((id: string, text?: string) => {
  store.dispatch('alerts/takeAction', [id, 'shelve', text ?? '', shelveTimeout.value!])
  .then(() => getAlert())
}, 200, {leading: true, trailing: false})

const watchAlert = debounce((id: string) => {
  store.dispatch('alerts/watchAlert', id)
  .then(() => getAlert())
}, 200, {leading: true, trailing: false})

const unwatchAlert = debounce((id: string) => {
  store.dispatch('alerts/unwatchAlert', id)
  .then(() => getAlert())
}, 200, {leading: true, trailing: false})

const addNote = debounce((id: string, text: string) => {
  store.dispatch('alerts/addNote', [id, text])
  .then(() => getNotes())
}, 200, {leading: true, trailing: false})

const deleteAlert = debounce((id: string) => {
  confirm(t('ConfirmDelete'))  && store.dispatch('alerts/deleteAlert', id)
  .then(() => router.push({ name: 'alerts' }))
}, 200, {leading: true, trailing: false})

function clipboardCopy(item: Alert | null) {
  copyIconText.value = t('Copied')

  const renderedText = store.state.config.clipboard_template

  const text = JSON.stringify(item, null, 4)
  const textarea = document.createElement('textarea')

  textarea.textContent = renderedText || text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  setTimeout(() => {
    copyIconText.value = t('Copy')
  }, 2000)
}

refresh()
</script>

  