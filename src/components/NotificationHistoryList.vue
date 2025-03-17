<template>
  <div>
    <v-card>
      <v-card-title class="title">
        {{ $t('NotificationHistory') }}
        <information-dialog 
          :title="$t('NotificationHistory') + ': ' + $t('NotificationHistoryInfo')" 
          :info="headers"
        />
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
import InformationDialog from '@/components/notification/InformationDialog'

export default {
  components: {
    InformationDialog,
  },
  data: vm => ({
    search: '',
    headers: [
      { text: i18n.t('ID'), value: 'id', sortable: false, info: i18n.t('NotificationHistoryId') },
      { text: i18n.t('Sent'), value: 'sent', sortable: false, info: [i18n.t('NotificationHistorySentTrue'), i18n.t('NotificationHistorySentFalse')]},
      { text: i18n.t('SentTime'), value: 'sent_time', sortable: false, info: i18n.t('NotificationHistorySentTime') },
      { text: i18n.t('Message'), value: 'message', sortable: false, info: i18n.t('NotificationHistoryMessage') },
      { text: i18n.t('Receiver'), value: 'receiver', sortable: false, info: i18n.t('NotificationHistoryReceiver') },
      { text: i18n.t('Sender'), value: 'sender', sortable: false, info: i18n.t('SenderInfo') },
      { text: i18n.t('Channel'), value: 'channel', sortable: false, info: i18n.t('NotificationHistoryChannel') },
      { text: i18n.t('NotificationRule'), value: 'rule', sortable: false, info: i18n.t('NotificationHistoryRule') },
      { text: i18n.t('Alert'), value: 'alert', sortable: false, info: i18n.t('NotificationHistoryAlert') },
      { text: i18n.t('Error'), value: 'error', sortable: false, info: i18n.t('NotificationHistoryError') },
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
</style>
