import type { State as RootState } from '.'
import type { AuthenticateOptions } from 'vue-authenticate-2'
import type { ActionContext } from 'vuex';


export interface Payload {
  aud?: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
  jti?: string;
  name?: string;
  nbf?: number;
  preferred_username?: string;
  provider?: string;
  roles?: string[];
  sub?: string;
  typ?: string;
  picture?: string;
  scope?: string;
  customers?: string[]
}

export interface State {
  isAuthenticated: boolean;
  token: string | null;
  payload: Payload
  isSending: boolean
}

export type Mutations<S = State> = {
  SET_AUTH(state: S, [token, payload]: [string, Payload]): void
  RESET_AUTH(state: S): void
  SET_SENDING(state: S): void
  RESET_SENDING(state: S): void
}



type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K]
} & Omit<ActionContext<State, RootState>, 'commit'>

type Login = {
  username?: string;
  email?: string;
  password: string;
  text?: string;
}

export type Actions = {
  signup({commit, dispatch}: AugmentedActionContext, {username, email, password, text}: Login): void
  login({commit, dispatch}: AugmentedActionContext, credentials: Login): void
  authenticate({commit, dispatch}: AugmentedActionContext, provider: string): void
  setToken({commit, dispatch}: AugmentedActionContext, token: string): void
  confirm(_: AugmentedActionContext, token: string): void
  forgot({commit}: AugmentedActionContext, email: string): void
  reset(_: AugmentedActionContext, [token, password]: [string, string]): void
  logout({commit}: AugmentedActionContext): void
}

export type Getters = {
  getOptions(): AuthenticateOptions
  getPayload(state: State): Payload
  isLoggedIn(state: State): boolean
  getUsername(state: State): string | undefined
  getAvatar(state: State): string | undefined
  scopes(state: State): string[]
  customers(state: State): string[] | undefined
  isAdmin(state: State, getters: {[K in keyof Getters]: ReturnType<Getters[K]>}): boolean
}