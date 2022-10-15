import { createApp } from 'vue'
import App from "./App.vue";
import widget from './widget.ts'


// Here we will use VueJS framework to bind JavaScript object to HTML.
const app = createApp(App).mount('#app')

widget.init(app)
