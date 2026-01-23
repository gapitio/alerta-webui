import type {ActionContext, State as RootState} from '.'
import type {DateRange} from './notificationHistory-types'

export interface Attributes {
  [key: string]: string
}

export interface RawData {
  [key: string]: string
}

export interface Query {
  q: string
  [key: string]: string
}

export interface SortBy {
  key: string
  order: boolean | 'desc' | 'asc'
}

interface SeverityCount {
  security?: number
  critical?: number
  major?: number
  minor?: number
  warning?: number
  indeterminate?: number
  informational?: number
  normal?: number
  ok?: number
  cleared?: number
  debug?: number
  trace?: number
  unknown?: number
}

interface StatusCount {
  open?: number
  assign?: number
  ack?: number
  unack?: number
  shelved?: number
  blackout?: number
  closed?: number
  expired?: number
  unknown?: number
  notValid?: number
}

interface Count {
  count: number
  environment: string
}

interface Group extends Count {
  group: string
}

interface Tag extends Count {
  tag: string
}

interface Environment extends Count {
  severityCount: SeverityCount
  StatusCount: StatusCount
}

interface Service extends Environment {
  service: string
}

export interface Pagination {
  page: number
  itemsPerPage: number
  sortBy?: SortBy[]
  descending?: boolean
  itemsPerPageOptions?: number[]
  totalItems?: number
}

interface Note {
  id: string
  href: string
  text: string
  user: string
  attributes: string
  type: string
  createTime: string
  updateTime: string
  customer: string
}

export interface History {
  id: string
  href: string
  environment: string
  attributes: Attributes
  resource: string
  event: string
  origin: string
  customer: string
  severity: string
  group: string
  status: string
  value: string
  text: string
  type: string
  service?: string[]
  tags?: string[]
  updateTime: string
  user: string
  timeout: number
}

export interface Alert {
  id: string
  href?: string
  resource: string
  event: string
  environment: string
  severity: string
  correlate: string[]
  status: string
  service: string[]
  group: string
  value: string
  text: string
  tags: string[]
  customTags: string[]
  attributes: Attributes
  origin: string
  type: string
  createTime: string
  timeout: number
  rawData: RawData
  customer: string
  duplicateCount: number
  repeat: boolean
  previousSeverity: string
  trendIndication: number
  receiveTime: string
  lastReceiveId: string
  lastReceiveTime: string
  updateTime: string
  history: History[]
}

export interface Filter {
  environment?: string | null
  environments?: string[] | null
  text?: string | null
  status?: string[] | null
  severity?: string[] | null
  customer?: string[] | null
  service?: string[] | null
  group?: string[] | null
  dateRange: DateRange
  [key: string]: any
}

interface EnvironmentsCount {
  [key: string]: number
}

export interface State {
  isLoading: boolean
  isSearching: boolean
  alerts: Alert[]
  history: History[]
  selected: string[]
  environments: Environment[]
  historyEnvironments: EnvironmentsCount
  services: Service[]
  groups: Group[]
  tags: Tag[]

  alert: Alert | null
  notes: Note[]

  isWatch: boolean
  isKiosk: boolean
  showPanel: boolean
  displayDensity: 'comfortable' | 'compact' // 'comfortable' or 'compact'

  query: Query
  historyFilter: Filter
  filter: Filter

  historyPagination: Pagination

  pagination: Pagination
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_SEARCH_QUERY(state: S, query: Query): void
  SET_ALERTS(state: S, [alerts, total, pageSize]: [Alert[], number, number]): void
  SET_HISTORY(state: S, [history, total]: [History[], number]): void
  SET_HISTORY_ENVIRONMENTS(state: S, [environments, total]: [EnvironmentsCount, number]): void
  RESET_LOADING(state: S): void
  SET_KIOSK(state: S, isKiosk: boolean): void
  SET_SELECTED(state: S, selected: string[]): void
  SET_ALERT(state: S, alert: Alert): void
  SET_NOTES(state: S, notes: Note[]): void
  SET_ENVIRONMENTS(state: S, environments: Environment[]): void
  SET_SERVICES(state: S, services: Service[]): void
  SET_GROUPS(state: S, groups: Group[]): void
  SET_TAGS(state: S, tags: Tag[]): void
  SET_SETTING<T extends keyof S>(state: S, {s, v}: {s: T; v: S[T]}): void
  SET_FILTER(state: S, filter: Partial<Filter>): void
  SET_HISTORY_FILTER(state: S, filter: Partial<Filter>): void
  SET_PAGINATION(state: S, pagination: Partial<Pagination>): void
  SET_HISTORY_PAGINATION(state: S, pagination: Partial<Pagination>): void
  SET_PANEL(state: S, panel: boolean): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions<S = State> = {
  getAlerts({rootGetters, commit, state, getters}: AugmentedActionContext): Promise<Alert[]>
  getAlertHistory({commit, state}: AugmentedActionContext): Promise<History[]>
  getAlertHistoryCount({commit}: AugmentedActionContext): void
  setHistoryFilter({commit}: AugmentedActionContext, filter: Partial<Filter>): void
  updateQuery({commit}: AugmentedActionContext, query: Query): void
  updateKiosk({commit}: AugmentedActionContext, isKiosk: boolean): void
  updateSelected({commit}: AugmentedActionContext, selected: string[]): void
  getAlert({commit}: AugmentedActionContext, alertId: string): void
  watchAlert({rootState}: AugmentedActionContext, alertId: string): Promise<any>
  unwatchAlert({rootState}: AugmentedActionContext, alertId: string): Promise<any>
  takeAction(
    _: AugmentedActionContext,
    [alertId, action, text, timeout]: [string, string, string, number?]
  ): Promise<any>
  takeActions(
    _: AugmentedActionContext,
    [alertIds, action, text, timeout]: [string[], string, string, number?]
  ): Promise<any>
  tagAlert(_: AugmentedActionContext, [alertId, tags]: [string, string[]]): void
  untagAlert(_: AugmentedActionContext, [alertId, tags]: [string, string[]]): void
  addNote({dispatch}: AugmentedActionContext, [alertId, text]: [string, string]): Promise<any>
  getNotes({commit}: AugmentedActionContext, alertId: string): void
  updateNote({dispatch}: AugmentedActionContext, [alertId, noteId, note]: [string, string, Note]): void
  deleteNote({dispatch}: AugmentedActionContext, [alertId, noteId]: [string, string]): void
  deleteAlert(_: AugmentedActionContext, alertId: string): Promise<any>
  deleteAlerts(_: AugmentedActionContext, alertIds: string[]): Promise<any>
  getEnvironments({commit, state}: AugmentedActionContext): void
  getServices({commit}: AugmentedActionContext): void
  getGroups({commit}: AugmentedActionContext): void
  getTags({commit}: AugmentedActionContext): void
  toggle<T extends keyof S>({commit}: AugmentedActionContext, [s, v]: [T, S[T]]): void
  set<T extends keyof S>({commit}: AugmentedActionContext, [s, v]: [T, S[T]]): void
  setFilter({commit}: AugmentedActionContext, filter: Partial<Filter>): void
  resetFilter({commit, rootState}: AugmentedActionContext): void
  setPagination({commit}: AugmentedActionContext, pagination: Partial<Pagination>): void
  setHistoryPagination({commit}: AugmentedActionContext, pagination: Partial<Pagination>): void
  setPanel({commit}: AugmentedActionContext, panel: boolean): void
}

export type Getters = {
  alerts(state: State): Alert[]
  history(state: State): History[]
  environments(state: State, _: Getters, rootState: RootState): (showAllowedEnvs?: boolean) => string[]
  counts(state: State): {All: number; [key: string]: number}
  historyCounts(state: State): EnvironmentsCount
  services(state: State): string[]
  groups(state: State): string[]
  tags(state: State): string[]
  getHash(state: State): string
  getHistoryHash(state: State): string
}
