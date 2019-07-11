// 引入vue 组件
import Vue from 'vue'
// 引入主 路口文件
import App from './App'
// 引入路由文件
import router from './router'
// 引入css样式全局控制
import './assets/css/global.css'
// 引入element-ui组件库
import ElementUi from 'element-ui'
// 引入iconfont 图标库
import './assets/fonts/iconfont.css'
// 引入 axios
import axios from 'axios'
// 给axios做配置 (访问根地址、Vue之$http成员)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 给Vue配置axios 成员
Vue.prototype.$http = axios

// 批量注册 element-ui
Vue.use(ElementUi)

Vue.config.productionTip = false

/* 创建一个Vue实例 */
const vm = new Vue({
    // 注册到Vue中
    router,
    render: h => h(App)
})
// 将Vue 挂载到 index.html div中
vm.$mount('#app')