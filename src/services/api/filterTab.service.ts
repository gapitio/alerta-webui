import api from './index'

export default {
  createFilterTab(data: object) {
    return api.post('/filtertab', data)
  },
  createFilterTabs(data: object) {
    return api.post('/filtertabs', data)
  },
  getFilterTab(id: string) {
    return api.get(`/filtertabs/${id}`)
  },
  getfilterTabs() {
    return api.get('/filtertabs')
  },
  updateFilterTabs(data: object) {
    return api.put(`/filtertabs`, data)
  },
  updateFilterTabIndexes(data: object) {
    return api.put(`/filtertabs/index`, data)
  },
  deleteFilterTab(id: string) {
    return api.delete(`/filtertabs/${id}`)
  },
  deleteFilterTabs(ids: string[]) {
    const config = {params: {id: ids}}
    return api.delete(`/filtertabs`, config)
  }
}
