import axios from 'axios'
import type {AxiosRequestConfig, Method} from 'axios'

const api = {
  get(url: string, config?: AxiosRequestConfig) {
    return this.request('GET', url, null, config)
  },

  delete(url: string, config?: AxiosRequestConfig) {
    return this.request('DELETE', url, null, config)
  },

  head(url: string, config?: AxiosRequestConfig) {
    return this.request('HEAD', url, null, config)
  },

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('POST', url, data, config)
  },

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('PUT', url, data, config)
  },

  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('PATCH', url, data, config)
  },

  async request(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return (await axios.request({...config, url, method, data})).data
  }
}

export default api
