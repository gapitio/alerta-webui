import type {ActionContext} from '.'

export type Permission = {
  id?: string
  href?: string
  match: string
  scopes: string[]
}

export type Filter = {
  scope?: string[]
  match?: string[]
}

export interface State {
  isLoading: boolean
  items: Permission[]
  scopes: string[]
  filter: Filter
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  RESET_LOADING(state: S): void
  SET_PERMS(state: S, perms: Permission[]): void
  SET_SCOPES(state: S, scopes: string[]): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getPerms({commit}: AugmentedActionContext): void
  createPerm({dispatch}: AugmentedActionContext, perm: Permission): void
  updatePerm({dispatch}: AugmentedActionContext, [id, update]: [string, Permission]): void
  deletePerm({dispatch}: AugmentedActionContext, id: string): void
  getScopes({commit}: AugmentedActionContext): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  resetFilter({commit}: AugmentedActionContext): void
}

export type Getters = {
  roles(state: State): string[]
}
