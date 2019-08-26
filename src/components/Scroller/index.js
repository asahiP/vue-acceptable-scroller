import Scroller from './Scroller.vue'

export default function (Vue, option = {}) {
  Vue.component('Scroller', Scroller)
  Vue.$Scroller = {
    option
  }
}