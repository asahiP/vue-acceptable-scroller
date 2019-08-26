import Scroller from './Scroller.vue'

export default function (Vue: any, option: any = {}) {
  Vue.component('Scroller', Scroller)
  Vue.$Scroller = {
    option
  }
}