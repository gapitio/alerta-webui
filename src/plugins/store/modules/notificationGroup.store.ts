import NotificationGroupApi from '@/services/api/notificationGroup.service'
import type {State, Getters, Actions, Mutations, Filter} from '../types/notificationGroup-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  isLoading: false,

  items: [],

  query: {q: ''},

  pagination: {
    page: 1,
    itemsPerPage: 20,
    sortBy: [{key: 'name'}],
    descending: true,
    itemsPerPageOptions: [10, 20, 50, 100, 200]
  },
  filter: {}
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
  SET_FILTER(state, filter) {
    state.filter = filter
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

    const notWildcards = ['usersEmails']
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

    // add server-side sort
    // params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationGroupApi.getNotificationGroups(params)
      .then(({notificationGroups, total, pageSize}) =>
        commit('SET_NOTIFICATION_GROUP', [notificationGroups, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
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
