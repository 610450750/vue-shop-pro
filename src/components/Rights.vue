<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-table :data="rightdb" border>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="等级">
          <template slot-scope="info">
            <el-tag v-if="info.row.level==0">一级</el-tag>
            <el-tag v-else-if="info.row.level==1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
    created() {
        this.getRight()
    },
    methods: {
        async getRight() {
            const { data: res } = await this.$http.get('rights/list')
            // 如果失败抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.rightdb = res.data
        }
    },
    data() {
        return {
            // 数据
            rightdb: []
        }
    }
}
</script>

<style lang="less" scoped>
</style>