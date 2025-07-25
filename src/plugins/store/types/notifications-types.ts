import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'

export type SnackBar = {
  type: 'success' | 'info' | 'error';
  text: string;
  action: string;
  timeout: number
}

export type Banner = {
  type: 'success' | 'info'| 'warning' | 'error';
  text: string;
  icon: string;
}

export interface State {
  snackbars: SnackBar[];
  banners: Banner[];
}

export type Mutations<S = State> = {
  ADD_SNACKBAR(state: S, snackbar: SnackBar): void
  ADD_BANNER(state: S, banner: Banner): void
  REMOVE_SNACKBAR(state: S): void
  REMOVE_BANNER(state: S): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type ErrorData = {
  code: number,
  message: string,
  status: 'error'
}

export type Actions = {
    showSnackbar({ commit }: AugmentedActionContext, snackbar: SnackBar): void
    closeSnackbar({ commit }: AugmentedActionContext): void
    showBanner({ commit }: AugmentedActionContext, snackbar: Banner): void
    closeBanner({ commit }: AugmentedActionContext): void
    success({ commit }: AugmentedActionContext, message: string): void
    error({ commit }: AugmentedActionContext, error: ErrorData | Error): void
}

export type Getters = {
  hasSnackbar(state: State): boolean
  hasBanners(state: State): boolean
}