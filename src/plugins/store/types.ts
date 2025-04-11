import type {State as AlertsState, Mutations as AlertsMutations, Getters as AlertsGetters } from './modules/alerts-types'
import type {State as AuthState, Mutations as AuthMutations, Getters as AuthGetters } from './modules/auth-types'

export interface State {
    alerts: AlertsState
    multiselect: boolean,
    auth: AuthState,
    refresh: boolean
}

export type Mutations = {
    alerts: AlertsMutations
    auth: AuthMutations
}

type AlertModule = {
    [K in keyof AlertsGetters as `alerts/${K}`] :  ReturnType<AlertsGetters[K]>
}

type AuthModule = {
  [K in keyof AuthGetters as `auth/${K}`] :  ReturnType<AuthGetters[K]>
}

export type Getters = AlertModule & AuthModule

export type Store = {
  state: State
  mutations: Mutations
  getters: Getters
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $store: Store
  }
}