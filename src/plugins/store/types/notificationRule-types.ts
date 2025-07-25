import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Pagination, Query } from './alerts-types';
import type { Tag, Trigger } from './escalationRule-types';

export type NotificationRule = {
  active: boolean;
  channelId: string;
  createTime?: string;
  customer: string | null;
  days: string[];
  delayTime: string | null;
  endTime: string | null;
  environment: string;
  event: string | null;
  excludedTags: Tag[];
  group: string | null;
  groupIds: string[];
  href?: string;
  id?: string;
  name: string | null;
  priority?: number;
  reactivate: string | null;
  receivers: string[];
  resource: string | null;
  service: string[];
  startTime: string | null;
  tags: Tag[];
  text: string;
  triggers: Trigger[];
  useOnCall: boolean;
  user?: string;
  userIds: string[];
}

export interface NotificationRuleHistory {
  user: string;
  type: string;
  createTime: string;
  data: NotificationRule;
}

export interface State {
  isLoading: boolean;
  items: NotificationRule[]
  history: NotificationRuleHistory[],
  item: null | NotificationRule,
  selected: string[]
  activeFilter: {active: boolean, inactive: boolean}
  historyPagination: Pagination;
  pagination: Pagination;
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_SEARCH_QUERY(state: S, query: Query): void
  SET_SELECTED(state: S, selected: string[]): void
  SET_ITEMS(state: S, [rule, total, pageSize]: [NotificationRule[], number, number]): void
  SET_ITEM(state: S, rule: NotificationRule): void
  SET_HISTORY(state: S, [notificationHistory, total, pageSize]: [NotificationRuleHistory[], number, number]): void
  SET_PAGINATION(state: S, pagination: Pagination): void
  SET_HISTORY_PAGINATION(state: S, pagination: Pagination): void
  SET_ACTIVE_FILTER(state: S, filter: Partial<{active: boolean, inactive: boolean}>): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
    getNotificationRules({ commit, state }: AugmentedActionContext): void
    getNotificationRule({ commit, state }: AugmentedActionContext, id: string): void
    getNotificationRuleHistory({ commit, state }: AugmentedActionContext, id: string): void
    setActiveFilter({ commit }: AugmentedActionContext, filter: Partial<{active: boolean, inactive: boolean}>): void
    createNotificationRule({ dispatch }: AugmentedActionContext, notificationrule: NotificationRule): void
    updateSelected({ commit }: AugmentedActionContext, selected: string[]): void
    updateNotificationRule({ dispatch }: AugmentedActionContext, [id, update]: [string, Partial<NotificationRule>]): void
    deleteNotificationRule({ dispatch }: AugmentedActionContext, id: string): void
    updateQuery({ commit }: AugmentedActionContext, query: Query): void
    setPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
    setHistoryPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
}

export type Getters = {
  pagination(state: State): Pagination
  historyPagination(state: State): Pagination
}