import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import WelCome from '@/components/WelCome.vue'
import User from '@/components/User.vue'
import Rights from '@/components/Rights.vue'
import Role from '@/components/Role.vue'

Vue.use(Router)
// 实例化路由
const router = new Router({
    routes: [
        // redirect 页面重定向
        { path: '/', redirect: '/home' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: Home,
            redirect: '/welcome',
            // 子级路由
            children: [
                { path: '/welcome', component: WelCome },
                { path: '/users', component: User },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Role }
            ]
        }
    ]
})
// 创建路由导航守卫
// to:目标
// from：来源
// next：执行方式
router.beforeEach((to, from, next) => {
    // 如果是login 则通过
    if (to.path === '/login') {
        return next()
    }
    // 如果是其他页面 则 检查 token令牌
    const token = window.sessionStorage.getItem('token')
    if (!token) {
        return next('/login')
    }
    // 如果满足所有条件则正常执行
    next()
})

// 导出路由
export default router
