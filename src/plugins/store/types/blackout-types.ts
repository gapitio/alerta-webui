import type { ActionContext } from 'vuex'
import type { State as RootState } from '.'

export interface Blackout {
  createTime: string;
  customer: string | null;
  duration: number;
  endTime: string;
  environment: string;
  event: string | null;
  group: string | null;
  href: string;
  id: string;
  origin: string | null;
  priority: number;
  remaining: string;
  resource: string | null;
  service: string[];
  startTime: string;
  status: string;
  tags: string[];
  text: string;
  user: string;
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_BLACKOUTS(state: S, [alerts, total, pageSize]: Blackout[]): void
  RESET_LOADING(state: S): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K]
} & Omit<ActionContext<State, RootState>, 'commit'>

export type Actions = {
  getBlackouts({ commit }: AugmentedActionContext): void
  createBlackout({ dispatch }: AugmentedActionContext, blackout: Blackout): void
  updateBlackout({ dispatch }: AugmentedActionContext, []:[string, Blackout]): void
  deleteBlackout({ dispatch }: AugmentedActionContext, blackoutId: string): void
}

export interface State {
  isLoading: boolean;
  blackouts: Blackout[];
}
