import type {State, Mutations, Actions, Getters} from '../types/config-types'
import type {ActionTree} from 'vuex'
import type {State as RootState} from '../types'

const state: State = {
  endpoint: 'http://local.alerta.io:8880',
  alarm_model: {
    colors: {
      severity: {},
      status: {},
      text: ''
    },
    defaults: {
      normal_severity: '',
      previous_severity: '',
      status: ''
    },
    name: 'Alerta',
    severity: {},
    status: {}
  },

  auth_required: true,
  allow_readonly: false,
  readonly_scopes: ['read'],
  provider: 'basic',
  customer_views: false,
  signup_enabled: true,
  email_verification: false,

  client_id: '',
  github_url: 'https://github.com',
  gitlab_url: 'https://gitlab.com',
  keycloak_realm: '',
  keycloak_url: '',
  pingfederate_url: '',

  site_logo_url: '',

  clipboard_template: '',

  timeouts: {
    ack: 0,
    alert: 0,
    heartbeat: 0,
    shelve: 0
  },

  blackouts: {duration: 0},

  dates: {
    longDate: 'ddd D MMM, YYYY HH:mm:ss.SSS Z',
    mediumDate: 'ddd D MMM HH:mm',
    shortTime: 'HH:mm'
  },
  font: {
    'font-family': '"Sintony", Arial, sans-serif',
    'font-size': '13px',
    'font-weight': 500
  },
  audio: {new: ''},
  columns: [],
  sort_by: [{key: 'severity'}, {key: 'lastReceiveTime'}],
  actions: [],
  filter: {
    customer: null,
    text: null,
    environment: null,
    status: null,
    service: null,
    group: null,
    dateRange: {}
  },

  tracking_id: null,
  refresh_interval: 5 * 1000, // milliseconds
  environments: [],

  aws_region: '',
  azure_tenant: '',
  cognito_domain: '',
  debug: false,
  indicators: {queries: [], severity: []},
  ldap_email_edit: false,
  oidc_auth_url: '',
  version: 'DEV'
}

export const deepCopy = function (state: any, value: any, propName?: string) {
  const isDangerousKey = (key: string | undefined) =>
    key === 'constructor' || key === '__proto__' || key === 'prototype'
  if (isDangerousKey(propName)) return
  if (
    Object.prototype.toString.call(value) === '[object Object]' &&
    (propName === undefined || state.hasOwnProperty(propName))
  ) {
    const o = propName === undefined ? state : state[propName]
    if (o != null) {
      for (const prop in value) {
        if (isDangerousKey(prop)) continue
        deepCopy(o, value[prop], prop)
      }
      return
    }
  }
  state[propName!] = value
}

function isKeyOfState(key: string): key is keyof State {
  return key in state
}

const mutations: Mutations = {
  SET_CONFIG(state, config) {
    config.sort_by = config.sort_by?.map(s => (typeof s === 'string' ? {key: s} : s))
    const conf: {[key: string]: any} = {}
    for (const key in config) {
      if (isKeyOfState(key) && config[key] !== undefined) {
        if (Object.prototype.toString.call(config[key]) === '[object Object]') deepCopy(state[key], config[key])
        else conf[key] = config[key]
      }
    }
    deepCopy(state, conf)
  }
}

const actions: Actions & ActionTree<State, RootState> = {
  updateConfig({commit}, config) {
    commit('SET_CONFIG', config)
  }
}

const getters: Getters = {
  getConfig: state => setting => {
    return state[setting]
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
