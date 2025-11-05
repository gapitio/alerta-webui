import OnCallApi from '@/services/api/onCall.service'
import type {State, Getters, Actions, Mutations} from '../types/onCall-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],

  query: {q: ''},
  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'startTime'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_ON_CALL(state, [onCalls, total, pageSize]) {
    state.isLoading = false
    state.items = onCalls
    state.pagination.totalItems = total
    state.pagination.itemsPerPage = pageSize
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getOnCalls({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    const sortBy = state.pagination.sortBy
    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy?.map(sb => {
        params.append('sort-by', (sb.order === 'desc' ? '-' : '') + sb.key)
      })
    }

    return OnCallApi.getOnCalls(params)
      .then(({onCalls, total, pageSize}) => commit('SET_ON_CALL', [onCalls, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createOnCall({dispatch}, notificationrule) {
    return OnCallApi.createOnCall(notificationrule).then(() => {
      dispatch('getOnCalls')
    })
  },
  updateOnCall({dispatch}, [onCallId, update]) {
    return OnCallApi.updateOnCall(onCallId, update).then(() => {
      dispatch('getOnCalls')
    })
  },
  deleteOnCall({dispatch}, onCallId) {
    return OnCallApi.deleteOnCall(onCallId).then(() => {
      dispatch('getOnCalls')
    })
  },
  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

const getters: Getters = {
  pagination: state => {
    return state.pagination
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
