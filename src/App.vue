<template>
  <div id="app" :style="{ width: '100%', height: '100%' }">
    <Scroller>
      <div v-for="i in num" :key="i" :style="{
        background: `rgb(${Math.random() * 156 + 100}, ${Math.random() * 156 + 100}, ${Math.random() * 156 + 100})`
      }" v-text="i"></div>
    </Scroller>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  num: number = 100
}
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
}

* {
  margin: 0;
  padding: 0;
}

div {
  width: 100%;
  height: 2rem;

  color: white;
  text-align: center;
}
</style>
