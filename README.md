# vue-component-scroller

## Example

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <Scroller>
      <!-- Whatever you want to scroll -->
    </Scroller>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class App extends Vue {}
</script>
```

```typescript
// main.ts
import Vue from 'vue'
import App from './App.vue'
import Scroller from './components/Scroller'

Vue.config.productionTip = false

Vue.use(Scroller, {
  /** other option */
  scrollerBarStyleX: { background: 'transparent' },
  scrollerBarStyleY: { background: 'transparent' },
  callback: {
    left () {},
    top () {},
    right () {},
    bottom () {},
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
```



## Project setup

```
yarn install
```

**Compiles and hot-reloads for development**

```
yarn run serve
```

## Option

|  Property Name  |     Description      | Required |         Type         | Default Value |
| :-------------: | :------------------: | :------: | :------------------: | :-----------: |
|  enableScroll   |      启用滚动条      |    N     | 'x' \| 'y' \| 'both' |    'both'     |
| enableTouchMove |     启用触摸滑动     |    N     |       boolean        |     true      |
|    autoHide     |    自动隐藏滚动条    |    N     |       boolean        |     true      |
|    barStyle     |      滚动条样式      |    N     | CSSStyleDeclaration  |       -       |
|   sliderStyle   |       滑块样式       |    N     | CSSStyleDeclaration  |       -       |
|  limitedLength  | 到顶到底后可拉伸距离 |    N     |        number        |      100      |
|     minSize     |     最小滑块大小     |    N     |        number        |      80       |
|    throttle     |   hook方法触发间隔   |    N     |        number        |      300      |

## Method

- **setScrollTop**

```javascript
/**
 * @param {number} newVal
 */

// go bottom
setScrollTop(Infinity)

// go top
setScrollTop(0)
```

- **setScrollLeft**

```javascript
/**
 * @param {number} newVal
 */

// go right
setScrollLeft(Infinity)

// go left
setScrollTop(0)
```