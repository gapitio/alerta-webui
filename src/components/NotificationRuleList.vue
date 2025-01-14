<template>
  <div>
    <v-dialog
      v-model="active_dialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <v-flex
              xs12
              sm6
              md9
            >
              <span class="headline">
                {{ editedItem.active ? 'Activate' : 'Deactivate' }} {{ editedItem.name ? editedItem.name : editedItem.id }}
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
                  xs8
                >
                  <v-menu
                    ref="menu1"
                    v-model="menu1"
                    :disabled="editedItem.active"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="editedItem.reactivateDate"
                      :disabled="editedItem.active"
                      :label="$t('ReactivateDate')"
                      prepend-icon="event"
                    />
                    <v-date-picker
                      v-model="editedItem.reactivateDate"
                      no-title
                      @input="menu1 = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex
                  xs4
                >
                  <v-combobox
                    v-model="editedItem.reactivateTime"
                    :disabled="editedItem.active"
                    :items="times"
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
              @click="close_active"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="changeState(editedItem)"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog
      v-model="activateBulkDialog"
      max-width="540px"
    > 
      <v-card>
        <v-card-title>
          <v-flex
            xs12
            sm6
            md9
          >
            <span class="headline">
              {{ $t('Activate') }} {{ $t('NotificationRules') }}
            </span>
          </v-flex>
        </v-card-title>
        
        <v-card-text>
          <span> {{ $t('NotificationRules') }} {{ $t('Activated') }}: </span>
          <ul>
            <li
              v-for="item in selected"
              :key="item.id"
            >
              {{ item.name ? item.name : item.id }}
            </li>
          </ul>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            flat
            @click="closeBulkActive"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="blue darken-1"
            flat
            @click="changeBulkState({active:true})"
          >
            {{ $t('Ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deactivateBulkDialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <v-flex
              xs12
              sm6
              md9
            >
              <span class="headline">
                {{ $t('Deactivate') }} {{ $t('NotificationRules') }}
              </span>
            </v-flex>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  xs8
                >
                  <v-menu
                    ref="menu3"
                    v-model="menu3"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="bulkDeactivateItem.reactivateDate"
                      :label="$t('ReactivateDate')"
                      prepend-icon="event"
                    />
                    <v-date-picker
                      v-model="bulkDeactivateItem.reactivateDate"
                      no-title
                      @input="menu3 = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex
                  xs4
                >
                  <v-combobox
                    v-model="bulkDeactivateItem.reactivateTime"
                    :items="times"
                  />
                </v-flex>
              </v-layout>
              <span> {{ $t('NotificationRules') }} {{ $t('Deactivated') }}: </span>
              <ul>
                <li
                  v-for="item in selected"
                  :key="item.id"
                >
                  {{ item.name ? item.name : item.id }}
                </li>
              </ul>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="closeBulkActive()"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="changeBulkState(bulkDeactivateItem)"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog
      v-model="dialog"
      scrollable
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
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
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
                  />
                </v-flex>

                <v-flex
                  xs8
                >
                  <v-menu
                    ref="menu2"
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="editedItem.reactivateDate"
                      :label="$t('ReactivateDate')"
                      prepend-icon="event"
                    />
                    <v-date-picker
                      v-model="editedItem.reactivateDate"
                      no-title
                      @input="menu2 = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex
                  xs4
                >
                  <v-combobox
                    v-model="editedItem.reactivateTime"
                    :items="times"
                    :label="$t('Time')"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.name"
                    :label="$t('Name')"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.channelId"
                    :items="currentChannelsIds"
                    :label="$t('NotificationChannel') + '*'"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex xs7>
                  <v-text-field
                    v-model.trim="editedItem.timeObj.time"
                    :label="$t('DelayTime')"
                  />
                </v-flex>
                <v-flex xs4>
                  <v-select
                    v-model="editedItem.timeObj.interval"
                    :items="intervals"
                    :label="$t('Interval')"
                  />
                </v-flex>
                <information-tooltip 
                  :info="$t('DelayTimeInfo')"
                  position="left"
                />

                <v-flex xs12>
                  <v-card>
                    <v-toolbar>
                      <v-toolbar-title>{{ $t('Receivers') }}</v-toolbar-title>
                      <information-tooltip :info="$t('ReceiversAllInfo')" />
                      <v-spacer />
                      <v-spacer />
                      <v-spacer />
                      <v-spacer />
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-checkbox
                            v-model="editedItem.useOnCall"
                            :label="$t('UseOncall')"
                            v-on="on"
                          />
                        </template>
                        <span>{{ $t('UseOnCallInfo') }}</span>
                      </v-tooltip>
                    </v-toolbar>
                    <v-container>
                      <v-layout
                        wrap
                        xs12
                      >
                        <v-flex
                          xs12
                        >
                          <v-combobox
                            v-model="editedItem.receivers"
                            :label="$t('Receivers')"
                            multiple
                            chips
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
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>

                <v-flex xs12>
                  <v-card>
                    <v-toolbar>
                      <v-toolbar-title>{{ $t('Triggers') }}</v-toolbar-title>
                      <information-tooltip :info="$t('TriggerInfo')" />
                      <triggers-information-dialog />
                      <v-spacer />

                      <v-btn
                        icon
                        @click="
                          editedItem.triggers = [...editedItem.triggers, { from_severity: [], to_severity: [], status: [], text: null}]
                        "
                      >
                        add
                        <v-icon>add</v-icon>
                      </v-btn>
                      <v-spacer />

                      <v-btn
                        icon
                        @click="editedItem.triggers = []"
                      >
                        clear
                        <v-icon>
                          clear
                        </v-icon>
                      </v-btn>
                    </v-toolbar>
                    <v-container>
                      <v-layout
                        v-for="(item, index) in editedItem.triggers"
                        :key="index"
                        wrap
                        xs12
                      >
                        <v-flex xs10>
                          <v-layout wrap>
                            <v-flex xs5>
                              <v-select
                                v-model="item.from_severity"
                                :items="severities"
                                :label="$t('FromSeverity')"
                                chips
                                multiple
                              />
                            </v-flex>
                            <v-flex xs5>
                              <v-select
                                v-model="item.to_severity"
                                :items="severities"
                                :label="$t('ToSeverity')"
                                chips
                                multiple
                              />
                            </v-flex>
                            <v-flex xs10>
                              <v-select
                                v-model="item.status"
                                :items="statuses"
                                :label="$t('Status')"
                                chips
                                multiple
                              />
                            </v-flex>
                            <v-flex xs10>
                              <v-text-field
                                v-model="item.text"
                                :label="$t('Text')"
                              />
                            </v-flex>
                          </v-layout>
                        </v-flex>
                        <v-flex
                          xs2
                          align-self-center
                        >
                          <v-btn
                            icon
                            @click="
                              editedItem.triggers.splice(index, 1)
                            "
                          >
                            <v-icon>delete</v-icon>
                          </v-btn>
                        </v-flex>
                        <v-flex>
                          <v-divider />
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
                <v-flex xs12>
                  <v-select
                    v-model="editedItem.days"
                    :items="days"
                    :label="$t('Days')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs6>
                  <v-combobox
                    v-model="editedItem.period.startTime"
                    :items="times"
                    :label="$t('StartTime')"
                  />
                </v-flex>
                <v-flex xs6>
                  <v-combobox
                    v-model="editedItem.period.endTime"
                    :items="times"
                    :label="$t('EndTime')"
                  />
                </v-flex>
                <v-card>
                  <v-toolbar>
                    <v-toolbar-title>{{ $t('AlertFields') }}</v-toolbar-title>
                    <information-tooltip :info="$t('AlertFieldsInfo')" />
                  </v-toolbar>
                  <v-container>
                    <v-layout
                      wrap
                      xs12
                    >
                      <v-flex xs12>
                        <v-select
                          v-model="editedItem.environment"
                          :items="allowedEnvironments"
                          :label="$t('Environment') + '*'"
                          :rules="[rules.required]"
                          required
                        />
                      </v-flex>

                      <v-flex xs12>
                        <v-text-field
                          v-model.trim="editedItem.resource"
                          :label="$t('Resource')"
                        />
                      </v-flex>

                      <v-flex xs12>
                        <v-text-field
                          v-model.trim="editedItem.event"
                          :label="$t('Event')"
                        />
                      </v-flex>
                      
                      <v-flex xs11>
                        <v-combobox
                          v-model="editedItem.service"
                          :items="currentServices"
                          :menu-props="{ maxHeight: '400' }"
                          :label="$t('Service')"
                          chips
                          multiple
                          :hint="$t('ChooseService')"
                          persistent-hint
                        />
                      </v-flex>
                      <information-tooltip 
                        :info="$t('ServiceInfo')" 
                        position="left"
                      />

                      <v-flex xs12>
                        <v-combobox
                          v-model.trim="editedItem.group"
                          :items="currentGroups"
                          :label="$t('Group')"
                          clearable
                        />
                      </v-flex>

                      <v-flex xs12>
                        <v-card>
                          <v-toolbar>
                            <v-toolbar-title>{{ $t('Tags') }}</v-toolbar-title>
                            <tags-information-dialog />

                            <v-spacer />

                            <v-btn
                              icon
                              @click="
                                editedItem.tags = [...editedItem.tags, { all: [], any: []}]
                              "
                            >
                              add
                              <v-icon>add</v-icon>
                            </v-btn>
                            <v-spacer />

                            <v-btn
                              icon
                              @click="editedItem.tags = []"
                            >
                              clear
                              <v-icon>
                                clear
                              </v-icon>
                            </v-btn>
                          </v-toolbar>
                          <v-container>
                            <v-layout
                              v-for="(tag, index) in editedItem.tags"
                              :key="index"
                              wrap
                              xs12
                            >
                              <v-flex xs10>
                                <v-layout wrap>
                                  <v-flex xs11>
                                    <v-combobox
                                      v-model="tag.all"
                                      :items="currentTags"
                                      :label="$t('AND')"
                                      chips
                                      multiple
                                      xs4
                                    />
                                  </v-flex>            
                                  <information-tooltip 
                                    :info="$t('TagsAnd')" 
                                    position="left"
                                  />
                                  <v-flex xs11>
                                    <v-combobox
                                      v-model="tag.any"
                                      :items="currentTags"
                                      :label="$t('OR')"
                                      chips
                                      multiple
                                    />
                                  </v-flex>   
                                  <information-tooltip 
                                    :info="$t('TagsOr')" 
                                    position="left"
                                  />
                                </v-layout>
                              </v-flex>
                              <v-flex
                                xs2
                                align-self-center
                              >
                                <v-btn
                                  icon
                                  @click="
                                    editedItem.tags.splice(index, 1)
                                  "
                                >
                                  <v-icon>delete</v-icon>
                                </v-btn>
                              </v-flex>
                              <v-flex>
                                <v-divider />
                              </v-flex>
                            </v-layout>
                          </v-container>
                        </v-card>
                      </v-flex>

                      <v-flex xs12>
                        <v-card>
                          <v-toolbar>
                            <v-toolbar-title>Excluded Tags</v-toolbar-title>

                            <v-spacer />

                            <v-btn
                              icon
                              @click="
                                editedItem.excludedTags = [...editedItem.excludedTags, { all: [], any: []}]
                              "
                            >
                              add
                              <v-icon>add</v-icon>
                            </v-btn>
                            <v-spacer />

                            <v-btn
                              icon
                              @click="editedItem.excludedTags = []"
                            >
                              clear
                              <v-icon>
                                clear
                              </v-icon>
                            </v-btn>
                          </v-toolbar>
                          <v-container>
                            <v-layout
                              v-for="(tag, index) in editedItem.excludedTags"
                              :key="index"
                              wrap
                              xs12
                            >
                              <v-flex xs10>
                                <v-layout wrap>
                                  <v-flex xs11>
                                    <v-combobox
                                      v-model="tag.all"
                                      :items="currentTags"
                                      :label="$t('AND')"
                                      chips
                                      multiple
                                      xs4
                                    />
                                  </v-flex>
                                  <information-tooltip 
                                    :info="$t('TagsExcludeAnd')" 
                                    position="left"
                                  />
                                  <v-flex xs11>
                                    <v-combobox
                                      v-model="tag.any"
                                      :items="currentTags"
                                      :label="$t('OR')"
                                      chips
                                      multiple
                                    />
                                  </v-flex>
                                  <information-tooltip 
                                    :info="$t('TagsExcludeOr')" 
                                    position="left"
                                  />
                                </v-layout>
                              </v-flex>
                              <v-flex
                                xs2
                                align-self-center
                              >
                                <v-btn
                                  icon
                                  @click="
                                    editedItem.excludedTags.splice(index, 1)
                                  "
                                >
                                  <v-icon>delete</v-icon>
                                </v-btn>
                              </v-flex>
                              <v-flex>
                                <v-divider />
                              </v-flex>
                            </v-layout>
                          </v-container>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card>

                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Text')"
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
              @click="dialog = false"
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
        {{ $t('Notification Rules') }}
        <information-dialog 
          :info="headers" 
          :title="$t('NotificationRulesInfo')"
        >
          <triggers-information-dialog :slot="$t('Triggers')" />
          <tags-information-dialog :slot="$t('Tags')" />
          <tags-information-dialog :slot="$t('ExcludedTags')" />
        </information-dialog>
        <v-spacer />
        <span
          v-if="selectableRows"
          class="subheading"
        >
          {{ selected.length }}<span class="hidden-sm-and-down"> {{ $t('selected') }}</span>
        </span>

        <v-tooltip
          v-if="selectableRows"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="activateBulk()"
          >
            <v-icon>
              check
            </v-icon>
          </v-btn>
          <span>{{ $t('Activate') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="selectableRows"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="deactivateBulk()"
          >
            <v-icon>
              highlight_off
            </v-icon>
          </v-btn>
          <span>{{ $t('Deactivate') }}</span>
        </v-tooltip>
        <v-spacer />
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
        v-model="selected"
        :headers="computedHeaders"
        :items="notification_rules"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="table"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
        select-all
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>
            <v-checkbox
              v-model="props.selected"
              primary
              hide-details
              color="gray"
              class="select-box"
              :ripple="false"
              @click.stop
            />
          </td>
          <td>
            <v-btn
              v-has-perms.disable="'write:notification_rules'"
              icon
              class="btn--plain mx-0"
              @click="editActive(props.item)"
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
          <td>{{ props.item.reactivateDate }} {{ props.item.reactivateTime }}</td>
          <td>{{ props.item.delayTime }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.environment }}</td>
          <td>{{ props.item.channelId }}</td>
          <td>
            <v-chip
              v-for="number in [...props.item.receivers, ...users.filter(b => props.item.userIds.includes(b.id)).map(b => b.name), ...groups.filter(b => props.item.groupIds.includes(b.id)).map(b => b.name)]"
              :key="number"
              outline
              small
            >
              {{ number }}
            </v-chip>
          </td>
          <td>{{ props.item.useOnCall }}</td>
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
                    From:
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
                    To:
                    <v-chip
                      v-for="severity in trigger.to_severity"
                      :key="severity"
                      outline
                      small
                    >
                      {{ severity }}
                    </v-chip>
                  </v-flex>
                  <v-flex
                    v-if="!emptyArray(trigger.status)"
                    xs12
                  >
                    Status:
                    <v-chip
                      v-for="severity in trigger.status"
                      :key="severity"
                      outline
                      small
                    >
                      {{ severity }}
                    </v-chip>
                  </v-flex>
                </v-layout>
                <v-layout v-if="trigger.text">
                  <v-flex>
                    Text: {{ trigger.text }}
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
              v-has-perms.disable="'write:notification_rules'"
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
              v-has-perms.disable="'write:notification_rules'"
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
              v-has-perms.disable="'write:notification_rules'"
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
      perms="write:notification_rules"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import InformationTooltip from '@/components/notification/InformationTooltip'
import TagsInformationDialog from '@/components/notification/TagsInformationDialog'
import TriggersInformationDialog from '@/components/notification/TriggersInformationDialog'
import InformationDialog from '@/components/notification/InformationDialog'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd,
    InformationTooltip,
    TagsInformationDialog,
    TriggersInformationDialog,
    InformationDialog
  },
  data: vm => ({
    status: ['true', 'false'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    intervals: ['second','minute', 'hour', 'days'],
    search: '',
    dialog: false,
    active_dialog: false,
    headers: [
      { text: i18n.t('Active'), value: 'active', info: [i18n.t('ActiveInfoTrue'), i18n.t('ActiveInfoFalse') ] },
      { text: i18n.t('Reactivate'), value: 'reactivate', info: i18n.t('ReactivateDateInfo')},
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Delay'), value: 'delay', info: i18n.t('DelayTimeInfo') },
      { text: i18n.t('Name'), value: 'Name', info: i18n.t('NameInfo') },
      { text: i18n.t('Environment'), value: 'environment', info: i18n.t('ActiveInfoTrue') },
      { text: i18n.t('Channel'), value: 'channel', info: i18n.t('NotificationHistoryChannel') },
      { text: i18n.t('Receivers'), value: 'receivers', info: i18n.t('ReceiversInfo') },
      { text: i18n.t('OnCall'), value: 'useOnCall', info: [i18n.t('UseOnCallInfoTrue'), i18n.t('UseOnCallInfoFalse')]  },
      { text: i18n.t('Triggers'), value: 'triggers'  },
      { text: i18n.t('Days'), value: 'days', info: i18n.t('DaysInfo') },
      { text: i18n.t('Start'), value: 'startTime', info: i18n.t('StartTimeInfo') },
      { text: i18n.t('End'), value: 'endTime', info: i18n.t('EndTimeInfo') },
      { text: i18n.t('Service'), value: 'service', info: i18n.t('ServicesInfo') },
      { text: i18n.t('Resource'), value: 'resource', info: i18n.t('ResourceInfo') },
      { text: i18n.t('Event'), value: 'event', info: i18n.t('EventInfo') },
      { text: i18n.t('Group'), value: 'group', info: i18n.t('GroupInfo') },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: i18n.t('ExcludedTags'), value: 'excludedTags', info: i18n.t('') },
      { text: i18n.t('User'), value: 'user'},
      { text: 'Text', value: 'text', info: i18n.t('TextInfo') },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    deactivateBulkDialog: false,
    activateBulkDialog: false,
    bulkDeactivateItem:{
      active: false,
      reactivateDate: null,
      reactivateTime: null,
    },
    bulkDeactivateDefaultItem:{
      active: false,
      reactivateDate: null,
      reactivateTime: null,
    },
    editedItem: {
      active: true,
      customer: null,
      name: null,
      environment: null,
      timeObj: {
        time: null,
        interval: null
      },
      receivers: [],
      userIds: [],
      groupIds: [],
      useOnCall: false,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      excludedTags: [],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      text: '',
      days: [],
      triggers: [],
      channelId: null
    },
    menu1: false,
    menu2: false,
    menu3: false,
    defaultItem: {
      active: true,
      customer: null,
      name: null,
      environment: null,
      timeObj: {
        time: null,
        interval: null
      },
      receivers: [],
      userIds: [],
      groupIds: [],
      useOnCall: false,
      service: [],
      resource: null,
      event: null,
      group: null,
      excludedTags: [],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      text: '',
      days: [],
      triggers: [],
      channelId: null,
      tags: []
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_rules() {
      return this.$store.state.notificationRules.notification_rules
        .filter(b => !this.status  || this.status.includes(String(b.active)))
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
          let reactivate = b.reactivate ? moment(b.reactivate) : null

          return Object.assign(
            { ...b },
            {
              period: period,
              timeObj: {
                time: b.delayTime,
                interval: 'second'
              },
              text:
                b.text === null
                  ? ''
                  : b.text.replace(/%\(([\w\[\]\. ]*)\)s/g, '{$1}'),
              triggers:  b.triggers.map(a => {return {...a, text: a.text !== null ? a.text.replace(/%\(([\w\[\]\. ]*)\)s/g, '{$1}') : a.text}})
            },
            reactivate ? {reactivateDate: reactivate.format('YYYY-MM-DD'),reactivateTime: reactivate.format('HH:mm'),} : {}
          )
        })
    },
    query: {
      get() {
        return this.$store.state.notificationRules.query
          ? this.$store.state.notificationRules.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    pagination: {
      get() {
        return this.$store.getters['notificationRules/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationRules/setPagination', value)
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
    allowedEnvironments() {
      return this.$store.getters['alerts/environments']()
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentChannelsIds() {
      return this.$store.getters['notificationChannels/ids']
    },
    currentTags() {
      return this.$store.getters['alerts/tags']
    },
    currentGroups() {
      return this.$store.getters['alerts/groups']
    },
    isLoading() {
      return this.$store.state.notificationRules.isLoading
    },
    formTitle() {
      return !this.editedId
        ? i18n.t('NewNotificationRule')
        : i18n.t('EditNotificationRule')
    },
    severities() {
      return Object.keys(this.$store.getters.getConfig('alarm_model').severity)
    },
    statuses() {
      return Object.keys(this.$store.getters.getConfig('alarm_model').status)
    },
    selected: {
      get() {
        return this.$store.state.notificationRules.selected
      },
      set(value) {
        this.$store.dispatch('notificationRules/updateSelected', value)
      }
    },
    selectableRows() {
      return this.selected.length > 0
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
      if (val) return
      this.getNotificationRules()
      this.getNotificationChannels()
      this.getCustomers()
      this.getEnvironments()
      this.getServices()
      this.getTags()
      this.getUsers()
      this.getGroups()
      this.getNotificaitonGroups()
    },
    pagination: {
      handler() {
        this.getNotificationRules()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationRules()
    this.getNotificationChannels()
    this.getCustomers()
    this.getEnvironments()
    this.getServices()
    this.getTags()
    this.getUsers()
    this.getGroups()
    this.getNotificaitonGroups()
    this.editedItem = Object.assign({}, JSON.parse(JSON.stringify(this.defaultItem)))
    this.editedItemStart = JSON.parse(JSON.stringify(this.defaultItem))
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
    emptyArray(arr) {
      for (let t in arr) {
        return false
      }
      return true
    },
    setSearch(query) {
      this.$store.dispatch('notificationRules/updateQuery', {q: query})
      this.$router.push({query: {...this.$router.query, q: query}})
      this.refresh_all()
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('notificationRules/updateQuery', {})
      this.$router.push({query: {...this.$router.query, q: undefined}})
      this.refresh_all()
    },
    getNotificationRules() {
      this.$store.dispatch('notificationRules/getNotificationRules')
    },
    getNotificationChannels() {
      this.$store.dispatch('notificationChannels/getNotificationChannels')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getGroups() {
      this.$store.dispatch('groups/getGroups')
    },
    getNotificaitonGroups() {
      this.$store.dispatch('notificationGroups/getNotificationGroups')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    toISODate(date, time) {
      return new Date(date + ' ' + time).toISOString()
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getTags() {
      this.$store.dispatch('alerts/getTags')
    },
    editActive(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.editedItem.active = !this.editedItem.active
      this.active_dialog = true
    },
    deactivateBulk() {
      this.deactivateBulkDialog = true
    },
    activateBulk() {
      this.activateBulkDialog = true
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
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
          'notificationRules/deleteNotificationRule',
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
        }, 300)
      }
      else setTimeout(() => this.dialog = true, 0.1)
    },
    close_active() {
      this.active_dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, JSON.parse(JSON.stringify(this.defaultItem)))
        this.editedId = null
      }, 300)
    },
    closeBulkActive() {
      if(this.deactivateBulkDialog){
        this.deactivateBulkDialog = false
        setTimeout(() => {
          this.bulkDeactivateItem = Object.assign({}, this.bulkDeactivateDefaultItem)
        }, 300)
      }
      else this.activateBulkDialog = false
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    changeState(item) {
      this.$store.dispatch('notificationRules/updateNotificationRule', [
        item.id,
        {
          active: item.active,
          reactivate: this.editedItem.reactivateDate && !item.active ? this.toISODate(
            this.editedItem.reactivateDate,
            this.editedItem.reactivateTime
          ) : null
        }
      ])
      this.close_active()
    },
    changeBulkState(item) {
      this.selected.map(a => {
        this.$store
          .dispatch('notificationRules/updateNotificationRule', [
            a.id,
            {
              active: item.active,
              reactivate: this.bulkDeactivateItem.reactivateDate ? this.toISODate(
                this.bulkDeactivateItem.reactivateDate,
                this.bulkDeactivateItem.reactivateTime
              ) : null
            }
          ])
      })
      this.clearSelected()
      this.closeBulkActive()
    },
    clearSelected() {
      this.$store.dispatch('notificationRules/updateSelected', [])
    },
    refresh_all() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
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
        this.$store.dispatch('notificationRules/updateNotificationRule', [
          this.editedId,
          {
            active: this.editedItem.active,
            customer: this.editedItem.customer,
            name: this.editedItem.name,
            environment: this.editedItem.environment,
            delayTime: this.editedItem.timeObj.time ? `${this.editedItem.timeObj.time} ${this.editedItem.timeObj.interval}` : null,
            receivers: this.editedItem.receivers,
            userIds: this.editedItem.userIds,
            groupIds: this.editedItem.groupIds,
            useOnCall: this.editedItem.useOnCall,
            service: this.editedItem.service,
            resource: this.editedItem.resource,
            event: this.editedItem.event,
            group: this.editedItem.group,
            tags: this.editedItem.tags,
            excludedTags: this.editedItem.excludedTags,
            startTime: sTimeStr,
            endTime: eTimeStr,
            text: this.editedItem.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s'),
            days: this.editedItem.days,
            channelId: this.editedItem.channelId,
            triggers: this.editedItem.triggers.map(b => {return {...b, text: b.text !== null ? b.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s') : b.text}}),
            reactivate:  this.editedItem.reactivateDate ? this.toISODate(
              this.editedItem.reactivateDate,
              this.editedItem.reactivateTime
            ) : null
          }
        ])
      } else {
        this.$store.dispatch(
          'notificationRules/createNotificationRule',
          Object.assign(this.editedItem, {
            id: null,
            startTime: sTimeStr,
            endTime: eTimeStr,
            delayTime: this.editedItem.timeObj.time ? `${this.editedItem.timeObj.time} ${this.editedItem.timeObj.interval}` : null,
            text: this.editedItem.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s'),
            triggers: this.editedItem.triggers.map(b => {return {...b, text: b.text !== null ? b.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s') : b.text}}),
          })
        )
      }
      this.saved = true
      this.dialog = false
    }
  }
}
</script>

<style>
.table .v-table th, td {
  padding: 0px 5px !important;
}
</style>
