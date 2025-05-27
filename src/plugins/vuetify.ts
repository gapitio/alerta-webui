import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  theme: {
    primary: '#1f6ea3',
    secondary: '#475467',
    accent: '#1F6EA3'
  },
  iconfont: 'md'
})
