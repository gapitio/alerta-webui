import type {ActionContext} from '.'

export type SnackBar = {
  type: 'success' | 'info' | 'error'
  text: string
  action: string
  timeout: number
}

export interface State {
  snackbars: SnackBar[]
}

export type Mutations<S = State> = {
  ADD_SNACKBAR(state: S, snackbar: SnackBar): void
  REMOVE_SNACKBAR(state: S): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type ErrorData = {
  code: number
  message: string
  status: 'error'
}

export type Actions = {
  showSnackbar({commit}: AugmentedActionContext, snackbar: SnackBar): void
  closeSnackbar({commit}: AugmentedActionContext): void
  success({commit}: AugmentedActionContext, message: string): void
  error({commit}: AugmentedActionContext, error: ErrorData | Error): void
}

export type Getters = {
  hasSnackbar(state: State): boolean
}
