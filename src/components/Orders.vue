<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 功能区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            ref="ss"
            placeholder="请输入搜索内容"
            v-model="queryParams.query"
            :clearable="true"
            v-on:clear="clear"
            @keyup.enter.native="getUserInfo"
            @keyup.esc.native="clear"
          >
            <el-button slot="append" icon="el-icon-search" v-on:click="selInfo"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="goodsAdd">添加订单</el-button>
        </el-col>
      </el-row>

      <!-- 报表区 -->
      <!-- 
          :data="infodb" 可以直接使用 data中的对象 
      -->
      <el-table :data="infodb" border>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80px"></el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <!-- :formatter 修改当前prop 绑定的值 -->
        <el-table-column prop="create_time" :formatter="newTime" label="下单时间" width="140px"></el-table-column>
        <el-table-column label="操作" width="150px">
          <!-- 酱油标签 用于 定义 slot-scope="resInfo" 插槽-->
          <template slot-scope="resInfo">
            <!-- 载入 表格 按钮 -->
            <el-tooltip content="修改订单" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button type="primary" icon="el-icon-edit" :circle="false" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="查看物流" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button
                type="success"
                icon="el-icon-location"
                :circle="false"
                size="mini"
                @click="getIdOrders(resInfo.row.create_time)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 数据分页区 -->
      <!-- 
            size-change 条数变化 回调 
            current-change 页码变化 回调
            current-page 当前页数
            page-sizes 更改每页条数
            page-size 每页显示条数
            layout：
            total 总条数 
            sizes 每条显示条数  
            prev 上一页 
            pager 分页列表
            next 下一页
            jumper 跳转到第几页
      -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="queryParams.total"
      ></el-pagination>

      <!-- 查看物流的Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog title="物流信息" :visible.sync="DialogVisible" width="50%" @close="DialogClose">
        <el-steps direction="vertical" :active="active" finish-status="success">
          <el-step
            :title="item.time"
            :description="item.context"
            :data="wlInfo"
            v-for="item in wlInfo"
            :key="item+Math.random()"
          ></el-step>
        </el-steps>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
    // 创建生命周期函数
    created() {
        // 引入首屏数据
        this.getUserInfo()
    },
    mounted() {
        // 默认光标
        this.$refs.ss.focus()
    },
    data() {
        return {
            // 查看物流
            DialogVisible: false,
            // 订单数据
            infodb: [],
            //  请求参数
            queryParams: {
                query: '', //搜索条件
                pagenum: 1, //当前页数
                pagesize: 5, //每页显示条数
                total: 0 //总条数
            },
            // 步骤条默认 显示
            active: 0,
            // 物流数据
            wlInfo: []
        }
    },
    methods: {
        // 根据ID查询物流信息
        async getIdOrders() {
            this.DialogVisible = true
            const { data: res } = await this.$http.get(
                // 提供测试的 id 单号 81337523816
                'http://127.0.0.1:8888/api/private/v1/kuaidi/81337523816',
                {
                    headers: {
                        Authorization:
                            'Bearer ' + window.sessionStorage.getItem('token')
                    }
                }
            )
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.wlInfo = res.data
        },
        // 获取订单列表
        async getUserInfo() {
            // es7 获取 promise 结构 data中的 res
            const { data: res } = await this.$http.get('orders', {
                params: this.queryParams
            })
            // 请求失败异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            // 获取数组
            this.infodb = res.data.goods
            // 获取总条数
            this.queryParams.total = res.data.total
        },
        // 查询按钮 查询时从第一页开始查询
        selInfo() {
            this.queryParams.pagenum = 1
            this.getUserInfo()
        },
        // 每页条数变化 回调函数
        handleSizeChange(val) {
            // 接收选取的参数
            this.queryParams.pagesize = val
            this.getUserInfo()
        },
        // 每页页数变化 回调函数
        handleCurrentChange(val) {
            // 接收选取的参数
            this.queryParams.pagenum = val
            this.getUserInfo()
        },
        // 关闭
        DialogClose() {},
        // exc |  clear时 清空并 载入数据
        clear() {
            this.queryParams.query = ''
            this.queryParams.pagenum = 1
            this.getUserInfo()
        },
        // 添加订单
        goodsAdd() {
            // 重定跳转到goosadd 路由
            // this.$router.push('goodsadd')
        },
        // 把时间戳处理为 "2019-03-05 11:23:50" 格式
        newTime(val, arg) {
            // console.log(val.add_time)
            // 请根据被处理的时间信息重新实例化一个新的时间对象
            // var tm = new Date(时间对象);  // 把一个旧的时间对象重新实例化出来
            var tm = new Date(val.create_time)

            var yyyy = tm.getFullYear()
            var mm = tm.getMonth() + 1
            var dd = tm.getDate()

            var hh = tm.getHours()
            var ii = tm.getMinutes()
            var ss = tm.getSeconds()
            // 只显示年月日
            if (arg === 'Y-M-D') {
                return `${yyyy}-${mm}-${dd}`
            }
            // 显示年月日 时分秒
            return `${yyyy}-${mm}-${dd} ${hh}:${ii}:${ss}`
        }
    }
}
</script>

<style lang="less" scoped>
</style>