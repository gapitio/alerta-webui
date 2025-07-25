import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'

export interface Key {
  id: string;
  count: number;
  customer: string | null;
  expireTime: string;
  href?: string;
  key: string;
  lastUsedTime: string;
  scopes: string[];
  status: string;
  text: string;
  type: string;
  user: string;
}

export interface State {
  isLoading: boolean;
  keys: Key[]
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_KEYS(state: S, keys: Key[]): void
}  

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
    getKeys({ commit }: AugmentedActionContext): void
    createKey({ dispatch }: AugmentedActionContext, key: Key): void
    updateKey({ dispatch }: AugmentedActionContext, [key, update]: [string, Key]): void
    deleteKey({ dispatch }: AugmentedActionContext, key: string): void
}