import api from './index'

export default {
  getNotificationSends(query: object) {
    const config = {
      params: query
    }
    return api.get('/notificationsends', config)
  },
  updateNotificationSend(id: string, data: object) {
    return api.put(`/notificationsends/${id}`, data)
  },
  sendNotification(id: string, data: object) {
    return api.post(`/notificationsends/${id}/send`, data)
  }
}
