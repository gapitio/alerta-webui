import type {ActionContext} from '.'
import type {Pagination, Query} from './alerts-types'

export interface Trigger {
  from_severity: string[]
  to_severity: string[]
  status?: string[]
  text?: string
}

export interface Tag {
  all: string[]
  any: string[]
}

export interface EscalationRule {
  id?: string
  active: boolean
  href?: string
  priority?: number
  environment: string
  time: string | null
  service: string[]
  triggers: Trigger[]
  resource: string | null
  event: string | null
  group: string | null
  tags: Tag[]
  excludedTags: Tag[]
  customer: string | null
  user?: string
  createTime?: string
  startTime: string | null
  endTime: string | null
  days: string[]
}

export type Filter = {
  environment?: string[]
  service?: string[]
  resource?: string[]
  event?: string[]
  group?: string[]
  user?: string[]
  tags?: string[]
}

export interface State {
  isLoading: boolean
  items: EscalationRule[]
  selected: string[]
  filter: Filter
  activeFilter: {active: boolean; inactive: boolean}
  pagination: Pagination
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_QUERY(state: S, query: Query): void
  SET_FILTER(state: S, filter: Filter): void
  SET_ITEMS(state: S, [escalationRules, total, pageSize]: [EscalationRule[], number, number]): void
  SET_SELECTED(state: S, selected: string[]): void
  SET_PAGINATION(state: S, pagination: {[key in keyof Pagination]?: Pagination[key]}): void
  SET_ACTIVE_FILTER(state: S, filter: Partial<{active: boolean; inactive: boolean}>): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getEscalationRules({commit, state}: AugmentedActionContext): void
  setActiveFilter({commit}: AugmentedActionContext, filter: Partial<{active: boolean; inactive: boolean}>): void
  setFilter({commit}: AugmentedActionContext, filter: Partial<Filter>): void
  updateQuery({commit}: AugmentedActionContext, query: Query): void
  resetFilter({commit}: AugmentedActionContext): void
  createEscalationRule({dispatch}: AugmentedActionContext, escalation_rule: EscalationRule): void
  updateSelected({commit}: AugmentedActionContext, selected: string[]): void
  updateEscalationRule({dispatch}: AugmentedActionContext, [escalationRuleId, update]: [string, EscalationRule]): void
  setPagination({commit}: AugmentedActionContext, pagination: Partial<Pagination>): void
  deleteEscalationRule({dispatch}: AugmentedActionContext, escalationRuleId: string): void
}

export type Getters = {
  pagination(state: State): Pagination
  getHash(state: State): string
}
