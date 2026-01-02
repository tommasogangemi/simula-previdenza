import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VTextField: {
      density: 'compact',
      rounded: 'lg',
    },
    VSlider: {
      density: 'compact',
    },
    VBtn: {
      density: 'default', // Keep buttons standard size
    },
    VTooltip: {
      maxWidth: 300,
    },
  },
})

createApp(App).use(vuetify).mount('#app')
