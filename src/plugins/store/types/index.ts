import type {State as AlertsState, Getters as AlertsGetters, Actions as AlertsActions} from './alerts-types'
import type {State as AuthState, Getters as AuthGetters, Actions as AuthActions} from './auth-types'
import type {State as ConfigState, Getters as ConfigGetters, Actions as ConfigActions} from './config-types'
import type {State as CustomerState, Getters as CustomerGetters, Actions as CustomerActions} from './customer-types'
import type {
  State as EscalationState,
  Getters as EscalationGetters,
  Actions as EscalationActions
} from './escalationRule-types'
import type {State as GroupState, Actions as GroupActions} from './groups-types'
import type {State as HeartbeatState, Actions as HeartbeatActions} from './heartbeats-types'
import type {State as KeyState, Actions as KeyActions} from './keys-types'
import type {State as ManagementState, Actions as ManagementActions} from './management-types'
import type {
  State as NotificationChannelState,
  Getters as NotificationChannelGetters,
  Actions as NotificationChannelActions
} from './notificationChannel-types'
import type {
  State as NotificationDelayState,
  Getters as NotificationDelayGetters,
  Actions as NotificationDelayActions
} from './notificationDelay-types'
import type {
  State as NotificationGroupState,
  Getters as NotificationGroupGetters,
  Actions as NotificationGroupActions
} from './notificationGroup-types'
import type {
  State as NotificationHistoryState,
  Getters as NotificationHistoryGetters,
  Actions as NotificationHistoryActions
} from './notificationHistory-types'
import type {
  State as NotificationRuleState,
  Getters as NotificationRuleGetters,
  Actions as NotificationRuleActions
} from './notificationRule-types'
import type {
  State as NotificationSendState,
  Getters as NotificationSendGetters,
  Actions as NotificationSendActions
} from './notificationSends-types'
import type {
  State as NotificationsState,
  Getters as NotificationsGetters,
  Actions as NotificationsActions
} from './notifications-types'
import type {State as OnCallState, Getters as OnCallGetters, Actions as OnCallActions} from './onCall-types'
import type {State as BlackoutState, Actions as BlackoutActions} from './blackout-types'
import type {State as PermsState, Getters as PermsGetters, Actions as PermsActions} from './perms-types'
import type {
  State as PreferencesState,
  Getters as PreferencesGetters,
  Actions as PreferencesActions
} from './preferences-types'
import type {State as ReportsState, Actions as ReportsActions} from './reports-types'
import type {State as UsersState, Getters as UsersGetters, Actions as UsersActions} from './users-types'
import type {State as IndexState, Actions as IndexActions} from '../index'

import type {ActionContext as VuexContext, Store as defaultStore} from 'vuex'

export type OmitIfUndefined<T, O> = undefined extends T
  ? []
  : undefined extends O
    ? [payload: T]
    : [payload: T, options: {root: true}]

export type ActionContext<M extends {[key: string]: any}, A extends {[key: string]: any}, S> = {
  commit<K extends keyof M>(key: K, ...[payload]: OmitIfUndefined<Parameters<M[K]>[1], undefined>): M[K]
  dispatch<K extends keyof A>(key: K, ...[payload]: OmitIfUndefined<Parameters<A[K]>[1], undefined>): A[K]
  dispatch<K extends keyof Actions>(key: K, ...payload: OmitIfUndefined<Parameters<Actions[K]>[1], true>): A[K]
  rootGetters: Getters
} & Omit<VuexContext<S, State>, 'commit' | 'rootGetters' | 'dispatch'>

// export type ActionContext<M extends {[key: string]: any}, A extends {[key: string]: any}, S> = Context<object, Actions, State> & Context<M, A, S>

export type State = {
  auth: AuthState
  refresh: boolean
  alerts: AlertsState
  multiselect: boolean
  customers: CustomerState
  escalationRules: EscalationState
  groups: GroupState
  heartbeats: HeartbeatState
  keys: KeyState
  management: ManagementState
  notificationChannels: NotificationChannelState
  notificationDelays: NotificationDelayState
  notificationGroups: NotificationGroupState
  notificationHistory: NotificationHistoryState
  notificationRules: NotificationRuleState
  notificationSends: NotificationSendState
  notifications: NotificationsState
  blackouts: BlackoutState
  onCalls: OnCallState
  perms: PermsState
  config: ConfigState
  reports: ReportsState
  users: UsersState
  prefs: PreferencesState
} & IndexState

type AlertModule = {
  [K in keyof AlertsGetters as `alerts/${K}`]: ReturnType<AlertsGetters[K]>
}

type AuthModule = {
  [K in keyof AuthGetters as `auth/${K}`]: ReturnType<AuthGetters[K]>
}

type CustomerModule = {
  [K in keyof CustomerGetters as `customers/${K}`]: ReturnType<CustomerGetters[K]>
}

type EscalationModule = {
  [K in keyof EscalationGetters as `escalationRules/${K}`]: ReturnType<EscalationGetters[K]>
}

type NotificationChannelModule = {
  [K in keyof NotificationChannelGetters as `notificationChannels/${K}`]: ReturnType<NotificationChannelGetters[K]>
}

type NotificationDelayModule = {
  [K in keyof NotificationDelayGetters as `notificationDelays/${K}`]: ReturnType<NotificationDelayGetters[K]>
}

type NotificationGroupModule = {
  [K in keyof NotificationGroupGetters as `notificationGroups/${K}`]: ReturnType<NotificationGroupGetters[K]>
}

type NotificationHistoryModule = {
  [K in keyof NotificationHistoryGetters as `notificationHistory/${K}`]: ReturnType<NotificationHistoryGetters[K]>
}

type NotificationRuleModule = {
  [K in keyof NotificationRuleGetters as `notificationRules/${K}`]: ReturnType<NotificationRuleGetters[K]>
}

type NotificationSendModule = {
  [K in keyof NotificationSendGetters as `notificationSends/${K}`]: ReturnType<NotificationSendGetters[K]>
}

type NotificationsModule = {
  [K in keyof NotificationsGetters as `notifications/${K}`]: ReturnType<NotificationsGetters[K]>
}

type OnCallModule = {
  [K in keyof OnCallGetters as `onCalls/${K}`]: ReturnType<OnCallGetters[K]>
}

type PermsModule = {
  [K in keyof PermsGetters as `perms/${K}`]: ReturnType<PermsGetters[K]>
}

type UsersModule = {
  [K in keyof UsersGetters as `users/${K}`]: ReturnType<UsersGetters[K]>
}

type ConfigModule = {
  [K in keyof ConfigGetters]: ReturnType<ConfigGetters[K]>
}

type PreferencesModule = {
  [K in keyof PreferencesGetters]: ReturnType<PreferencesGetters[K]>
}

export type Getters = AlertModule &
  AuthModule &
  ConfigModule &
  CustomerModule &
  EscalationModule &
  NotificationChannelModule &
  NotificationDelayModule &
  NotificationGroupModule &
  NotificationHistoryModule &
  NotificationRuleModule &
  NotificationSendModule &
  NotificationsModule &
  OnCallModule &
  PermsModule &
  PreferencesModule &
  UsersModule

export type AlertDispatch = {
  [K in keyof AlertsActions as `alerts/${K}`]: AlertsActions[K]
}

export type AuthDispatch = {
  [K in keyof AuthActions as `auth/${K}`]: AuthActions[K]
}

export type CustomerDispatch = {
  [K in keyof CustomerActions as `customers/${K}`]: CustomerActions[K]
}

export type EscalationDispatch = {
  [K in keyof EscalationActions as `escalationRules/${K}`]: EscalationActions[K]
}

export type GroupDispatch = {
  [K in keyof GroupActions as `groups/${K}`]: GroupActions[K]
}

export type HeartbeatDispatch = {
  [K in keyof HeartbeatActions as `heartbeats/${K}`]: HeartbeatActions[K]
}

export type KeyDispatch = {
  [K in keyof KeyActions as `keys/${K}`]: KeyActions[K]
}

export type ManagementDispatch = {
  [K in keyof ManagementActions as `management/${K}`]: ManagementActions[K]
}

export type NotificationChannelDispatch = {
  [K in keyof NotificationChannelActions as `notificationChannels/${K}`]: NotificationChannelActions[K]
}

export type NotificationDelayDispatch = {
  [K in keyof NotificationDelayActions as `notificationDelays/${K}`]: NotificationDelayActions[K]
}

export type NotificationGroupDispatch = {
  [K in keyof NotificationGroupActions as `notificationGroups/${K}`]: NotificationGroupActions[K]
}

export type NotificationHistoryDispatch = {
  [K in keyof NotificationHistoryActions as `notificationHistory/${K}`]: NotificationHistoryActions[K]
}

export type NotificationRuleDispatch = {
  [K in keyof NotificationRuleActions as `notificationRules/${K}`]: NotificationRuleActions[K]
}

export type NotificationSendDispatch = {
  [K in keyof NotificationSendActions as `notificationSends/${K}`]: NotificationSendActions[K]
}

export type NotificationsDispatch = {
  [K in keyof NotificationsActions as `notifications/${K}`]: NotificationsActions[K]
}

export type OnCallDispatch = {
  [K in keyof OnCallActions as `onCalls/${K}`]: OnCallActions[K]
}

export type BlackoutDispatch = {
  [K in keyof BlackoutActions as `blackouts/${K}`]: BlackoutActions[K]
}

export type PermsDispatch = {
  [K in keyof PermsActions as `perms/${K}`]: PermsActions[K]
}

export type ReportsDispatch = {
  [K in keyof ReportsActions as `reports/${K}`]: ReportsActions[K]
}

export type UsersDispatch = {
  [K in keyof UsersActions as `users/${K}`]: UsersActions[K]
}

export type ConfigDispatch = {
  [K in keyof ConfigActions]: ConfigActions[K]
}

export type PreferencesDispatch = {
  [K in keyof PreferencesActions]: PreferencesActions[K]
}

export type IndexDispatch = {
  [K in keyof IndexActions]: IndexActions[K]
}

export type Actions = AlertDispatch &
  AuthDispatch &
  ConfigDispatch &
  IndexActions &
  CustomerDispatch &
  EscalationDispatch &
  GroupDispatch &
  HeartbeatDispatch &
  KeyDispatch &
  ManagementDispatch &
  NotificationChannelDispatch &
  NotificationDelayDispatch &
  NotificationGroupDispatch &
  NotificationHistoryDispatch &
  NotificationRuleDispatch &
  NotificationSendDispatch &
  NotificationsDispatch &
  OnCallDispatch &
  BlackoutDispatch &
  PermsDispatch &
  PreferencesDispatch &
  ReportsDispatch &
  UsersDispatch

type Dispatch = <K extends keyof Actions>(
  key: K,
  ...payload: OmitIfUndefined<Parameters<Actions[K]>[1], undefined>
) => ReturnType<Actions[K]>

export type Store = {
  state: State
  getters: Getters
  dispatch: Dispatch
} & Omit<defaultStore<State>, 'state' | 'getters' | 'dispatch'>

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $store: Store
  }
}
