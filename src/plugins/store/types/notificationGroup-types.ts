import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Pagination, Query } from './alerts-types';

export type NotificationGroup = {
  id: string;
  users: string[];
  mails: string[];
  phoneNumbers: string[];
  name: string;
}

export interface State {
  isLoading: boolean;
  pagination: Pagination;
  items: NotificationGroup[]
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_PAGINATION(state: S, pagination: { [key in keyof Pagination]?: Pagination[key] }): void
  RESET_LOADING(state: S): void
  SET_NOTIFICATION_GROUP(state: S, [notificationGroups, total, pageSize]: [NotificationGroup[], number, number]): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
  getNotificationGroups({ commit, state }: AugmentedActionContext): void
  createNotificationGroup({ dispatch }: AugmentedActionContext, notificationGroup: NotificationGroup): void
  updateNotificationGroup({ dispatch }: AugmentedActionContext, [notificationGroupId, update]: [string, NotificationGroup]): void
  deleteNotificationGroup({ dispatch }: AugmentedActionContext, notificationGroupId: string): void
  setPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
}

export type Getters = {
  pagination(state: State): Pagination
}