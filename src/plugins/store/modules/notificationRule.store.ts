import NotificationRuleApi from '@/services/api/notificationRule.service'
import type { State, Getters, Actions, Mutations } from '../types/notificationRule-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  selected: [],

  history: [],
  item: null,

  query: {q: ''},
  activeFilter: {
    active: true,
    inactive: true
  },
  
  historyPagination: {
    page: 1,
    itemsPerPage: 15,
    itemsPerPageOptions: [10, 15, 30, 50, 100, 200]
  },

  pagination: {
    page: 1,
    itemsPerPage: 15,
    sortBy: [{key: 'startTime'}],
    descending: true,
    itemsPerPageOptions: [10, 15, 30, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query) {
    state.query = query
  },
  SET_ITEMS(state, [notificationRules, total, pageSize]) {
    state.isLoading = false
    state.items = notificationRules
    state.pagination.totalItems = total
    state.pagination.itemsPerPage = pageSize
  },
  SET_ITEM(state, rule) {
    state.isLoading = false
    state.item = rule
  },
  SET_HISTORY(state, [notificationRuleHistory, total, pageSize]) {
    state.history = notificationRuleHistory
    state.historyPagination.totalItems = total
    state.historyPagination.itemsPerPage = pageSize
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_ACTIVE_FILTER(state, filter) {
    state.activeFilter.active = filter.active !== undefined ? filter.active : state.activeFilter.active
    state.activeFilter.inactive = filter.inactive !== undefined ? filter.inactive : state.activeFilter.inactive
  },
  SET_HISTORY_PAGINATION(state, pagination) {
    state.historyPagination = Object.assign({}, state.historyPagination, pagination)
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getNotificationRules({commit, state}) {
    commit('SET_LOADING')
    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())
    if (!state.activeFilter.active && state.activeFilter.inactive) params.append('active', 'false')
    else if (!state.activeFilter.inactive && state.activeFilter.active) params.append('active', 'true')

    const sortBy = state.pagination.sortBy
    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy?.map(sb => {
        params.append('sort-by', (sb.order === 'desc' ? '-' : '') + sb.key)
      })
    }

    return NotificationRuleApi.getNotificationRules(params)
      .then(({notificationRules, total, pageSize}) =>
        commit('SET_ITEMS', [notificationRules, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  getNotificationRuleHistory({commit, state}, id) {
    const params = new URLSearchParams(state.query)
    params.append('page', state.historyPagination.page.toString())
    params.append('page-size', state.historyPagination.itemsPerPage.toString())
    return NotificationRuleApi.getNotificationRuleHistory(id, params).then(
      ({notificationRuleHistory, total, pageSize}) => {
        commit('SET_HISTORY', [notificationRuleHistory, total, pageSize])
      }
    )
  },
  getNotificationRule({commit}, id) {
    return NotificationRuleApi.getNotificationRule(id).then(({notificationRule}) => {
      commit('SET_ITEM', notificationRule)
    })
  },
  setActiveFilter({commit, dispatch}, filter) {
    commit('SET_ACTIVE_FILTER', filter)
    dispatch('getNotificationRules')
  },
  createNotificationRule({dispatch}, notificationrule) {
    return NotificationRuleApi.createNotificationRule(notificationrule).then(() => {
      dispatch('getNotificationRules')
    })
  },
  updateSelected({commit}, selected) {
    commit('SET_SELECTED', selected)
  },
  updateNotificationRule({dispatch}, [notificationRuleId, update]) {
    return NotificationRuleApi.updateNotificationRule(notificationRuleId, update).then(() => {
      dispatch('getNotificationRules')
    })
  },
  deleteNotificationRule({dispatch}, notificationRuleId) {
    return NotificationRuleApi.deleteNotificationRule(notificationRuleId).then(() => {
      dispatch('getNotificationRules')
    })
  },
  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  setHistoryPagination({commit}, pagination) {
    commit('SET_HISTORY_PAGINATION', pagination)
  },
  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  }
}

const getters: Getters = {
  pagination: state => {
    return state.pagination
  },
  historyPagination: state => {
    return state.historyPagination
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
