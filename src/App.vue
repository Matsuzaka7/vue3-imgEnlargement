<script lang="ts" setup>
import { ref } from 'vue'
import PcImg from './components/PcImg.vue'
const imgUrl = ref('')

// 控制面板是否打开
const isShow = ref(false)
const setImgUrl = (e) => { 
  imgUrl.value = e.target.src
  isShow.value = true
}

// 关闭面板
const closeImgBox = () => {
  isShow.value = false
}

</script>

<template>
  <img src="http://47.95.112.111:666/bi.jpg" alt="" @click="setImgUrl">
  <img src="http://47.95.112.111:666/ba.jpg" alt="" @click="setImgUrl">
  <div class="imgdiv">
    <!-- 组件需要传递一个值作为显示与隐藏, closeImgBox 是用于关闭窗口 -->
    <PcImg :isShow="isShow" :imgUrl="imgUrl" @closeImgBox="closeImgBox"></PcImg>
  </div>
</template>

<style scoped>
img {
  display: flex;
  max-width: 300px;
}
.imgdiv {
  padding: 5px;
  display: flex;  
  align-items: center;
  justify-content: center;
}
</style>
