<template>
  <v-data-table-server
    v-model:items-per-page="pagination.rowsPerPage"
    v-model="selected"
    show-select
    :headers="customHeaders"
    :items="alerts"
    :items-length="pagination.totalItems"
    :items-per-page-options="pagination.rowsPerPageItems"
    :loading="isSearching"
    :row-props="rowProps"
    multi-sort
    density="compact"
    sort-desc-icon="mdi-menu-down"
    sort-asc-icon="mdi-menu-up"
    class="alert-table h-100"
    @update:options="setPagination"
  >
    <template
      v-for="timeObj in ['lastReceiveTime', 'createTime', 'receiveTime']"
      :key="timeObj"
      #[`item.${timeObj}`]="{item}"
    >
      <date-time :value="item[timeObj]" />
    </template>
    <template #[`item.timeout`]="{item}">
      {{ $filters.hhmmss(item.timeout) }}
    </template>
    <template #[`item.timeoutLeft`]="{item}">
      {{ $filters.hhmmss(timeoutLeft(item)) }}
    </template>
    <template #[`item.severity`]="{item}">
      <v-chip
        :color="severityColor(item.severity, 'open')"
        label
        variant="elevated"
        size="small"
      >
        {{ item.severity }}
      </v-chip>
    </template>
    <template #[`item.status`]="{item}">
      <v-chip 
        label
        variant="elevated"
        size="small"
      >
        {{ item.status }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{item}">
      <div
        class="action-buttons"
      >
        <v-btn
          v-if="isAcked(item.status) || isClosed(item.status)"
          density="compact"
          variant="text"
          icon="mdi-refresh"
          @click.stop="takeAction(item.id, 'open')"
        />
        <v-btn
          v-if="!isWatched(item.tags)"
          density="compact"
          variant="text"
          icon="mdi-eye"
          @click.stop="watchAlert(item.id)"
        />
        <v-btn
          v-if="isWatched(item.tags)"
          density="compact"
          variant="text"
          icon="mdi-eye-off"
          @click.stop="unwatchAlert(item.id)"
        />
        <v-btn
          v-if="isOpen(item.status)"
          density="compact"
          variant="text"
          icon="mdi-check"
          @click.stop="ackAlert(item.id)"
        />
        <v-btn
          v-if="isAcked(item.status)"
          density="compact"
          variant="text"
          icon="mdi-undo"
          @click.stop="takeAction(item.id, 'unack')"
        />
        <v-btn
          v-if="isOpen(item.status) || isAcked(item.status)"
          density="compact"
          variant="text"
          icon="mdi-clock"
          @click.stop="shelveAlert(item.id)"
        />
        <v-btn
          v-if="isShelved(item.status)"
          density="compact"
          variant="text"
          icon="mdi-restore"
          @click.stop="takeAction(item.id, 'unshelve')"
        />
        <v-btn
          v-if="!isClosed(item.status) && isAlertAlarmModel()"
          density="compact"
          variant="text"
          icon="mdi-close-circle-outline"
          @click.stop="takeAction(item.id, 'close')"
        />
        <v-btn
          v-if="haveDeleteScope()"
          density="compact"
          variant="text"
          icon="mdi-delete"
          @click.stop="deleteAlert(item.id)"
        />
      </div>
    </template>            
  </v-data-table-server>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import moment from 'moment'

export default {
  props: {
    filter: {
      type: Object,
      required: true
    }
  },
  data: a => ({
    search: '',
    headersMap: {
      id: { title: a.$t('AlertId'), key: 'id' },
      resource: { title: a.$t('Resource'), key: 'resource' },
      event: { title: a.$t('Event'), key: 'event' },
      environment: { title: a.$t('Environment'), key: 'environment' },
      severity: { title: a.$t('Severity'), key: 'severity' },
      correlate: { title: a.$t('Correlate'), key: 'correlate' },
      status: { title: a.$t('Status'), key: 'status' },
      service: { title: a.$t('Service'), key: 'service' },
      group: { title: a.$t('Group'), key: 'group' },
      value: { title: a.$t('Value'), value: 'value', class: 'value-header' },
      tags: { title: a.$t('Tags'), key: 'tags' },
      attributes: { title: a.$t('Attribute'), key: 'attributes' },
      origin: { title: a.$t('Origin'), key: 'origin' },
      type: { title: a.$t('Type'), key: 'type' },
      createTime: { title: a.$t('CreateTime'), key: 'createTime' },
      timeout: { title: a.$t('Timeout'), key: 'timeout' },
      timeoutLeft: { title: a.$t('TimeoutLeft'), key: 'timeoutLeft' },
      customer: { title: a.$t('Customer'), key: 'customer' },
      duplicateCount: { title: a.$t('Dupl'), key: 'duplicateCount', },
      repeat: { title: a.$t('Repeat'), key: 'repeat' },
      previousSeverity: { title: a.$t('PrevSeverity'), key: 'previousSeverity' },
      trendIndication: { title: a.$t('TrendIndication'), key: 'trendIndication' },
      receiveTime: { title: a.$t('ReceiveTime'), key: 'receiveTime' },
      duration: { title: a.$t('Duration'), key: 'duration' },
      lastReceiveId: { title: a.$t('LastReceiveId'), key: 'lastReceiveId', headerProps: {class:"text-no-wrap"} },
      lastReceiveTime: { title: a.$t('LastReceiveTime'), key: 'lastReceiveTime', headerProps: {class:'text-no-wrap'}},
      text: { title: a.$t('Description'), key: 'text' },
      note: { title: a.$t('LastNote'), key: 'note', sortable: false },
      actions: { title: a.$t('Actions'), key: 'actions', sortable: false, },

    },
    details: false,
    selectedId: null,
    multiselect: false,
    timer: null
  }),
  computed: {
    alerts() {
      if (this.filter.text) {
        return this.$store.getters['alerts/alerts']
          .filter(alert =>
            Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
          )
      } else {
        return this.$store.getters['alerts/alerts'].map((b) => { return {...b, service: b.service.join(', ')}})
      }
    },
    displayDensity() {
      return (
        this.$store.getters.getPreference('displayDensity') ||
        this.$store.state.alerts.displayDensity
      )
    },
    fontStyle() {
      const font = this.$store.getters.getPreference('font')
      return {
        'font-family': font['font-family'],
        'font-size': font['font-size'],
        'font-weight': font['font-weight']
      }
    },
    fontSize() {
      return this.$store.getters.getPreference('font')['font-size']
    },
    columnWidths() {
      return {
        '--value-width': this.valueWidth() + 'px',
        '--text-width': this.textWidth() + 'px'
      }
    },
    isLoading() {
      return this.$store.state.alerts.isLoading
    },
    isSearching() {
      return this.$store.state.alerts.isSearching ? 'primary' : false
    },
    showNotesIcon() {
      return this.$store.getters.getPreference('showNotesIcon')
    },
    rowsPerPage() {
      return this.$store.getters.getPreference('rowsPerPage')
    },
    pagination() {
      return this.$store.state.alerts.pagination
    },
    actions() {
      return this.$config.actions
    },
    customHeaders() {
      const configHeaders = this.$config.columns.map(c =>
        this.headersMap[c] || { text: this.$options.filters.capitalize(c), value: 'attributes.' + c }
      )
      
      return [...configHeaders, this.headersMap.actions]
    },
    selectedItem() {
      return this.alerts.filter(a => a.id == this.selectedId)[0]
    },
    selectableRows() {
      return this.selected.length > 0
    },
    selected: {
      get() {
        return this.$store.state.alerts.selected
      },
      set(value) {
        this.$store.dispatch('alerts/updateSelected', value)
      }
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  watch: {
    rowsPerPage(val) {
      this.pagination = Object.assign({}, this.pagination, {rowsPerPage: val})
    }
  },
  methods: {
    setPagination(value) {
      console.log(value)
      this.$store.dispatch('alerts/setPagination', value)
      this.$store.dispatch('alerts/getAlerts')
      this.$store.dispatch('alerts/getTags')
    },
    duration(item) {
      return moment.duration(moment().diff(moment(item.receiveTime)))
    },
    timeoutLeft(item) {
      const ackedOrShelved = this.isShelved(item.status) || this.isAcked(item.status)
      const lastModified = ackedOrShelved && item.updateTime ? item.updateTime : item.lastReceiveTime
      const expireTime = moment(lastModified).add(item.timeout, 'seconds')
      return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
    },
    lastNote(item) {
      const note = item.history.filter(h => h.type == 'note' || h.type == 'dismiss').pop()
      return note && note.type == 'note' ? note.text : ''
    },
    valueWidth() {
      return this.$store.getters.getPreference('valueWidth')
    },
    textWidth() {
      return this.$store.getters.getPreference('textWidth')
    },
    textColor(severity) {
      if (this.severityColor(severity) === 'black' || this.severityColor(severity) === '#000000') {
        return 'text-white'
      }
      return this.$store.getters.getConfig('colors').text
        ? `text-${this.$store.getters.getConfig('colors').text}`
        : ''
    },
    rowProps({item}) {
      return {
        style: {backgroundColor: this.severityColor(item.severity, item.status)},
        class: `${this.textColor(item.severity)} hover-lighten text-no-wrap`,
        'onClick': () => this.selectItem(item),
      }
    },
    severityColor(severity, status) {
      const config = this.$store.getters.getConfig('colors')
      return (config.status || {})[status] || config.severity[severity] || 'white'
    },
    selectItem(item) {
      if (!this.selected.length) {        
        this.$router.push({ path: `/alert/${item.id}`, query: {redirect: this.$route.fullPath} })
      }
    },
    isOpen(status) {
      return status == 'open' || status == 'unack' || status == 'NORM' || status == 'UNACK' || status == 'RTNUN'
    },
    isWatched(tags) {
      return tags ? tags.indexOf(`watch:${this.username}`) > -1 : false
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
    haveDeleteScope(){
      const scopes = this.$store.getters['auth/scopes']
      if (this.$config.delete_alert_scope_enforced) return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('delete:alerts')
      else return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('write') || scopes.includes('write:alerts') || scopes.includes('delete:alerts')
    },
    isAlertAlarmModel(){
      return !this.$config.alarm_model.name.includes('ISA 18')
    },
    takeAction: debounce(function(id, action) {
      this.$store
        .dispatch('alerts/takeAction', [id, action, ''])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    ackAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'ack', '', this.ackTimeout])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'shelve', '', this.shelveTimeout])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/watchAlert', id)
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/unwatchAlert', id)
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function(id) {
      confirm(this.$t('ConfirmDelete')) &&
        this.$store.dispatch('alerts/deleteAlert', id)
          .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    clipboardCopy(text) {
      const textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style>


.value-header {
  width: var(--value-width);
  min-width: var(--value-width);
}

.text-header {
  width: var(--text-width);
  min-width: var(--text-width);
}

.comfortable table.v-table tbody td, table.v-table tbody th {
  height: 42px !important;
}

.compact table.v-table tbody td, table.v-table tbody th {
  height: 34px !important;
}

.alert-table td {
  --v-border-opacity: 0.4 !important;
}

.fixed-table {
  display: table;
  table-layout: fixed;
  width: 100%;
}

i.trend-arrow {
  width: 24px !important;
}

div.select-box {
  width: 24px !important;
}

.label {
  font-weight: bold;
  line-height: 14px;
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  vertical-align: baseline;
  background-color: #999999;
}

.label {
  padding: 1px 4px 2px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}

.label-critical {
  background-color: #b94a48;
}

.label-major {
  background-color: #f89406;
}

.label-minor {
  background-color: #ffd700;
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

.label-inverse {
  background-color: #333333;
}

.hover-lighten:hover {
  filter: brightness(0.87);
}

.btn--plain {
  height: auto;
  width: auto;
  margin: 0;
}
.btn--plain {
  padding: 0;
}
.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}
.btn--plain:hover {
  opacity: 1;
}

div.action-buttons {
  opacity: 0;
  right: 0;
  top: 0.5em;
  height: 2em;
}

tr:hover div.action-buttons {
  opacity: 1;
}
</style>
