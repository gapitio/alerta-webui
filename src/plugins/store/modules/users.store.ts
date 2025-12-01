import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'
import codes from 'country-calling-code'
import type {State, Mutations, Actions, Getters, Filter} from '../types/users-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'
import utils from '@/common/utils'

const namespaced = true

const state: State = {
  isLoading: false,
  countryCodes: Array.from(codes, x => `${x.country} (+${x.countryCodes[0]})`),

  domains: [],
  items: [],
  emails: [],
  groups: [],
  filter: {},
  activeFilter: {
    active: true,
    inactive: true
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_ITEMS(state, users) {
    state.isLoading = false
    state.items = users
  },
  SET_EMAILS(state, emails) {
    state.emails = emails
  },
  SET_FILTER(state, filter) {
    state.filter = filter
  },
  SET_ACTIVE_FILTER(state, filter) {
    if (filter.active !== undefined) state.activeFilter.active = filter.active
    if (filter.inactive !== undefined) state.activeFilter.inactive = filter.inactive
  },
  SET_USER_GROUPS(state, groups) {
    state.groups = groups
  },
  RESET_USER_GROUPS(state) {
    state.groups = []
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getUsers({commit}) {
    const params = new URLSearchParams()
    const specialKeys: string[] = []
    const notWildcards = ['role']
    for (const key of Object.keys(state.filter)) {
      const typedKey = key as keyof Omit<Filter, 'dateRange'>
      if (specialKeys.includes(typedKey) || !state.filter[typedKey]) continue
      else if (typeof state.filter[typedKey] === 'object')
        state.filter[typedKey].map((k: string) =>
          params.append(typedKey, notWildcards.includes(typedKey) ? k : '~' + k)
        )
      else params.append(typedKey, `~${state.filter[typedKey]}`)
    }
    if (state.activeFilter.active && !state.activeFilter.inactive) params.append('status', 'active')
    if (!state.activeFilter.active && state.activeFilter.inactive) params.append('status', 'inactive')

    commit('SET_LOADING')
    return UsersApi.getUsers(params)
      .then(({users}) => commit('SET_ITEMS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  async getEmails({commit}) {
    const {emails} = await UsersApi.getEmails()
    commit('SET_EMAILS', emails)
  },
  createUser({dispatch}, user) {
    return UsersApi.createUser(user).then(() => {
      dispatch('getUsers')
    })
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  setActiveFilter({commit, dispatch}, filter) {
    commit('SET_ACTIVE_FILTER', filter)
    dispatch('getUsers')
  },
  resetFilter({commit}) {
    commit('SET_FILTER', {})
  },
  updateUser({dispatch}, [userId, update]) {
    return UsersApi.updateUser(userId, update).then(() => {
      dispatch('getUsers')
    })
  },
  setUserStatus({dispatch}, [userId, status]) {
    return UsersApi.updateUser(userId, {status: status})
      .then(() => {
        dispatch('getUsers')
      })
      .then(() =>
        dispatch('notifications/success', i18n.global.t('UserStatusSaved'), {
          root: true
        })
      )
  },
  setEmailVerified({dispatch}, [userId, emailVerified]) {
    return UsersApi.updateUser(userId, {email_verified: emailVerified})
      .then(() => {
        dispatch('getUsers')
      })
      .then(() => dispatch('notifications/success', i18n.global.t('EmailSaved'), {root: true}))
  },
  deleteUser({dispatch}, userId) {
    return UsersApi.deleteUser(userId).then(() => {
      dispatch('getUsers')
    })
  },
  getUserGroups({commit}, userId) {
    return UsersApi.getGroups(userId).then(({groups}) => commit('SET_USER_GROUPS', groups))
  },
  resetUserGroups({commit}) {
    commit('RESET_USER_GROUPS')
  }
}

const getters: Getters = {
  countryCodes: state => {
    return state.countryCodes
  },
  getHash: state => {
    const filterHash = utils.toHash(state.filter)
    return `#${filterHash};`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
