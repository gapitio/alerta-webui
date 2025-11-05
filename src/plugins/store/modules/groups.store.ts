import GroupsApi from '@/services/api/group.service'
import i18n from '@/plugins/i18n'
import type {State, Mutations, Actions} from '../types/groups-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  groups: [],
  group: {
    id: '',
    name: '',
    text: ''
  },
  users: []
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_GROUPS(state, groups) {
    state.isLoading = false
    state.groups = groups
  },
  SET_GROUP(state, group) {
    state.group = group
  },
  SET_GROUP_USERS(state, users) {
    state.isLoading = false
    state.users = users
  },
  RESET_GROUP_USERS(state) {
    state.users = []
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getGroups({commit}) {
    commit('SET_LOADING')
    return GroupsApi.getGroups({})
      .then(({groups}) => commit('SET_GROUPS', groups))
      .catch(() => commit('RESET_LOADING'))
  },
  getGroup({commit}, groupId) {
    return GroupsApi.getGroup(groupId).then(({group}) => {
      commit('SET_GROUP', group)
    })
  },
  getGroupUsers({commit}, groupId) {
    commit('SET_LOADING')
    return GroupsApi.getGroupUsers(groupId)
      .then(({users}) => commit('SET_GROUP_USERS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  clearGroupUsers({commit}) {
    commit('RESET_GROUP_USERS')
  },
  createGroup({dispatch}, group) {
    return GroupsApi.createGroup(group).then(() => {
      dispatch('getGroups')
    })
  },
  updateGroup({dispatch}, [groupId, update]) {
    return GroupsApi.updateGroup(groupId, update).then(() => {
      dispatch('getGroups')
    })
  },
  addUserToGroup({dispatch}, [groupId, userId]) {
    return GroupsApi.addUserToGroup(groupId, userId)
      .then(() => {
        dispatch('getGroupUsers', groupId)
      })
      .then(() => dispatch('notifications/success', i18n.global.t('UserAddedGroup'), {root: true}))
  },
  removeUserFromGroup({dispatch}, [groupId, userId]) {
    return GroupsApi.removeUserFromGroup(groupId, userId)
      .then(() => {
        dispatch('getGroupUsers', groupId)
      })
      .then(() => dispatch('notifications/success', i18n.global.t('UserRemovedGroup'), {root: true}))
  },
  deleteGroup({dispatch}, groupId) {
    return GroupsApi.deleteGroup(groupId).then(() => {
      dispatch('getGroups')
    })
  }
}

const getters = {
  //
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
