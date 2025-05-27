<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="700px"
      scrollable
    >
      <v-form ref="form">
        <v-card class="dialog-section">
          <v-card-title>
            <v-flex
              xs12
              sm6
              md9
            >
              <span class="headline">
                {{ formTitle }}
              </span>
            </v-flex>
            <v-flex
              xs12
              sm6
              md3
            >
              <v-checkbox
                v-model="editedItem.active"
                :label="$t('Active')"
              />
            </v-flex>
          </v-card-title>
          
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  v-if="$config.customer_views"
                  xs12
                >
                  <g-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
                  />
                </v-flex>

                <v-flex xs7>
                  <g-text-field
                    v-model.trim="editedItem.timeObj.time"
                    show-header
                    :label="$t('Time')"
                  />
                </v-flex>
                <v-flex xs4>
                  <g-select
                    v-model="editedItem.timeObj.interval"
                    show-header
                    :items="intervals"
                    :label="$t('Interval')"
                  />
                </v-flex>
                <information-tooltip
                  :info="$t('EscalationTimeInfo')"
                  position="left"
                />

                <v-flex xs11>
                  <g-select
                    v-model="editedItem.days"
                    show-header
                    :items="days"
                    :label="$t('Days')"
                    chips
                    multiple
                  />
                </v-flex>
                <information-tooltip
                  :info="$t('EscalationDaysInfo')"
                  position="left"
                />

                <v-flex xs5>
                  <g-combobox
                    v-model="editedItem.period.startTime"
                    show-header
                    :items="times"
                    :label="$t('StartTime')"
                  />
                </v-flex>
                <v-flex
                  xs1
                  style="align-self: center;"
                >
                  <information-tooltip
                    :info="$t('EscalationStartTimeInfo')"
                    position="left"
                  />
                </v-flex>
                <v-flex xs5>
                  <g-combobox
                    v-model="editedItem.period.endTime"
                    show-header
                    :items="times"
                    :label="$t('EndTime')"
                  />
                </v-flex>
                <information-tooltip
                  :info="$t('EscalationEndTimeInfo')"
                  position="left"
                />

                <v-flex xs12>
                  <escalation-triggers-edit 
                    v-model="editedItem.triggers"
                    :title="$t('Triggers')"
                    :items="severities"
                  > 
                    <escalation-triggers-information-dialog slot="information" />
                  </escalation-triggers-edit>
                </v-flex>
                <v-card class="info-section">
                  <v-card-title class="headline">
                    {{ $t('AlertFields') }}
                    <information-tooltip
                      :info="$t('AlertFieldsInfo')"
                      position="right"
                    />
                  </v-card-title>
                  <v-container>
                    <v-layout
                      wrap
                      xs12
                    >
                      <v-flex xs11>
                        <g-select
                          v-model="editedItem.environment"
                          show-header
                          show-details
                          :items="allowedEnvironments"
                          :label="$t('Environment')+'*'"
                          :rules="[rules.required]"
                          required
                        />
                      </v-flex>
                      <information-tooltip
                        :info="$t('EscalationEnvironmentInfo')"
                        position="left"
                      />

                      <v-flex xs11>
                        <g-combobox
                          v-model="editedItem.service"
                          show-header
                          :items="currentServices"
                          :menu-props="{ maxHeight: '400' }"
                          :label="$t('Service')"
                          chips
                          multiple
                        />
                      </v-flex>
                      <information-tooltip
                        :info="$t('EscalationServicesInfo')"
                        position="left"
                      />

                      <v-flex xs11>
                        <g-text-field
                          v-model.trim="editedItem.resource"
                          show-header
                          :label="$t('Resource')"
                        />
                      </v-flex>
                      <information-tooltip
                        :info="$t('EscalationResourceInfo')"
                        position="left"
                      />
                      <v-flex xs11>
                        <g-text-field
                          v-model.trim="editedItem.event"
                          show-header
                          :label="$t('Event')"
                        />
                      </v-flex>
                      <information-tooltip
                        :info="$t('EscalationEventInfo')"
                        position="left"
                      />
                      <v-flex xs11>
                        <g-combobox
                          v-model.trim="editedItem.group"
                          show-header
                          :items="currentGroups"
                          :label="$t('Group')"
                          clearable
                        />
                      </v-flex>
                      <information-tooltip
                        :info="$t('EscalationGroupInfo')"
                        position="left"
                      />

                      <v-flex xs12>
                        <tags-edit 
                          v-model="editedItem.tags"
                          :items="currentTags"
                          :title="$t('Tags')"
                        >
                          <tags-information-dialog slot="information" />
                        </tags-edit>
                      </v-flex>

                      <v-flex xs12>
                        <tags-edit 
                          v-model="editedItem.excludedTags"
                          :items="currentTags"
                          :title="$t('ExcludedTags')"
                        >
                          <excluded-tags-information-dialog slot="information" />
                        </tags-edit>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="secondary"
              @click="close"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              @click="validate"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <h1>
      {{ $t('EscalationRules') }}
      <information-dialog 
        :info="headers" 
        :title="$t('EscalationRuleInfo')"
        style="display: inline-flex;"
      >
        <escalation-triggers-information-dialog :slot="$t('Triggers')" />
        <tags-information-dialog :slot="$t('Tags')" />
        <excluded-tags-information-dialog :slot="$t('ExcludedTags')" />
      </information-dialog>
    </h1>
    <v-card class="section">
      <v-card-title class="title">
        <v-btn-toggle
          v-model="status"
          class="transparent"
          multiple
        >
          <v-btn
            value="true"
            flat
          >
            <information-tooltip
              :info="status.includes('true') ? $t('HideActive') : $t('ShowActive')"
              icon="notifications"
            />
          </v-btn>
          <v-btn
            value="false"
            flat
          >
            <information-tooltip
              :info="status.includes('false') ? $t('HideDeactivated') : $t('ShowDeactivated')"
              icon="notifications_paused"
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
        :items="escalation_rules"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        :search="search"
        class="g-table"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>
            <v-btn
              v-has-perms.disable="'write:escalation_rules'"
              icon
              class="btn--plain mx-0"
              @click="changeState(props.item)"
            >
              <v-icon
                small
                :color="props.item.active ? 'green': 'red'"
              >
                {{ props.item.active ? "check_circle": "cancel" }}
              </v-icon>
            </v-btn>
          </td>
          <td v-if="$config.customer_views">
            {{ props.item.customer }}
          </td>
          <td>{{ props.item.environment }}</td>
          <td>{{ props.item.time }}</td>
          <td>
            <div style="margin: auto;">
              <v-container
                v-for="(trigger, index) in props.item.triggers"
                :key="index"
                grid-list-md
                style="padding: 1px;"
              >
                <v-layout>
                  <!-- <v-flex xs12 v-if="!emptyArray(trigger.from_severity) || !emptyArray(trigger.to_severity) || !emptyArray(trigger.status)">
                    Trigger{{ index }}
                  </v-flex> -->
                  <v-flex 
                    v-if="!emptyArray(trigger.from_severity)"
                    xs12
                  >
                    {{ $t('From') }}:
                    <v-chip
                      v-for="severity in trigger.from_severity"
                      :key="severity"
                      outline
                      small
                    >
                      {{ severity }}
                    </v-chip>
                  </v-flex>
                  <v-flex 
                    v-if="!emptyArray(trigger.to_severity)"
                    xs12 
                  >
                    {{ $t('To') }}:
                    <v-chip
                      v-for="severity in trigger.to_severity"
                      :key="severity"
                      outline
                      small
                    >
                      {{ severity }}
                    </v-chip>
                  </v-flex>
                </v-layout>
                <v-divider v-if="index < props.item.triggers.length - 1" />
              </v-container>
            </div>
          </td>
          <td>
            <v-chip
              v-for="day in props.item.days"
              :key="day"
              outline
              small
            >
              {{ day }}
            </v-chip>
          </td>
          <td class="text-xs-left">
            {{ props.item.period.startTime }}
          </td>
          <td class="text-xs-left">
            {{ props.item.period.endTime }}
          </td>
          <td>
            <v-chip
              v-for="service in props.item.service"
              :key="service"
              outline
              small
            >
              {{ service }}
            </v-chip>
          </td>
          <td>{{ props.item.resource }}</td>
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.group }}</td>
          <td>
            <div style="margin: auto;">
              <v-container
                v-for="(tag, index) in props.item.tags"
                :key="index"
                grid-list-md
                style="padding: 1px;"
              >
                <v-layout>
                  <v-flex 
                    v-if="!emptyArray(tag.all)"
                    xs12
                  >
                    AND:
                    <v-chip
                      v-for="t in tag.all"
                      :key="t"
                      outline
                      small
                    >
                      {{ t }}
                    </v-chip>
                  </v-flex>
                  <v-flex 
                    v-if="!emptyArray(tag.any)"
                    xs12 
                  >
                    OR:
                    <v-chip
                      v-for="t in tag.any"
                      :key="t"
                      outline
                      small
                    >
                      {{ t }}
                    </v-chip>
                  </v-flex>
                </v-layout>
                <v-divider v-if="index < props.item.tags.length - 1" />
              </v-container>
            </div>
          </td>
          <td>
            <div style="margin: auto;">
              <v-container
                v-for="(tag, index) in props.item.excludedTags"
                :key="index"
                grid-list-md
                style="padding: 1px;"
              >
                <v-layout>
                  <v-flex 
                    v-if="!emptyArray(tag.all)"
                    xs12
                  >
                    AND:
                    <v-chip
                      v-for="t in tag.all"
                      :key="t"
                      outline
                      small
                    >
                      {{ t }}
                    </v-chip>
                  </v-flex>
                  <v-flex 
                    v-if="!emptyArray(tag.any)"
                    xs12 
                  >
                    OR:
                    <v-chip
                      v-for="t in tag.any"
                      :key="t"
                      outline
                      small
                    >
                      {{ t }}
                    </v-chip>
                  </v-flex>
                </v-layout>
                <v-divider v-if="index < props.item.excludedTags.length - 1" />
              </v-container>
            </div>
          </td>
          <td class="text-xs-left">
            {{ props.item.user }}
          </td>
          <td class="text-xs-left">
            {{ props.item.text }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:escalation_rules'"
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
              v-has-perms.disable="'write:escalation_rules'"
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
              v-has-perms.disable="'write:escalation_rules'"
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
      perms="write:escalation_rules"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import InformationTooltip from '@/components/notification/InformationTooltip'
import InformationDialog from '@/components/notification/InformationDialog'
import EscalationTriggersInformationDialog from '@/components/notification/EscalationTriggersInformationDialog'
import TagsInformationDialog from '@/components/notification/TagsInformationDialog'
import ExcludedTagsInformationDialog from './notification/ExcludedTagsInformationDialog'
import TagsEdit from './notification/TagsEdit'
import EscalationTriggersEdit from './notification/EscalationTriggersEdit'
import GSelect from './GSelect.vue'
import GCombobox from './GCombobox.vue'
import GTextField from './GTextField.vue'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd,
    InformationTooltip,
    InformationDialog,
    EscalationTriggersInformationDialog,
    TagsInformationDialog,
    ExcludedTagsInformationDialog,
    TagsEdit,
    EscalationTriggersEdit,
    GSelect,
    GCombobox,
    GTextField
  },
  data: vm => ({
    status: ['true', 'false'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    intervals: ['second', 'minute', 'hour', 'days'],
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('Active'), value: 'active', info: [i18n.t('ActiveInfoTrue'), i18n.t('ActiveInfoFalse') ] },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Environment'), value: 'environment', info: i18n.t('EscalationEnvironmentInfo') },
      { text: i18n.t('Time'), value: 'time', info: i18n.t('EscalationTimeInfo') },
      { text: i18n.t('Triggers'), value: 'triggers' },
      { text: i18n.t('Days'), value: 'days', info: i18n.t('EscalationDaysInfo') },
      { text: i18n.t('Start'), value: 'startTime', info: i18n.t('EscalationStartTimeInfo') },
      { text: i18n.t('End'), value: 'endTime', info: i18n.t('EscalationEndTimeInfo') },
      { text: i18n.t('Service'), value: 'service', info: i18n.t('EscalationServicesInfo') },
      { text: i18n.t('Resource'), value: 'resource', info: i18n.t('EscalationResourceInfo') },
      { text: i18n.t('Event'), value: 'event', info: i18n.t('EscalationEventInfo') },
      { text: i18n.t('Group'), value: 'group', info: i18n.t('EscalationGroupInfo') },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: i18n.t('ExcludedTags'), value: 'excludedTags' },
      { text: i18n.t('User'), value: 'user' },
      { text: 'Text', value: 'text' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      active: true,
      customer: null,
      environment: null,
      time: '',
      timeObj: {
        time: '',
        interval: ''
      },
      useOnCall: false,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [{ all: [], any: []}],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      days: [],
      triggers: [{ from_severity: [], to_severity: []}],
      excludedTags: [{ all: [], any: []}],
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      active: true,
      customer: null,
      environment: null,
      time: '',
      timeObj: {
        time: '1',
        interval: 'hour'
      },
      useOnCall: false,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [{ all: [], any: []}],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      days: [],
      triggers: [{ from_severity: [], to_severity: []}],
      excludedTags: [{ all: [], any: []}],
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    escalation_rules() {
      return this.$store.state.escalationRules.escalation_rules
        .filter(b => !this.status  || this.status.includes(String(b.active)) || b.active === null)
        .map(b => {
          let period = {
            startTime: '',
            endTime: ''
          }
          if (b.startTime !== null && b.endTime !== null) {
            let sTime = new Date()
            let eTime = new Date()
            sTime.setUTCHours(
              parseInt(b.startTime.substr(0, 2)),
              parseInt(b.startTime.substr(3))
            )
            eTime.setUTCHours(
              parseInt(b.endTime.substr(0, 2)),
              parseInt(b.endTime.substr(3))
            )
            period.startTime = `${('0' + sTime.getHours()).slice(-2)}:${(
              '0' + sTime.getMinutes()
            ).slice(-2)}`
            period.endTime = `${('0' + eTime.getHours()).slice(-2)}:${(
              '0' + eTime.getMinutes()
            ).slice(-2)}`
          }

          return Object.assign(
            { ...b },
            {
              period: period,
              timeObj: {
                time: b.time,
                interval: 'second'
              }
            }
          )
        })
    },
    pagination: {
      get() {
        return this.$store.getters['escalationRules/pagination']
      },
      set(value) {
        this.$store.dispatch('escalationRules/setPagination', value)
      }
    },
    users() {
      return this.$store.state.users.users
    },
    groups() {
      return this.$store.state.groups.groups
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    allowedEnvironments() {
      return this.$store.getters['alerts/environments']()
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentTags() {
      return this.$store.getters['alerts/tags']
    },
    currentGroups() {
      return this.$store.getters['alerts/groups']
    },
    isLoading() {
      return this.$store.state.escalationRules.isLoading
    },
    formTitle() {
      return !this.editedId
        ? i18n.t('NewEscalationRule')
        : i18n.t('EditEscalationRule')
    },
    severities() {
      return Object.keys(this.$store.getters.getConfig('alarm_model').severity)
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
      this.getEscalationRules()
      this.getCustomers()
      this.getEnvironments()
      this.getServices()
      this.getTags()
      this.getUsers()
      this.getGroups()
    },
    pagination: {
      handler() {
        this.getEscalationRules()
      },
      deep: true
    }
  },
  created() {
    this.getEscalationRules()
    this.getCustomers()
    this.getEnvironments()
    this.getServices()
    this.getTags()
    this.editedItem = Object.assign({},  JSON.parse(JSON.stringify(this.defaultItem)))
    this.editedItemStart = Object.assign({}, JSON.parse(JSON.stringify(this.defaultItem)))
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
    getEscalationRules() {
      this.$store.dispatch('escalationRules/getEscalationRules')
    },
    emptyArray(arr) {
      for (let t in arr) {
        return false
      }
      return true
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getTags() {
      this.$store.dispatch('alerts/getTags')
    },

    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, JSON.parse(JSON.stringify(item)))
      this.editedItemStart = JSON.parse(JSON.stringify(item))
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch(
          'escalationRules/deleteEscalationRule',
          item.id
        )
    },
    close() {
      let change = !this.compareDict(this.editedItem, this.editedItemStart)
      if (this.saved || !change || confirm('Are you sure you want to close the dialog?')) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
          this.editedItem = JSON.parse(JSON.stringify(this.defaultItem))
          this.editedItemStart = JSON.parse(JSON.stringify(this.defaultItem))
          this.editedId = null
          this.saved = false
          if (this.dialog) this.dialog = false
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
    changeState(item) {
      this.$store.dispatch('escalationRules/updateEscalationRule', [
        item.id,
        {
          active: !item.active,
        }
      ])
    },
    save() {
      let sTimeStr = null
      let eTimeStr = null
      if (
        this.editedItem.period.startTime !== '' &&
        this.editedItem.period.endTime !== ''
      ) {
        let sTime = new Date()
        let eTime = new Date()
        sTime.setHours(
          this.editedItem.period.startTime.substr(0, 2),
          this.editedItem.period.startTime.substr(3)
        )
        eTime.setHours(
          this.editedItem.period.endTime.substr(0, 2),
          this.editedItem.period.endTime.substr(3)
        )
        sTimeStr = `${('0' + sTime.getUTCHours()).slice(-2)}:${(
          '0' + sTime.getUTCMinutes()
        ).slice(-2)}`
        eTimeStr = `${('0' + eTime.getUTCHours()).slice(-2)}:${(
          '0' + eTime.getUTCMinutes()
        ).slice(-2)}`
      }
      if (this.editedId) {
        this.$store.dispatch('escalationRules/updateEscalationRule', [
          this.editedId,
          {
            active: this.editedItem.active,
            customer: this.editedItem.customer,
            environment: this.editedItem.environment,
            time: `${this.editedItem.timeObj.time} ${this.editedItem.timeObj.interval}`,
            service: this.editedItem.service,
            resource: this.editedItem.resource,
            event: this.editedItem.event,
            group: this.editedItem.group,
            tags: this.editedItem.tags,
            excludedTags: this.editedItem.excludedTags,
            startTime: sTimeStr,
            endTime: eTimeStr,
            days: this.editedItem.days,
            triggers: this.editedItem.triggers
          }
        ])
      } else {
        this.$store.dispatch(
          'escalationRules/createEscalationRule',
          Object.assign(this.editedItem, {
            id: null,
            time: `${this.editedItem.timeObj.time} ${this.editedItem.timeObj.interval}`,
            startTime: sTimeStr,
            endTime: eTimeStr,
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
