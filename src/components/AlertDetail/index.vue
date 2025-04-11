<template>
    <v-card
      flat
    >
      <v-card
        tile
        flat
      >
        <v-toolbar
          density="compact"
        >
          <v-btn
            icon="mdi-arrow-left"
            @click="$router.push($route.query.redirect || '/alerts')"
          />
  
          <v-btn
            :disabled="!isAcked(item.status) && !isClosed(item.status)"
            icon
            @click="takeAction(item.id, 'open')"
          >
            <v-icon icon="mdi-refresh" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Open')"
            />
          </v-btn>
          
          <v-btn
            v-show="!isWatched(item.tags)"
            icon
            @click="watchAlert(item.id)"
          >
            <v-icon icon="mdi-eye" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Watch')"
            />
          </v-btn>
          
          <v-btn
            v-show="isWatched(item.tags)"
            icon
            @click="unwatchAlert(item.id)"
          >
            <v-icon icon="mdi-eye-off" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Unwatch')"
            />
          </v-btn>
          
          <v-btn
            v-show="!isAcked(item.status)"
            :disabled="!isOpen(item.status)"
            icon
            @click="ackAlert(item.id)"
          >
            <v-icon icon="mdi-check" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Ack')"
            />
          </v-btn>
          
          <v-btn
            v-show="isAcked(item.status)"
            icon
            @click="takeAction(item.id, 'unack')"
          >
            <v-icon icon="mdi-undo" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Unack')"
            />
          </v-btn>
          
          <v-btn
            v-show="!isShelved(item.status)"
            :disabled="!isOpen(item.status) && !isAcked(item.status)"
            icon
            @click="shelveAlert(item.id)"
          >
            <v-icon icon="mdi-clock" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Shelve')"
            />
          </v-btn>
          
          <v-btn
            v-show="isShelved(item.status)"
            icon
            @click="takeAction(item.id, 'unshelve')"
          >
            <v-icon icon="mdi-restore" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Unshelve')"
            />
          </v-btn>
          
          <v-btn
            v-if="isAlertAlarmModel()"
            :disabled="isClosed(item.status)"
            icon
            @click="takeAction(item.id, 'close')"
          >
            <v-icon icon="mdi-close-circle-outline" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Close')"
            />
          </v-btn>
          
          <v-btn
            v-if="haveDeleteScope()"
            icon
            @click="deleteAlert(item.id)"
          >
            <v-icon icon="mdi-delete" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="$t('Delete')"
            />
          </v-btn>
          
          <v-btn
            :key="copyIconText"
            icon
            @click="clipboardCopy(item)"
          >
            <v-icon icon="mdi-content-copy" />
            <v-tooltip
              location="bottom"
              activator="parent"
              :text="copyIconText"
            />
          </v-btn>
        </v-toolbar>
  
        <v-card>
          <v-tabs
            v-model="active"
            grow
          >
            <v-tab value="detail">
              <v-icon
                size="x-large"
                icon="mdi-information"
              />
              &nbsp;
              {{ $t('Details') }}
            </v-tab>
            <v-tab value="history">
              <v-icon
                icon="mdi-history"
                size="x-large"
              />
              &nbsp;
              {{ $t('History') }}
            </v-tab>
            <v-tab value="data">
              <v-icon
                icon="mdi-chart-box"
                size="x-large" 
              /> 
              &nbsp;
              {{ $t('Data') }}
            </v-tab>
          </v-tabs>
          <v-tabs-window v-model="active">
            <v-tabs-window-item
              value="detail"
              :transition="false"
              :reverse-transition="false"
            >
             <detail :id="id"/>
            </v-tabs-window-item>
  
            <v-tabs-window-item
              value="history"
              :transition="false"
              :reverse-transition="false"
            >
              <history :item="item" />
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
                  <span class="console-text">{{ item.rawData || 'no raw data' }}</span>
                </v-card-text>
              </v-card>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
        <actions 
          v-if="item.id"
          :id="item.id"
          :status="item.status"
          :is-watched="isWatched(item.tags)"
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
  
<script lang="ts">
  import debounce from 'lodash/debounce'
  
  export default {
    components: {
    },
    props: {
      id: {
        type: String,
        required: true
      }
    },
    data: (a) => ({
      sheet: false,
      active: null,
      alertDetails: [
        {text: a.$t('AlertId'), value: 'id'},
        {text: a.$t('LastReceiveAlertId'), value: 'lastReceiveId'},
        {text: a.$t('CreateTime'), value: 'createTime'},
        {text: a.$t('ReceiveTime'), value: 'receiveTime'},
        {text: a.$t('LastReceiveTime'), value: 'lastReceiveTime'},
        {text: a.$t('Service'), value: 'service', searchable: true},
        {text: a.$t('Environment'), value: 'environment', searchable: true},
        {text: a.$t('Resource'), value: 'resource', searchable: true},
        {text: a.$t('Event'), value: 'event', searchable: true},
        {text: a.$t('Correlate'), value: 'correlate', searchable: true},
        {text: a.$t('Group'), value: 'group', searchable: true},
        {text: a.$t('Severity'), value: 'severity'},
        {text: a.$t('Status'), value: 'status'},
        {text: a.$t('Value'), value: 'value'},
        {text: a.$t('Text'), value: 'text'},
        {text: a.$t('TrendIndication'), value: 'trendIndication'},
        {text: a.$t('Timeout'), value: 'timeout'},
        {text: a.$t('Type'), value: 'type'},
        {text: a.$t('DuplicateCount'), value: 'duplicateCount'},
        {text: a.$t('Repeat'), value: 'repeat'},
        {text: a.$t('Origin'), value: 'origin', searchable: true},
        {text: a.$t('Tags'), value: 'tags', searchable: true},
      ],
      copyIconText: a.$t('Copy')
    }),
    computed: {
      isDark() {
        return this.$store.getters.getPreference('isDark')
      },
      item() {
        return this.$store.state.alerts.alert
      },
      actions() {
        return this.$config.actions
      },
      notes() {
        return this.$store.state.alerts.notes
      },
      // DEPRECATED: notes stored in alert history are deprecated and will be removed in version 8
      historyNotes() {
        return this.history
          .filter(h => h.type == 'note' && h.id == this.id)  // get notes from alert history
      },
      statusNote() {
        return this.history.filter(h => h.type != 'note' && h.status == this.item.status).pop()
      },
      headersByScreenSize() {
        return this.headers.filter(
          h => !h.hide || !this.$vuetify.breakpoint[h.hide]
        )
      },
      ackTimeout() {
        return this.$store.getters.getPreference('ackTimeout')
      },
      shelveTimeout() {
        return this.$store.getters.getPreference('shelveTimeout')
      },
      username() {
        return this.$store.getters['auth/getUsername']
      },
      refresh() {
        return this.$store.state.refresh
      }
    },
    watch: {
      refresh(val) {
        if (val) {
          this.getAlert(this.id)
          this.getNotes(this.id)
        }
      }
    },
    created() {
      this.getAlert(this.id)
      this.getNotes(this.id)
    },
    methods: {
      getAlert() {
        this.$store.dispatch('alerts/getAlert', this.id)
      },
      getNotes() {
        this.$store.dispatch('alerts/getNotes', this.id)
      },
      haveDeleteScope(){
        const scopes = this.$store.getters['auth/scopes']
        if (this.$config.delete_alert_scope_enforced) return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('delete:alerts')
        else return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('write') || scopes.includes('write:alerts') || scopes.includes('delete:alerts')
      },
      isAlertAlarmModel(){
        return !this.$config.alarm_model.name.includes('ISA 18')
      },
      isOpen(status) {
        return status == 'open' || status == 'NORM' || status == 'UNACK' || status == 'RTNUN' || status == 'unack'
      },
      isWatched(tags) {
        const tag = `watch:${this.username}`
        return tags ? tags.indexOf(tag) > -1 : false
      },
      isAcked(status) {
        return status == 'ack' || status == 'ACKED'
      },
      isShelved(status) {
        return status == 'shelved' || status == 'SHLVD'
      },
      isClosed(status) {
        return status == 'closed'
      },
      deleteNote(alertId, noteId) {
        this.$store.dispatch('alerts/deleteNote', [alertId, noteId])
      },
      takeAction: debounce(function(id, action, text) {
        this.$store
          .dispatch('alerts/takeAction', [id, action, text])
          .then(() => this.getAlert(this.id))
      }, 200, {leading: true, trailing: false}),
      ackAlert: debounce(function(id, text) {
        this.$store
          .dispatch('alerts/takeAction', [id, 'ack', text, this.ackTimeout])
          .then(() => this.getAlert(this.id))
      }, 200, {leading: true, trailing: false}),
      shelveAlert: debounce(function(id, text) {
        this.$store
          .dispatch('alerts/takeAction', [id, 'shelve', text, this.shelveTimeout])
          .then(() => this.getAlert(this.id))
      }, 200, {leading: true, trailing: false}),
      watchAlert: debounce(function(id) {
        this.$store
          .dispatch('alerts/watchAlert', id)
          .then(() => this.getAlert(this.id))
      }, 200, {leading: true, trailing: false}),
      unwatchAlert: debounce(function(id) {
        this.$store
          .dispatch('alerts/unwatchAlert', id)
          .then(() => this.getAlert(this.id))
      }, 200, {leading: true, trailing: false}),
      addNote: debounce(function(id, text) {
        this.$store
          .dispatch('alerts/addNote', [id, text])
          .then(() => this.getNotes(this.id))
      }, 200, {leading: true, trailing: false}),
      deleteAlert: debounce(function(id) {
        confirm(a.$t('ConfirmDelete')) &&
          this.$store.dispatch('alerts/deleteAlert', id)
            .then(() => this.$router.push({ name: 'alerts' }))
      }, 200, {leading: true, trailing: false}),
      queryBy(attribute, value) {
        this.$router.push({ path: "/alerts", query: {q: `${attribute}:${value}`} })  // double-quotes (") around value mean exact match
      },
      clipboardCopy(item) {
        this.copyIconText = this.$t('Copied')
  
        const renderedText = this.$config.clipboard_template
  
        const text = JSON.stringify(item, null, 4)
        const textarea = document.createElement('textarea')
  
        textarea.textContent = renderedText || text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setTimeout(() => {
          this.copyIconText = this.$t('Copy')
        }, 2000)
      }
    }
  }
  </script>
  
<style>
  
  .console-text {
    font-size: 14px;
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
    white-space: pre;
    line-height: 1;
  }
  

  .label-critical {
    background-color: #b94a48;
  }

  .label-major {
    background-color: #f89406;
  }

  .label-minor {
    background-color: #ffd700;
    color: black
  }

  .label-warning {
    background-color: #3a87ad;
  }

  .label-normal,
  .label-cleared,
  .label-ok,
  .label-informational {
    background-color: #468847;
  }
</style>
  