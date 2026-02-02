import AlertsApi from '@/services/api/alert.service'
import type {Mutations, Actions, Getters, State} from '../types/alerts-types'
import type {State as RootState} from '../types'

import moment from 'moment'
import utils from '@/common/utils'
import type {ActionTree} from 'vuex'

const namespaced = true

const state: State = {
  isLoading: false,
  isSearching: false,

  alerts: [],
  history: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  historyEnvironments: {},
  services: [],
  groups: [],
  tags: [],

  alert: null,
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  displayDensity: 'comfortable', // 'comfortable' or 'compact'

  // query, filter and pagination
  query: {q: ''}, // URLSearchParams
  historyFilter: {
    environment: null,
    dateRange: {}
  },
  filter: {
    // local defaults
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: {}
  },

  historyPagination: {
    page: 1,
    totalItems: 0,
    itemsPerPage: 20,
    itemsPerPageOptions: [10, 20, 50, 100, 200, 500, 1000]
  },

  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [],
    descending: false,
    totalItems: 0,
    itemsPerPageOptions: [5, 10, 20, 50, 100, 200]
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
    state.pagination.itemsPerPage = pageSize
    state.isLoading = false
    state.isSearching = false
  },
  SET_HISTORY(state, [history, total]) {
    state.history = history
    state.historyPagination.totalItems = total
  },
  SET_HISTORY_ENVIRONMENTS(state, [environments, total]) {
    state.historyEnvironments = {All: total, ...environments}
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
    state.filter = Object.assign({}, {dateRange: {}}, filter)
  },
  SET_HISTORY_FILTER(state, filter) {
    state.historyFilter = Object.assign({}, {dateRange: {}}, filter)
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

const actions: Actions & ActionTree<State, RootState> = {
  async getAlerts({rootGetters, commit, state, rootState}) {
    await commit('SET_LOADING')
    // get "lucene" query params (?q=)
    const params = new URLSearchParams(state.query)

    const specialKeys = ['environment', 'environments', 'dateRange', 'search']
    const notWildcards = ['duplicateCount']
    for (const key of Object.keys(state.filter)) {
      if (specialKeys.includes(key) || !state.filter[key]) continue
      else if (typeof state.filter[key] === 'object') state.filter[key].map((k: any) => params.append(key, k))
      else if (notWildcards.includes(key)) params.append(key, state.filter[key])
      else params.append(key, `~${state.filter[key]}`)
    }
    // append filter params to query paramsstate.filter.environments &&
    !state.filter.environment && state.filter.environments?.map(env => params.append('environment', env))
    state.filter.environment && params.append('environment', state.filter.environment)
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    // state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // add server-side sorting
    let sortBy = state.pagination.sortBy
    if (sortBy?.length === 0 || !sortBy) {
      sortBy = await rootGetters['getConfig']('sort_by')
      commit('SET_PAGINATION', {sortBy})
    }

    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy?.map(sb => {
        params.append('sort-by', (sb.order === 'desc' ? '-' : '') + sb.key)
      })
    }
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      params.append('customTags', tag)
    }

    // need notes from alert history if showing notes icons
    if (rootGetters.getPreference('showNotesIcon') || rootGetters.getConfig('columns').includes('note')) {
      params.append('show-history', 'true')
    }

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    // apply any date/time filters
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

    try {
      const {alerts, total, pageSize} = await AlertsApi.getAlerts(params)
      await commit('SET_ALERTS', [alerts, total, pageSize])
      return alerts
    } catch {
      await commit('RESET_LOADING')
      return []
    }
  },

  async getAlertHistory({commit, state}) {
    const params = new URLSearchParams(state.query)

    const specialKeys = ['environment', 'environments', 'dateRange', 'search']
    const notWildcards = ['duplicateCount']
    for (const key of Object.keys(state.historyFilter)) {
      if (specialKeys.includes(key) || !state.historyFilter[key]) continue
      else if (typeof state.historyFilter[key] === 'object')
        state.historyFilter[key].map((k: any) => params.append(key, k))
      else if (notWildcards.includes(key)) params.append(key, state.historyFilter[key])
      else params.append(key, `~${state.historyFilter[key]}`)
    }

    !state.historyFilter.environment && state.historyFilter.environments?.map(env => params.append('environment', env))
    state.historyFilter.environment && params.append('environment', state.historyFilter.environment)
    const dateRange = state.historyFilter.dateRange
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

    params.append('page', state.historyPagination.page.toString())
    params.append('page-size', state.historyPagination.itemsPerPage.toString())

    const {history, total} = await AlertsApi.getAlertHistory(params)
    commit('SET_HISTORY', [history, total])
    return history
  },
  getAlertHistoryCount({commit}) {
    return AlertsApi.getAlertHistoryCount().then(({environments, total}) =>
      commit('SET_HISTORY_ENVIRONMENTS', [environments, total])
    )
  },
  setHistoryFilter({commit, dispatch}, filter) {
    commit('SET_HISTORY_FILTER', filter)
    dispatch('getAlertHistory')
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
  takeActions(_, [alertsIds, action, text, timeout]) {
    return AlertsApi.actionAlerts({alerts: alertsIds, action: action, text: text, timeout: timeout})
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
    }).then(() => dispatch('getNotes', alertId))
  },
  deleteNote({dispatch}, [alertId, noteId]) {
    return AlertsApi.deleteNote(alertId, noteId).then(() => dispatch('getNotes', alertId))
  },

  deleteAlert(_, alertId) {
    return AlertsApi.deleteAlert(alertId)
  },
  deleteAlerts(_, alertIds) {
    const params = new URLSearchParams()
    for (const id of alertIds) {
      params.append('id', id)
    }
    return AlertsApi.deleteAlerts(params)
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
  alerts: state => state.alerts,
  history: state => {
    return state.history
  },
  environments:
    (state, _, rootState) =>
    (showAllowedEnvs = true) => {
      if (showAllowedEnvs) {
        return [
          ...new Set([...(rootState.config?.environments || []), ...state.environments.map(e => e.environment)])
        ].sort()
      }
      return state.environments.map(e => e.environment).sort()
    },
  counts: state => {
    return state.environments.reduce(
      (grp: {All: number; [key: string]: number}, e) => {
        grp[e.environment] = e.count
        grp['All'] = grp['All'] + e.count
        return grp
      },
      {All: 0}
    )
  },
  historyCounts: state => {
    return state.historyEnvironments
  },
  services: state => {
    return [...new Set(state.services.map(s => s.service).sort())]
  },
  groups: state => {
    return [...new Set(state.groups.map(g => g.group).sort())]
  },
  tags: state => {
    return [...new Set(state.tags.map(t => t.tag).sort())]
  },
  getHash: state => {
    const filterHash = utils.toHash(state.filter)
    const sortBy = state.pagination.sortBy ? state.pagination.sortBy : []
    const descending = sortBy.length > 0 ? sortBy.map(o => (o.order === 'desc' ? 1 : 0)) : [0, 1]
    const paginationHash = `sb:${sortBy.map(({key}) => key).join(',')};sd:${descending}`
    const asiHash = `asi:${state.showPanel ? 1 : 0}`
    return `#${filterHash};${paginationHash};${asiHash}`
  },
  getHistoryHash: state => `#${utils.toHash(state.historyFilter)}`
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
