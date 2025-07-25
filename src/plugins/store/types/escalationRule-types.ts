import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Pagination, Query } from './alerts-types'

export interface Trigger {
  from_severity: string[];
  to_severity: string[];
  status?: string[];
  text?: string;

}

export interface Tag {
  all: string[];
  any: string[];
}

export interface EscalationRule {
  id?: string;
  active: boolean;
  href?: string;
  priority?: number;
  environment: string;
  time: string | null;
  service: string[];
  triggers: Trigger[];
  resource: string | null;
  event: string | null;
  group: string | null;
  tags: Tag[];
  excludedTags: Tag[];
  customer: string | null;
  user?: string;
  createTime?: string;
  startTime: string | null;
  endTime: string | null;
  days: string[];
}

export interface State {
  isLoading: boolean;
  items: EscalationRule[];
  selected: string[]
  activeFilter: {active: boolean, inactive: boolean}
  pagination: Pagination
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void; 
  RESET_LOADING(state: S): void;
  SET_ITEMS(state: S, [escalationRules, total, pageSize]: [EscalationRule[], number, number]): void;
  SET_SELECTED(state: S, selected: string[]): void
  SET_PAGINATION(state: S, pagination: { [key in keyof Pagination]?: Pagination[key] }): void;
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
  getEscalationRules({ commit, state }: AugmentedActionContext): void
  setActiveFilter({ commit }: AugmentedActionContext, filter: Partial<{active: boolean, inactive: boolean}>): void
  createEscalationRule({ dispatch }: AugmentedActionContext, escalation_rule: EscalationRule): void
  updateSelected({ commit }: AugmentedActionContext, selected: string[]): void
  updateEscalationRule({ dispatch }: AugmentedActionContext, [escalationRuleId, update]: [string, EscalationRule]): void
  setPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
  deleteEscalationRule({ dispatch }: AugmentedActionContext, escalationRuleId: string): void
}

export type Getters = {
  pagination(state: State): Pagination
}