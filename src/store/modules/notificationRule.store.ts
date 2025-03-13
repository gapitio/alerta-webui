import NotificationRuleApi from '@/services/api/notificationRule.service'

const namespaced = true

const state = {
  isLoading: false,

  notification_rules: [],
  selected: [],

  notificationRuleHistory: [],
  notificationRule: null,

  query: {},

  historyPagination: {
    page: 1,
    rowsPerPage: 15,
    rowsPerPageItems: [10, 15, 30, 50, 100, 200]
  },

  pagination: {
    page: 1,
    rowsPerPage: 15,
    sortBy: 'startTime',
    descending: true,
    rowsPerPageItems: [10, 15, 30, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query): any {
    state.query = query
  },
  SET_NOTIFICATION_RULES(state, [notificationRules, total, pageSize]) {
    state.isLoading = false
    state.notification_rules = notificationRules
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  SET_NOTIFICATION_RULE_HISTORY(state, [notificationRuleHistory, total, pageSize]) {
    state.notificationRuleHistory = notificationRuleHistory
    state.historyPagination.totalItems = total
    state.historyPagination.rowsPerPage = pageSize
  },
  SET_NOTIFICATION_RULE(state, notificationRule) {
    state.notificationRule = notificationRule
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
  SET_HISTORY_PAGINATION(state, pagination) {
    state.historyPagination = Object.assign({}, state.historyPagination, pagination)
  }
}

const actions = {
  getNotificationRules({commit, state}) {
    commit('SET_LOADING')
    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationRuleApi.getNotificationRules(params)
      .then(({notificationRules, total, pageSize}) =>
        commit('SET_NOTIFICATION_RULES', [notificationRules, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  getNotificationRuleHistory({commit, state}, id) {
    let params = new URLSearchParams(state.query)
    params.append('page', state.historyPagination.page)
    params.append('page-size', state.historyPagination.rowsPerPage)
    return NotificationRuleApi.getNotificationRuleHistory(id, params).then(
      ({notificationRuleHistory, total, pageSize}) => {
        commit('SET_NOTIFICATION_RULE_HISTORY', [notificationRuleHistory, total, pageSize])
      }
    )
  },
  getNotificationRule({commit}, id) {
    return NotificationRuleApi.getNotificationRule(id).then(({notificationRule}) => {
      commit('SET_NOTIFICATION_RULE', notificationRule)
    })
  },
  createNotificationRule({dispatch, commit}, notificationrule) {
    return NotificationRuleApi.createNotificationRule(notificationrule).then(response => {
      dispatch('getNotificationRules')
    })
  },
  updateSelected({commit}, selected) {
    commit('SET_SELECTED', selected)
  },
  updateNotificationRule({dispatch, commit}, [notificationRuleId, update]) {
    return NotificationRuleApi.updateNotificationRule(notificationRuleId, update).then(response => {
      dispatch('getNotificationRules')
    })
  },
  deleteNotificationRule({dispatch, commit}, notificationRuleId) {
    return NotificationRuleApi.deleteNotificationRule(notificationRuleId).then(response => {
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

const getters = {
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
