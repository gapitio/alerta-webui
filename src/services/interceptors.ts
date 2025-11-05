import {v4 as uuidv4} from 'uuid'
import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios'
import type {Router} from 'vue-router'
import type {Store} from '@/plugins/store/types'
import type {ErrorData} from '@/plugins/store/types/notifications-types'

export function makeInterceptors(router: Router, store: Store) {
  return {
    // add requestId
    requestIdHeader(config: InternalAxiosRequestConfig) {
      config.headers['X-Request-ID'] = uuidv4()
      return config
    },

    // response handlers
    interceptErrors(error: AxiosError) {
      if (!error.response && !axios.isCancel(error)) {
        store.dispatch('notifications/error', Error('Problem connecting to Alerta API, retrying...'))
      }

      if (error.response) {
        store.dispatch('notifications/error', error.response.data as ErrorData)
      }
      return Promise.reject(error)
    },

    // redirect to login if API rejects auth token
    redirectToLogin(error: AxiosError) {
      if (error.response && error.response.status === 401) {
        if (store.getters['auth/isLoggedIn']) {
          store.dispatch('auth/logout')
        }
        if (router.currentRoute.value.path != '/login') {
          router.replace({
            path: '/login',
            query: {redirect: router.currentRoute.value.fullPath}
          })
        }
      }
      return Promise.reject(error)
    }
  }
}
