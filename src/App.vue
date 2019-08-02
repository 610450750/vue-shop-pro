<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {}
</script>

<style>
/* 设置进度条 样式 */
#nprogress .bar {
    /* 自定义进度条颜色 */
    background: rgb(81, 164, 247) !important;
    height: 5px;
    /* border-radius: 100%; */
}
</style>