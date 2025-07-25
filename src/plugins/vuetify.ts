/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { aliases, md } from 'vuetify/iconsets/md'
import CustomIcon from '@/assets/gapit/edit.svg?component'

const gapitDark = {
  dark: true,
  colors: {
    background: '#161719',
    surface: '#1D232A',
    'surface-bright': '#FFFFFF',
    'surface-light': '#344054',
    'surface-variant': '#424242',
    'on-surface-variant': '#EEEEEE',
    primary: '#1F6EA3',
    'primary-600': '#1570EF',
    secondary: '#48A9A6',
    'secondary-darken-1': '#018786',
    error: '#F97066',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
  variables: {
    'border-color': '#000000',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000',
  }
}


const gapitLight = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#EDEFF3',
    'on-surface-variant': '#EEEEEE',
    primary: '#1F6EA3',
    'primary-darken-1': '#344054',
    secondary: '#1570EF',
    'secondary-darken-1': '#018786',
    error: '#F97066',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
  variables: {
    'border-color': '#EAECF0',
    'border-opacity': 1,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000',
    'theme-overlay-multiplier': '10'
  }
}

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'gapitLight',
    themes: {
      gapitDark,
      gapitLight
    },
  },
  icons: {
    defaultSet: 'md',
    aliases: {...aliases, custom: 'custom-icon'},
    sets: {
      md,
      custom: {
        component: CustomIcon,
      },
    },
  },
})
