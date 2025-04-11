import type {ActionContext} from '.'
import type {Pagination, Query} from './alerts-types'

export type OnCall = {
  customer?: string | null
  endDate: string | null
  endTime: string | null
  groupIds: string[]
  href?: string
  id?: string
  repeatDays: string[]
  repeatMonths: string[]
  repeatType?: 'list'
  repeatWeeks: number[]
  startDate: string | null
  startTime: string | null
  user?: string
  userIds: string[]
}

export interface State {
  isLoading: boolean
  items: OnCall[]
  pagination: Pagination
  query: Query
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_PAGINATION(state: S, pagination: Pagination): void
  SET_ON_CALL(state: S, [onCalls, total, pageSize]: [OnCall[], number, number]): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getOnCalls({commit, state}: AugmentedActionContext): void
  createOnCall({dispatch}: AugmentedActionContext, onCall: OnCall): void
  updateOnCall({dispatch}: AugmentedActionContext, [id, update]: [string, OnCall]): void
  deleteOnCall({dispatch}: AugmentedActionContext, id: string): void
  setPagination({commit}: AugmentedActionContext, status: Pagination): void
}

export type Getters = {
  pagination(state: State): Pagination
}
