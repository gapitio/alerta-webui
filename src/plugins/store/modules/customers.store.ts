import CustomersApi from '@/services/api/customer.service'

const namespaced = true

const state = {
  isLoading: false,

  customers: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_CUSTOMERS(state, customers) {
    state.isLoading = false
    state.customers = customers
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getCustomers({commit}) {
    commit('SET_LOADING')
    return CustomersApi.getCustomers({})
      .then(({customers}) => commit('SET_CUSTOMERS', customers))
      .catch(() => commit('RESET_LOADING'))
  },
  createCustomer({dispatch}, customer) {
    return CustomersApi.createCustomer(customer).then(() => {
      dispatch('getCustomers')
    })
  },
  updateCustomer({dispatch}, [customerId, update]) {
    return CustomersApi.updateCustomer(customerId, update).then(() => {
      dispatch('getCustomers')
    })
  },
  deleteCustomer({dispatch}, customerId) {
    return CustomersApi.deleteCustomer(customerId).then(() => {
      dispatch('getCustomers')
    })
  }
}

const getters = {
  customers: state => {
    return state.customers.map(c => c.customer)
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
