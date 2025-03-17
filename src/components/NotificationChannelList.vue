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

                <v-flex xs11>
                  <v-text-field
                    v-model="editedItem.id"
                    :label="$t('ID')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex xs1>
                  <information-tooltip
                    :info="$t('NotificationChannelId')"
                    position="left"
                  />
                </v-flex>

                <v-flex xs11>
                  <v-text-field
                    v-model="editedItem.sender"
                    :label="$t('Sender')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                
                <v-flex xs1>
                  <information-tooltip
                    :info="$t('SenderInfo')"
                    position="left"
                  />
                </v-flex>

                <v-flex xs11>
                  <v-select
                    v-model="editedItem.type"
                    :items="types"
                    :label="$t('Type')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex xs1>
                  <information-tooltip
                    :info="$t('NotificationChannelType')"
                    position="left"
                  />
                </v-flex>

                <v-flex
                  v-if="(editedItem.type === 'smtp' || editedItem.type === 'link_mobility' || editedItem.type === 'link_mobility_xml')"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.host"
                    :label="$t('Host')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="(editedItem.type === 'smtp' || editedItem.type === 'link_mobility' || editedItem.type === 'link_mobility_xml')"
                  xs11
                >
                  <v-text-field
                    v-model="editedItem.verify"
                    :label="$t('Verify')"
                  />
                </v-flex>
                <v-flex 
                  v-if="(editedItem.type === 'smtp' || editedItem.type === 'link_mobility' || editedItem.type === 'link_mobility_xml')"
                  xs1
                >
                  <information-tooltip
                    :info="$t('VerifyInfo')"
                    position="left"
                  />
                </v-flex>
                <v-flex
                  v-if="editedId === null && labels[editedItem.type].username !== undefined"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.apiSid"
                    :type="editedItem.type !== 'smtp' && editedItem.type !== 'jira' ? 'password' : 'text'"
                    :label="labels[editedItem.type].username"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedId === null"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.apiToken"
                    :type="'password'"
                    :label="labels[editedItem.type].password"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedItem.type === 'link_mobility'"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.platformId"
                    :label="$t('PlatformId')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedItem.type === 'link_mobility'"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.platformPartnerId"
                    :label="$t('PlatfromPartnerId')"
                    :rules="[rules.required]"
                    required
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
    <v-dialog
      v-model="testDialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              TestNotificationChannel
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    v-model="testedItem.text"
                    :label="$t('Message')"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm6
                  md9
                >
                  <v-combobox
                    v-model="testedItem.receivers"
                    :label="$t('Receivers')"
                    multiple
                    chips
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="testedItem.userIds"
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
                    v-model="testedItem.groupIds"
                    :items="groups"
                    item-text="name"
                    item-value="id"
                    :label="$t('Groups')"
                    chips
                    multiple
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
              @click="closeTest"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="test"
            >
              {{ testType == "sendgrid" || testType == "smtp" ? $t('TestEmail') : $t('TestSMS') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('NotificationChannels') }}
        
        <information-dialog 
          :info="info"
          :title="$t('NotificationChannelsInfo') "
        />
        <v-spacer />
        <v-tooltip bottom>
          <template slot="activator">
            <v-btn @click="copyEncryptionKey">
              Get New Encryption Key
            </v-btn>
          </template>
          <span>{{ $t('NotificationKeyGenerate') }}</span>
          <br>
          <span>{{ $t('NotificationKey') }}</span>
        </v-tooltip>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          :label="$t('Search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="notification_channels"
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
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.sender }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.host }}</td>
          <td>{{ props.item.verify }}</td>

          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:notification_channels'"
              icon
              class="btn--plain mr-0"
              @click="testItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                {{ props.item.type == "sendgrid" || props.item.type == "smtp" ? "email": "sms" }}
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:notification_channels'"
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
              v-has-perms.disable="'write:notification_channels'"
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
              v-has-perms.disable="'write:notification_channels'"
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
      perms="write:notification_channels"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import InformationTooltip from '@/components/notification/InformationTooltip'
import InformationDialog from '@/components/notification/InformationDialog'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd,
    InformationTooltip,
    InformationDialog
  },
  data: vm => ({
    types: [
      { text: 'sendgrid (email)', value: 'sendgrid' },
      { text: 'smtp (email)', value: 'smtp' },
      { text: 'twilio (sms)', value: 'twilio_sms' },
      { text: 'twilio (call + sms)', value: 'twilio_call' },
      { text: 'link moblity xml (sms)', value: 'link_mobility_xml' },
      { text: 'my link (sms)', value: 'my_link' }
    ],
    labels: {
      sendgrid: {password: 'API Key'},
      smtp: {password: 'Password', username: 'Username'},
      twilio_sms: {password: 'ApiToken', username: 'ApiSid'},
      twilio_call: {password: 'ApiToken', username: 'ApiSid'},
      link_mobility_xml: {password: 'Password', username: 'Username'},
      my_link: {password: 'Client Secret', username: 'Client ID'},
    },
    search: '',
    dialog: false,
    testDialog: false,
    info: [
      { text: i18n.t('ID'), info: i18n.t('NotificationChannelId') },
      { text: i18n.t('Sender'), info: i18n.t('SenderInfo') },
      { text: i18n.t('Type'), info: i18n.t('NotificationChannelType') },
      { text: i18n.t('Host'), info: i18n.t('HostInfo') },
      { text: i18n.t('Verify'), info: i18n.t('VerifyInfo') },
    ],
    headers: [
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('ID'), value: 'id' },
      { text: i18n.t('Sender'), value: 'sender' },
      { text: i18n.t('Type'), value: 'type' },
      { text: i18n.t('Host'), value: 'type' },
      { text: i18n.t('Verify'), value: 'type' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    testId: null,
    testType: null,
    testedItem: {
      receivers: [],
      userIds: [],
      groupIds: [],
      useOnCall: false,
      text: '',
    },
    defaultTestItem: {
      receivers: [],
      userIds: [],
      groupIds: [],
      useOnCall: false,
      text: '',
    },
    editedId: null,
    editedItem: {
      customer: null,
      id: null,
      sender: null,
      type: null,
      host: null,
      apiToken: null,
      apiSid: null,
      platformPartnerId: null,
      platformId: null,
      verify: null
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      customer: null,
      id: null,
      sender: null,
      type: 'sendgrid',
      host: null,
      apiToken: null,
      apiSid: null,
      platformPartnerId: null,
      platformId: null,
      verify: null
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_channels() {
      return this.$store.state.notificationChannels.notification_channels
        .filter(b =>
          this.search
            ? Object.keys(b).some(
              k => b[k] && b[k].toString().includes(this.search)
            )
            : true
        )
        .map(b => {
          return { ...b }
        })
    },
    pagination: {
      get() {
        return this.$store.getters['notificationChannels/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationChannels/setPagination', value)
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
      return this.$store.state.notificationChannels.isLoading
    },
    formTitle() {
      return !this.editedId
        ? i18n.t('NewNotificationChannel')
        : i18n.t('EditNotificationChannel')
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    testDialog(val) {
      val || this.closeTest()
    },
    refresh(val) {
      if (!val) return
      this.getNotificationChannels()
      this.getUsersAndGroups()
      this.getEncryptionKey()
      this.getCustomers()
    },
    pagination: {
      handler() {
        this.getNotificationChannels()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationChannels()
    this.getUsersAndGroups()
    this.getEncryptionKey()
    this.getCustomers()
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
    getEncryptionKey() {
      this.$store.dispatch('notificationChannels/getEncryptionKey')
    },
    copyEncryptionKey() {
      this.getEncryptionKey()
      navigator.clipboard.writeText(
        this.$store.state.notificationChannels.encryptionKey
      )
    },
    getNotificationChannels() {
      this.$store.dispatch('notificationChannels/getNotificationChannels')
    },
    getUsersAndGroups() {
      this.$store.dispatch('users/getUsers')
      this.$store.dispatch('notificationGroups/getNotificationGroups')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.editedItemStart = Object.assign({}, item)
      this.dialog = true
    },
    testItem(item) {
      this.testId = item.id
      this.testType = item.type
      this.testDialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch(
          'notificationChannels/deleteNotificationChannel',
          item.id
        )
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
    closeTest() {
      this.testDialog = false
      this.testedItem = Object.assign({}, this.defaultTest)
    },
    test() {
      this.$store.dispatch('notificationChannels/testNotificationChannel', [this.testId, this.testedItem])
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('notificationChannels/updateNotificationChannel', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            sender: this.editedItem.sender,
            type: this.editedItem.type,
            host: this.editedItem.host,
            apiToken: this.editedItem.apiToken,
            apiSid: this.editedItem.apiSid,
            platformId: this.editedItem.platformId,
            platformPartnerId: this.editedItem.platformPartnerId,
            verify: this.editedItem.verify
          }
        ])
      } else {
        this.$store.dispatch(
          'notificationChannels/createNotificationChannel',
          this.editedItem
        )
      }
      this.dialog = false
      this.saved = true
    }
  }
}
</script>

<style></style>
