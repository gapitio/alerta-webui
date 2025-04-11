import type {State, Getters, Actions, Mutations, ErrorData} from '../types/notifications-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'
const namespaced = true

const state: State = {
  snackbars: []
}

// SNACKBAR
// {
//   type: 'success', 'info', 'error'
//   text: '',
//   action: 'RETRY',
//   timeout: 6000
// }

// BANNER
// {
//   type: success, info, warning or error
//   icon: null,  // check_circle, info, priority_high, warning,
//   text: ''
// }

const mutations: Mutations = {
  ADD_SNACKBAR(state, snackbar) {
    if (!state.snackbars.map(s => s.text).includes(snackbar.text)) {
      state.snackbars.push(snackbar)
    }
  },
  REMOVE_SNACKBAR(state) {
    state.snackbars.shift()
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  showSnackbar({commit}, snackbar) {
    commit('ADD_SNACKBAR', snackbar)
  },
  closeSnackbar({commit}) {
    commit('REMOVE_SNACKBAR')
  },

  success({commit}, message) {
    commit('ADD_SNACKBAR', {
      type: 'success',
      text: message,
      action: 'OK',
      timeout: 3000
    })
  },

  error({commit}, error) {
    function isAxiosError(error: any): error is ErrorData {
      return error.hasOwnProperty('code')
    }
    // HTTP error with status, code, message and errors.
    if (isAxiosError(error)) {
      commit('ADD_SNACKBAR', {
        type: error.status,
        text: `${error.message} (${error.code})`,
        action: 'CLOSE',
        timeout: 5000
      })
    } else {
      commit('ADD_SNACKBAR', {
        type: 'error',
        text: `${error.name}: ${error.message}`,
        action: 'CLOSE',
        timeout: 5000
      })
    }
  }
}

const getters: Getters = {
  hasSnackbar: state => {
    return state.snackbars.length > 0
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
