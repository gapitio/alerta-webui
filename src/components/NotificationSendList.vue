<template>
  <div>
    <v-card>
      <v-card-title class="title">
        {{ $t('NotificationSend') }}
        <v-spacer />
        <v-select
          v-model="emailChannel"
          :items="emailNotificationChannels"
          :label="$t('EmailChannel')"
          item-text="id"
          item-value="id"
        />
        <v-spacer />
        <v-select
          v-model="smsChannel"
          :items="smsNotificationChannels"
          :label="$t('SMSChannel')"
          item-text="id"
          item-value="id"
        />
        <v-spacer />
        <v-text-field
          v-model="text"
          :label="$t('Text')"
        />
        <v-spacer />
        <v-btn @click="send">
          {{ $t('Send') }}
        </v-btn>
      </v-card-title>

      <v-data-table
        v-model="notifications"
        :headers="computedHeaders"
        :items="sends"
        :pagination.sync="pagination"
        class="px-2"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.type }}</td>
          <td>
            <v-checkbox 
              v-model="props.item.mail"
              @change="updateNotifcationSend(props.item)"
            />
          </td>
          <td>
            <v-checkbox 
              v-model="props.item.sms"
              @change="updateNotifcationSend(props.item)"
            />
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  data: vm => ({
    pagination: {
      sortBy: 'name',
      rowsPerPage: 20,
      
    },
    notifications: [],
    types: [
      { text: 'sendgrid (mail)', value: 'sendgrid', email: true },
      { text: 'smtp (mail)', value: 'smtp', email: true },
      { text: 'twilio (sms)', value: 'twilio_sms', email: false },
      { text: 'twilio (call + sms)', value: 'twilio_call', email: false },
      { text: 'link moblity xml (sms)', value: 'link_mobility_xml', email: false },
      { text: 'my link', value: 'my_link', email: false }
    ],
    emailChannel: '',
    smsChannel: '',
    text: 'Hello, this is a text from notification send',
    headers: [
      { text: i18n.t('Name'), value: 'name' },
      { text: i18n.t('Type'), value: 'type' },
      { text: i18n.t('Email'), value: 'email' },
      { text: i18n.t('SMS'), value: 'sms' }
    ],
  }),
  computed: {
    sends() {
      return this.$store.state.notificationSends.notifications
        .map(b => Object.assign({}, b))
    },
    emailNotificationChannels() {
      return this.$store.state.notificationChannels.notification_channels
        .filter (b => {
          for (const type of this.types) {
            if (type.value != b.type) continue
            return type.email
          }
        })
    },
    smsNotificationChannels() {
      return this.$store.state.notificationChannels.notification_channels
        .filter (b => {
          for (const type of this.types) {
            if (type.value != b.type) continue
            return !type.email
          }
        })
    },
    computedHeaders() {
      return this.headers
    },
    isLoading() {
      return this.$store.state.notificationChannels.isLoading || this.$store.state.users.isLoading || this.$store.state.notificationGroups.isLoading
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
    refresh(val) {
      if (!val) return
      this.getNotificationChannels()
      this.getUsersAndGroups()
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
  },
  methods: {
    send() {
      if (this.emailChannel){
        const emailNotifications = this.sends.filter(b => b.mail)
        this.$store.dispatch(
          'notificationSends/sendNotification',
          [
            this.emailChannel,
            {
              receivers: [],
              text: this.text,
              notifications: emailNotifications
            }
          ]
        )
      }
      if (this.smsChannel) {
        const smsNotifications = this.sends.filter(b => b.sms)
        this.$store.dispatch(
          'notificationSends/sendNotification',
          [
            this.smsChannel,
            {
              receivers: [],
              text: this.text,
              notifications: smsNotifications
            }
          ]
        )
      }
    },
    updateNotifcationSend(item) {
      this.$store.dispatch(
        'notificationSends/updateNotificationSend',
        [
          item.id,
          {
            mail: item.mail,
            sms: item.sms
          }
        ])
    },
    getNotificationChannels() {
      this.$store.dispatch('notificationChannels/getNotificationChannels')
    },
    getUsersAndGroups() {
      this.$store.dispatch('notificationSends/getNotificationSends')
    },
  }
}
</script>

<style></style>
