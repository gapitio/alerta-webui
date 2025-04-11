import { createStore } from 'vuex'
import config from './modules/config.store'
import alerts from './modules/alerts.store'
import heartbeats from './modules/heartbeats.store'
import blackouts from './modules/blackouts.store'
import notificationRules from './modules/notificationRule.store'
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


const mutations = {
  SET_SETTING(state, {s, v}) {
    state[s] = v
  }
}

const actions = {
  set({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  }
}

const store = createStore({
  state: {
    multiselect: false,
    refresh: false
  },
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
