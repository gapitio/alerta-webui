import hasPerms from './hasPerms'

import type {App} from 'vue'

export function registerDirectives(app: App) {
  app.directive('has-perms', hasPerms(app.config.globalProperties.$store))
}
