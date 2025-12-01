import type {ActionContext} from '.'
import type {Pagination, Query} from './alerts-types'

export type NotificationChannelType =
  | 'sendgrid'
  | 'smtp'
  | 'twilio_sms'
  | 'twilio_call'
  | 'link_mobility_xml'
  | 'my_link'

export type NotificationChannel = {
  customer?: string | null
  host: string | null
  href?: string
  id: string
  apiSid?: string
  apiToken?: string
  sender: string
  type: NotificationChannelType
  verify: boolean | null
}

export type Filter = {
  name?: string[]
  sender?: string[]
  type?: NotificationChannelType[]
}

export type NotificationSend = {
  text: string
  receivers: string[]
  users: string[]
  groups: string[]
}

export interface State {
  isLoading: boolean
  items: NotificationChannel[]
  encryptionKey: string
  pagination: Pagination
  query: Query
  filter: Filter
}

export type Mutations<S = State> = {
  SET_ENCRYPTION_KEY(state: S, key: string): void
  SET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  RESET_LOADING(state: S): void
  SET_NOTIFICATION_CHANNEL(
    state: S,
    [notificationChannel, total, pageSize]: [NotificationChannel[], number, number]
  ): void
  SET_PAGINATION(state: S, pagination: Pagination): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getEncryptionKey({commit}: AugmentedActionContext): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  getNotificationChannels({commit, state}: AugmentedActionContext): void
  createNotificationChannel({dispatch}: AugmentedActionContext, notificationChannel: NotificationChannel): void
  updateNotificationChannel(
    {dispatch}: AugmentedActionContext,
    [notificationChannelId, update]: [string, NotificationChannel]
  ): void
  deleteNotificationChannel({dispatch}: AugmentedActionContext, notificationChannelId: NotificationChannel['id']): void
  setPagination({commit}: AugmentedActionContext, pagination: Pagination): void
  testNotificationChannel(_: AugmentedActionContext, [notificationChannelId, data]: [string, NotificationSend]): void
}

export type Getters = {
  pagination(state: State): Pagination
  ids(state: State): NotificationChannel['id'][]
  getHash(state: State): string
}
