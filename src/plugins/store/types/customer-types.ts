import type {ActionContext} from '.'
export interface Customer {
  id: string
  href?: string
  match: string
  customer: string
}
export interface State {
  isLoading: boolean
  customers: Customer[]
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_CUSTOMERS(state: S, customers: Customer[]): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getCustomers({commit}: AugmentedActionContext): void
  createCustomer({dispatch}: AugmentedActionContext, customer: Customer): void
  updateCustomer({dispatch}: AugmentedActionContext, [customerId, update]: [string, Customer]): void
  deleteCustomer({dispatch}: AugmentedActionContext, customerId: string): void
}
export type Getters = {
  customers(state: State): string[]
}
