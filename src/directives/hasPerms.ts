import type {Store} from '@/plugins/store/types'
import type {VueElement} from 'vue'

export function checkPerms(store: Store, perm: string) {
  if (!store.getters.getConfig('auth_required')) {
    return true
  }
  const allowReadonly = store.getters.getConfig('allow_readonly')
  const readonlyScopes = store.getters.getConfig('readonly_scopes')
  const authenticated = allowReadonly || store.state.auth.isAuthenticated
  if (!authenticated) {
    return true
  }

  function isInScope(want: string, have: string[]): boolean {
    if (have.includes(want) || have.includes(want.split(':')[0]) || have.includes(want.split('.')[0])) {
      return true
    } else if (want.startsWith('read')) {
      return isInScope(want.replace('read', 'write'), have)
    } else if (want.startsWith('write')) {
      return isInScope(want.replace('write', 'admin'), have)
    }
    return false
  }

  const scopes = authenticated ? store.getters['auth/scopes'] : readonlyScopes

  if (!perm) {
    return true
  }

  return isInScope(perm, scopes)
}

export default (store: Store) => {
  return function (el: VueElement, binding: any) {
    const action = binding.modifiers.disable ? 'disable' : 'hide'
    if (!checkPerms(store, binding.value)) {
      if (action === 'disable') {
        el.classList.add('v-input--disabled', 'v-selection-control--disabled')
        // el.setAttribute('disabled', '')
      } else {
        el.style.display = 'none'
      }
    }
  }
}
