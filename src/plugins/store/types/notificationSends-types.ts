import type {ActionContext} from '.'
import type {Pagination, Query} from './alerts-types'

export type NotificationSend = {
  id: string
  name: string
  type: string[]
  sms: boolean
  mail: boolean
}

export type NotificationSendData = {
  receivers: string[]
  text: string
  notifications: NotificationSend[]
}

export type Filter = {
  name?: string[]
  type?: 'user' | 'group'
}

export interface State {
  isLoading: boolean
  pagination: Pagination
  items: NotificationSend[]
  query: Query
  filter: Filter
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  SET_PAGINATION(state: S, pagination: {[key in keyof Pagination]?: Pagination[key]}): void
  RESET_LOADING(state: S): void
  SET_NOTIFICATION_SEND(state: S, [notificationGroups, total, pageSize]: [NotificationSend[], number, number]): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getNotificationSends({commit, state}: AugmentedActionContext): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  updateNotificationSend(
    {dispatch}: AugmentedActionContext,
    [notificationGroupId, update]: [string, Partial<NotificationSend>]
  ): void
  sendNotification({}: AugmentedActionContext, [channelId, data]: [string, NotificationSendData]): void
}

export type Getters = {
  pagination(state: State): Pagination
}
