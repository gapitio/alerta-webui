import BlackoutsApi from '@/services/api/blackout.service'

const namespaced = true

const state = {
  isLoading: false,

  blackouts: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_BLACKOUTS(state, blackouts) {
    state.isLoading = false
    state.blackouts = blackouts
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
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
