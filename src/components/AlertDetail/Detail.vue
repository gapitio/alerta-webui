<template>
  <v-alert
    v-for="note in notes"
    :key="note.id"
    :text="note.text"
    closable
    type="info"
    style="margin:6px"
    border="top"
    variant="tonal"
    density="compact"
    @click:close="deleteNote(item.id, note.id)"
  >
    <template #title>
      <span> <b>{{ note.user || 'Anonymous' }}</b> {{ $t('addedNoteOn') }}</span>
      &nbsp;
      <div>
        <b><date-time
          :value="note.updateTime || note.createTime"
          format="longDate"
        /></b> ({{ $filters.timeago(note.updateTime || note.createTime) }})<br>
      </div>
    </template>
  </v-alert>

  <v-container fluid v-if="item.id">
    <v-row
      v-for="detail in alertDetails"
      :key="detail.text"
      dense
    >
      <v-col 
        cols="3" 
        class="text-grey"
      >
        {{ detail.text }}
      </v-col>
      <v-col 
        v-if="detail.value === 'severity'"
        cols="9"
      >
        <v-chip
          label
          size="small"
          :color="severityColor(item.previousSeverity)"
        >
          {{ $filters.capitalize(item.previousSeverity) }}
        </v-chip>
        &nbsp;&rarr;&nbsp;
        <v-chip
          label
          size="small"
          :color="severityColor(item.severity)"
        >
          {{ $filters.capitalize(item.severity) }}
        </v-chip>
      </v-col>
      <v-col 
        v-else-if="detail.value.includes('Time')"
        cols="9"
      >
        <date-time
          v-if="item[detail.value]"
          :value="item[detail.value]"
          format="longDate"
        />
        ({{ $filters.timeago(item[detail.value]) }})<br>
      </v-col>
      <v-col 
        v-else-if="detail.searchable"
        cols="9"
      >
        <div v-if="typeof item[detail.value] === 'object'">
          
          <v-row
            style="width:fit-content;"
            dense
          >
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
        <span
          v-else
          class="clickable"
          @click="queryBy(detail.value, item[detail.value])"
        >
          {{ item[detail.value] }}
        </span>
      </v-col>
      <v-col 
        v-else
        cols="9"
      >
        {{ item[detail.value] }}
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <span> {{ $t('Attributes') }}</span>
      </v-col>
    </v-row>
    <v-divider />
    <v-row
      v-for="(value, key) in item.attributes"
      :key="key"
      dense
    >  
      <v-col
        cols="3"
        class="text-grey"
      >
        {{ key }}
      </v-col>              
      <v-col 
        cols="9"
        class="clickable"
        @click="queryBy(`_.${key}`, value)"
      >
        {{ value }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'

export default {
  components: {
  },
  data: (a) => ({
    sheet: false,
    active: null,
    pagination: {
      rowsPerPage: 10,
      sortBy: 'updateTime',
      descending: true
    },
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
    item() {
      return this.$store.state.alerts.alert
    },
    history() {
      return this.item.history
        ? this.item.history.map((h, index) => ({ index: index, ...h }))
        : []
    },
    notes() {
      return this.$store.state.alerts.notes
    },
    statusNote() {
      return this.history.filter(h => h.type != 'note' && h.status == this.item.status).pop()
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
  methods: {
    haveDeleteScope(){
      const scopes = this.$store.getters['auth/scopes']
      if (this.$config.delete_alert_scope_enforced) return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('delete:alerts')
      else return scopes.includes('admin') || scopes.includes('admin:alerts') || scopes.includes('write') || scopes.includes('write:alerts') || scopes.includes('delete:alerts')
    },
    isAlertAlarmModel(){
      return !this.$config.alarm_model.name.includes('ISA 18')
    },
    severityColor(severity) {
      const config = this.$store.getters.getConfig('colors')
      return config.severity[severity]
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

.clickable {
  cursor: pointer;
  color: #3f51b5;
  font-weight: 400;
  text-decoration: underline;
}

.v-theme--dark .clickable {
  color: orange
}

div.clickable:hover, span.clickable:hover, div.link-text a:hover {
  text-decoration: none;
}

#alerta .v-chip__content {
  cursor: pointer;
}

</style>
