import AlertsApi from '@/services/api/alert.service'
import type {State, Mutations, Actions} from '../types/reports-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

// import moment from 'moment'

const namespaced = true

const state: State = {
  offenders: [],
  flapping: [],
  standing: [],
  report: '',

  filter: {
    environment: null,
    severity: [],
    status: ['open', 'ack'],
    customer: [],
    service: [],
    group: [],
    dateRange: {}
  },

  query: {q: ''},

  pagination: {
    page: 1,
    itemsPerPage: 10,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_TOP_OFFENDERS(state, top10) {
    state.offenders = top10
  },
  SET_TOP_FLAPPING(state, top10) {
    state.flapping = top10
  },
  SET_TOP_STANDING(state, top10) {
    state.standing = top10
  },
  SET_FILTER(state, filter) {
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_PAGE_SIZE(state, rowsPerPage) {
    state.pagination.itemsPerPage = rowsPerPage
  },
  SET_REPORT(state, file) {
    state.report = file
  }
}

function getParams(state: State) {
  // get "lucene" query params (?q=)
  const params = new URLSearchParams(state.query)

  // append filter params to query params
  // state.filter.environment && params.append('environment', state.filter.environment)
  // state.filter.severity && state.filter.severity.map(sv => params.append('severity', sv))
  // state.filter.status && state.filter.status.map(st => params.append('status', st))
  // state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
  // state.filter.service && state.filter.service.map(s => params.append('service', s))
  // state.filter.group && state.filter.group.map(g => params.append('group', g))

  // add server-side paging
  params.append('page', state.pagination.page.toString())
  params.append('page-size', state.pagination.itemsPerPage.toString())

  // // apply any date/time filters
  // if (state.filter.dateRange[0] !== null) {
  //   if (state.filter.dateRange[0] > 0) {
  //     params.append(
  //       'from-date',
  //       moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
  //     )
  //   } else if (state.filter.dateRange[0] < 0) {
  //     params.append(
  //       'from-date',
  //       moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
  //     )
  //   }
  // }
  // if (state.filter.dateRange[1] !== null) {
  //   if (state.filter.dateRange[1] > 0) {
  //     params.append(
  //       'to-date',
  //       moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
  //     )
  //   } else if (state.filter.dateRange[1] < 0) {
  //     params.append(
  //       'to-date',
  //       moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
  //     )
  //   }
  // }
  return params
}

const actions: Actions & ActionTree<State, RootState> = {
  getTopOffenders({commit, state}) {
    const params = getParams(state)
    return AlertsApi.getTop10Count(params).then(({top10}) => commit('SET_TOP_OFFENDERS', top10))
  },
  getTopFlapping({commit, state}) {
    const params = getParams(state)
    return AlertsApi.getTop10Flapping(params).then(({top10}) => commit('SET_TOP_FLAPPING', top10))
  },
  getTopStanding({commit, state}) {
    const params = getParams(state)
    return AlertsApi.getTop10Standing(params).then(({top10}) => commit('SET_TOP_STANDING', top10))
  },
  getReport({commit, state}) {
    const params = getParams(state)
    return AlertsApi.getReport(params).then(file => commit('SET_REPORT', file))
  },

  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit, rootState}) {
    commit('SET_FILTER', rootState.config.filter)
  },
  setPageSize({commit}, rowsPerPage) {
    commit('SET_PAGE_SIZE', rowsPerPage)
  }
}

const getters = {}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
