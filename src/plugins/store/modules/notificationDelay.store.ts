import NotificationDelayApi from '@/services/api/notificationDelay.service'
import type {State, Getters, Actions, Mutations} from '../types/notificationDelay-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],

  pagination: {
    page: 1,
    itemsPerPage: 15,
    sortBy: [{key: 'delay_time'}],
    descending: true,
    itemsPerPageOptions: [10, 15, 30, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_NOTIFICATION_DELAY(state, [notificationDelays, total, pageSize]) {
    state.isLoading = false
    state.items = notificationDelays
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
  getNotificationDelays({commit, state}) {
    commit('SET_LOADING')
    const params = new URLSearchParams()

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    // add server-side sort
    // params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationDelayApi.getNotificationDelays(params)
      .then(({notificationDelays, total, pageSize}) =>
        commit('SET_NOTIFICATION_DELAY', [notificationDelays, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  deleteNotificationDelay({dispatch}, notificationDelayId) {
    return NotificationDelayApi.deleteNotificationDelay(notificationDelayId).then(() => {
      dispatch('getNotificationDelays')
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
