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
                <v-flex xs12>
                  <v-select
                    v-model="editedItem.users"
                    :items="users"
                    item-text="name"
                    item-value="id"
                    :label="$t('Users')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs12>
                  <v-combobox
                    v-model="editedItem.phoneNumbers"
                    :label="$t('PhoneNumbers')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs12>
                  <v-combobox
                    v-model="editedItem.mails"
                    :label="$t('Emails')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model="editedItem.name"
                    :label="$t('Name')"
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

    <v-card>
      <v-card-title class="title">
        {{ $t('NotificationGroups') }}
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="notificationGroups"
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
          <td>{{ props.item.name }}</td>
          <td>
            <v-chip
              v-for="user in props.item.users"
              :key="user"
              outline
              small
            >
              {{ getName(users, user) }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="number in props.item.phoneNumbers"
              :key="number"
              outline
              small
            >
              {{ number }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="mail in props.item.mails"
              :key="mail"
              outline
              small
            >
              {{ mail }}
            </v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:notification_groups'"
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
              v-has-perms.disable="'write:notification_groups'"
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
              v-has-perms.disable="'write:notification_groups'"
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
      perms="write:notification_groups"
      @add-to-list="dialog = true"
    />
  </div>
</template>
<script>

import ListButtonAdd from './lib/ListButtonAdd'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd
  },
  data: vm => ({
    search: '',
    dialog: false,
    headers: [
      {
        text: i18n.t('Name'),
        value: 'name'
      },
      {
        text: i18n.t('Users'),
        value: 'users'
      },
      {
        text: i18n.t('PhoneNumbers'),
        value: 'phoneNumbers'
      },
      {
        text: i18n.t('Emails'),
        value: 'mails'
      },
      {
        text: i18n.t('Actions'),
        value: 'name',
        sortable: false
      }
    ],
    editedId: null,
    editedItem: {
      name: null,
      users: [],
      phoneNumbers: [],
      mails: [],
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      name: null,
      users: [],
      phoneNumbers: [],
      mails: [],
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notificationGroups() {
      return this.$store.state.notificationGroups.notificationGroups
        .filter(b =>
          this.search
            ? Object.keys(b).some(
              k => b[k] && b[k].toString().includes(this.search)
            )
            : true
        )
    },
    pagination: {
      get() {
        return this.$store.getters['notificationGroups/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationGroups/setPagination', value)
      }
    },
    users() {
      return this.$store.state.users.users
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
      return this.$store.state.notificationGroups.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewNotificationGroup') : i18n.t('EditNotificationGroup')
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
      this.getNotificationGroups()
      this.getUsers()
    },
    pagination: {
      handler() {
        this.getNotificationGroups()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationGroups()
    this.getUsers()
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
    getNotificationGroups() {
      this.$store.dispatch('notificationGroups/getNotificationGroups')
    },
    getName(nameList,id) {
      let name = nameList.find(element => element.id == id)
      return name !== undefined ? name.name : id
    },
    getUsers() {
      this.$store.dispatch('users/getUsers')
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
      this.$store.dispatch('notificationRules/getNoificationRulesGroup', item.id).then(
        (value) => {
          const rules = value.notificationRules.map(({id, name}) => name ?? id)
          confirm(`${i18n.t('ConfirmDelete')}\nNotification Rules affected:\n - ${rules.join('\n  - ')}`) &&
            this.$store.dispatch('notificationGroups/deleteNotificationGroup', item.id)
        }
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
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('notificationGroups/updateNotificationGroup', [
          this.editedId,
          {
            name: this.editedItem.name,
            users: this.editedItem.users,
            phoneNumbers: this.editedItem.phoneNumbers,
            mails: this.editedItem.mails
          }
        ])
      } else {
        this.$store.dispatch(
          'notificationGroups/createNotificationGroup',
          Object.assign(this.editedItem, {
            id: null
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
