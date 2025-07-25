import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'

export type Metric = {
  description: string;
  group: string;
  name: string;
  type: string;
  title: string;
  value?: string | number;
  count?: number;

}

export type Manifest = {
  build: string;
  date: string;
  release: string;
  revision: string;
}

export type Status = {
  application: string;
  metrics: Metric[];
  time: number;
  uptime: number;
  version: string;
}

export type State = {
  manifest: Manifest;
  healthcheck: string;
} & Status

export type Mutations<S = State> = {
  SET_MANIFEST(state: S, manifest: Manifest): void
  SET_HEALTHCHECK(state: S, healthcheck: string): void
  SET_STATUS(state: S, status: Status): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
  getManifest({ commit }: AugmentedActionContext): void
  getHealthcheck({ commit }: AugmentedActionContext): void
  getStatus({ commit }: AugmentedActionContext): void
}