import type {ActionContext} from '.'

export interface Group {
  id: string
  name: string
  text: string
  href?: string
  count?: number
}

export interface State {
  isLoading: boolean
  groups: Group[]
  group: Group
  users: string[]
}

export type Mutations<S = State> = {
  SET_LOADING(state: S): void
  SET_GROUPS(state: S, groups: Group[]): void
  SET_GROUP(state: S, group: Group): void
  SET_GROUP_USERS(state: S, users: string[]): void
  RESET_GROUP_USERS(state: S): void
  RESET_LOADING(state: S): void
}

type AugmentedActionContext = ActionContext<Mutations, Actions, State>

export type Actions = {
  getGroups({commit}: AugmentedActionContext): void
  getGroup({commit}: AugmentedActionContext, groupId: string): void
  getGroupUsers({commit}: AugmentedActionContext, groupId: string): void
  clearGroupUsers({commit}: AugmentedActionContext): void
  createGroup({dispatch}: AugmentedActionContext, group: Group): void
  updateGroup({dispatch}: AugmentedActionContext, [groupId, group]: [string, Group]): void
  addUserToGroup({dispatch}: AugmentedActionContext, [groupId, userId]: [string, string]): void
  removeUserFromGroup({dispatch}: AugmentedActionContext, [groupId, userId]: [string, string]): void
  deleteGroup({dispatch}: AugmentedActionContext, groupId: string): void
}
