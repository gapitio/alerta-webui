import type { ActionContext } from 'vuex'
import type { State as RootState } from '../types'
import type { ActionTree } from 'vuex';

interface Attributes {
  [key: string]: string; 
}

interface RawData {
  [key: string]: string; 
}

interface Query {
  [key: string]: string; 
}

interface SortBy {
  key: string,
  order?: string,
}

interface SeverityCount {
  security?: number,
  critical?: number,
  major?: number,
  minor?: number,
  warning?: number,
  indeterminate?: number,
  informational?: number,
  normal?: number,
  ok?: number,
  cleared?: number,
  debug?: number,
  trace?: number,
  unknown?: number,
}

interface StatusCount {
  open?: number,
  assign?: number,
  ack?: number,
  unack?: number,
  shelved?: number,
  blackout?: number,
  closed?: number,
  expired?: number,
  unknown?: number,
  notValid?: number,
}

interface Count {
  count: number,
  environment: string,
}

interface Group extends Count {
  group: string
}

interface Tag extends Count {
  tag: string
}

interface Environment extends Count {
  severityCount: SeverityCount,
  StatusCount: StatusCount
}

interface Service extends Environment {
  service: string
}

interface Pagination {
  page: number,
  rowsPerPage: number,
  sortBy?: SortBy[],
  descending?: boolean,
  rowsPerPageItems: number[]
  totalItems?: number
}

interface Note {
  id: string,
  href: string,
  text: string,
  user: string,
  attributes: string,
  type: string,
  createTime: string,
  updateTime: string,
  customer: string,
}

interface History {
  id: string,
  href: string,
  event: string,
  severity: string,
  status: string,
  value: string,
  text: string,
  type: string,
  updateTime: string,
  user: string,
  timeout: number
}

interface Alert {
  id?: string,
  href?: string,
  resource?: string,
  event?: string,
  environment?: string,
  severity?: string,
  correlate?: string[],
  status?: string,
  service?: string,
  group?: string,
  value?: string,
  text?: string,
  tags?: string[],
  attributes?: Attributes,
  origin?: string,
  type?: string,
  createTime?: string,
  timeout?: number,
  rawData?: RawData,
  customer?: string,
  duplicateCount?: number,
  repeat?: boolean,
  previousSeverity?: string,
  trendIndication?: number,
  receiveTime?: string,
  lastReceiveId?: string,
  lastReceiveTime?: string,
  updateTime?: string,
  history?: History[]
}

interface Filter {
  environment: string | null,
  text: string | null,
  status: string[],
  customer: string[] | null,
  service: string[] | null,
  group: string[] | null,
  dateRange: [number | null, number | null]
}

export interface State {
  isLoading: boolean,
  isSearching: boolean,
  alerts: Alert[],
  history: History[],
  selected: Alert[],
  environments: Environment[],
  services: Service[],
  groups: Group[],
  tags: Tag[],

  alert: Alert,
  notes: Note[],

  isWatch: boolean,
  isKiosk: boolean,
  showPanel: boolean,
  displayDensity: 'comfortable' | 'compact', // 'comfortable' or 'compact'

  query: Query,
  historyFilter: {
    environment: string | null
  },
  filter: Filter,

  historyPagination: Pagination

  pagination: Pagination
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_LOADING(state: S): void
  SET_SEARCH_QUERY(state: S, query:Query): void
  SET_ALERTS(state: S, [alerts, total, pageSize]: [Alert[], number, number]): void
  SET_HISTORY(state: S, [history, total]: [History[], number]): void
  RESET_LOADING(state: S): void
  SET_KIOSK(state: S, isKiosk: boolean): void
  SET_SELECTED(state: S, selected: Alert[]): void
  SET_ALERT(state: S, alert: Alert): void
  SET_NOTES(state: S, notes: Note[]): void
  SET_ENVIRONMENTS(state: S, environments: Environment[]): void
  SET_SERVICES(state: S, services: Service[]): void
  SET_GROUPS(state: S, groups: Group[]): void
  SET_TAGS(state: S, tags: Tag[]): void
  SET_SETTING<T extends keyof S>(state: S, {s, v}: {s: T, v: S[T]}): void
  SET_FILTER(state: S, filter: Filter): void
  SET_HISTORY_FILTER(state: S, filter: Filter): void
  SET_PAGINATION(state: S, pagination: {[key in keyof Pagination]?: Pagination[key]}): void
  SET_HISTORY_PAGINATION(state: S, pagination: Pagination): void
  SET_PANEL(state: S, panel: boolean): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K]
} & Omit<ActionContext<State, RootState>, 'commit'>

export type Actions = {
  getAlerts({ rootGetters, commit, state, getters }: AugmentedActionContext): Promise<Alert[]>
  getAlertHistory({ commit, state }: AugmentedActionContext): void
  setHistoryFilter({ commit }: AugmentedActionContext, filter: Filter): void
  updateQuery({ commit }: AugmentedActionContext, query: Query): void
  updateKiosk({ commit }: AugmentedActionContext, isKiosk: boolean): void
  updateSelected({ commit }: AugmentedActionContext, selected: Alert[]): void
  getAlert({ commit }: AugmentedActionContext, alertId: string): void
  watchAlert({ rootState }: AugmentedActionContext, alertId: string): void
  unwatchAlert({ rootState }: AugmentedActionContext, alertId: string): void
  takeAction(_: AugmentedActionContext, [alertId, action, text, timeout]: [string, string, string, string]): void
  tagAlert(_: AugmentedActionContext, [alertId, tags]: [string, string[]]): void
  untagAlert(_: AugmentedActionContext, [alertId, tags]: [string, string[]]): void
  addNote({ dispatch }: AugmentedActionContext, [alertId, text]: [string, string]): void
  getNotes({ commit }: AugmentedActionContext, alertId: string): void
  updateNote({ dispatch }: AugmentedActionContext, [alertId, noteId, note]: [string, string, Note]): void
  deleteNote({ dispatch }: AugmentedActionContext, [alertId, noteId]: [string, string]): void
  deleteAlert(_: AugmentedActionContext, alertId: string): void
  getEnvironments({commit, state}: AugmentedActionContext): void
  getServices({ commit }: AugmentedActionContext): void
  getGroups({ commit }: AugmentedActionContext): void
  getTags({ commit }: AugmentedActionContext): void
  toggle<T extends keyof State>({ commit }: AugmentedActionContext, [s, v]: [T, State[T]]): void
  set<T extends keyof State>({ commit }: AugmentedActionContext, [s, v]: [T, State[T]]): void
  setFilter({ commit }: AugmentedActionContext, filter: Filter): void
  resetFilter({ commit, rootState }: AugmentedActionContext): void
  setPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
  setHistoryPagination({ commit }: AugmentedActionContext, pagination: Pagination): void
  setPanel({ commit }: AugmentedActionContext, panel: boolean): void
} & ActionTree<State, RootState>
export type Getters = {
  alerts(state: State, rootState: RootState): Alert[]
  history(state: State): History[]
  environments(state: State, rootState: RootState): (showAllowedEnvs?: boolean) => string[]
  counts(state: State): {ALL: number, [key: string]: number}
  services(state: State): string[]
  groups(state: State): string[]
  tags(state: State): string[]
  getHash(state: State): string
}