<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 数据图标的显示区域 -->
      <div ref="mypic" style="width:750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
//  引入 echarts 模块
import echarts from 'echarts'
export default {
    // 生命周期函数
    // 页面 与 dom 函数 数据 都没有
    beforeCreate() {},
    // 加载函数与数据部分
    created() {},
    // 加载vue {{参数}}模板 函数 数据
    beforeMount() {},
    // 数据与页面加载完毕
    mounted() {
        this.paintPic()
    },
    methods: {
        // 生成柱状 数据图表
        paintPic() {
            // 基于准备好的dom，初始化echarts 柱状图
            var myChart = echarts.init(this.$refs.mypic)

            // 生成柱状 数据图表
            myChart.setOption({
                // 指定图表的配置项和数据
                title: {
                    // 标题内容
                    text: 'ECharts 产品报表'
                },
                // 显示内容
                tooltip: {},
                // 分类
                legend: {
                    data: ['销量', '金额']
                },
                // x轴信息列 名称
                xAxis: {
                    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
                },
                // y轴信息列 名称
                yAxis: {},
                // 显示内容数据 数值
                series: [
                    {
                        name: '销量',
                        type: 'bar',
                        data: [600, 500, 760, 300, 600, 500]
                    },
                    {
                        name: '金额',
                        type: 'bar',
                        data: [2000, 1600, 3000, 3000, 1000, 2400]
                    }
                ]
            })
        }
    }
}
</script>

<style lang="less" scoped>
</style>