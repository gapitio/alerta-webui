import bootstrap from './services/config'

// Plugins
import {registerPlugins} from '@/plugins'

// Filters
import {registerFilters} from './filters'

// Directives
import {registerDirectives} from './directives'

// Components
import App from './App.vue'

// Composables
import {createApp} from 'vue'
import type {State} from './plugins/store/types/config-types'

async function makeApp() {
  const app = createApp(App)
  const config = await bootstrap.getConfig()
  app.config.globalProperties.$config = config as State

  registerPlugins(app)

  registerFilters(app)

  registerDirectives(app)

  app.mount('#app')
}

makeApp()
