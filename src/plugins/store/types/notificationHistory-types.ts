import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Pagination, Query } from './alerts-types';

export type NotificationHistory = {
  alert: string;
  channel: string;
  confirmed: boolean | null;
  confirmed_time: string | null;
  error: string | null;
  id: string;
  message: string
  receiver: string;
  rule: string
  sender: string;
  sent: boolean;
  sent_time: string
}

export interface State {
  isLoading: boolean;
  notification_history: NotificationHistory[]
  sent: boolean[]
  pagination: Pagination;
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_SEARCH_QUERY(state: S, query: Query): void
  SET_SHOWN_SENT_STATUS(state: S, sent: boolean[]): void
  SET_NOTIFICATION_HISTORY(state: S, [notificationHistory, total, pageSize]: [NotificationHistory[], number, number]): void
  SET_PAGINATION(state: S, pagination: Pagination): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
    getNotificationHistory({ commit, state }: AugmentedActionContext): void
    updateQuery({ commit }: AugmentedActionContext, query: Query): void
    setShownSentStatus({ commit }: AugmentedActionContext, status: boolean[]): void
    setPagination({ commit }: AugmentedActionContext, status: Pagination): void
}

export type Getters = {
  pagination(state: State): Pagination
  sent(state: State): boolean[]
}