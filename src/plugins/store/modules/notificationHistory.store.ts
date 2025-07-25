import NotificationHistoryApi from '@/services/api/notificationHistory.service'
import type { State, Getters, Mutations, Actions } from '../types/notificationHistory-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  notification_history: [],

  sent: [true, false],
  query: {q: ''},
  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'sent_time'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query) {
    state.query = query
  },

  SET_SHOWN_SENT_STATUS(state, sent) {
    state.sent = sent
  },

  SET_NOTIFICATION_HISTORY(state, [notificationHistory, total, pageSize]) {
    state.isLoading = false
    state.notification_history = notificationHistory
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
  getNotificationHistory({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    //add server-side sent status
    params.append('sent', state.sent.join(','))

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    // add server-side sort
    // params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationHistoryApi.getNotificationHistory(params)
      .then(({notificationHistory: notificationHistory, total, pageSize}) =>
        commit('SET_NOTIFICATION_HISTORY', [notificationHistory, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },

  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },

  setShownSentStatus({commit}, status) {
    commit('SET_SHOWN_SENT_STATUS', status)
  },

  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

const getters: Getters = {
  pagination: state => {
    return state.pagination
  },
  sent: state => {
    return state.sent
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
