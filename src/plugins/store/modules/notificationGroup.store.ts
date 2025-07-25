import NotificationGroupApi from '@/services/api/notificationGroup.service'
import type { State, Getters, Actions, Mutations } from '../types/notificationGroup-types'
import type { ActionTree } from 'vuex'
import type { State as RootState } from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],

  query:{q : ''},

  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'name'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  }
}

const mutations: Mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_NOTIFICATION_GROUP(state, [notificationGroups, total, pageSize]) {
    state.isLoading = false
    state.items = notificationGroups
    state.pagination.totalItems = total
    state.pagination.itemsPerPage = pageSize
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getNotificationGroups({commit, state}) {
    commit('SET_LOADING')

    const params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page.toString())
    params.append('page-size', state.pagination.itemsPerPage.toString())

    // add server-side sort
    // params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationGroupApi.getNotificationGroups(params)
      .then(({notificationGroups, total, pageSize}) =>
        commit('SET_NOTIFICATION_GROUP', [notificationGroups, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  createNotificationGroup({dispatch}, notificationGroup) {
    return NotificationGroupApi.createNotificationGroup(notificationGroup).then(() => {
      dispatch('getNotificationGroups')
    })
  },
  updateNotificationGroup({dispatch}, [notificationGroupId, update]) {
    return NotificationGroupApi.updateNotificationGroup(notificationGroupId, update).then(() => {
      dispatch('getNotificationGroups')
    })
  },
  deleteNotificationGroup({dispatch}, notificationGroupId) {
    return NotificationGroupApi.deleteNotificationGroup(notificationGroupId).then(() => {
      dispatch('getNotificationGroups')
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
