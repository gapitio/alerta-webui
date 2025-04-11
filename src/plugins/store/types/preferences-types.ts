import type {ActionContext} from '.'
import type {Query} from './alerts-types'

export type Permission = {
  match: string
  scopes: string[]
}

export type DateFormats = {
  longDate?: string | null
  mediumDate?: string | null
  shortTime?: string | null
}

export type Font = {
  'font-family': string | null
  'font-size': number | null
  'font-weight': number | null
}

export interface State {
  isDark: boolean
  isMute: boolean
  languagePref: string
  audioURL: string
  dates: DateFormats
  timezone: string
  displayDensity: string | null
  showAllowedEnvs: boolean
  showNotesIcon: boolean
  font: Font
  itemsPerPage: number
  valueWidth: number
  textWidth: number
  refreshInterval: number
  ackTimeout: number | null
  shelveTimeout: number | null
  blackoutStartNow: boolean
  blackoutPeriod: number | null
  queries: Query[]
}

export type Mutations<S = State> = {
  SET_PREFS(state: S, prefs: S): void
  RESET_PREFS(state: S): void
  SET_QUERIES(state: S, queries: Query[]): void
  RESET_QUERIES(state: S): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getUserPrefs({dispatch, commit}: AugmentedActionContext): void
  toggle<S extends keyof State>({dispatch}: AugmentedActionContext, [s, v]: [S, State[S]]): void
  setUserPrefs({dispatch}: AugmentedActionContext, prefs: Partial<State>): void
  resetUserPrefs({dispatch, commit}: AugmentedActionContext): void
  clearUserPrefs({commit}: AugmentedActionContext): void
  getUserQueries({dispatch, commit}: AugmentedActionContext): void
  addUserQuery({dispatch, commit}: AugmentedActionContext, query: Query): void
  removeUserQuery({dispatch, commit}: AugmentedActionContext, query: Query): void
  resetUserQueries({dispatch, commit}: AugmentedActionContext): void
}

export type Getters = {
  getPreference(state: State): <T extends keyof State>(pref: T) => State[T]
  getUserQueries(state: State): Query[]
}
