import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'

export type Permission = {
  match: string;
  scopes: string[];
}

export interface State {
  isLoading: boolean;
  permissions: Permission[];
  scopes: string[];
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_PERMS(state: S, perms: Permission[]): void
  SET_SCOPES(state: S, scopes: string[]): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
    getPerms({ commit }: AugmentedActionContext): void
    createPerm({ dispatch }: AugmentedActionContext, perm: Permission): void
    updatePerm({ dispatch }: AugmentedActionContext, [id, update]: [string, Permission]): void
    deletePerm({ dispatch }: AugmentedActionContext, id: string): void
    getScopes({ commit }: AugmentedActionContext): void
}

export type Getters = {
  roles(state: State): string[]
}