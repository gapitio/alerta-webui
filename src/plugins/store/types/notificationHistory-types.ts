import type {ActionContext} from '.'
import type {Pagination, Query} from './alerts-types'

export type NotificationHistory = {
  alert: string
  channel: string
  confirmed: boolean | null
  confirmed_time: string | null
  error: string | null
  id: string
  message: string
  receiver: string
  rule: string
  sender: string
  sent: boolean
  sent_time: string
}

export type DateRange = {
  from?: number
  to?: number
  select?: boolean
}

export type Filter = {
  dateRange: DateRange
  message?: string[]
  receiver?: string[]
  channel?: string[]
  rule?: string[]
  alert?: string[]
  error?: string[]
}

type ActiveFilter = {
  sent: boolean
  error: boolean
}

export interface State {
  isLoading: boolean
  notification_history: NotificationHistory[]
  sent: boolean[]
  filter: Filter
  activeFilter: ActiveFilter
  pagination: Pagination
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  SET_ACTIVE_FILTER(state: S, filter: Partial<ActiveFilter>): void
  RESET_LOADING(state: S): void
  SET_SEARCH_QUERY(state: S, query: Query): void
  SET_SHOWN_SENT_STATUS(state: S, sent: boolean[]): void
  SET_NOTIFICATION_HISTORY(
    state: S,
    [notificationHistory, total, pageSize]: [NotificationHistory[], number, number]
  ): void
  SET_PAGINATION(state: S, pagination: Pagination): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getNotificationHistory({commit, state}: AugmentedActionContext): Promise<NotificationHistory[]>
  updateQuery({commit}: AugmentedActionContext, query: Query): void
  setShownSentStatus({commit}: AugmentedActionContext, status: boolean[]): void
  setPagination({commit}: AugmentedActionContext, status: Pagination): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  setActiveFilter({commit, dispatch}: AugmentedActionContext, filter: Partial<ActiveFilter>): void
  resetFilter({commit}: AugmentedActionContext): void
}

export type Getters = {
  pagination(state: State): Pagination
  sent(state: State): boolean[]
  getHash(state: State): string
}
