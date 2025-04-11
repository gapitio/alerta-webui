import api from './index'

export default {
  getNotificationDelays(query: object) {
    const config = {
      params: query
    }
    return api.get('/notificationdelay', config)
  },
  deleteNotificationDelay(id: string) {
    return api.delete(`/notificationdelay/${id}`)
  }
}
