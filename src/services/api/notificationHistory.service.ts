import api from './index'

export default {
  getNotificationHistory(query: object) {
    const config = {
      params: query
    }
    return api.get('/notificationhistory', config)
  }
}
