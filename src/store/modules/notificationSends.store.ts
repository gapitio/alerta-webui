import NotificationSendApi from '@/services/api/notificationSend.service'

const namespaced = true

const state = {
  isLoading: false,

  notifications: [],
  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'id',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_NOTIFICATION_SEND(state, [notificationSends, total, pageSize]) {
    state.isLoading = false
    state.notifications = notificationSends
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
  getNotificationSends({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationSendApi.getNotificationSends(params)
      .then(({notificationSends: notificationSends, total, pageSize}) =>
        commit('SET_NOTIFICATION_SEND', [notificationSends, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  updateNotificationSend({dispatch, commit}, [notificationChannelId, update]) {
    return NotificationSendApi.updateNotificationSend(notificationChannelId, update).then(response => {
      dispatch('getNotificationSends')
    })
  },
  sendNotification({dispatch, commit}, [notificationChannelId, data]) {
    return NotificationSendApi.sendNotification(notificationChannelId, data)
  }
}

const getters = {
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
