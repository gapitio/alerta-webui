import NotificationRuleApi from '@/services/api/notificationRule.service'
import type {State, Getters, Actions, Mutations, Filter} from '../types/notificationRule-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'
import utils from '@/common/utils'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  selected: [],

  history: [],
  item: null,

  alerts: [],
  isLoadingAlerts: false,
  isLoadingHistory: false,
  query: {q: ''},
  activeFilter: {
    active: true,
    inactive: true
  },

  historyPagination: {
    page: 1,
    itemsPerPage: 15,
    itemsPerPageOptions: [10, 15, 30, 50, 100, 200],
    totalItems: 0
  },

  alertsPagination: {
    page: 1,
    itemsPerPage: 15,
    itemsPerPageOptions: [10, 15, 30]
  },

  pagination: {
    page: 1,
    itemsPerPage: 15,
    sortBy: [{key: 'startTime', order: 'asc'}],
    descending: true,
    itemsPerPageOptions: [10, 15, 30, 50, 100, 200]
  },
  filter: {}
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query) {
    state.query = query
  },
  SET_FILTER(state, filter) {
    state.filter = filter
  },
  SET_ITEMS(state, [notificationRules, total, pageSize]) {
    state.isLoading = false
    state.items = notificationRules
    state.pagination.totalItems = total
    state.pagination.itemsPerPage = pageSize
  },
  SET_ALERTS_LOADING(state) {
    state.isLoadingAlerts = true
  },
  SET_HISTORY_LOADING(state) {
    state.isLoadingHistory = true
  },
  SET_ALERTS(state, [total, alerts, pageSize]) {
    state.isLoadingAlerts = false
    state.alertsPagination.totalItems = total
    state.alertsPagination.itemsPerPage = pageSize
    state.alerts = alerts
  },
  SET_ITEM(state, rule) {
    state.isLoading = false
    state.item = rule
  },
  SET_HISTORY(state, [notificationRuleHistory, total, pageSize]) {
    state.isLoadingHistory = false
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
  RESET_HISTORY_LOADING(state) {
    state.isLoadingHistory = false
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
  },
  SET_ALERTS_PAGINATION(state, pagination) {
    state.alertsPagination = Object.assign({}, state.alertsPagination, pagination)
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

    const sortBy = state.pagination.sortBy
    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy?.map(sb => {
        params.append('sort-by', (sb.order === 'desc' ? '-' : '') + sb.key)
      })
    }

    return NotificationRuleApi.getNotificationRules(params)
      .then(({notificationRules, total, pageSize}) => commit('SET_ITEMS', [notificationRules, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  async getAlerts({commit, state}, notification_rule) {
    commit('SET_ALERTS_LOADING')

    const params = new URLSearchParams()
    params.append('page', state.alertsPagination.page.toString())
    params.append('page-size', state.alertsPagination.itemsPerPage.toString())
    const {alerts, total, pageSize} = await NotificationRuleApi.getNotificationAlerts(notification_rule, params)
    commit('SET_ALERTS', [total, alerts, pageSize])
  },
  getNotificationRuleHistory({commit, state}, id) {
    commit('SET_HISTORY_LOADING')
    const params = new URLSearchParams(state.query)
    params.append('page', state.historyPagination.page.toString())
    params.append('page-size', state.historyPagination.itemsPerPage.toString())
    return NotificationRuleApi.getNotificationRuleHistory(id, params)
      .then(({notificationRuleHistory, total, pageSize}) => {
        commit('SET_HISTORY', [notificationRuleHistory, total, pageSize])
      })
      .catch(() => commit('RESET_HISTORY_LOADING'))
  },
  async getNotificationRule({commit}, id) {
    try {
      const {notificationRule} = await NotificationRuleApi.getNotificationRule(id)
      commit('SET_ITEM', notificationRule)
      return notificationRule
    } catch (error) {
      return {name: id, error}
    }
  },
  getNoificationRulesGroup(_, id) {
    return NotificationRuleApi.getNotificationRulesByNGroup(id)
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
  setPagination({commit, dispatch}, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('getNotificationRules')
  },
  setHistoryPagination({commit}, pagination) {
    commit('SET_HISTORY_PAGINATION', pagination)
  },
  setAlertsPagination({commit}, pagination) {
    commit('SET_ALERTS_PAGINATION', pagination)
  },
  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  }
}

const getters: Getters = {
  pagination: state => {
    return state.pagination
  },
  historyPagination: state => {
    return state.historyPagination
  },
  getHash: state => {
    const filterHash = utils.toHash(state.filter)
    const sortBy = state.pagination.sortBy ? state.pagination.sortBy : []
    const descending = sortBy.length > 0 ? sortBy.map(o => (o.order === 'desc' ? 1 : 0)) : [0, 1]
    const paginationHash = sortBy.length > 0 ? `sb:${sortBy.map(({key}) => key).join(',')};sd:${descending}` : ''
    return `#${filterHash};${paginationHash};`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
