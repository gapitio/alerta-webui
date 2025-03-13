<template>
  <div>
    <v-card>
      <v-card-title class="title">
        <v-btn
          icon
          href="/notificationrules"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>
        {{ $t('NotificationRuleHistory') }} {{ notificationRuleName }}
        <information-dialog 
          :title="$t('NotificationRuleHistory') + $t('NotificationRuleHistoryInfo')" 
          :info="headers"
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        :items="notification_rule_history"
        class="alert-table"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        > 
          <tr>
            <td>{{ props.item.user }}</td>
            <td>{{ props.item.type }}</td>
            <td>{{ props.item.createTime }}</td>
            <td>{{ props.item.data }}</td>
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
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: vm => ({
    search: '',
    headers: [
      { text: i18n.t('User'), value: 'user', sortable: false, info: i18n.t('NotificationRuleHistoryUser') },
      { text: i18n.t('Type'), value: 'message', sortable: false, info: [i18n.t('NotificationRuleHistoryTypeUpdate'),i18n.t('NotificationRuleHistoryTypeCreate'),i18n.t('NotificationRuleHistoryTypeReactivate')] },
      { text: i18n.t('CreateTime'), value: 'receiver', sortable: false, info: i18n.t('NotificationRuleHistoryCreateTime') },
      { text: i18n.t('Data'), value: 'sender', sortable: false, info: i18n.t('NotificationRuleHistoryCreateData') },
    ]
  }),
  computed: {
    notification_rule_history() {
      let previousData = {}
      return this.$store.state.notificationRules.notificationRuleHistory
        .map((b, i) => {
          const createTime = b.createTime ? moment(b.createTime).format('YYYY-MM-DD HH:mm:ss') : null
          let data = {}
          if (i !== 0) {
            for (const key in b.data) {
              if (!(key in previousData)) {
                data[key] = b.data[key]
              }
              else if (typeof b.data[key] === 'object' && b.data[key] !== null && previousData[key] !== null && b.data[key].toString() === previousData[key].toString()) continue
              else if (b.data[key] != previousData[key]) data[key] = b.data[key]
            }
          } else {
            data = b.data
          }
          previousData = {...previousData, ...data}
          if (i !== 0){
            return { ...b, createTime, data }
          } else {
            return { ...b, createTime}
          }
        })
    },
    notificationRuleName() {
      const rule = this.$store.state.notificationRules.notificationRule
      if (!rule) return null
      return rule.name ? rule.name : rule.id
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
        return this.$store.getters['notificationRules/historyPagination']
      },
      set(value) {
        this.$store.dispatch('notificationRules/setHistoryPagination', value)
      }
    },
    computedHeaders() {
      return this.headers
    },
    isLoading() {
      return false
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      if (!val) return
      this.getNotificationsRuleHistory()
    },
    sent: {
      handler() {
        this.getNotificationsRuleHistory()
      }
    },
    pagination: {
      handler() {
        this.getNotificationsRuleHistory()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationsRuleHistory()
  },
  methods: {
    getNotificationsRuleHistory() {
      this.$store.dispatch('notificationRules/getNotificationRule', this.id)
      this.$store.dispatch('notificationRules/getNotificationRuleHistory', this.id)
    },
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
