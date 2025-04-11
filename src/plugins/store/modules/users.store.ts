import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'
import codes from 'country-calling-code'
const namespaced = true

const state = {
  isLoading: false,
  countryCodes: Array.from(codes, x => `${x.country} (+${x.countryCodes[0]})`),

  domains: [],
  users: [],
  groups: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_USERS(state, users) {
    state.isLoading = false
    state.users = users
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

const actions = {
  getUsers({commit}) {
    commit('SET_LOADING')
    return UsersApi.getUsers({})
      .then(({users}) => commit('SET_USERS', users))
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

const getters = {
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
