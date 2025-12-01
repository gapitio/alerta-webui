import NotificationChannelApi from '@/services/api/notificationChannel.service'
import type {State, Getters, Actions, Mutations, Filter} from '../types/notificationChannel-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'
import utils from '@/common/utils'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  encryptionKey: '',
  query: {q: ''},
  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'id', order: 'asc'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  },
  filter: {}
}

const mutations: Mutations = {
  SET_ENCRYPTION_KEY(state, key) {
    state.encryptionKey = key
  },
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_FILTER(state, filter) {
    state.filter = filter
  },
  SET_NOTIFICATION_CHANNEL(state, [notificationChannel, total, pageSize]) {
    state.isLoading = false
    state.items = notificationChannel
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
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  getNotificationChannels({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    const notWildcards = ['users']
    for (const key of Object.keys(state.filter)) {
      const typedKey = key as keyof Filter
      if (!state.filter[typedKey]) continue
      else if (typeof state.filter[typedKey] === 'object')
        state.filter[typedKey].map((k: string) =>
          params.append(typedKey, notWildcards.includes(typedKey) ? k : '~' + k)
        )
      else if (notWildcards.includes(typedKey)) params.append(key, state.filter[typedKey])
      else params.append(key, `~${state.filter[typedKey]}`)
    }

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
    return state.items.map(channel => {
      return channel.id
    })
  },
  getHash: state => {
    const filterHash = utils.toHash(state.filter)
    return `#${filterHash};`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
