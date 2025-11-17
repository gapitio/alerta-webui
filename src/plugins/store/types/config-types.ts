import type {ActionContext} from '.'
import type {Filter, SortBy} from './alerts-types'

interface ColorMap {
  [key: string]: string
}

interface StatusMap {
  [key: string]: string
}

type Query = {
  query: string[][]
  text: string
}

type Indicators = {
  queries: Query[]
  severity: string[]
}

interface SeverityMap {
  [key: string]: number
}

interface Colors {
  severity: ColorMap
  status: ColorMap
  text: string
}

interface Defaults {
  normal_severity: string
  previous_severity: string
  status: string
}

export interface AlarmModel {
  colors: Colors
  defaults: Defaults
  name: string
  severity: SeverityMap
  status: StatusMap
}

type Timeouts = {
  ack: number
  alert: number
  heartbeat: number
  shelve: number
}

type DateFormats = {
  longDate: string
  mediumDate: string
  shortTime: string
}

type FontSettings = {
  'font-family': string
  'font-size': string
  'font-weight': number
}

export interface State {
  actions: string[]
  alarm_model: AlarmModel
  allow_readonly: boolean
  audio: {new: string | null}
  auth_required: boolean
  aws_region: string
  azure_tenant: string
  blackouts: {duration: number}
  client_id: string | null
  clipboard_template: string
  cognito_domain: string | null
  columns: string[]
  customer_views: boolean
  dates: DateFormats
  debug: boolean
  delete_alert_scope_enforced?: boolean
  email_verification: boolean
  endpoint: string
  environments: string[]
  filter: Filter
  font: FontSettings
  github_url: string
  gitlab_url: string
  indicators: Indicators
  keycloak_realm: string | null
  keycloak_url: string | null
  ldap_email_edit: boolean
  oidc_auth_url: string | null
  provider: string
  readonly_scopes: string[]
  refresh_interval: number
  signup_enabled: boolean
  site_logo_url: string
  sort_by: SortBy[]
  timeouts: Timeouts
  tracking_id: null | string
  version: string
  pingfederate_url: string | null
}

export type ExternalConfig = {sort_by: (SortBy | string)[]} & Omit<State, 'sort_by'>

export type Mutations<S = State> = {
  SET_CONFIG(state: S, config: {[T in keyof ExternalConfig]?: ExternalConfig[T]}): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  updateConfig({commit}: AugmentedActionContext, config: ExternalConfig | State): void
}

export type Getters = {
  getConfig(state: State): <T extends keyof State>(settings: T) => State[T]
}
