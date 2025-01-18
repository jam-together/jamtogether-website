import './scss/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import createI18n from './services/i18n'

const app = createApp(App)

app.use(createI18n)
app.use(createPinia())
app.use(router)

app.mount('#app')
