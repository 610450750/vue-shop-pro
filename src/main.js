// 引入vue 组件
import Vue from 'vue'
// 引入主 路口文件
import App from './App'
// 引入路由文件
import router from './router'
// 引入css样式全局控制
import './assets/css/global.css'
// 引入element-ui全局css
// import 'element-ui/lib/theme-chalk/index.css'
// 引入element-ui组件库
import ElementUi from 'element-ui'
//  引入表格树
import ZkTable from 'vue-table-with-tree-grid'
// 引入iconfont 图标库
import './assets/fonts/iconfont.css'
// 导入日期格式化组件
// import moment from 'moment'
// 引入 axios
import axios from 'axios'
// 引入axios 加载jQuery 进度条组件
import NProgress from 'nprogress/nprogress.js'
// 引入axios 加载jQuery 进度条样式表
import 'nprogress/nprogress.css'

// 给axios做配置 (访问根地址、Vue之$http成员)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 给axios 设置 请求拦截器  绑定token
axios.interceptors.request.use(
    function(config) {
        // 开始进度条
        NProgress.start()
        // 获取token 令牌
        var token = window.sessionStorage.getItem('token')
        // 将令牌加入 axios 请求中
        config.headers.Authorization = token
        return config
    },
    function(error) {
        return Promise.reject(error)
    }
)
// 给axios 设置 响应拦截器
axios.interceptors.response.use(
    function(response) {
        NProgress.done()
        return response
    },
    function(error) {
        return Promise.reject(error)
    }
)

// 给Vue配置axios 成员
Vue.prototype.$http = axios

// 批量注册 element-ui
Vue.use(ElementUi)

// 批量注册 vue-tree-table
Vue.use(ZkTable)

Vue.config.productionTip = false

/* 创建一个Vue实例 */
new Vue({
    el: '#app',
    router,
    render: h => h(App)
})
