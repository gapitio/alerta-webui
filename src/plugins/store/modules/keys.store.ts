import KeysApi from '@/services/api/key.service'
import type {State, Mutations, Actions} from '../types/keys-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  filter: {}
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_KEYS(state, keys) {
    state.isLoading = false
    state.items = keys
  },
  SET_FILTER(state, filter) {
    state.filter = filter
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getKeys({commit}) {
    commit('SET_LOADING')

    const params = new URLSearchParams()
    if (state.filter.key) state.filter.key.map(k => params.append('key', '~' + k))
    if (state.filter.scope) state.filter.scope.map(k => params.append('scope', k))
    if (state.filter.text) state.filter.text.map(k => params.append('text', '~' + k))

    return KeysApi.getKeys(params)
      .then(({keys}) => commit('SET_KEYS', keys))
      .catch(() => commit('RESET_LOADING'))
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
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
