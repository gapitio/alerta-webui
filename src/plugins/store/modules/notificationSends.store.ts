import NotificationSendApi from '@/services/api/notificationSend.service'
import type {State, Mutations, Actions, Getters} from '../types/notificationSends-types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'id'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  },
  query: {q: ''},
  filter: {}
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_FILTER(state, filter) {
    state.filter = filter
  },
  SET_NOTIFICATION_SEND(state, [notificationSends, total, pageSize]) {
    state.isLoading = false
    state.items = notificationSends
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

const actions: Actions = {
  getNotificationSends({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    // params.append('page', state.pagination.page.toString())
    // params.append('page-size', state.pagination.itemsPerPage.toString())

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    if (state.filter.name) state.filter.name.map(a => params.append('name', a))
    if (state.filter.type) params.append('type', state.filter.type)

    return NotificationSendApi.getNotificationSends(params)
      .then(({notificationSends, total, pageSize}) =>
        commit('SET_NOTIFICATION_SEND', [notificationSends, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  updateNotificationSend({dispatch}, [notificationChannelId, update]) {
    return NotificationSendApi.updateNotificationSend(notificationChannelId, update).then(() => {
      dispatch('getNotificationSends')
    })
  },
  sendNotification({}, [notificationChannelId, data]) {
    return NotificationSendApi.sendNotification(notificationChannelId, data)
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
