import api from './index'

export default {
  createNotificationRule(data: object) {
    return api.post('/notificationrules', data)
  },
  getNotificationAlerts(data: object, params: object) {
    let config = {
      params: params
    }
    return api.post('/notificationrule/alerts', data, config)
  },
  getNotificationRule(id: string) {
    return api.get(`/notificationrules/${id}`)
  },
  getNotificationRules(query: object) {
    let config = {
      params: query
    }
    return api.get('/notificationrules', config)
  },
  getNotificationRuleHistory(id: string, params) {
    let config = {
      params: params
    }
    return api.get(`/notificationrules/${id}/history`, config)
  },
  updateNotificationRule(id: string, data: object) {
    return api.put(`/notificationrules/${id}`, data)
  },
  deleteNotificationRule(id: string) {
    return api.delete(`/notificationrules/${id}`)
  }
}
