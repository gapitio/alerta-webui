import PermsApi from '@/services/api/perms.service'
import type { State, Getters, Actions, Mutations } from '../types/perms-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  permissions: [],
  scopes: []
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_PERMS(state, permissions) {
    state.isLoading = false
    state.permissions = permissions
  },
  SET_SCOPES(state, scopes) {
    state.isLoading = false
    state.scopes = scopes
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getPerms({commit}) {
    commit('SET_LOADING')
    return PermsApi.getPerms({})
      .then(({permissions}) => commit('SET_PERMS', permissions))
      .catch(() => commit('RESET_LOADING'))
  },
  createPerm({dispatch}, perm) {
    return PermsApi.createPerm(perm).then(() => {
      dispatch('getPerms')
    })
  },
  updatePerm({dispatch}, [permId, update]) {
    return PermsApi.updatePerm(permId, update).then(() => {
      dispatch('getPerms')
    })
  },
  deletePerm({dispatch}, permId) {
    return PermsApi.deletePerm(permId).then(() => {
      dispatch('getPerms')
    })
  },

  getScopes({commit}) {
    commit('SET_LOADING')
    return PermsApi.getScopes().then(({scopes}) => commit('SET_SCOPES', scopes))
  }
}

const getters: Getters = {
  roles: state => {
    return state.permissions.map(p => p.match)
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
