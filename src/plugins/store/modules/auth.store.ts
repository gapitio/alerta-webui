import AuthApi from '@/services/api/auth.service'
import type {State, Payload} from '../types/auth-types'
import type {VueAuthenticate, AuthenticateOptions} from 'vue-authenticate-2'
import type {AxiosRequestConfig} from 'axios'
import type {Module} from 'vuex'
import type {State as RootState} from '../types'

export interface VueAuthenticateFix extends Omit<VueAuthenticate, 'authenticate'> {
  getPayload(): Payload
  authenticate(provider: string, userData?: any, requestOptions?: AxiosRequestConfig): Promise<object>
  options: AuthenticateOptions
}

export function makeStore(vueAuth: VueAuthenticateFix): Module<State, RootState> {
  return {
    namespaced: true,

    state: {
      isAuthenticated: vueAuth.isAuthenticated(),
      token: vueAuth.getToken(),
      payload: vueAuth.getPayload(),

      isSending: false
    },

    mutations: {
      SET_AUTH(state, [token, payload]) {
        state.isAuthenticated = true
        state.token = token
        state.payload = payload
      },
      RESET_AUTH(state) {
        state.isAuthenticated = false
        state.token = null
        state.payload = {}
      },
      SET_SENDING(state) {
        state.isSending = true
      },
      RESET_SENDING(state) {
        state.isSending = false
      }
    },

    actions: {
      async signup({commit, dispatch}, {name, email, password, text}) {
        commit('SET_SENDING')
        const res = await vueAuth.register({
          name,
          email,
          password,
          text
        })
        vueAuth.setToken(res)
        commit('SET_AUTH', [vueAuth.getToken(), vueAuth.getPayload()])
        await dispatch('getUserPrefs', {}, {root: true})
        commit('RESET_SENDING')
      },
      async login({commit, dispatch}, credentials) {
        console.log('login')
        const res = await vueAuth.login(credentials)
        vueAuth.setToken(res)
        await commit('SET_AUTH', [vueAuth.getToken(), vueAuth.getPayload()])
        dispatch('getUserPrefs', {}, {root: true})
      },
      async authenticate({commit, dispatch}, provider) {
        console.log('authenticate')
        await vueAuth.authenticate(provider)
        await commit('SET_AUTH', [vueAuth.getToken(), vueAuth.getPayload()])
        await dispatch('getUserPrefs', {}, {root: true})
      },
      setToken({commit, dispatch}, token) {
        vueAuth.setToken(token)
        commit('SET_AUTH', [token, vueAuth.getPayload()])
        dispatch('getUserPrefs', {}, {root: true})
      },
      confirm(_, token) {
        return AuthApi.confirm(token)
      },
      forgot({commit}, email) {
        commit('SET_SENDING')
        return AuthApi.forgot(email).finally(() => commit('RESET_SENDING'))
      },
      reset(_, [token, password]) {
        return AuthApi.reset(token, password)
      },
      logout({commit}) {
        return vueAuth
          .logout()
          .then(response => {
            return response
          })
          .finally(() => commit('RESET_AUTH'))
      }
    },

    getters: {
      getOptions() {
        return vueAuth.options
      },
      getPayload(state) {
        return state.payload
      },
      isLoggedIn(state) {
        return state.isAuthenticated
      },
      getUsername(state) {
        return state.payload && state.payload.preferred_username
      },
      getAvatar(state) {
        return state.payload && state.payload.picture
      },
      scopes(state) {
        return state.payload && state.payload.scope ? state.payload.scope.split(' ') : []
      },
      customers(state) {
        return state.payload.customers && state.payload.customers.length == 0 ? ['ALL (*)'] : state.payload.customers
      },
      isAdmin(state, getters) {
        if (getters.isLoggedIn) {
          return getters.scopes.includes('admin')
        }
        return false
      }
    }
  }
}
