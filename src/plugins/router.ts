/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {createRouter, createWebHistory} from 'vue-router/auto'
import {routes} from 'vue-router/auto-routes'
import type {Store} from './store/types'

const router = createRouter({
  history: createWebHistory(__BASE_URL__ ?? '/'),
  routes
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})
export default router

export function registerBefore(store: Store) {
  router.beforeEach((to, from, next) => {
    if (store.getters.getConfig('auth_required') && to.matched.some(record => record.meta.requiresAuth)) {
      if (!store.getters['auth/isLoggedIn'] && !store.getters.getConfig('allow_readonly')) {
        next({
          path: '/login',
          query: {redirect: to.fullPath}
        })
      } else {
        next()
      }
    } else {
      next()
    }
  })

  router.beforeEach((to, from, next) => {
    if (to?.meta?.title) {
      document.title = to.meta.title + ' | Alerta'
    }
    next()
  })

  router.beforeEach((to, from, next) => {
    const externalUrl = to.fullPath.replace('/', '')
    if (externalUrl.match(/^(http(s)?|ftp):\/\//)) {
      window.open(externalUrl, '_blank')
    } else {
      next()
    }
  })
}
