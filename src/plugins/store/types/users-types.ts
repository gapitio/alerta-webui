import type {ActionContext} from '.'
import type {Query} from './alerts-types'
import type {DateFormats, Font} from './preferences-types'
import type {Group} from './groups-types'

export type User = {
  attributes?: Attributes
  country: string | null
  createTime?: string
  domain?: string
  email: string
  email_verified: boolean
  href?: string
  id?: string
  lastLogin?: string
  login: string
  name: string | null
  phoneNumber: string | null
  roles: string[]
  status: string
  text: string | null
  updateTime?: string
  password?: string | null
}

export type Filter = {
  name?: string[]
  login?: string[]
  email?: string[]
  phoneNumber?: string[]
  role?: string[]
  text?: string[]
}

type ActiveFilter = {
  active: boolean
  inactive: boolean
}

export type Attributes = {
  prefs: Preferences
  queries: Query[]
}

export type EmailsResponse = {
  emails: {name: string; email: string}[]
  status: 'ok'
  total: number
  message?: 'not found'
}

export type Preferences = {
  ackTimeout?: number
  blackoutPeriod?: number
  blackoutStartNow?: boolean
  dates?: DateFormats
  displayDensity?: string
  font?: Font
  isDark?: boolean
  isMute?: boolean
  languagePref?: string
  refreshInterval?: number
  rowsPerPage?: number
  shelveTimeout?: number
  showAllowedEnvs?: boolean
  showNotesIcon?: boolean
  textWidth?: number
  timezone?: string
  valueWidth?: number
}

export interface State {
  isLoading: boolean
  countryCodes: string[]
  domains: string[]
  emails: {name: string; email: string}[]
  items: User[]
  groups: Group[]
  filter: Filter
  activeFilter: ActiveFilter
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_FILTER(state: S, filter: Filter): void
  SET_ACTIVE_FILTER(state: S, filter: Partial<ActiveFilter>): void
  SET_ITEMS(state: S, users: User[]): void
  SET_EMAILS(state: S, emails: {name: string; email: string}[]): void
  SET_USER_GROUPS(state: S, groups: Group[]): void
  RESET_USER_GROUPS(state: S): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getUsers({commit}: AugmentedActionContext): void
  getEmails({commit}: AugmentedActionContext): void
  createUser({dispatch}: AugmentedActionContext, user: User): void
  setFilter({commit}: AugmentedActionContext, filter: Filter): void
  setActiveFilter({commit}: AugmentedActionContext, filter: Partial<ActiveFilter>): void
  resetFilter({commit}: AugmentedActionContext): void
  updateUser({dispatch}: AugmentedActionContext, [id, update]: [string, Partial<User>]): void
  setUserStatus({dispatch}: AugmentedActionContext, [id, status]: [string, string]): void
  setEmailVerified({dispatch}: AugmentedActionContext, [id, status]: [string, boolean]): void
  deleteUser({dispatch}: AugmentedActionContext, id: string): void
  getUserGroups({commit}: AugmentedActionContext, id: string): void
  resetUserGroups({commit}: AugmentedActionContext, id: string): void
}

export type Getters = {
  countryCodes(state: State): string[]
  getHash(state: State): string
}
