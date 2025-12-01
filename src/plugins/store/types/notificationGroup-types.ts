import type {ActionContext} from '.'
import type {Pagination, Query} from './alerts-types'

export type NotificationGroup = {
  id: string
  usersEmails: string[]
  mails: string[]
  phoneNumbers: string[]
  name: string
}

export type NotificationGroupAdd = Omit<NotificationGroup, 'id'> & {id?: string}

export type Filter = {
  name?: string[]
  usersEmails?: string[]
  phoneNumbers?: string[]
  mails?: string[]
}

export interface State {
  isLoading: boolean
  pagination: Pagination
  items: NotificationGroup[]
  query: Query
  filter: Filter
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  SET_PAGINATION(state: S, pagination: {[key in keyof Pagination]?: Pagination[key]}): void
  RESET_LOADING(state: S): void
  SET_NOTIFICATION_GROUP(state: S, [notificationGroups, total, pageSize]: [NotificationGroup[], number, number]): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getNotificationGroups({commit, state}: AugmentedActionContext): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  createNotificationGroup({dispatch}: AugmentedActionContext, notificationGroup: NotificationGroupAdd): void
  updateNotificationGroup(
    {dispatch}: AugmentedActionContext,
    [notificationGroupId, update]: [string, NotificationGroupAdd]
  ): void
  deleteNotificationGroup({dispatch}: AugmentedActionContext, notificationGroupId: string): void
  setPagination({commit}: AugmentedActionContext, pagination: Pagination): void
}

export type Getters = {
  pagination(state: State): Pagination
  getHash(state: State): string
}
