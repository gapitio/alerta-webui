<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  v-if="$config.customer_views"
                  xs12
                >
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.userIds"
                    :items="users"
                    item-text="name"
                    item-value="id"
                    :label="$t('Users')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.groupIds"
                    :items="groups"
                    item-text="name"
                    item-value="id"
                    :label="$t('Groups')"
                    chips
                    multiple
                  />
                </v-flex>
                <v-flex xs6>
                  <v-menu
                    ref="sDateMenu"
                    v-model="sDateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="editedItem.startDate"
                        :label="$t('StartDate')"
                        prepend-icon="event"
                        readonly
                        clearable
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="editedItem.startDate"
                      no-title
                      scrollable
                      :max="editedItem.endDate"
                      @input="sDateMenu = false"
                    />
                  </v-menu>
                </v-flex>
                <v-flex xs6>
                  <v-menu
                    ref="eDateMenu"
                    v-model="eDateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="editedItem.endDate"
                        :label="$t('EndDate')"
                        prepend-icon="event"
                        readonly
                        clearable
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="editedItem.endDate"
                      no-title
                      scrollable
                      :min="editedItem.startDate"
                      @input="eDateMenu = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex xs6>
                  <v-menu
                    ref="sTimeMenu"
                    v-model="sTimeMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="editedItem.startTime"
                        label="Start Time"
                        prepend-icon="schedule"
                        readonly
                        clearable
                        v-on="on"
                      />
                    </template>
                    <v-time-picker
                      v-model="editedItem.startTime"
                      scrollable
                      format="24hr"
                    >
                      <v-spacer />
                      <v-btn
                        flat
                        color="primary"
                        @click="sTimeMenu = false"
                      >
                        {{ $t('OK') }}
                      </v-btn>
                    </v-time-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs6>
                  <v-menu
                    ref="eTimeMenu"
                    v-model="eTimeMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="editedItem.endTime"
                        :label="$t('EndTime')"
                        prepend-icon="schedule"
                        readonly
                        clearable
                        v-on="on"
                      />
                    </template>
                    <v-time-picker
                      v-model="editedItem.endTime"
                      format="24hr"
                      scrollable
                    >
                      <v-spacer />
                      <v-btn
                        flat
                        color="primary"
                        @click="eTimeMenu = false"
                      >
                        {{ $t('OK') }}
                      </v-btn>
                    </v-time-picker>
                  </v-menu>
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-select
                    v-model="editedItem.repeatDays"
                    :items="days"
                    :label="$t('RepeatDays')"
                    chips
                    multiple
                    clearable
                  />
                  <v-select
                    ref="repeatWeeks"
                    v-model="editedItem.repeatWeeks"
                    :items="weeks"
                    :label="$t('RepeatWeeks')"
                    chips
                    multiple
                    clearable
                  >
                    <template v-slot:prepend-item>
                      <v-list-tile @click="selectOdd($refs.repeatWeeks)">
                        <v-list-tile-content>
                          <v-list-tile-title>{{ $t('SelectOdd') }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile @click="selectEven($refs.repeatWeeks)">
                        <v-list-tile-content>
                          <v-list-tile-title>{{ $t('SelectEven') }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-divider class="mt-2" />
                    </template>
                  </v-select>
                  <v-select
                    v-model="editedItem.repeatMonths"
                    :items="months"
                    :label="$t('RepeatMonths')"
                    chips
                    multiple
                    clearable
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="() => dialog = false"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="validate"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <h1>
      {{ $t('OnCall') }}
      <div style="display: inline-flex;">
        <information-tooltip
          :info="$t('OnCallInfo')"
          position="right"
        />
      </div>
    </h1>
    <v-card class="section">
      <v-card-title class="title">
        <v-btn-toggle
          v-model="status"
          class="transparent"
          multiple
        >
          <v-btn
            value="active"
            flat
          >
            <information-tooltip
              :info="status.includes('active') ? $t('HideActive') : $t('ShowActive')"
              icon="notifications_paused"
            />
          </v-btn>
          <v-btn
            value="deactivated"
            flat
          >
            <information-tooltip
              :info="status.includes('deactivated') ? $t('HideDeactivated') : $t('ShowDeactivated')"
              icon="schedule"
            />
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          :label="$t('Search')"
          single-line
          hide-details
          solo
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="on_calls"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="px-2"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td v-if="$config.customer_views">
            {{ props.item.customer }}
          </td>
          <td>
            <v-chip
              v-for="userId in props.item.userIds"
              :key="userId"
              outline
              small
            >
              {{ getName(users, userId) }}
              <!-- {{ users.find(element => element.id == userId).name }} -->
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="groupId in props.item.groupIds"
              :key="groupId"
              outline
              small
            >
              {{ getName(groups, groupId) }}
              <!-- {{ groups.find(element => element.id == groupId).name }} -->
            </v-chip>
          </td>
          <td class="text-xs-left">
            {{ props.item.startDate }}
          </td>
          <td class="text-xs-left">
            {{ props.item.endDate }}
          </td>
          <td class="text-xs-left">
            {{ props.item.startTime }}
          </td>
          <td class="text-xs-left">
            {{ props.item.endTime }}
          </td>
          <td>
            <v-chip
              v-for="day in props.item.repeatDays"
              :key="day"
              outline
              small
            >
              {{ day }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="week in props.item.repeatWeeks"
              :key="week"
              outline
              small
            >
              {{ week }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="month in props.item.repeatMonths"
              :key="month"
              outline
              small
            >
              {{ month }}
            </v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:on_calls'"
              icon
              class="btn--plain mr-0"
              @click="editItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                edit
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:on_calls'"
              icon
              class="btn--plain mx-0"
              @click="copyItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                content_copy
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:on_calls'"
              icon
              class="btn--plain mx-0"
              @click="deleteItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                delete
              </v-icon>
            </v-btn>
          </td>
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

    <list-button-add
      perms="write:on_calls"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import InformationTooltip from '@/components/notification/InformationTooltip'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd,
    InformationTooltip
  },
  data: vm => ({
    status: ['active', 'deactivated'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weeks: [...Array(52).keys()].map(x => x + 1),
    months: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    search: '',
    dialog: false,
    sDateMenu: false,
    eDateMenu: false,
    sTimeMenu: false,
    eTimeMenu: false,
    headers: [
      {
        text: i18n.t('Users'),
        value: 'users'
      },
      {
        text: i18n.t('Groups'),
        value: 'groups'
      },
      {
        text: i18n.t('StartDate'),
        value: 'startDate'
      },
      {
        text: i18n.t('EndDate'),
        value: 'endDate'
      },
      {
        text: i18n.t('StartTime'),
        value: 'startTime'
      },
      {
        text: i18n.t('EndTime'),
        value: 'endTime'
      },
      {
        text: i18n.t('RepeatDays'),
        value: 'repeatDays'
      },
      {
        text: i18n.t('RepeatWeeks'),
        value: 'repeatWeeks'
      },
      {
        text: i18n.t('RepeatMonths'),
        value: 'repeatMonths'
      },
      {
        text: i18n.t('Actions'),
        value: 'name',
        sortable: false
      }
    ],
    editedId: null,
    editedItem: {
      customer: null,
      userIds: [],
      groupIds: [],
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      fullDay: false,
      repeatType: 'list',
      repeatDays: [],
      repeatWeeks: [],
      repeatMonths: []
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      customer: null,
      userIds: [],
      groupIds: [],
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      fullDay: false,
      repeatType: 'list',
      repeatDays: [],
      repeatWeeks: [],
      repeatMonths: []
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    on_calls() {
      return this.$store.state.onCalls.on_calls
        .filter(b =>
          this.search
            ? Object.keys(b).some(
              k => b[k] && b[k].toString().includes(this.search)
            )
            : true
        )
        .map(b => {
          const startTime = this.fix_time(b.startTime)
          const endTime = this.fix_time(b.endTime)
          return { ...b, startTime, endTime }
        })
    },
    pagination: {
      get() {
        return this.$store.getters['onCalls/pagination']
      },
      set(value) {
        this.$store.dispatch('onCalls/setPagination', value)
      }
    },
    users() {
      return this.$store.state.users.users
    },
    groups() {
      return this.$store.state.notificationGroups.notificationGroups
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    isLoading() {
      return this.$store.state.onCalls.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewOnCall') : i18n.t('EditOnCall')
    },
    times() {
      return Array.from(
        {
          length: (24 * 60) / 15 + 1
        },
        (v, i) => {
          if (i == 0) {
            return ''
          } else {
            let h = Math.floor(((i - 1) * 15) / 60)
            let m = (i - 1) * 15 - h * 60
            return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2)
          }
        }
      )
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    refresh(val) {
      if (!val) return
      this.getOnCalls()
      this.getCustomers()
      this.getUsers()
      this.getGroups()
    },
    pagination: {
      handler() {
        this.getOnCalls()
      },
      deep: true
    }
  },
  created() {
    this.getOnCalls()
    this.getCustomers()
    this.getUsers()
    this.getGroups()
    this.editedItem = Object.assign({}, this.defaultItem)
    this.editedItemStart = Object.assign({}, this.defaultItem)
  },
  methods: {
    compareDict(a, b) {
      if (a === null) return true
      for (const key in a) {
        if (b[key] === undefined) return false
        if (a[key] !== null && typeof a[key] === typeof({})) {
          if (b[key] === null || a[key].length !== b[key].length || !this.compareDict(a[key], b[key])) return false
        }
        else if (a[key] !== b[key]) return false
      } 
      return true
    },
    selectOdd(e) {
      const filtered_items = e.items.filter((value, index) => index % 2 == 0)
      e.internalValue = e.items.filter((value, index) => index % 2 == 0)
    },
    selectEven(e) {
      e.internalValue = e.items.filter((value, index) => index % 2 == 1)
    },
    getOnCalls() {
      this.$store.dispatch('onCalls/getOnCalls')
    },
    getName(nameList,id) {
      let name = nameList.find(element => element.id == id)
      return name !== undefined ? name.name : id
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getGroups() {
      this.$store.dispatch('notificationGroups/getNotificationGroups')
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.editedItemStart = Object.assign({}, item)
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('onCalls/deleteOnCall', item.id)
    },
    close() {
      let change = !this.compareDict(this.editedItem, this.editedItemStart)
      if (this.saved || !change || confirm('Are you sure you want to close the dialog?')) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedItemStart = Object.assign({}, this.defaultItem)
          this.editedId = null
          this.saved = false
        }, 300)
      }
      else setTimeout(() => this.dialog = true, 0.1)
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    fix_time(time, toUTC = false) {
      if (time === null) return null
      const [hour, minute] = time.split(':')
      const date = new Date()
      date.setHours(hour, minute)
      if (toUTC) return `${date.getUTCHours()}:${date.getUTCMinutes()}`
      date.setUTCHours(hour)
      return `${date.getHours()}:${date.getMinutes()}`
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('onCalls/updateOnCall', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            userIds: this.editedItem.userIds,
            groupIds: this.editedItem.groupIds,
            startDate: this.editedItem.startDate,
            endDate: this.editedItem.endDate,
            startTime: this.fix_time(this.editedItem.startTime, true),
            endTime: this.fix_time(this.editedItem.endTime, true),
            fullDay: this.editedItem.fullDay,
            repeatType: 'list',
            repeatDays: this.editedItem.repeatDays,
            repeatWeeks: this.editedItem.repeatWeeks,
            repeatMonths: this.editedItem.repeatMonths
          }
        ])
      } else {
        this.$store.dispatch(
          'onCalls/createOnCall',
          Object.assign(this.editedItem, {
            id: null,
            startTime: this.fix_time(this.editedItem.startTime, true),
            endTime: this.fix_time(this.editedItem.endTime, true),
          })
        )
      }
      this.dialog = false
      this.saved = true
    }
  }
}
</script>

<style></style>
