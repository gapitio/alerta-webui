import EscalationRuleApi from '@/services/api/escalationRule.service'
import type {State, Mutations, Actions, Getters, Filter} from '../types/escalationRule-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],
  selected: [],

  query: {q: ''},
  activeFilter: {
    active: true,
    inactive: true
  },

  filter: {},

  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'startTime', order: 'asc'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_ITEMS(state, [escalationRules, total, pageSize]) {
    state.isLoading = false
    state.items = escalationRules
    state.pagination.totalItems = total
    state.pagination.itemsPerPage = pageSize
  },
  SET_QUERY(state, query) {
    state.query = query
  },
  SET_FILTER(state, filter) {
    state.filter = Object.assign({}, filter)
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
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getEscalationRules({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    const specialKeys = ['dateRange', 'tags']
    const notWildcards = ['service']
    for (const key of Object.keys(state.filter)) {
      const typedKey = key as keyof Omit<Filter, 'dateRange'>
      if (specialKeys.includes(typedKey) || !state.filter[typedKey]) continue
      else if (typeof state.filter[typedKey] === 'object')
        state.filter[typedKey].map((k: string) =>
          params.append(typedKey, notWildcards.includes(typedKey) ? k : '~' + k)
        )
      else params.append(typedKey, `~${state.filter[typedKey]}`)
    }

    if (state.filter.tags) {
      state.filter.tags.forEach(t => {
        params.append('taga', t)
        params.append('tago', t)
      })
    }

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

    return EscalationRuleApi.getEscalationRules(params)
      .then(({escalationRules, total, pageSize}) => commit('SET_ITEMS', [escalationRules, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  setActiveFilter({commit, dispatch}, filter) {
    commit('SET_ACTIVE_FILTER', filter)
    dispatch('getEscalationRules')
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit}) {
    commit('SET_FILTER', {})
  },
  updateQuery({commit}, query) {
    commit('SET_QUERY', query)
  },
  createEscalationRule({dispatch}, escalationrule) {
    return EscalationRuleApi.createEscalationRule(escalationrule).then(() => {
      dispatch('getEscalationRules')
    })
  },
  updateSelected({commit}, selected) {
    commit('SET_SELECTED', selected)
  },
  updateEscalationRule({dispatch}, [escalationRuleId, update]) {
    return EscalationRuleApi.updateEscalationRule(escalationRuleId, update).then(() => {
      dispatch('getEscalationRules')
    })
  },
  deleteEscalationRule({dispatch}, escalationRuleId) {
    return EscalationRuleApi.deleteEscalationRule(escalationRuleId).then(() => {
      dispatch('getEscalationRules')
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
