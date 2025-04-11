import PermsApi from '@/services/api/perms.service'
import type {State, Getters, Actions, Mutations} from '../types/perms-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  scopes: [],
  filter: {}
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_PERMS(state, permissions) {
    state.isLoading = false
    state.items = permissions
  },
  SET_FILTER(state, filter) {
    state.filter = filter
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
    const params = new URLSearchParams()
    if (state.filter.match) state.filter.match.map(r => params.append('match', r))
    if (state.filter.scope) state.filter.scope.map(r => params.append('scope', r))
    commit('SET_LOADING')
    return PermsApi.getPerms(params)
      .then(({permissions}) => commit('SET_PERMS', permissions))
      .catch(() => commit('RESET_LOADING'))
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit}) {
    commit('SET_FILTER', {})
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
    return state.items.map(p => p.match)
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
