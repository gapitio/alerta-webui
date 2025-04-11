import AlertsApi from '@/services/api/alert.service'
import type { Mutations, Actions, Getters, State } from './alerts-types'

import moment from 'moment'
import utils from '@/common/utils'

const namespaced = true

const state: State = {
  isLoading: false,
  isSearching: false,

  alerts: [],
  history: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  services: [],
  groups: [],
  tags: [],

  alert: {},
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  displayDensity: 'comfortable', // 'comfortable' or 'compact'

  // query, filter and pagination
  query: {}, // URLSearchParams
  historyFilter: {
    environment: null
  },
  filter: {
    // local defaults
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  historyPagination: {
    page: 1,
    totalItems: 0,
    rowsPerPage: 20,
    rowsPerPageItems: [10, 20, 50, 100, 200, 500, 1000]
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: [],
    descending: false,
    totalItems: 0,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query) {
    state.isSearching = true
    state.query = query
  },
  SET_ALERTS(state, [alerts, total, pageSize]) {
    state.alerts = alerts
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
    state.isLoading = false
    state.isSearching = false
  },
  SET_HISTORY(state, [history, total]) {
    state.history = history
    state.historyPagination.totalItems = total
  },
  RESET_LOADING(state) {
    state.isLoading = false
    state.isSearching = false
  },
  SET_KIOSK(state, isKiosk) {
    state.isKiosk = isKiosk
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  SET_ALERT(state, alert) {
    state.alert = alert
  },
  SET_NOTES(state, notes) {
    state.notes = notes
  },
  SET_ENVIRONMENTS(state, environments) {
    state.environments = environments
  },
  SET_SERVICES(state, services) {
    state.services = services
  },
  SET_GROUPS(state, groups) {
    state.groups = groups
  },
  SET_TAGS(state, tags) {
    state.tags = tags
  },
  SET_SETTING(state, {s, v}) {
    state[s] = v
  },
  SET_FILTER(state, filter) {
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_HISTORY_FILTER(state, filter) {
    state.historyFilter = Object.assign({}, state.historyFilter, filter)
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_HISTORY_PAGINATION(state, pagination) {
    state.historyPagination = Object.assign({}, state.historyPagination, pagination)
  },
  SET_PANEL(state, panel) {
    state.showPanel = panel
  }
}

const actions: Actions = {
  async getAlerts({ rootGetters, commit, state }) {
    await commit('SET_LOADING')
    // get "lucene" query params (?q=)
    const params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.environment && params.append('environment', state.filter.environment)
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))


    // add server-side sorting
    let sortBy = state.pagination.sortBy
    if (sortBy?.length === 0 || !sortBy) {
      sortBy = await rootGetters['getConfig']('sort_by').map(b => {return {'key': b}})
      commit('SET_PAGINATION', { sortBy })
    }

    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy?.map(sb => {
        params.append('sort-by', (sb.order === 'desc' ? '-' : '') + sb.key)
      })
    }

    // need notes from alert history if showing notes icons
    if (rootGetters.getPreference('showNotesIcon')) {
      params.append('show-history', 'true')
    }

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.rowsPerPage.toString())

    // apply any date/time filters
    if (state.filter.dateRange [0]) {
      if (state.filter.dateRange[0] > 0) {
        params.append(
          'from-date',
          moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
        )
      } else if (state.filter.dateRange[0] < 0) {
        params.append(
          'from-date',
          moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
        )
      }
    }
    if (state.filter.dateRange [1]) {
      if (state.filter.dateRange[1] > 0) {
        params.append(
          'to-date',
          moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
        )
      } else if (state.filter.dateRange[1] < 0) {
        params.append(
          'to-date',
          moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
        )
      }
    }
    try {
      const {alerts, total, pageSize} = await AlertsApi.getAlerts(params)
      await commit('SET_ALERTS', [alerts, total, pageSize])
      return alerts
    } catch {
      await commit('RESET_LOADING')
      return []
    }
  },

  getAlertHistory({commit, state}) {
    const params = new URLSearchParams(state.query)

    state.historyFilter.environment && params.append('environment', state.historyFilter.environment)

    console.log(typeof state.historyPagination.page)

    params.append('page', state.historyPagination.page.toString())
    params.append('page-size', state.historyPagination.rowsPerPage.toString())

    return AlertsApi.getAlertHistory(params).then(({history, total}) => commit('SET_HISTORY', [history, total]))
  },
  setHistoryFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },
  updateKiosk({commit}, isKiosk) {
    commit('SET_KIOSK', isKiosk)
  },
  updateSelected({commit}, selected) {
    commit('SET_SELECTED', selected)
  },

  async getAlert({commit}, alertId) {
    const {alert} = await AlertsApi.getAlert(alertId)
    return commit('SET_ALERT', alert)
  },

  watchAlert({rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.tagAlert(alertId, {tags: [tag]})
  },
  unwatchAlert({rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.untagAlert(alertId, {tags: [tag]})
  },
  takeAction(_, [alertId, action, text, timeout]) {
    return AlertsApi.actionAlert(alertId, {
      action: action,
      text: text,
      timeout: timeout
    })
  },
  tagAlert(_, [alertId, tags]) {
    return AlertsApi.tagAlert(alertId, tags)
  },
  untagAlert(_, [alertId, tags]) {
    return AlertsApi.untagAlert(alertId, tags)
  },

  addNote({dispatch}, [alertId, text]) {
    return AlertsApi.addNote(alertId, {
      text: text
    }).then(() => dispatch('getAlerts'))
  },
  getNotes({commit}, alertId) {
    return AlertsApi.getNotes(alertId).then(({notes}) => {
      commit('SET_NOTES', notes)
    })
  },
  updateNote({dispatch}, [alertId, noteId, note]) {
    return AlertsApi.updateNote(alertId, noteId, {
      note: note
    }).then(() => dispatch('getNotes'))
  },
  deleteNote({dispatch}, [alertId, noteId]) {
    return AlertsApi.deleteNote(alertId, noteId).then(() => dispatch('getNotes', [alertId]))
  },

  deleteAlert(_, alertId) {
    return AlertsApi.deleteAlert(alertId)
  },

  getEnvironments({commit, state}) {
    // get "lucene" query params (?q=)
    const params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // apply any date/time filters
    if (state.filter.dateRange[0]) {
      if (state.filter.dateRange[0] > 0) {
        params.append(
          'from-date',
          moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
        )
      } else if (state.filter.dateRange[0] < 0) {
        params.append(
          'from-date',
          moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
        )
      }
    } 
    if (state.filter.dateRange[1]) {
      if (state.filter.dateRange[1] > 0) {
        params.append(
          'to-date',
          moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
        )
      } else if (state.filter.dateRange[1] < 0) {
        params.append(
          'to-date',
          moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
        )
      }
    }

    return AlertsApi.getEnvironments(params).then(({environments}) => commit('SET_ENVIRONMENTS', environments))
  },
  getServices({commit}) {
    return AlertsApi.getServices({}).then(({services}) => commit('SET_SERVICES', services))
  },
  getGroups({commit}) {
    return AlertsApi.getGroups({}).then(({groups}) => commit('SET_GROUPS', groups))
  },
  getTags({commit}) {
    return AlertsApi.getTags({}).then(({tags}) => commit('SET_TAGS', tags))
  },

  toggle({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  },
  set({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit, rootState}) {
    commit('SET_FILTER', rootState.config.filter)
  },
  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  setHistoryPagination({commit}, pagination) {
    commit('SET_HISTORY_PAGINATION', pagination)
  },
  setPanel({commit}, panel) {
    commit('SET_PANEL', panel)
  }
}

const getters: Getters = {
  alerts: (state, rootState) => {
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return state.alerts.filter(a => a.tags?.includes(tag))
    } else {
      return state.alerts
    }
  },
  history: (state) => {
    return state.history
  },
  environments: (state, rootState) =>
    (showAllowedEnvs = true) => {
      if (showAllowedEnvs) {
        return [
          ...new Set([...(rootState.config.environments || []), ...state.environments.map(e => e.environment)])
        ].sort()
      }
      return state.environments.map(e => e.environment).sort()
    },
  counts: (state) => {
    return state.environments.reduce(
      (grp: {ALL: number, [key: string]: number}, e) => {
        grp[e.environment] = e.count
        grp['ALL'] = grp['ALL'] + e.count
        return grp
      },
      {ALL: 0}
    )
  },
  services: (state) => {
    return state.services.map(s => s.service).sort()
  },
  groups: (state) => {
    return state.groups.map(g => g.group).sort()
  },
  tags: (state) => {
    return state.tags.map(t => t.tag).sort()
  },
  getHash: (state) => {
    const filterHash = utils.toHash(state.filter)
    const sortBy = state.pagination.sortBy ? state.pagination.sortBy : []
    const descending = sortBy.length > 0 ? sortBy.map(o => o.order==="desc" ? 1:0) : [0,1]
    const paginationHash = `sb:${sortBy.map(({key}) => key).join(',')};sd:${descending}`
    const asiHash = `asi:${state.showPanel ? 1 : 0}`
    return `#${filterHash};${paginationHash};${asiHash}`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
