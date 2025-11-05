import type {State} from '@/plugins/store/types/config-types'
import Axios from 'axios'
import type {AxiosInstance} from 'axios'

class Config {
  private config: State | undefined = undefined
  private envConfig: Partial<State> = {}
  private localConfig: Partial<State> = {}
  private remoteConfig: State | undefined = undefined

  private $http: AxiosInstance

  constructor() {
    this.$http = Axios.create()
  }

  getConfig(): Promise<State> {
    return this.getEnvConfig()
      .then(response => {
        return this.setEnvConfig(response)
      })
      .then(() => {
        return this.getLocalConfig()
      })
      .then(response => {
        return this.setLocalConfig(response)
      })
      .then(() => {
        const endpoint = {...this.envConfig, ...this.localConfig}!.endpoint
        if (!endpoint) {
          const errorText =
            `ERROR: Failed to retrieve client config from Alerta API endpoint ${endpoint}/config.\n\n` +
            'This could be due to the API not being available, or to a missing or invalid ' +
            'config.json file. Please confirm a config.json file exists, contains an "endpoint" ' +
            'setting and is in the same directory as the application index.html file.'
          alert(errorText)
          throw errorText
        }
        return this.getRemoteConfig(endpoint)
      })
      .then(response => {
        return this.setRemoteConfig(response)
      })
      .catch((error: any) => {
        throw error
      })
  }

  getEnvConfig(): Promise<{endpoint?: string}> {
    return new Promise(resolve => {
      const endpoint = import.meta.env.VITE_APP_ALERTA_ENDPOINT
      const envConfig: {endpoint?: string} = endpoint ? {endpoint} : {}
      resolve(envConfig)
    })
  }

  getLocalConfig() {
    const basePath = import.meta.env.BASE_URL ?? '/'
    return this.$http
      .get(`${basePath}config.json`)
      .then(response => {
        return response.data
      })
      .catch((error: any) => {
        console.warn(error.message)
      })
  }

  getRemoteConfig(endpoint: string) {
    return this.$http
      .get(`${endpoint}/config`)
      .then(response => {
        return response.data
      })
      .catch((error: any) => {
        alert(
          `ERROR: Failed to retrieve client config from Alerta API endpoint ${endpoint}/config.\n\n` +
            'This could be due to the API not being available, or to a missing or invalid ' +
            'config.json file. Please confirm a config.json file exists, contains an "endpoint" ' +
            'setting and is in the same directory as the application index.html file.'
        )
        throw error
      })
  }

  mergeConfig() {
    return (this.config = {
      ...this.remoteConfig!,
      ...this.localConfig,
      ...this.envConfig
    })
  }

  setEnvConfig(data: {endpoint?: string}) {
    this.envConfig = data
  }

  setLocalConfig(data: {endpoint?: string} | string) {
    if (typeof data === 'object') this.localConfig = data
  }

  setRemoteConfig(data: State) {
    this.remoteConfig = data
    return this.mergeConfig()
  }

  $get() {
    return this.config
  }
}

export default new Config()
