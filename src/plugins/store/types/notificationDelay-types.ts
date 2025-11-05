import type {ActionContext} from '.'
import type {Pagination} from './alerts-types'

export type NotificationDelay = {
  id: string
  notification_rule_id: string
  alert_id: string
  delay_time: string
}

export interface State {
  isLoading: boolean
  pagination: Pagination
  items: NotificationDelay[]
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_NOTIFICATION_DELAY(state: S, [notificationDelays, total, pageSize]: [NotificationDelay[], number, number]): void
  SET_PAGINATION(state: S, pagination: {[key in keyof Pagination]?: Pagination[key]}): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getNotificationDelays({commit, state}: AugmentedActionContext): void
  deleteNotificationDelay({dispatch}: AugmentedActionContext, id: string): void
  setPagination({commit}: AugmentedActionContext, pagination: Pagination): void
}

export type Getters = {
  pagination(state: State): Pagination
}
