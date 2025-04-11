import NotificationHistoryApi from '@/services/api/notificationHistory.service'
import type {State, Getters, Mutations, Actions, Filter} from '../types/notificationHistory-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'
import moment from 'moment'

const namespaced = true

const state: State = {
  isLoading: false,

  notification_history: [],

  activeFilter: {
    sent: true,
    error: true
  },

  sent: [true, false],
  query: {q: ''},
  filter: {dateRange: {}},
  pagination: {
    page: 1,
    itemsPerPage: 20,
    totalItems: 0,
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

  SET_FILTER(state, filter) {
    state.filter = Object.assign({}, filter)
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
  },
  SET_ACTIVE_FILTER(state, filter) {
    state.activeFilter.sent = filter.sent !== undefined ? filter.sent : state.activeFilter.sent
    state.activeFilter.error = filter.error !== undefined ? filter.error : state.activeFilter.error
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getNotificationHistory({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    //add server-side sent status

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())
    const specialKeys = ['dateRange']
    for (const key of Object.keys(state.filter)) {
      const typedKey = key as keyof Omit<Filter, 'dateRange'>
      if (specialKeys.includes(typedKey) || !state.filter[typedKey]) continue
      else if (typeof state.filter[typedKey] === 'object')
        state.filter[typedKey].map((k: string) => params.append(typedKey, '~' + k))
      else params.append(typedKey, `~${state.filter[typedKey]}`)
    }

    if (!state.activeFilter.sent && state.activeFilter.error) params.append('sent', 'false')
    else if (!state.activeFilter.error && state.activeFilter.sent) params.append('sent', 'true')

    const dateRange = state.filter.dateRange
    if (dateRange.select) {
      if (dateRange.to !== undefined) {
        params.append('to-date', moment.unix(dateRange.to).toISOString())
      }
      if (dateRange.from !== undefined) {
        params.append('from-date', moment.unix(dateRange.from).toISOString())
      }
    } else if (dateRange.from !== undefined) {
      params.append('from-date', moment().utc().add(dateRange.from, 'seconds').toISOString())
    }

    // add server-side sort
    // params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationHistoryApi.getNotificationHistory(params)
      .then(({notificationHistory, total, pageSize}) =>
        commit('SET_NOTIFICATION_HISTORY', [notificationHistory, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },

  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },

  setActiveFilter({commit, dispatch}, filter) {
    commit('SET_ACTIVE_FILTER', filter)
    dispatch('getNotificationHistory')
  },

  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit}) {
    commit('SET_FILTER', {dateRange: {}})
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
