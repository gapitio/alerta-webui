import NotificationChannelApi from '@/services/api/notificationChannel.service'

const namespaced = true

const state = {
  isLoading: false,

  notification_channels: [],
  encryptionKey: '',

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'id',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_ENCRYPTION_KEY(state, key) {
    state.encryptionKey = key
  },
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_NOTIFICATION_CHANNEL(state, [notificationChannel, total, pageSize]) {
    state.isLoading = false
    state.notification_channels = notificationChannel
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
  getEncryptionKey({commit}) {
    return NotificationChannelApi.getEncryptionKey().then(({key}) => commit('SET_ENCRYPTION_KEY', key))
  },
  getNotificationChannels({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationChannelApi.getNotificationChannels(params)
      .then(({notificationChannels: notificationChannels, total, pageSize}) =>
        commit('SET_NOTIFICATION_CHANNEL', [notificationChannels, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  createNotificationChannel({dispatch}, notificationchannel) {
    return NotificationChannelApi.createNotificationChannel(notificationchannel).then(() => {
      dispatch('getNotificationChannels')
    })
  },
  updateNotificationChannel({dispatch}, [notificationChannelId, update]) {
    return NotificationChannelApi.updateNotificationChannel(notificationChannelId, update).then(() => {
      dispatch('getNotificationChannels')
    })
  },
  deleteNotificationChannel({dispatch}, notificationChannelId) {
    return NotificationChannelApi.deleteNotificationChannel(notificationChannelId).then(() => {
      dispatch('getNotificationChannels')
    })
  },
  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  testNotificationChannel(_, [notificationChannelId, data]) {
    return NotificationChannelApi.testNotificationChannel(notificationChannelId, data)
  }
}

const getters = {
  pagination: state => {
    return state.pagination
  },
  ids: state => {
    return state.notification_channels.map(channel => {
      return channel.id
    })
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
