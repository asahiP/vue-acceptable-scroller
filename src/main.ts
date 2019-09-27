import Vue from 'vue'
import App from './App.vue'
import Scroller from './components/Scroller'

Vue.config.productionTip = false

Vue.use(Scroller)

new Vue({
  render: h => h(App),
}).$mount('#app')