import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Pagination, Query } from './alerts-types';

export type NotificationChannel = {
  customer: string | null;
  host: string | null;
  href?: string;
  id: string;
  platformId: string | null;
  platformPartnerId: string | null;
  sender: string;
  type: string;
  verify: boolean | null;
}

export interface State {
  isLoading: boolean;
  notification_channels: NotificationChannel[];
  encryptionKey: string;
  pagination: Pagination;
  query: Query;
}

export type Mutations<S = State> = {
  SET_ENCRYPTION_KEY(state: S, key: string): void
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_NOTIFICATION_CHANNEL(state: S, [notificationChannel, total, pageSize]: [NotificationChannel[], number, number]): void
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
    getEncryptionKey({ commit }: AugmentedActionContext): void
    getNotificationChannels({ commit, state }: AugmentedActionContext): void
    createNotificationChannel({ dispatch }: AugmentedActionContext, notificationChannel: NotificationChannel): void
    updateNotificationChannel({ dispatch }: AugmentedActionContext, [notificationChannelId, update]: [string, NotificationChannel]): void
    deleteNotificationChannel({ dispatch }: AugmentedActionContext, notificationChannelId: NotificationChannel['id']): void
    setPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
    testNotificationChannel(_: AugmentedActionContext, [notificationChannelId, data]: [string, any]): void
}

export type Getters = {
    pagination(state: State): Pagination
    ids(state: State): NotificationChannel["id"][]
}