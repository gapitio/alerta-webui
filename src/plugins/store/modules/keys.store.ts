import KeysApi from '@/services/api/key.service'
import type { State, Mutations, Actions } from '../types/keys-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  keys: []
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_KEYS(state, keys) {
    state.isLoading = false
    state.keys = keys
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getKeys({commit}) {
    commit('SET_LOADING')
    return KeysApi.getKeys({})
      .then(({keys}) => commit('SET_KEYS', keys))
      .catch(() => commit('RESET_LOADING'))
  },
  createKey({dispatch}, key) {
    return KeysApi.createKey(key).then(() => {
      dispatch('getKeys')
    })
  },
  updateKey({dispatch}, [key, update]) {
    return KeysApi.updateKey(key, update).then(() => {
      dispatch('getKeys')
    })
  },
  deleteKey({dispatch}, key) {
    return KeysApi.deleteKey(key).then(() => {
      dispatch('getKeys')
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
