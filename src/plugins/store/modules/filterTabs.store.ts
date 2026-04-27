import FilterTabApi from '@/services/api/filterTab.service'
import type {State, Actions, Mutations, Getters} from '../types/filterTabs-types'

const namespaced = true

const state: State = {
  isLoading: false,
  currentTab: 'user-defined',
  items: [],
  counts: {},
  historyCounts: {}
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_FILTER_TAB(state, [filterTab, counts, historyCounts]) {
    state.items = filterTab
    state.counts = counts
    state.historyCounts = historyCounts
  },
  SET_CURRENT_TAB(state, name) {
    state.currentTab = name
  }
}

const actions: Actions = {
  async createFilterTab({dispatch}, filterTab) {
    await FilterTabApi.createFilterTab(filterTab)
    dispatch('getFilterTabs')
  },
  async createFilterTabs({dispatch}, filterTabs) {
    await FilterTabApi.createFilterTabs(filterTabs)
    dispatch('getFilterTabs')
  },
  async deleteFilterTab({dispatch}, id) {
    await FilterTabApi.deleteFilterTab(id)
    dispatch('getFilterTabs')
  },
  async deleteFilterTabs({dispatch}, ids) {
    await FilterTabApi.deleteFilterTabs(ids)
    dispatch('getFilterTabs')
  },
  async getFilterTabs({commit}) {
    commit('SET_LOADING')
    try {
      const {filterTabs, counts, historyCounts} = await FilterTabApi.getfilterTabs()
      commit('SET_FILTER_TAB', [filterTabs, counts, historyCounts])
    } catch {
      commit('RESET_LOADING')
    }
  },
  async updateFilterTabs({dispatch}, filterTabs) {
    await FilterTabApi.updateFilterTabs(filterTabs)
    dispatch('getFilterTabs')
  },
  async updateFilterTabIndexes({dispatch}, filterTabs) {
    await FilterTabApi.updateFilterTabIndexes(filterTabs)
    dispatch('getFilterTabs')
  },
  setCurrentTab({commit}, name) {
    commit('SET_CURRENT_TAB', name)
  }
}

const getters: Getters = {
  getHash: state => `ct:${state.currentTab}`
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
