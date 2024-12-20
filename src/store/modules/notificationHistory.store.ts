import NotificationHistoryApi from '@/services/api/notificationHistory.service'

const namespaced = true

const state = {
  isLoading: false,

  notification_history: [],

  sent: [true, false],
  query: {},
  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'sent_time',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query): any {
    state.query = query
  },

  SET_SHOWN_SENT_STATUS(state, sent): any {
    state.sent = sent
  },

  SET_NOTIFICATION_HISTORY(state, [notificationHistory, total, pageSize]) {
    state.isLoading = false
    state.notification_history = notificationHistory
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions = {
  getNotificationHistory({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    //add server-side sent status
    params.append('sent', state.sent)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

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

const getters = {
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
