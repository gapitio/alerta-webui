import BlackoutsApi from '@/services/api/blackout.service'
import type {State, Mutations, Actions} from '../types/blackout-types'
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
  SET_BLACKOUTS(state, blackouts) {
    state.isLoading = false
    state.items = blackouts
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getBlackouts({commit}) {
    commit('SET_LOADING')
    return BlackoutsApi.getBlackouts({})
      .then(({blackouts}) => commit('SET_BLACKOUTS', blackouts))
      .catch(() => commit('RESET_LOADING'))
  },
  createBlackout({dispatch}, blackout) {
    return BlackoutsApi.createBlackout(blackout).then(() => {
      dispatch('getBlackouts')
    })
  },
  updateBlackout({dispatch}, [blackoutId, update]) {
    return BlackoutsApi.updateBlackout(blackoutId, update).then(() => {
      dispatch('getBlackouts')
    })
  },
  deleteBlackout({dispatch}, blackoutId) {
    return BlackoutsApi.deleteBlackout(blackoutId).then(() => {
      dispatch('getBlackouts')
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
