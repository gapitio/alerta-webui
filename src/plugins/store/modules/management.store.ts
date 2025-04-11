import ManagementApi from '@/services/api/management.service'
import type {State, Mutations, Actions} from '../types/management-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const namespaced = true

const state: State = {
  manifest: {
    build: '',
    date: '',
    release: '',
    revision: ''
  },

  healthcheck: '',

  application: '',
  metrics: [],
  time: 0,
  uptime: 0,
  version: ''
}

const mutations: Mutations = {
  SET_MANIFEST(state, manifest) {
    state.manifest = manifest
  },
  SET_HEALTHCHECK(state, healthcheck) {
    state.healthcheck = healthcheck
  },
  SET_STATUS(state, status) {
    state.application = status.application
    state.metrics = status.metrics
    state.time = status.time
    state.uptime = status.uptime
    state.version = status.version
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  getManifest({commit}) {
    return ManagementApi.manifest().then(manifest => commit('SET_MANIFEST', manifest))
  },
  getHealthcheck({commit}) {
    return ManagementApi.healthcheck().then(healthcheck => commit('SET_HEALTHCHECK', healthcheck))
  },
  getStatus({commit}) {
    return ManagementApi.status().then(status => commit('SET_STATUS', status))
  }
}

const getters = {
  //
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
