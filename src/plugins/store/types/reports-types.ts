import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Pagination, Query, Filter } from './alerts-types';

export type Resource = {
  href: string;
  id: string;
  resource: string;
}

export type Report = {
  count: number;
  duplicateCount: number;
  environments: string[];
  event: string;
  resources: Resource[];
  services: string[];
}

export interface State {
  offenders: Report[];
  flapping: Report[];
  standing: Report[];
  report: string;
  filter: Filter;
  query: Query;
  pagination: Pagination;
}

export type Mutations<S = State> = {
  SET_TOP_OFFENDERS(state: S, top10: Report[]): void
  SET_TOP_FLAPPING(state: S, top10: Report[]): void
  SET_TOP_STANDING(state: S, top10: Report[]): void
  SET_FILTER(state: S, filter: Filter): void
  SET_PAGE_SIZE(state: S, size: number): void
  SET_REPORT(state: S, top10: string): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
    getTopOffenders({ commit, state }: AugmentedActionContext): void
    getTopFlapping({ commit, state }: AugmentedActionContext): void
    getTopStanding({ commit, state }: AugmentedActionContext): void
    getReport({ commit, state }: AugmentedActionContext): void
    setFilter({ commit }: AugmentedActionContext, filter: Filter): void
    resetFilter({ commit, rootState }: AugmentedActionContext): void
    setPageSize({ commit }: AugmentedActionContext, size: number): void
}