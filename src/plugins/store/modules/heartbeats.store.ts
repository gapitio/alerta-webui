import HeartbeatsApi from '@/services/api/heartbeat.service'
import type {State, Mutations, Actions} from '../types/heartbeats-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: []
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_HEARTBEATS(state, heartbeats) {
    state.isLoading = false
    state.items = heartbeats
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getHeartbeats({commit}) {
    commit('SET_LOADING')
    return HeartbeatsApi.getHeartbeats({})
      .then(({heartbeats}) => commit('SET_HEARTBEATS', heartbeats))
      .catch(() => commit('RESET_LOADING'))
  },
  deleteHeartbeat({dispatch}, heartbeatId) {
    return HeartbeatsApi.deleteHeartbeat(heartbeatId).then(() => {
      dispatch('getHeartbeats')
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
