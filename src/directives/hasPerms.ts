export default (store) => {
  return function (el, binding) {
    if (!store.getters.getConfig('auth_required')) {
      return false
    }
    const allowReadonly = store.getters.getConfig('allow_readonly')
    const readonlyScopes = store.getters.getConfig('readonly_scopes')
    const  authenticated = allowReadonly || store.state.auth.isAuthenticated

    
    if (!authenticated) {
      return false
    }

    // helper function
    function isInScope(want: string, have: string): boolean {
      if (have.includes(want) || have.includes(want.split(':')[0])) {
        return true
      } else if (want.startsWith('read')) {
        return isInScope(want.replace('read', 'write'), have)
      } else if (want.startsWith('write')) {
        return isInScope(want.replace('write', 'admin'), have)
      }
      return false
    }

    const perm = binding.value
    const scopes = authenticated ? store.getters['auth/scopes'] : readonlyScopes
    const action = binding.modifiers.disable ? 'disable' : 'hide'

    if (!perm) {
      return false
    }

    if (!isInScope(perm, scopes)) {
      if (action === 'disable') {
        el.setAttribute('disabled', '')
      } else {
        el.style.display = 'none'
      }
    }
  }
}

