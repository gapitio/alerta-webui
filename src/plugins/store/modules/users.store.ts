import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'
import codes from 'country-calling-code'
import type { State, Mutations, Actions, Getters } from '../types/users-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,
  countryCodes: Array.from(codes, x => `${x.country} (+${x.countryCodes[0]})`),

  domains: [],
  items: [],
  groups: []
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_ITEMS(state, users) {
    state.isLoading = false
    state.items = users
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
    commit('SET_LOADING')
    return UsersApi.getUsers({})
      .then(({users}) => commit('SET_ITEMS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  createUser({dispatch}, user) {
    return UsersApi.createUser(user).then(() => {
      dispatch('getUsers')
    })
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
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
