import type { ActionContext } from 'vuex'
import type { State as RootState, Getters as rootGetters } from '.'
import type { Query } from './alerts-types';
import type { DateFormats, Font } from './preferences-types';
import type { Group } from './groups-types';

export type User = {
  attributes?: Attributes;
  country: string | null;
  createTime?: string;
  domain?: string;
  email: string;
  email_verified: boolean;
  href?: string;
  id?: string;
  lastLogin?: string;
  login: string;
  name: string | null;
  phoneNumber: string | null;
  roles: string[];
  status: string;
  text: string | null;
  updateTime?: string;
  password?: string | null;
}

export type Attributes = {
  prefs: Preferences;
  queries: Query[];
}

export type Preferences = {
  ackTimeout?: number;
  blackoutPeriod?: number;
  blackoutStartNow?: boolean;
  dates?: DateFormats;
  displayDensity?: string;
  font?: Font;
  isDark?: boolean;
  isMute?: boolean;
  languagePref?: string;
  refreshInterval?: number;
  rowsPerPage?: number;
  shelveTimeout?: number;
  showAllowedEnvs?: boolean;
  showNotesIcon?: boolean;
  textWidth?: number;
  timezone?: string;
  valueWidth?: number;
}

export interface State {
  isLoading: boolean;
  countryCodes: string[];
  domains: string[];
  items: User[];
  groups: Group[];
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  RESET_LOADING(state: S): void
  SET_ITEMS(state: S, users: User[]): void
  SET_USER_GROUPS(state: S, groups: Group[]): void
  RESET_USER_GROUPS(state: S): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): Mutations[K];
  rootGetters: rootGetters;
} & Omit<ActionContext<State, RootState>, 'commit' | 'rootGetters'>

export type Actions = {
  getUsers({ commit }: AugmentedActionContext): void
  createUser({ dispatch }: AugmentedActionContext, user: User): void
  updateUser({ dispatch }: AugmentedActionContext, [id, update]: [string, Partial<User>]): void
  setUserStatus({ dispatch }: AugmentedActionContext, [id, status]: [string, string]): void
  setEmailVerified({ dispatch }: AugmentedActionContext, [id, status]: [string, boolean]): void
  deleteUser({ dispatch }: AugmentedActionContext, id: string): void
  getUserGroups({ commit }: AugmentedActionContext, id: string): void
  resetUserGroups({ commit }: AugmentedActionContext, id: string): void
}

export type Getters = {
  countryCodes(state: State): string[]
}