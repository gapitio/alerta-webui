<template>
  <div>
    <v-dialog
      v-model="infocard"
      max-width="540px"      
    >
      <v-flex xs12>
        <v-card>
          <v-toolbar>
            <v-toolbar-title>{{ $t('NotificationHistory') }}: {{ $t('NotificationHistoryInfo') }}</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('Id') }}:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryId') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('Sent') }}:
                </v-flex>
                <v-flex xs9>
                  <v-flex xs12>
                    {{ $t('NotificationHistorySentTrue') }}
                  </v-flex>
                  <v-flex xs12>
                    {{ $t('NotificationHistorySentFalse') }}
                  </v-flex>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('SentTime') }}:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistorySentTime') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('Message') }}:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryMessage') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  Receiver:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryReceiver') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  Sender:
                </v-flex>
                <v-flex xs9>
                  {{ $t('SenderInfo') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  Channel:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryChannel') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('NotificationRule') }}:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryRule') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('Alert') }}:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryAlert') }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider />
            <v-flex 
              xs12
              headerinfo
            >
              <v-layout wrap>
                <v-flex 
                  xs3 
                  style="align-self: center;"
                >
                  {{ $t('Error') }}:
                </v-flex>
                <v-flex xs9>
                  {{ $t('NotificationHistoryError') }}
                </v-flex>
              </v-layout>
            </v-flex>
          </v-container>
        </v-card>
      </v-flex>
    </v-dialog>
    <v-card>
      <v-card-title class="title">
        {{ $t('NotificationHistory') }}
        <v-icon 
          @click="() => infocard = true"
        >
          help_outline
        </v-icon>
        <v-spacer />
        <v-btn-toggle
          v-model="sent"
          class="transparent"
          multiple
        >
          <v-btn
            :value="true"
            flat
          >
            <v-tooltip bottom>
              <v-icon slot="activator">
                check
              </v-icon>
              <span>{{ $t('Sent') }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            :value="false"
            flat
          >
            <v-tooltip bottom>
              <v-icon slot="activator">
                cancel
              </v-icon>
              <span>{{ $t('NotSent') }}</span>
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field
          v-model="query"
          append-icon="search"
          clearable
          single-line
          hide-details
          :label="$t('Search')"
          @change="setSearch"
          @click:clear="clearSearch"
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="notification_history"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="alert-table"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        > 
          <tr
            :style="{'background-color': severityColor(props.item.confirmed, props.item.sent), 'color': 'black'}"
          >
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.sent }}</td>
            <td>{{ props.item.sent_time }}</td>
            <td>{{ props.item.message }}</td>
            <td>{{ props.item.receiver }}</td>
            <td>{{ props.item.sender }}</td>
            <td>{{ props.item.channel }}</td>
            <td
              class="clickable"
              @click="findNotificationRule(props.item.rule)"
            >
              {{ props.item.rule }}
            </td>
            <td
              class="clickable"
              @click="findAlert(props.item.alert)"
            >
              {{ props.item.alert }}
            </td>
            <td>{{ props.item.error }}</td>
          </tr>
        </template>
        <template slot="no-data">
          <v-alert
            :value="true"
            color="error"
            icon="warning"
          >
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
        <v-alert
          slot="no-results"
          :value="true"
          color="error"
          icon="warning"
        >
          {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
        </v-alert>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  data: vm => ({
    search: '',
    infocard: false,
    headers: [
      { text: i18n.t('Id'), tooltip: 'test', value: 'id', sortable: false },
      { text: i18n.t('Sent'), value: 'sent', sortable: false },
      { text: i18n.t('SentTime'), value: 'sent_time', sortable: false },
      { text: i18n.t('Message'), value: 'message', sortable: false },
      { text: i18n.t('Receiver'), value: 'receiver', sortable: false },
      { text: i18n.t('Sender'), value: 'sender', sortable: false },
      { text: i18n.t('Channel'), value: 'channel', sortable: false },
      { text: i18n.t('NotificationRule'), value: 'rule', sortable: false },
      { text: i18n.t('Alert'), value: 'alert', sortable: false },
      { text: i18n.t('Error'), value: 'error', sortable: false },
    ],
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_history() {
      return this.$store.state.notificationHistory.notification_history
        .filter(b =>
          this.search
            ? Object.keys(b).some(
              k => b[k] && b[k].toString().includes(this.search)
            )
            : true
        )
        .map(b => {
          let sent_time = b.sent_time ? moment(b.sent_time).format('YYYY-MM-DD HH:mm:ss') : null
          let confirmed_time = b.confirmed_time ? moment(b.confirmed_time).format('YYYY-MM-DD HH:mm:ss') : null

          return { ...b, sent_time, confirmed_time }
        })
    },
    
    sent: {
      get() {
        return this.$store.getters['notificationHistory/sent']
      },
      set(value) {
        this.$store.dispatch('notificationHistory/setShownSentStatus', value)
        this.getNotificationsHistory()
      }
    },
    pagination: {
      get() {
        return this.$store.getters['notificationHistory/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationHistory/setPagination', value)
      }
    },
    query: {
      get() {
        return this.$store.state.notificationHistory.query
          ? this.$store.state.notificationHistory.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    isLoading() {
      return this.$store.state.notificationHistory.isLoading
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      if (!val) return
      this.getNotificationsHistory()
    },
    sent: {
      handler() {
        this.getNotificationsHistory()
      }
    },
    pagination: {
      handler() {
        this.getNotificationsHistory()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationsHistory()
  },
  methods: {
    getNotificationsHistory() {
      this.$store.dispatch('notificationHistory/getNotificationHistory')
    },
    setSearch(query) {
      this.$store.dispatch('notificationHistory/updateQuery', {q: query})
      this.$router.push({query: {...this.$router.query, q: query}})
      this.getNotificationsHistory()
    },
    severityColor(confirmed, sent) {
      const config = this.$store.getters.getConfig('colors')
      return config.severity[confirmed ? 'ok' : sent ? 'normal' : 'critical'] || 'white'
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('notificationHistory/updateQuery', {})
      this.$router.push({query: {...this.$router.query, q: undefined}})
      this.getNotificationsHistory()
    },
    findAlert(id){
      this.$router.push({ path: `/alerts?q=id:"${id}"` })
    },
    findNotificationRule(id){
      this.$router.push({ path: `/notificationrules?q=id:"${id}"` })
    }
  }
}
</script>

<style>
td.clickable {
  cursor: pointer;
  color: #3f51b5;
  font-weight: 400;
  text-decoration: underline;
}
.container {
  padding-top: 0px;
}
.headerinfo {
  padding: 10px 0px;
}
</style>
