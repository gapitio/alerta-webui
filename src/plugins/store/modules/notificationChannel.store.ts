import NotificationChannelApi from '@/services/api/notificationChannel.service'
import type { State, Getters, Actions, Mutations } from '../types/notificationChannel-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  notification_channels: [],
  encryptionKey: '',
  query: {q: ''},
  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'id'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
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
  getEncryptionKey({commit}) {
    return NotificationChannelApi.getEncryptionKey().then(({key}) => commit('SET_ENCRYPTION_KEY', key))
  },
  getNotificationChannels({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    // add server-side sort
    // params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

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

const getters: Getters = {
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
