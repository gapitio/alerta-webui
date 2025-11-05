import {createStore} from 'vuex'
import config from './modules/config.store'
import alerts from './modules/alerts.store'
import heartbeats from './modules/heartbeats.store'
import blackouts from './modules/blackouts.store'
import notificationRules from './modules/notificationRule.store'
import notificationSends from './modules/notificationSends.store'
import notificationHistory from './modules/notificationHistory.store'
import notificationDelays from './modules/notificationDelay.store'
import escalationRules from './modules/escalationRule.store'
import notificationChannels from './modules/notificationChannel.store'
import onCalls from './modules/onCall.store'
import notificationGroups from './modules/notificationGroup.store'
import users from './modules/users.store'
import groups from './modules/groups.store'
import perms from './modules/perms.store'
import customers from './modules/customers.store'
import keys from './modules/keys.store'
import reports from './modules/reports.store'
import prefs from './modules/preferences.store'
import management from './modules/management.store'
import notifications from './modules/notifications.store'
import type {ActionContext, ActionTree} from 'vuex'
import type {OmitIfUndefined, State as RootState} from './types'

export type State = {
  multiselect: boolean
  refresh: boolean
}

export type Mutations = {
  SET_SETTING<K extends keyof State>(state: State, {s, v}: {s: K; v: State[K]}): void
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    ...payload: OmitIfUndefined<Parameters<Mutations[K]>[1], undefined>
  ): Mutations[K]
} & Omit<ActionContext<State, RootState>, 'commit'>

const mutations: Mutations = {
  SET_SETTING(state: typeof store.state, {s, v}) {
    state[s] = v
  }
}

export type Actions = {
  set<T extends keyof State>({commit}: AugmentedActionContext, [s, v]: [T, State[T]]): void
}

const actions: Actions & ActionTree<State, RootState> = {
  set({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  }
}

const store = createStore({
  mutations,
  actions,
  modules: {
    config,
    alerts,
    heartbeats,
    blackouts,
    notificationRules,
    notificationDelays,
    notificationHistory,
    escalationRules,
    notificationSends,
    notificationChannels,
    onCalls,
    notificationGroups,
    users,
    groups,
    perms,
    customers,
    keys,
    reports,
    prefs,
    management,
    notifications
  }
})

export default store
