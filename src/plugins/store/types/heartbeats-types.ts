import type {ActionContext} from '.'

export interface Attribute {
  [key: string]: string
}

export interface Heartbeat {
  attributes: Attribute[]
  createTime: string
  customer: string | null
  href?: string
  id: string
  latency: number
  maxLatency: number
  origin: string
  receiveTime: string
  since: number
  status: string
  tags: string[]
  timeout: number
  type: string
}

export interface State {
  isLoading: boolean

  items: Heartbeat[]
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_HEARTBEATS(state: S, heartbeats: Heartbeat[]): void
  RESET_LOADING(state: S): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getHeartbeats({commit}: AugmentedActionContext): void
  deleteHeartbeat({commit}: AugmentedActionContext, heartbeatId: string): void
}
