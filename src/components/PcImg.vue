<template>
  <div 
    class="imgBox" 
    @click="click" 
    @wheel="mouseWheelScroll"
    @mousedown="mousedown"
    @mousemove="mousemove"
    @mouseup="mouseup"
    v-if="props.isShow && props.imgUrl"
  >
    <img 
      class="img"
      ref="imgEl"
      :src="props.imgUrl"
      :style="{transition: data.isLongDuration ? '' : 'all 0.2s' }"
    />

    <!-- 这个shade div是为了解决长按图片会拖图片的问题 -->
    <div class="shade"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, reactive } from 'vue'
const emit = defineEmits(['closeImgBox'])
const props = defineProps({
  // 图片地址
  imgUrl: {
    type: String,
    default: ''
  },
  // 标识预览面板是否打开
  isShow: {
    type: Boolean,
    default: false
  }
})

const data = reactive({
  // 判断是否是长按
  isLongDuration: false,
  // 记录长按的定时器
  LongDurationTimer: 0,
  // 滚轮缩放大小
  zoomSize: 1,
  // 最小缩放
  minSize: 0.3,
  // 最大缩放
  maxSize: 2,
  // 放大系数
  scrollStep: 0.2,
  // 鼠标起始位置
  mouseStartX: 0,
  mouseStartY: 0,
  // 鼠标拖拽时与起始位置的距离
  mousemoveDiffX: 0,
  mousemoveDiffY: 0,
  // 计算的最终位置
  x: 0,
  y: 0
})

const imgEl: any = ref(null)
const { zoomSize,  mousemoveDiffX, mousemoveDiffY, x, y } = toRefs(data)

// 点击预览面板进行关闭
const click = () => {
  // 如果长按了, 就不执行
  if (data.isLongDuration) return
  console.log('单击关闭');
  // 关闭窗口重置位置
  data.x = 0
  data.y = 0
  data.zoomSize = 1
  data.mousemoveDiffX = 0
  data.mousemoveDiffY = 0
  mouseEndX = 0
  mouseEndY = 0
  allDiffX = 0
  allDiffY = 0
  oldX = 0
  oldY = 0
  emit('closeImgBox')
}

// 鼠标按下（处理拖拽）
const mousedown = (e: MouseEvent) => {
  
  // 如果这个定时器执行了, 就代表是长按 
  data.LongDurationTimer = setTimeout(() => {
    console.log('长按');
    data.isLongDuration = true
    // 记录按下时鼠标的起始位置
    data.mouseStartX = e.pageX
    data.mouseStartY = e.pageY
  }, 100);
}

// 记录鼠标上次拖拽的位置差
let mouseEndX = 0;
let mouseEndY = 0;

// 记录鼠标总的拖拽的位置差
let allDiffX = 0
let allDiffY = 0

// 记录总的差异停留的位置
let oldX = 0
let oldY = 0

// 鼠标拖拽
const mousemove = (e: MouseEvent) => {
  if (data.isLongDuration) {
    const { mouseStartX, mouseStartY } = data
    
    // 记录最新移动时的差异 x越大越往左, y越大越往上
    data.mousemoveDiffX = mouseStartX - e.pageX
    data.mousemoveDiffY = mouseStartY - e.pageY

    // 记录当前差异和上一次的差异的差值的总和（就是上一次停留的坐标）
    oldX += data.mousemoveDiffX - mouseEndX
    oldY += data.mousemoveDiffY - mouseEndY
    
    // 最终的x坐标 = 上一次的坐标 + 总的移动差异
    x.value = oldX + allDiffX
    y.value = oldY + allDiffY
    console.log('拖拽', x.value, y.value);
    
    mouseEndX = data.mousemoveDiffX
    mouseEndY = data.mousemoveDiffY
  }
}

// 鼠标抬起
const mouseup = (e: MouseEvent) => {
  console.log('抬起');
  // 在鼠标抬起时记录一次上一次的位置
  clearTimeout(data.LongDurationTimer)
  // 由于click事件会比mouseup执行得晚, 而click函数内又需要判断isLongDuration, 因此将修改放入宏任务中执行. 为了能够让click内能拿到正确的值
  setTimeout(() => {
    data.isLongDuration = false
    // 松开时记录计算总的移动的距离
    allDiffX += mousemoveDiffX.value
    allDiffY += mousemoveDiffY.value
  })
}

// 记录
let percentageX = ref(0)
let percentageY = ref(0)

// 鼠标滚轮事件
const mouseWheelScroll = (e: WheelEvent) => {
  console.log('mouseWheelScroll');
  let zoomSize = data.zoomSize
  // 边界处理 
  if (zoomSize > data.maxSize) {
    zoomSize = data.maxSize
  } else if (zoomSize < data.minSize) {
    zoomSize = data.minSize
  }

  // 判断滚轮行为是放大还是缩小
  if (e.deltaY < 0) {
    zoomSize += data.scrollStep
  } else {
    zoomSize -= data.scrollStep
  }
  if (zoomSize >= data.maxSize || zoomSize <= data.minSize ) return
  data.zoomSize = zoomSize

  // 优化体验, 放大系数小于1时，让图片归位到最中间
  if (data.zoomSize < 1) {
    data.x = 0
    data.y = 0
    data.mousemoveDiffX = 0
    data.mousemoveDiffY = 0
    x.value = 0
    y.value = 0
    mouseEndX = 0
    mouseEndY = 0
    allDiffX = 0
    allDiffY = 0
    oldX = 0
    oldY = 0
  }

  const WindowWidth = window.innerWidth
  const WindowHeight = window.innerHeight

  // 图片实际宽高的一半（这个值是图片变化之前的值）
  const halfX = (imgEl.value.offsetWidth * data.zoomSize)/2
  const halfY = (imgEl.value.offsetHeight * data.zoomSize)/2

  // 计算图片四周距离window有多远
  // 公式 = window宽高的一半 - 图片实际宽高的一半 + 图片移动距离
  // const r0 = WindowWidth / 2 - halfX + x.value
  const l0 = WindowWidth - (WindowWidth / 2 - halfX + x.value) - imgEl.value.offsetWidth * data.zoomSize
  // const b0 = WindowHeight / 2 - halfY + y.value
  const t0 = WindowHeight - (WindowHeight / 2 - halfY + y.value) - imgEl.value.offsetHeight * data.zoomSize
  console.log(l0, t0);
  
  // 计算鼠标在图片的位置
  // 公式 = 鼠标到window的距离 - 图片到window的距离
  // 我们需要的是, 图片中心点是 0,0  需要得到鼠标在中心点的位置
  const imgPageX = halfX - (e.x - l0)
  const imgPageY = halfY - (e.y - t0)
  
  
  // 处理边界, 如果鼠标离开了图片进行了放大, 那就以图片大小一半进行限制
  percentageX.value = imgPageX > halfX ? halfX : imgPageX < -halfX ? -halfX : -imgPageX
  percentageY.value = imgPageY > halfY ? halfY : imgPageY < -halfY ? -halfY : -imgPageY
}

</script>

<style scoped>
.imgBox {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000c0;
  overflow: hidden;
}

.img {
  max-width: 80vw !important;
  max-height: 80vh !important;
  user-select: none;
  position: absolute;
  top: calc(50% - v-bind(y + 'px'));
  left: calc(50% - v-bind(x + 'px'));
  transform: scale(v-bind(zoomSize)) translate(-50%, -50%) !important;
  transform-origin: v-bind(percentageX + 'px') v-bind(percentageY + 'px');
}
.shade {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>