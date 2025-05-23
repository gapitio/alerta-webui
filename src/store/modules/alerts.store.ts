import AlertsApi from '@/services/api/alert.service'

import moment from 'moment'
import utils from '@/common/utils'

const namespaced = true

const state = {
  isLoading: false,
  isSearching: false,
  search: null,

  alerts: [],
  history: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  historyEnvironments: [],
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
    rowsPerPage: 20,
    rowsPerPageItems: [10, 20, 50, 100, 200, 500, 1000]
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'default',
    descending: false,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state): any {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query): any {
    state.isSearching = true
    state.query = query
  },
  SET_ALERTS(state, [alerts, total, pageSize]): any {
    state.isLoading = false
    state.isSearching = false
    state.alerts = alerts
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  SET_HISTORY(state, [history, total]): any {
    state.history = history
    state.historyPagination.totalItems = total
  },
  SET_HISTORY_ENVIRONMENTS(state, [environments, total]) {
    state.historyEnvironments = {ALL: total, ...environments}
  },
  RESET_LOADING(state): any {
    state.isLoading = false
    state.isSearching = false
  },
  SET_KIOSK(state, isKiosk): any {
    state.isKiosk = isKiosk
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  SET_ALERT(state, alert): any {
    state.alert = alert
  },
  SET_NOTES(state, notes): any {
    state.notes = notes
  },
  SET_ENVIRONMENTS(state, environments): any {
    state.environments = environments
  },
  SET_SERVICES(state, services): any {
    state.services = services
  },
  SET_GROUPS(state, groups): any {
    state.groups = groups
  },
  SET_TAGS(state, tags): any {
    state.tags = tags
  },
  SET_SETTING(state, {s, v}) {
    state[s] = v
  },
  SET_SEARCH(state, search): any {
    state.search = search
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
  },
  RESET_FILTER(state, filter): any {
    state.filter = {}
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_HISTORY_FILTER(state, filter): any {
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

const actions = {
  getAlerts({rootGetters, commit, state}) {
    commit('SET_LOADING')
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)
    const specialKeys = ['environment', 'environments', 'dateRange', 'tags', 'search']
    const notWildcards = ['duplicateCount']
    for (const key of Object.keys(state.filter)) {
      if (specialKeys.includes(key) || !state.filter[key]) continue
      else if (typeof state.filter[key] === 'object') state.filter[key].map(k => params.append(key, k))
      else if (notWildcards.includes(key)) params.append(key, state.filter[key])
      else params.append(key, `~${state.filter[key]}`)
    }

    // append filter params to query params
    state.filter.environments &&
      !state.filter.environment &&
      state.filter.environments.map(env => params.append('environment', env))
    state.filter.environment && params.append('environment', state.filter.environment)
    // state.filter.resource && params.append('resource', `~${state.filter.resource}`)
    // state.filter.event && params.append('event', `~${state.filter.event}`)
    // state.filter.severities && state.filter.severities.map(se => params.append('severity', se))
    state.filter.tags && state.filter.tags.map(s => params.append('tag', s))
    // state.filter.status && state.filter.status.map(st => params.append('status', st))
    // state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    // state.filter.service && state.filter.service.map(s => params.append('service', s))
    // state.filter.group && state.filter.group.map(g => params.append('group', g))

    // add server-side sorting
    let sortBy = state.pagination.sortBy
    if (sortBy === 'default' || !sortBy) {
      sortBy = rootGetters['getConfig']('sort_by')
    }

    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy.map(sb => params.append('sort-by', sb))
    }

    // need notes from alert history if showing notes icons
    if (rootGetters.getPreference('showNotesIcon')) {
      params.append('show-history', 'true')
    }

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // apply any date/time filters
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

    return AlertsApi.getAlerts(params)
      .then(({alerts, total, pageSize}) => commit('SET_ALERTS', [alerts, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },

  getAlertHistory({commit, state}) {
    let params = new URLSearchParams(state.query)

    state.historyFilter.environment && params.append('environment', state.historyFilter.environment)

    params.append('page', state.historyPagination.page)
    params.append('page-size', state.historyPagination.rowsPerPage)

    return AlertsApi.getAlertHistory(params).then(({history, total}) => commit('SET_HISTORY', [history, total]))
  },
  getAlertHistoryCount({commit, state}) {
    return AlertsApi.getAlertHistoryCount().then(({environments, total}) =>
      commit('SET_HISTORY_ENVIRONMENTS', [environments, total])
    )
  },
  setHistoryFilter({commit}, filter) {
    commit('SET_HISTORY_FILTER', filter)
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

  getAlert({commit}, alertId) {
    return AlertsApi.getAlert(alertId).then(({alert}) => {
      commit('SET_ALERT', alert)
    })
  },

  watchAlert({commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.tagAlert(alertId, {tags: [tag]})
  },
  unwatchAlert({commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.untagAlert(alertId, {tags: [tag]})
  },
  takeAction({commit, dispatch}, [alertId, action, text, timeout]) {
    return AlertsApi.actionAlert(alertId, {
      action: action,
      text: text,
      timeout: timeout
    })
  },
  tagAlert({commit, dispatch}, [alertId, tags]) {
    return AlertsApi.tagAlert(alertId, tags)
  },
  untagAlert({commit, dispatch}, [alertId, tags]) {
    return AlertsApi.untagAlert(alertId, tags)
  },

  addNote({commit, dispatch}, [alertId, text]) {
    return AlertsApi.addNote(alertId, {
      text: text
    }).then(response => dispatch('getAlerts'))
  },
  getNotes({commit}, alertId) {
    return AlertsApi.getNotes(alertId).then(({notes}) => {
      commit('SET_NOTES', notes)
    })
  },
  updateNote({commit, dispatch}, [alertId, noteId, note]) {
    return AlertsApi.updateNote(alertId, noteId, {
      note: note
    }).then(response => dispatch('getNotes'))
  },
  deleteNote({commit, dispatch}, [alertId, noteId]) {
    return AlertsApi.deleteNote(alertId, noteId).then(response => dispatch('getNotes', [alertId]))
  },

  deleteAlert({commit, dispatch}, alertId) {
    return AlertsApi.deleteAlert(alertId)
  },

  getEnvironments({commit, state}) {
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // apply any date/time filters
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
  setSearch({commit}, search) {
    commit('SET_SEARCH', search)
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit, rootState}) {
    commit('RESET_FILTER', rootState.config.filter)
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

const getters = {
  alerts: (state, getters, rootState) => {
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return state.alerts.filter(a => a.tags.includes(tag))
    } else {
      return state.alerts
    }
  },
  history: (state, getters, rootState) => {
    return state.history
  },
  environments:
    (state, getters, rootState) =>
    (showAllowedEnvs = true) => {
      if (showAllowedEnvs) {
        return [
          ...new Set([...(rootState.config.environments || []), ...state.environments.map(e => e.environment)])
        ].sort()
      }
      return state.environments.map(e => e.environment).sort()
    },
  counts: state => {
    return state.environments.reduce(
      (grp, e) => {
        grp[e.environment] = e.count
        grp['ALL'] = grp['ALL'] + e.count
        return grp
      },
      {ALL: 0}
    )
  },
  historyCounts: state => {
    return state.historyEnvironments
  },
  services: state => {
    return state.services.map(s => s.service).sort()
  },
  groups: state => {
    return state.groups.map(g => g.group).sort()
  },
  tags: state => {
    return state.tags.map(t => t.tag).sort()
  },
  getHash: state => {
    let filterHash = utils.toHash(state.filter)
    let sortBy = state.pagination.sortBy ? state.pagination.sortBy : 'default'
    let descending = state.pagination.descending ? 1 : 0
    let paginationHash = `sb:${sortBy};sd:${descending}`
    let asiHash = `asi:${state.showPanel ? 1 : 0}`
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
