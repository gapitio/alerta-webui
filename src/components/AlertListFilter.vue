<template>
  <v-navigation-drawer
    v-model="sidesheet"
    temporary
    location="right"
    width="300"
  >
    <v-card flat>
      <v-toolbar 
        density="compact"
      >
        <v-toolbar-title>{{ $t('Filters') }}</v-toolbar-title>
        <v-spacer />
        <v-btn 
          icon 
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container fluid>
        <v-text-field
          v-model="filterText"
          :label="$t('Search')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          dense 
          clearable
        />

        <v-select 
          v-model="filterStatus" 
          :items="statusList"
          :label="$t('Status')"
          multiple
          variant="outlined"
          dense 
        />

        <v-select
          v-if="$config.customer_views"
          v-model="filterCustomer"
          :items="currentCustomers"
          :label="$t('Customer')"
          multiple
          variant="outlined"
          dense
        />

        <v-autocomplete
          v-model="filterService"
          :items="currentServices"
          :label="$t('Service')"
          multiple
          variant="outlined"
          dense
        />

        <v-select
          v-model="filterGroup"
          :items="currentGroups"
          :label="$t('Group')"
          multiple
          variant="outlined"
          dense
        />

        <v-select
          v-model="filterDateRange"
          :items="dateRanges"
          item-value="range"
          prepend-inner-icon="mdi-calendar"
          variant="solo-filled"
        />

        <template v-if="showDateRange">
          <v-row>
            <v-col cols="8">
              <v-text-field
                v-model="period.startDate"
                :label="$t('StartDate')"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="outlined"
                @click="menu1 = true"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="period.startTime"
                :label="$t('Time')"
                variant="outlined"
                dense
              />
            </v-col>
          </v-row>
          <v-menu
            v-model="menu1"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <v-date-picker
              v-model="period.startDate"
              @update:model-value="menu1 = false"
            />
          </v-menu>

          <v-row>
            <v-col cols="8">
              <v-text-field
                v-model="period.endDate"
                :label="$t('EndDate')"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="outlined"
                @click="menu2 = true"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="period.endTime"
                :label="$t('Time')"
                variant="outlined"
                dense
              />
            </v-col>
          </v-row>
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <v-date-picker
              v-model="period.endDate"
              @update:model-value="menu2 = false"
            />
          </v-menu>
        </template>
      </v-container>

      <v-card-actions>
        <v-btn
          v-if="showDateRange"
          color="primary"
          @click="setDateRange"
        >
          {{ $t('Apply') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="reset"
        >
          {{ $t('Reset') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script lang="ts">
import moment from 'moment'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: vm => ({
    sidesheet: vm.value,
    active: null,
    pagination: {
      rowsPerPage: 10,
      sortBy: 'updateTime'
    },
    showDateRange: false,
    menu1: false,
    menu2: false,
    period: {
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null
    },
  }),
  computed: {
    dateRanges() {
      return [
        { text: this.$t('Latest'), range: [null, null] },
        { text: this.$t('Hour'), range: [-3600, null] },
        { text: this.$t('SixHours'), range: [-3600 * 6, null] },
        { text: this.$t('TwelveHours'), range: [-3600 * 12, null] },
        { divider: true },
        { text: this.$t('SelectRange'), range: [0, 0] },
      ]
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    history() {
      return this.item.history.map((h, index) => ({ index: index, ...h }))
    },
    isWatched() {
      const tag = `watch:${this.username}`
      return this.item.tags.indexOf(tag) > -1
    },
    statusList() {
      // FIXME - remove defaultStatusMap from v7.0 onwards
      const defaultStatusMap = {
        'open': 'A',
        'assign': 'B',
        'ack': 'C',
        'shelved': 'D',
        'blackout': 'E',
        'closed': 'F',
        'expired': 'G',
        'unknown': 'H'
      }
      const statusMap = this.$config.alarm_model.status || defaultStatusMap
      return Object.keys(statusMap).sort((a, b) => {
        return statusMap[a].localeCompare(statusMap[b])
      })
    },
    currentCustomers() {
      return this.$store.getters['customers/customers']
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentGroups() {
      return this.$store.getters['alerts/groups']
    },
    filterText: {
      get() {
        return this.$store.state.alerts.filter.text
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          text: value
        })
      }
    },
    filterStatus: {
      get() {
        return this.$store.state.alerts.filter.status
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          status: value.length > 0 ? value : null
        })
      }
    },
    filterCustomer: {
      get() {
        return this.$store.state.alerts.filter.customer
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          customer: value.length > 0 ? value : null
        })
      }
    },
    filterService: {
      get() {
        return this.$store.state.alerts.filter.service
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          service: value.length > 0 ? value : null
        })
      }
    },
    filterGroup: {
      get() {
        return this.$store.state.alerts.filter.group
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          group: value.length > 0 ? value : null
        })
      }
    },
    filterDateRange: {
      get() {
        return this.$store.state.alerts.filter.dateRange[0] > 0
          ? [0, 0]
          : this.$store.state.alerts.filter.dateRange
      },
      set(value) {
        if (value[0] === 0) {
          this.period = this.getDateRange(
            this.$store.state.alerts.filter.dateRange[0]
              ? this.$store.state.alerts.filter.dateRange[0]
              : moment().unix() - 7 * 24 * 3600,  // 7 days ago
            this.$store.state.alerts.filter.dateRange[1]
              ? this.$store.state.alerts.filter.dateRange[1]
              : moment().unix()
          )
          this.showDateRange = true
        } else {
          this.showDateRange = false
          this.$store.dispatch('alerts/setFilter', {
            dateRange: value
          })
        }
      }
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  watch: {
    value(val) {
      this.sidesheet = val
    }
  },
  created() {
    if (this.$config.customer_views) {
      this.getCustomers()
    }
    this.getServices()
    this.getGroups()

    if (this.filterDateRange[0] === 0) {
      this.period = this.getDateRange(
        this.$store.state.alerts.filter.dateRange[0],
        this.$store.state.alerts.filter.dateRange[1]
      )
      this.showDateRange = true
    }
  },
  methods: {
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getGroups() {
      this.$store.dispatch('alerts/getGroups')
    },
    getDateRange(from, to) {
      const t1 = moment.unix(from).utc()
      const t2 = moment.unix(to).utc()
      return {
        startDate: t1.format('YYYY-MM-DD'),
        startTime: t1.format('HH:mm'),
        endDate: t2.format('YYYY-MM-DD'),
        endTime: t2.format('HH:mm')
      }
    },
    toEpoch(date, time) {
      return new Date(date + ' ' + time).getTime() / 1000
    },
    setDateRange() {
      this.$store.dispatch('alerts/setFilter', {
        dateRange: [
          this.toEpoch(
            this.period.startDate,
            this.period.startTime
          ),
          this.toEpoch(
            this.period.endDate,
            this.period.endTime
          )
        ]
      })
    },
    reset() {
      this.showDateRange = false
      this.$store.dispatch('alerts/resetFilter')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
