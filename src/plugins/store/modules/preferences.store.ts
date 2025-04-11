import UsersApi from '@/services/api/user.service'
import i18n from '../../i18n'
import type {State, Actions, Getters, Mutations} from '../types/preferences-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'
import type {Query} from '../types/alerts-types'
import {deepCopy} from './config.store'

const getDefaults = (): State => {
  return {
    isDark: false,
    isMute: true,
    languagePref: i18n.global.locale,
    audioURL: './audio/alert_high-intensity.ogg',
    dates: {
      longDate: null,
      mediumDate: null,
      shortTime: null
    },
    timezone: 'local', // 'local' or 'utc'
    displayDensity: null, // 'comfortable' or 'compact'
    showAllowedEnvs: false,
    showNotesIcon: false,
    font: {
      'font-family': null,
      'font-size': null,
      'font-weight': null
    },
    itemsPerPage: 20,
    valueWidth: 50, // px
    textWidth: 400, // px
    refreshInterval: 5 * 1000, // milliseconds
    ackTimeout: null,
    shelveTimeout: null,
    blackoutStartNow: true,
    blackoutPeriod: null,
    queries: []
  }
}

const state: State = getDefaults()

function isKeyOfState(key: string): key is keyof State {
  return key in state
}
const mutations: Mutations = {
  SET_PREFS(state, prefs) {
    const preferences: {[key: string]: any} = {}
    for (const key in prefs) {
      if (isKeyOfState(key) && prefs[key] !== undefined) {
        if (Object.prototype.toString.call(prefs[key]) === '[object Object]') deepCopy(state[key], prefs[key])
        else preferences[key] = prefs[key]
      }
    }
    deepCopy(state, preferences)
  },
  RESET_PREFS(state) {
    const q = state.queries
    Object.assign(state, getDefaults())
    state = {...state, queries: [...q]}
  },
  SET_QUERIES(state, queries) {
    state.queries = JSON.parse(JSON.stringify(queries)) as Query[]
  },
  RESET_QUERIES(state) {
    Object.assign(state, {queries: []})
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getUserPrefs({dispatch, commit}) {
    return UsersApi.getMeAttributes()
      .then(({attributes}) => commit('SET_PREFS', attributes.prefs))
      .catch(e => {
        if (!e.response)
          dispatch('notifications/error', Error('' + i18n.global.t('SettingsError')), {
            root: true
          })
      })
  },
  toggle({dispatch}, [s, v]) {
    return UsersApi.updateMeAttributes({prefs: {[s]: v}})
      .then(() => dispatch('getUserPrefs'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  setUserPrefs({dispatch}, prefs) {
    return UsersApi.updateMeAttributes({prefs: prefs})
      .then(() => dispatch('getUserPrefs'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  resetUserPrefs({dispatch, commit}) {
    return UsersApi.updateMeAttributes({prefs: null})
      .then(() => commit('RESET_PREFS'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsReset'), {
          root: true
        })
      )
  },
  clearUserPrefs({commit}) {
    commit('RESET_PREFS')
  },
  getUserQueries({dispatch, commit}) {
    return UsersApi.getMeAttributes()
      .then(({attributes}) => {
        if (attributes.queries !== undefined) commit('SET_QUERIES', attributes.queries)
      })
      .catch(e => {
        if (!e.response)
          dispatch('notifications/error', Error('' + i18n.global.t('SettingsError')), {
            root: true
          })
      })
  },
  addUserQuery({dispatch, state}, query) {
    const qlist = state.queries.filter(q => q.q != query.q).concat([query])
    return UsersApi.updateMeAttributes({queries: qlist})
      .then(() => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  removeUserQuery({dispatch, state}, query) {
    const qlist = state.queries.filter(q => q.q != query.q)
    return UsersApi.updateMeAttributes({queries: qlist})
      .then(() => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  resetUserQueries({dispatch, commit}) {
    return UsersApi.updateMeAttributes({queries: null})
      .then(() => commit('RESET_QUERIES'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsReset'), {
          root: true
        })
      )
  }
}

const getters: Getters = {
  getPreference: state => pref => {
    return state[pref]
  },
  getUserQueries: state => {
    return state.queries
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
