/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@/assets/css/fonts.css'
import 'vuetify/styles'
import {aliases, md} from 'vuetify/iconsets/md'

const gapitDark = {
  dark: true,
  colors: {
    surface: '#1D232A'
  }
}

const gapitLight = {
  dark: false,
  colors: {
    surface: '#FFFFFF'
  }
}

// Composables
import {createVuetify} from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'gapitDark',
    themes: {
      gapitDark,
      gapitLight
    }
  },
  icons: {
    defaultSet: 'md',
    aliases: {
      ...aliases,
      custom: 'custom-icon'
    },
    sets: {
      md
    }
  }
})
