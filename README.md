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

|    Property Name     |     Description      | Required |        Type         | Default Value |
| :------------------: | :------------------: | :------: | :-----------------: | :-----------: |
|   enableScrollerX    |     启用滚动条X      |    N     |       boolean       |     true      |
|   enableScrollerY    |     启用滚动条Y      |    N     |       boolean       |     true      |
|   enableTouchMove    |     启用触摸滑动     |    N     |       boolean       |     true      |
| autoHiddenScrollerX  |   自动隐藏滚动条X    |    N     |       boolean       |     true      |
| autoHiddenScrollerY  |   自动隐藏滚动条Y    |    N     |       boolean       |     true      |
|  scrollerBarStyleX   |     滚动条样式X      |    N     | CSSStyleDeclaration |       -       |
|  scrollerBarStyleY   |     滚动条样式Y      |    N     | CSSStyleDeclaration |       -       |
| scrollerSliderStyleX |      滑块样式X       |    N     | CSSStyleDeclaration |       -       |
| scrollerSliderStyleY |      滑块样式Y       |    N     | CSSStyleDeclaration |       -       |
|    enableCallback    |   启用到顶到底方法   |    N     |       boolean       |     false     |
|       callback       |     到顶到底方法     |    N     |       object        |       -       |
|    limitedLength     | 到顶到底后可拉伸距离 |    N     |       number        |      100      |
| minScrollSliderSize  |     最小滑块大小     |    N     |       number        |      80       |

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