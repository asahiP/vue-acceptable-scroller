<template>
  <div
    ref="scrollerContainer"
    :style="containerStyle"
    @mouseenter="isMouseOver = !isMobile"
    @touchstart="isMouseOver = true"
    @mouseleave="isMouseOver = false"
    @touchend="isMouseOver = false"
    @wheel="sliderMouseWheel"
  >
    <div
      ref="scrollerContent"
      :style="scrollerContentStyle"
      @touchstart="scrollerContentTouchStart"
      @dragstart="(e) => e.preventDefault()"
      @transitionend="isInTransition = false"
    >
      <slot></slot>
    </div>
    <div
      ref="scrollBarX"
      :style="scrollerBarStyleX"
      @mousedown.left.stop="scrollBarMouseDown($event, 'sliderX')"
      @mouseup.left="scrollBarAnimateCancelHandle"
      @mouseleave="scrollBarAnimateCancelHandle"
    >
      <div
        :style="scrollerSliderStyleX"
        @mousedown.left.stop="sliderMouseDown($event, 'sliderX')"
        @dragstart="(e) => e.preventDefault()"
      ></div>
    </div>
    <div
      ref="scrollBarY"
      :style="scrollerBarStyleY"
      @mousedown.left.stop="scrollBarMouseDown($event, 'sliderY')"
      @mouseup.left="scrollBarAnimateCancelHandle"
      @mouseleave="scrollBarAnimateCancelHandle"
    >
      <div
        :style="scrollerSliderStyleY"
        @mousedown.left.stop="sliderMouseDown($event, 'sliderY')"
        @dragstart="(e) => e.preventDefault()"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getAbsPosition } from './lib/getAbsPosition'
import animate from './lib/animate'

type enableScroll = 'x' | 'y' | 'both'

interface option {
  enableScroll: enableScroll
  enableTouchMove: boolean
  autoHide: boolean
  barStyle?: any
  sliderStyle?: any
  limitedLength: number
  minSize: number
  throttle: number
}

@Component
export default class Scroller extends Vue {
  @Prop({ required: false }) hook!: Function
  
  containerStyle = {
    position: 'relative',

    width: '100%',
    height: '100%',
    overflow: 'hidden',
  }

  defaultBarStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,

    width: '8px',
    height: '8px',
    overflow: 'hidden',

    background: 'rgb(220, 220, 220)',

    transition: 'opacity .4s ease',
  }

  defaultSliderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,

    width: '100%',
    height: '100%',

    background: 'rgb(155, 155, 155)',
  }

  option: option = {
    enableScroll: 'both',
    enableTouchMove: true,
    autoHide: true,
    limitedLength: 100,
    minSize: 50,
    throttle: 300,
  }

  containerWidth: number = 0
  containerHeight: number = 0
  contentWidth: number = 0
  contentHeight: number = 0
  contentScrollTop: number = 0
  contentScrollLeft: number = 0

  get contentScrollWidth (): number {
    let { contentWidth, containerWidth } = this
    return contentWidth - containerWidth > 0
      ? contentWidth - containerWidth
      : 0
  }
  get contentScrollHeight (): number {
    let { contentHeight, containerHeight } = this
    return contentHeight - containerHeight > 0
      ? contentHeight - containerHeight
      : 0
  }

  sliderWidth: number = 0
  sliderHeight: number = 0
  sliderOffsetTop: number = 0
  sliderOffsetLeft: number = 0

  get sliderScrollWidth (): number {
    let { containerWidth, sliderWidth } = this
    return containerWidth - sliderWidth > 0
      ? containerWidth - sliderWidth
      : 0
  }
  get sliderScrollHeight (): number {
    let { containerHeight, sliderHeight } = this
    return containerHeight - sliderHeight > 0
      ? containerHeight - sliderHeight
      : 0
  }

  scrollBarAbsPositionX: number = 0
  scrollBarAbsPositionY: number = 0
  isShiftPressed: boolean = false
  isMouseOver: boolean = false
  isMobile: boolean = navigator.userAgent.toLowerCase().includes('mobile')
  isEventActive: boolean = false

  get isOverFlowX (): boolean {
    let { contentWidth, containerWidth } = this
    return contentWidth > containerWidth
  }
  get isOverFlowY (): boolean {
    let { contentHeight, containerHeight } = this
    return contentHeight > containerHeight
  }
  get scrollerBarStyleX (): any {
    let { barStyle, autoHide, enableScroll } = this.option
    let { isOverFlowX, isMouseOver, isEventActive, isInTransition, defaultBarStyle } = this

    return Object.assign({}, defaultBarStyle, barStyle, {
      display: ['x', 'both'].includes(enableScroll) && isOverFlowX ? 'block' : 'none',

      width: '100%',

      opacity: autoHide && !isMouseOver && !isEventActive && !isInTransition ? 0 : 1,
    })
  }
  get scrollerBarStyleY (): any {
    let { barStyle, autoHide, enableScroll } = this.option
    let { isOverFlowY, isMouseOver, isEventActive, isInTransition, defaultBarStyle } = this

    return Object.assign({}, defaultBarStyle, barStyle, {
      display: ['y', 'both'].includes(enableScroll) && isOverFlowY ? 'block' : 'none',

      height: '100%',

      opacity: autoHide && !isMouseOver && !isEventActive && !isInTransition ? 0 : 1,
    })
  }
  get scrollerSliderStyleX (): any {
    let { sliderStyle } = this.option
    let { sliderWidth, sliderOffsetLeft, isInTransition, defaultSliderStyle } = this

    return Object.assign({}, defaultSliderStyle, sliderStyle, {
      width: `${sliderWidth}px`,

      transform: `translate3d(${Math.round(sliderOffsetLeft)}px, 0, 0)`,
      transition: isInTransition ? 'transform .4s cubic-bezier(.25, .46, .45, .94) 0s' : '',
    })
  }
  get scrollerSliderStyleY (): any {
    let { sliderStyle } = this.option
    let { sliderHeight, sliderOffsetTop, isInTransition, defaultSliderStyle } = this
    
    return Object.assign({}, defaultSliderStyle, sliderStyle, {
      height: `${sliderHeight}px`,

      transform: `translate3d(0, ${Math.round(sliderOffsetTop)}px, 0)`,
      transition: isInTransition ? 'transform .4s cubic-bezier(.25, .46, .45, .94) 0s' : '',
    })
  }
  get scrollerContentStyle (): any {
    let { contentScrollTop, contentScrollLeft, isEventActive, isInTransition } = this

    return Object.assign({ position: 'relative' }, {
      transform: `translate3d(${Math.round(contentScrollLeft)}px, ${Math.round(contentScrollTop)}px, 0)`,
      transition: isInTransition ? 'transform .4s cubic-bezier(.25, .46, .45, .94) 0s' : '',
    })
  }

  getComputedStyle (): void {
    let { scrollerContainer, scrollerContent, scrollBarX, scrollBarY }: any = this.$refs
    let { sliderScrollWidth, sliderScrollHeight,
      sliderOffsetLeft, sliderOffsetTop,
      containerWidth, containerHeight } = this

    this.containerWidth = scrollerContainer.offsetWidth
    this.containerHeight = scrollerContainer.offsetHeight
    this.scrollBarAbsPositionX = getAbsPosition(scrollBarX)[0]
    this.scrollBarAbsPositionY = getAbsPosition(scrollBarY)[1]
    this.contentWidth = scrollerContent.scrollWidth
    this.contentHeight = scrollerContent.scrollHeight

    let { containerWidth: newContainerWidth, contentWidth,
      containerHeight: newContainerHeight, contentHeight, option } = this
    let { minSize } = option
    let scrollerSliderWidth = (newContainerWidth / contentWidth || 0) * newContainerWidth
    let scrollerSliderHeight = (newContainerHeight / contentHeight || 0) * newContainerHeight
    
    this.sliderWidth = Math.max(scrollerSliderWidth, minSize)
    this.sliderHeight = Math.max(scrollerSliderHeight, minSize)

    let { sliderScrollWidth: newSliderScrollWidth,
      sliderScrollHeight: newSliderScrollHeight,
      setScrollLeft, setScrollTop,
      syncScrollLeft, syncScrollTop } = this
    
    if (containerWidth !== newContainerWidth) {
      setScrollLeft((sliderOffsetLeft / sliderScrollWidth || 0) * newSliderScrollWidth)
    }
    if (containerHeight !== newContainerHeight) {
      setScrollTop((sliderOffsetTop / sliderScrollHeight || 0) * newSliderScrollHeight)
    }
  }

  setScrollTop (newVal: number): void {
    if (newVal < 0) throw new TypeError('newVal must be Bigger than 0')
    let self = this

    let { sliderScrollHeight, syncContentTranslateY } = this
    window.requestAnimationFrame(() => {
      self.sliderOffsetTop = Math.min(newVal, sliderScrollHeight)
      syncContentTranslateY()
    })
  }

  setScrollLeft (newVal: number): void {
    if (newVal < 0) throw new TypeError('newVal must be Bigger than 0')
    let self = this

    let { sliderScrollWidth, syncContentTranslateX } = this
    window.requestAnimationFrame(() => {
      self.sliderOffsetLeft = Math.min(newVal, sliderScrollWidth)
      syncContentTranslateX()
    })
  }

  setTranslateX (newVal: number, limit: number = 0): void {
    let { contentScrollWidth, syncScrollLeft } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.contentScrollLeft = newVal > 0
        ? Math.min(newVal, limit)
        : Math.max(newVal, (contentScrollWidth + limit) * -1)
      syncScrollLeft()
    })
  }

  setTranslateY (newVal: number, limit: number = 0): void {
    let { contentScrollHeight, syncScrollTop } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.contentScrollTop = newVal > 0
        ? Math.min(newVal, limit)
        : Math.max(newVal, (contentScrollHeight + limit) * -1)
      syncScrollTop()      
    })
  }

  syncScrollTop (): void {
    let { contentScrollHeight, contentScrollTop, sliderScrollHeight } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.sliderOffsetTop = (contentScrollTop / contentScrollHeight || 0) * sliderScrollHeight * -1
    })
  }

  syncScrollLeft (): void {
    let { contentScrollWidth, contentScrollLeft, sliderScrollWidth } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.sliderOffsetLeft = (contentScrollLeft / contentScrollWidth || 0) * sliderScrollWidth * -1
    })
  }

  syncContentTranslateX (): void {
    let { sliderOffsetLeft, sliderScrollWidth, contentScrollWidth } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.contentScrollLeft = (sliderOffsetLeft / sliderScrollWidth || 0) * contentScrollWidth * -1
    })
  }

  syncContentTranslateY (): void {
    let { sliderOffsetTop, sliderScrollHeight, contentScrollHeight } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.contentScrollTop = (sliderOffsetTop / sliderScrollHeight || 0) * contentScrollHeight * -1
    })
  }

  startMousePositionX: number = 0
  startMousePositionY: number = 0
  startContentPositionX: number = 0
  startContentPositionY: number = 0
  startSliderPositionX: number = 0
  startSliderPositionY: number = 0
  targetSlider: string = ''

  sliderMouseDown (e: MouseEvent, slider: string): void {
    let { sliderOffsetTop, sliderOffsetLeft } = this
    this.startMousePositionX = e.pageX
    this.startMousePositionY = e.pageY
    this.startSliderPositionX = sliderOffsetLeft
    this.startSliderPositionY = sliderOffsetTop
    this.targetSlider = slider
    this.isEventActive = true
  }
  sliderMouseMove (e: MouseEvent): void {
    let { pageX: moveMousePositionX, pageY: moveMousePositionY } = e
    let { startMousePositionX, startMousePositionY,
      startSliderPositionX, startSliderPositionY,
      targetSlider,
      setScrollTop, setScrollLeft } = this
    let distance: number
    
    switch (targetSlider) {
      case 'sliderX':
        distance = moveMousePositionX - startMousePositionX
        setScrollLeft(Math.max(startSliderPositionX + distance, 0))
        break
      case 'sliderY':
        distance = moveMousePositionY - startMousePositionY
        setScrollTop(Math.max(startSliderPositionY + distance, 0))
    }
  }
  sliderMouseUp (e: MouseEvent): void {
    this.startMousePositionX = 0
    this.startMousePositionY = 0
    this.startContentPositionX = 0
    this.startContentPositionY = 0
    this.targetSlider = ''
    this.isEventActive = false
  }
  sliderMouseWheel (e: MouseWheelEvent): void {
    let { setTranslateX, setTranslateY,
      isShiftPressed,
      contentScrollTop, contentScrollLeft,
      contentScrollWidth, contentScrollHeight,
      isOverFlowX, isOverFlowY } = this
    let distance = 24 * 3
    if (isShiftPressed) {
      if (isOverFlowX) {
        if (e.deltaY > 0) {
          setTranslateX(contentScrollLeft - distance)
        } else {
          setTranslateX(contentScrollLeft + distance)
        }
        e.stopPropagation()
      }
    } else {
      if (isOverFlowY) {
        if (e.deltaY > 0) {
          setTranslateY(contentScrollTop - distance)
        } else {
          setTranslateY(contentScrollTop + distance)
        }
        e.stopPropagation()
      }
    }
  }

  scrollBarAnimateCancelHandle: Function = () => {}

  scrollBarMouseDown (e: MouseEvent, slider: string): void {
    let { sliderWidth, sliderHeight,
      scrollBarAbsPositionX, scrollBarAbsPositionY,
      sliderOffsetLeft, sliderOffsetTop,
      setScrollLeft, setScrollTop } = this
    let mouseDownPosixionX = e.pageX - scrollBarAbsPositionX
    let mouseDownPosixionY = e.pageY - scrollBarAbsPositionY
    let endX = mouseDownPosixionX < sliderOffsetLeft
      ? mouseDownPosixionX - sliderOffsetLeft
      : mouseDownPosixionX - sliderOffsetLeft - sliderWidth
    let endY = mouseDownPosixionY < sliderOffsetTop
      ? mouseDownPosixionY - sliderOffsetTop
      : mouseDownPosixionY - sliderOffsetTop - sliderHeight
    let scrollBarAnimateCancelHandle: any
    let self = this
    switch (slider) {
      case 'sliderX':
        scrollBarAnimateCancelHandle = animate({
          end: endX,
          step: endX > 0 ? 10 : -10,
          callback: (currentStep: number) => {
            setScrollLeft(Math.max(sliderOffsetLeft + currentStep, 0))
          }
        })
        break
      case 'sliderY':
        scrollBarAnimateCancelHandle = animate({
          end: endY,
          step: endY > 0 ? 10 : -10,
          callback: (currentStep: number) => {
            setScrollTop(Math.max(sliderOffsetTop + currentStep, 0))
          }
        })
        
    }

    this.isEventActive = true
    this.scrollBarAnimateCancelHandle = () => {
      scrollBarAnimateCancelHandle.cancel()
      self.isEventActive = false
    }
  }

  touchStartFingerPositionX: number = 0
  touchStartFingerPositionY: number = 0
  touchEndFingerPositionX: number = 0
  touchEndFingerPositionY: number = 0
  touchStartContentPositionX: number = 0
  touchStartContentPositionY: number = 0
  touchEventTime: number = 0
  isInTransition: boolean = false
  bouncingAnimateCancelHandleX: Function = () => {}
  bouncingAnimateCancelHandleY: Function = () => {}

  scrollerContentTouchStart (e: TouchEvent): void {
    let { isOverFlowX, isOverFlowY } = this
    let { enableTouchMove } = this.option
    if (isOverFlowX || isOverFlowY && enableTouchMove) {
      let { pageX, pageY } = e.touches[0]
      let { contentScrollLeft, contentScrollTop,
        bouncingAnimateCancelHandleX,
        bouncingAnimateCancelHandleY,
        setTranslateX, setTranslateY } = this

      this.isEventActive = true
      this.touchStartFingerPositionX = this.touchEndFingerPositionX = pageX
      this.touchStartFingerPositionY = this.touchEndFingerPositionY = pageY
      this.touchStartContentPositionX = contentScrollLeft
      this.touchStartContentPositionY = contentScrollTop
      this.touchEventTime = e.timeStamp
      bouncingAnimateCancelHandleX()
      bouncingAnimateCancelHandleY()
      e.stopPropagation()
    }
  }
  scrollerContentTouchMove (e: TouchEvent): void {
    let { isEventActive, option } = this
    let { enableTouchMove, limitedLength } = option

    if (enableTouchMove && isEventActive) {
      let { pageX, pageY } = e.touches[0]
      let { isOverFlowX, isOverFlowY,
        touchEventTime,
        touchStartFingerPositionX,
        touchStartFingerPositionY,
        touchStartContentPositionX,
        touchStartContentPositionY,
        setTranslateX, setTranslateY,
        contentScrollWidth, contentScrollHeight } = this
      
      if (isOverFlowX) {
        let distance = pageX - touchStartFingerPositionX
        let translateX = touchStartContentPositionX + distance
        if (translateX < contentScrollWidth * -1 || translateX > 0) {
          if (translateX > 0) {
            setTranslateX(translateX / 5, limitedLength)
          } else {
            let overflow = (translateX + contentScrollWidth) / 5
            setTranslateX(contentScrollWidth * -1 + overflow, limitedLength)
          }
        } else {
          setTranslateX(translateX, limitedLength)
        }
        e.stopPropagation()
      }
      if (isOverFlowY) {
        let distance = pageY - touchStartFingerPositionY
        let translateY = touchStartContentPositionY + distance
        if (translateY < contentScrollHeight * -1 || translateY > 0) {
          if (translateY > 0) {
            setTranslateY(translateY / 5, limitedLength)
          } else {
            let overflow = (translateY + contentScrollHeight) / 5
            setTranslateY(contentScrollHeight * -1 + overflow, limitedLength)
          }
        } else {
          setTranslateY(translateY, limitedLength)
        }
        e.stopPropagation()
      }
      this.touchEndFingerPositionX = pageX
      this.touchEndFingerPositionY = pageY
    }
  }
  scrollerContentTouchEnd (e: TouchEvent): void {
    let { isEventActive, option } = this
    let { enableTouchMove } = option

    if (enableTouchMove && isEventActive) {
      let { touchEventTime,
        isOverFlowX, isOverFlowY,
        touchStartFingerPositionX,
        touchStartFingerPositionY,
        touchEndFingerPositionX,
        touchEndFingerPositionY,
        touchStartContentPositionX,
        touchStartContentPositionY,
        setTranslateX, setTranslateY,
        bouncing } = this

      this.isEventActive = false
      
      let timeDistance = e.timeStamp - touchEventTime
      let distanceX = touchEndFingerPositionX - touchStartFingerPositionX
      let distanceY = touchEndFingerPositionY - touchStartFingerPositionY
      if (timeDistance < 300) {
        if (isOverFlowX && Math.abs(distanceX) > 15) {
          this.isInTransition = true
          setTranslateX(touchStartContentPositionX + distanceX * 3)
        }
        if (isOverFlowY && Math.abs(distanceY) > 15) {
          this.isInTransition = true
          setTranslateY(touchStartContentPositionY + distanceY * 3)
        }
      } else {
        bouncing()
      }
    }
  }

  bouncing (): void {
    let { contentScrollWidth, contentScrollHeight,
      contentScrollLeft, contentScrollTop,
      setTranslateX, setTranslateY,
      option } = this
    let { limitedLength } = option
    if (contentScrollLeft < contentScrollWidth * -1 || contentScrollLeft > 0) {
      let Animate
      if (contentScrollLeft > 0) {
        Animate = animate({
          end: contentScrollLeft * -1,
          time: 50,
          fps: 120,
          callback: (currentStep: number) => {
            setTranslateX(contentScrollLeft + currentStep, limitedLength)
          }
        })
      } else {
        Animate = animate({
          end: Math.abs(contentScrollLeft + contentScrollWidth),
          time: 50,
          fps: 120,
          callback: (currentStep: number) => {
            setTranslateX(contentScrollLeft + currentStep, limitedLength)
          }
        })
      }
      this.bouncingAnimateCancelHandleX = Animate.cancel
    }
    if (contentScrollTop < contentScrollHeight * -1 || contentScrollTop > 0) {
      let Animate
      if (contentScrollTop > 0) {
        Animate = animate({
          end: contentScrollTop * -1,
          time: 50,
          fps: 120,
          callback: (currentStep: number) => {
            setTranslateY(contentScrollTop + currentStep, limitedLength)
          }
        })
      } else {
        Animate = animate({
          end: Math.abs(contentScrollTop + contentScrollHeight),
          time: 50,
          fps: 120,
          callback: (currentStep: number) => {
            setTranslateY(contentScrollTop + currentStep, limitedLength)
          }
        })
      }
      this.bouncingAnimateCancelHandleY = Animate.cancel
    }
  }

  @Watch('isEventActive')
  toggleUserSelect (): void {
    let { isMobile, isEventActive } = this

    isEventActive = !isMobile && isEventActive

    document.body.style['msUserSelect'] = isEventActive ? 'none' : ''
    document.body.style['userSelect'] = isEventActive ? 'none' : ''
    document.body.style['webkitUserSelect'] = isEventActive ? 'none' : ''
  }

  triggered: boolean = false

  @Watch('contentScrollLeft')
  @Watch('contentScrollTop')
  trigger (): void {
    let { hook, contentScrollLeft, contentScrollTop, triggered, option } = this
    let { throttle } = option
    let isFunction = typeof hook === 'function'

    if (isFunction && !triggered && throttle > 0) {
      this.triggered = true

      hook(contentScrollLeft, contentScrollTop)

      setTimeout(() => this.triggered = false, throttle)
    } else if (isFunction && !triggered) {
      hook(contentScrollLeft, contentScrollTop)
    }
  }

  keyDownEvent (e: KeyboardEvent): void {
    let { keyCode, target } = e
    let { isKeyDownEventActive } = Vue.prototype.$Scroller
    let { isMouseOver } = this

    if (!isMouseOver
      || isKeyDownEventActive
      || target !== document.body
      || ![16, 33, 34, 35, 36, 37, 38, 39, 40].includes(keyCode)) return
    if (keyCode === 16) {
      this.isShiftPressed = true
      return
    }

    Vue.prototype.$Scroller.isKeyDownEventActive = true
    window.cancelAnimationFrame(Vue.prototype.$Scroller.keyDownRequest)

    let self = this
    let loop = () => {
      let { setTranslateX, setTranslateY,
        contentScrollLeft, contentScrollTop,
        isShiftPressed, isInTransition } = self
      
      self.isInTransition = [33, 34, 35, 36].includes(keyCode) ? true : isInTransition
      switch (keyCode) {
        // ArrowUp
        case 38:
          setTranslateY(contentScrollTop + 24)
          break
        // ArrowDown
        case 40:
          setTranslateY(contentScrollTop - 24)
          break
        // ArrowLeft
        case 37:
          setTranslateX(contentScrollLeft + 24)
          break
        // ArrowRight
        case 39:
          setTranslateX(contentScrollLeft - 24)
          break
        // Home
        case 36:
          if (isShiftPressed) {
            setTranslateX(0)
          } else {
            setTranslateY(0)
          }
          break
        // End
        case 35:
          if (isShiftPressed) {
            setTranslateX(-Infinity)
          } else {
            setTranslateY(-Infinity)
          }
          break
        // PageUp
        case 33:
          if (isShiftPressed) {
            setTranslateX(contentScrollLeft + 24 * 3)
          } else {
            setTranslateY(contentScrollTop + 24 * 3)
          }
          break
        // PageDown
        case 34:
          if (isShiftPressed) {
            setTranslateX(contentScrollLeft - 24 * 3)
          } else {
            setTranslateY(contentScrollTop - 24 * 3)
          }
      }

      if (Vue.prototype.$Scroller.isKeyDownEventActive) {
        Vue.prototype.$Scroller.keyDownRequest = window.requestAnimationFrame(loop)
      }
    }

    Vue.prototype.$Scroller.keyDownRequest = window.requestAnimationFrame(loop)
  }

  keyUpEvent (e: KeyboardEvent): void {
    if (e.keyCode === 16) {
      this.isShiftPressed = false
      return
    }

    window.cancelAnimationFrame(Vue.prototype.$Scroller.keyDownRequest)
    Vue.prototype.$Scroller.isKeyDownEventActive = false
  }

  mounted (): void {
    let { $refs, $nextTick, getComputedStyle,
      sliderMouseMove, sliderMouseUp,
      scrollerContentTouchMove, scrollerContentTouchEnd,
      keyDownEvent, keyUpEvent } = this
    let { scrollerContainer }: any = $refs
    let self = this

    let config = {
      attributes: true,
      attributeOldValue: false,
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    }

    ;(new MutationObserver(getComputedStyle))
      .observe(scrollerContainer, config);
    
    window.addEventListener('resize', getComputedStyle)
    window.addEventListener('mousemove', sliderMouseMove)
    window.addEventListener('mouseup', sliderMouseUp)
    window.addEventListener('touchmove', scrollerContentTouchMove)
    window.addEventListener('touchend', scrollerContentTouchEnd)
    window.addEventListener('keydown', keyDownEvent)
    window.addEventListener('keyup', keyUpEvent)
    
    $nextTick(getComputedStyle)

    this.option = Object.assign({}, this.option, Vue.prototype.$Scroller.option)
  }
}
</script>

<style>
html, body {
  overscroll-behavior: contain;
}
</style>