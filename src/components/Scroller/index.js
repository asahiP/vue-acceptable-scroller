import Scroller from './Scroller.vue'

export default function install (Vue, option = {}) {
  Vue.component('Scroller', Scroller)
  Vue.prototype.$Scroller = {
    option,
    isKeyDownEventActive: false,
    keyDownRequest: 0,
  }
}