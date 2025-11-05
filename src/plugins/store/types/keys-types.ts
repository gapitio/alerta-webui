import type {ActionContext} from '.'

export interface Key {
  id?: string
  count?: number
  customer?: string | null
  expireTime: string
  href?: string
  key?: string
  lastUsedTime?: string
  scopes: string[]
  status?: string
  text: string | null
  type?: string
  user: string
}

export type Filter = {
  key?: string[]
  scope?: string[]
  text?: string[]
}

export interface State {
  isLoading: boolean
  items: Key[]
  filter: Filter
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  RESET_LOADING(state: S): void
  SET_KEYS(state: S, keys: Key[]): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getKeys({commit}: AugmentedActionContext): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  createKey({dispatch}: AugmentedActionContext, key: Key): void
  updateKey({dispatch}: AugmentedActionContext, [key, update]: [string, Key]): void
  deleteKey({dispatch}: AugmentedActionContext, key: string): void
}
