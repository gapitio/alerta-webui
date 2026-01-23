import api from './index'
import axios from 'axios'

import type {CancelTokenSource} from 'axios'

let queryInProgress: CancelTokenSource

export default {
  async getAlert(alertId: string) {
    return await api.get(`/alert/${alertId}`)
  },
  setStatus(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/status`, data)
  },
  actionAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/action`, data)
  },
  actionAlerts(data: {action: string; text?: string; timeout?: number; alerts: string[]}) {
    return api.put(`/alerts/action`, data)
  },
  tagAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/tag`, data)
  },
  untagAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/untag`, data)
  },
  updateAttributes(alertId: string, attributes: object) {
    const data = {
      attributes: attributes
    }
    return api.put(`/alert/${alertId}/attributes`, data)
  },
  addNote(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/note`, data)
  },
  getNotes(alertId: string) {
    return api.get(`/alert/${alertId}/notes`)
  },
  updateNote(alertId: string, noteId: string, data: object) {
    return api.put(`/alert/${alertId}/note/${noteId}`, data)
  },
  deleteNote(alertId: string, noteId: string) {
    return api.delete(`/alert/${alertId}/note/${noteId}`)
  },
  async getAlerts(query: object) {
    if (query && queryInProgress) {
      queryInProgress.cancel('Too many search requests. Cancelling current query.')
    }
    queryInProgress = axios.CancelToken.source()
    const config = {
      params: query,
      cancelToken: queryInProgress.token
    }
    return await api.get('/alerts', config)
  },
  getAlertHistory(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/history', config)
  },
  getAlertHistoryCount() {
    return api.get('/alerts/history/count')
  },
  getCounts(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/count', config)
  },
  getTop10Count(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/top10/count', config)
  },
  getTop10Flapping(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/top10/flapping', config)
  },
  getTop10Standing(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/top10/standing', config)
  },

  deleteAlert(alertId: string) {
    return api.delete(`/alert/${alertId}`)
  },

  deleteAlerts(params: object) {
    const config = {
      params: params
    }
    return api.delete(`/alerts`, config)
  },

  getEnvironments(query: object) {
    const config = {
      params: query
    }
    return api.get('/environments', config)
  },
  getServices(query: object) {
    const config = {
      params: query
    }
    return api.get('/services', config)
  },
  getGroups(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/groups', config)
  },
  getTags(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/tags', config)
  },
  getReport(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/reports/download', config)
  }
}
