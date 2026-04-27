import type {ActionContext} from '.'
import type {Filter} from './alerts-types'

export type FilterTab = {
  name: string
  index: number
  filter: Filter
}

export interface State {
  isLoading: boolean
  items: FilterTab[]
  currentTab: string
  counts: {[key: string]: number}
  historyCounts: {[key: string]: number}
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_FILTER_TAB(
    state: S,
    [filterTab, counts, historyCounts]: [FilterTab[], {[key: string]: number}, {[key: string]: number}]
  ): void
  SET_CURRENT_TAB(state: S, name: string): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getFilterTabs({commit, state}: AugmentedActionContext): void
  createFilterTab({dispatch}: AugmentedActionContext, filterTab: FilterTab): void
  createFilterTabs({dispatch}: AugmentedActionContext, filterTabs: FilterTab[]): void
  updateFilterTabs({dispatch}: AugmentedActionContext, filterTabs: FilterTab[]): void
  updateFilterTabIndexes({dispatch}: AugmentedActionContext, filterTabs: {name: string; index: number}[]): void
  deleteFilterTab({dispatch}: AugmentedActionContext, id: string): void
  deleteFilterTabs({dispatch}: AugmentedActionContext, ids: string[]): void
  setCurrentTab({commit}: AugmentedActionContext, name: string): void
}

export type Getters = {
  getHash(state: State): string
}
