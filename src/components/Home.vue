<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <img src="../assets/img/logo.png" alt="logo" />
      <span>电商后台管理系统</span>
      <el-button type="info" v-on:click="fun">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左侧导航 -->
      <el-aside :width="menushow ? '65px' : '200px'">
        <div class="menu" v-on:click="menushow=!menushow">|||</div>
        <!--  
            default-active="1" 默认展开
            :unique-opened="true" 每次只能展开一个 子菜单
            :collapse="menushow" 是否可以折叠
            :collapse-transition="false" 动画效果
            :router="true" 开启路由 index属性可以与路由直接绑定
        -->
        <el-menu
          style="border:none"
          default-active="125-110"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#4 09EFF"
          :collapse="menushow"
          :collapse-transition="false"
          :unique-opened="true"
          :style="menushow ? 'width:65px':'width:200px'"
          :router="true"
        >
          <el-submenu :index="item.id+''" v-for="(item,index) in menulist" :key="item.id">
            <template slot="title">
              <i :class="'icon iconfont icon-' + menuimg[index]"  style="margin-right:10px"></i>
              <span style="font-size:13px">{{item.authName}}</span>
            </template>
            <!--  index 指向绑定路由 在数据库中读取地址 -->
            <el-menu-item
              v-for="items in item.children"
              :index="items.path"
              :key="items.id"
            >
              <i class="el-icon-menu"></i>
              <span style="font-size:13px">{{items.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 中间容器 -->
      <el-main>
          <!-- 子级路由 -->
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
    created() {
        // 获取左侧数据列表
        this.getMenuList()
    },
    data() {
        return {
            // 菜单是否折叠
            menushow: false,
            // 接收 左侧data数据
            menulist: [],
            // 菜单图标
            menuimg: ['users', 'tijikongjian', 'shangpin', 'danju', 'baobiao']
        }
    },
    methods: {
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.menulist = res.data
        },
        fun() {
            this.$confirm('此操作将会退出系统, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    this.$message({
                        type: 'success',
                        message: '退出成功!'
                    })
                    window.sessionStorage.removeItem('token')
                    this.$router.push('/login')
                })
                .catch(() => {
                    // this.$message({
                    //     type: 'info',
                    //     message: '已取消删除'
                    // })
                })
        }
    }
}
</script>

<style lang="less" scoped>
.el-container {
    height: 100%;
    .el-header {
        padding: 0px;
        background-color: #373d41;
        img {
            margin: 4px;
            width: 44px;
            height: 44px;
            display: block;
            float: left;
            border-radius: 50%;
            border: 4px solid aqua;
            box-shadow: 0px 0px 6px #00aeff;
        }
        span {
            font-size: 22px;
            font-family: '微软雅黑';
            color: #fff;
            display: block;
            height: 60px;
            line-height: 60px;
            float: left;
            // 不能选定
            user-select: none;
        }
        .el-button {
            display: block;
            margin-top: 10px;
            margin-right: 20px;
            float: right;
        }
    }
    .el-aside {
        background-color: #333744;
        .menu {
            width: 100%;
            height: 25px;
            line-height: 24px;
            text-align: center;
            color: #fff;
            font-size: 12px;
            // 不能选中
            -moz-user-select: none;
            cursor: pointer;
            // 间隔
            letter-spacing: 0.1em;
            background-color: #4a5064;
        }
    }
    .el-main {
        background-color: #eaedf1;
    }
}
</style>