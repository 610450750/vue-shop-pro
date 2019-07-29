<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-button type="primary" @click="bindCat">添加分类</el-button>
      <!-- 数据报表区域 -->
      <!-- data：数据源 columns：列字段 -->
      <zk-table
        :show-index="true"
        index-text="序号"
        :data="catInfos"
        :columns="catColumns"
        :expand-type="false"
        :selection-type="false"
      >
        <!-- 自定义列 slot="名称" -->
        <template slot="order" slot-scope="info">
          <el-tag v-if="info.row.cat_level==0">一级</el-tag>
          <el-tag v-else-if="info.row.cat_level==1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="resInfo">
          <el-button
            type="primary"
            icon="el-icon-edit"
            :circle="false"
            size="mini"
            @click="editBind(resInfo.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            :circle="false"
            size="mini"
            @click="delCat(resInfo.row.cat_id,resInfo.row.cat_level)"
          >删除</el-button>
        </template>
      </zk-table>

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

      <!-- 添加分类Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog
        title="添加分类"
        :visible.sync="catAddDialogVisible"
        width="50%"
        @close="catAddDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="catFormRef" :rules="formRules" :model="catForm" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="catForm.cat_name"></el-input>
          </el-form-item>
          <!-- 级联菜单 -->
          <el-form-item label="所属分类">
            <!-- expand-trigger="hover"  鼠标滑过显示子级菜单 
                  v-model="value"  当前显示数据
                  :options="options"  级联选择器数据
                  @change 当值变化时回调
                  :props 给级联菜单绑定（名称，id，子级字段）
                  :clearable 是否支持清空
                  :change-on-select 是否可以选择任意一级
            -->
            <el-cascader
              expand-trigger="hover"
              v-model="showCatInfo"
              :options="catInfosTwo"
              :props="selCatForm"
              @change="handleChange"
              :clearable="true"
              :change-on-select="true"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="catAddDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="addCat">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改分类Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog
        title="修改分类"
        :visible.sync="catEditDialogVisible"
        width="50%"
        @close="catEditDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="catEditFormRef" :rules="formRules" :model="catForm" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="catForm.cat_name"></el-input>
          </el-form-item>
          <!-- 级联菜单 -->
          <el-form-item label="当前位置">
            <!-- expand-trigger="hover"  鼠标滑过显示子级菜单 
                  v-model="value"  当前显示数据
                  :options="options"  级联选择器数据
                  @change 当值变化时回调
                  :props 给级联菜单绑定（名称，id，子级字段）
                  :clearable 是否支持清空
                  :change-on-select 是否可以选择任意一级
            -->
            <el-cascader
              expand-trigger="hover"
              v-model="showCatInfo"
              :options="catInfosTwo"
              :props="selCatForm"
              @change="handleChange"
              :clearable="true"
              :change-on-select="true"
              :disabled="true"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="catEditDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="editCat">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
    created() {
        this.getCatInfo()
    },
    methods: {
        // 添加分类对话框
        async bindCat() {
            this.catAddDialogVisible = true
            const { data: res } = await this.$http.get('categories', {
                params: {
                    type: 2
                }
            })
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.catInfosTwo = res.data
        },
        //添加分类
        addCat() {
            // 表单验证
            this.$refs.catFormRef.validate(async valid => {
                if (valid) {
                    // 数据封装在catForm 对象中
                    const { data: res } = await this.$http.post(
                        'categories',
                        this.catForm
                    )
                    // 失败抛出异常
                    if (res.meta.status !== 201) {
                        return this.$message.error(res.meta.msg)
                    }
                    console.log(res)
                    this.$message.success(res.meta.msg)
                    this.catAddDialogVisible = false
                    this.getCatInfo()
                }
            })
        },
        // 修改分类
        editCat() {
            // 表单验证
            this.$refs.catEditFormRef.validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put(
                        'categories/' + this.catForm.cat_id,
                        this.catForm
                    )
                    // 如果错误抛出异常
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    console.log(res)
                    this.catEditDialogVisible = false
                    this.$message.success(res.meta.msg)
                    this.getCatInfo()
                }
            })
        },
        // 编辑分类显示数据
        async editBind(id) {
            this.catEditDialogVisible = true
            // 遍历所有下拉列表数据
            const { data: res1 } = await this.$http.get('categories', {
                params: {
                    type: 3
                }
            })
            // 填充到容器
            this.catInfosTwo = res1.data

            // 根据当前id 查询 对应的分类信息
            const { data: res2 } = await this.$http.get('categories/' + id)
            if (res2.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res2)
            // 数据与表单属性绑定
            this.catForm = res2.data

            // 设置下拉列表显示值
            var newCat = [this.catForm.cat_pid, this.catForm.cat_id]
            console.log(newCat)
            this.showCatInfo = newCat
        },
        // 关闭对话框 重置表单
        catAddDialogClose() {
            this.$refs.catFormRef.resetFields()
            // 重置 级联菜单 值
            this.showCatInfo = []
        },
        // 关闭对话框 重置表单
        catEditDialogClose() {
            this.$refs.catEditFormRef.resetFields()
            // 重置 级联菜单 值
            this.showCatInfo = []
        },
        // 删除分类
        delCat(id, level) {
            console.log(level)
            this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(async () => {
                    const { data: res } = await this.$http.delete(
                        'categories/' + id
                    )
                    if (res.meta.status != 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    //如果当前页面只有一条数据 被删除后 当前页数减一
                    if (
                        this.catInfos.length === 1 &&
                        this.queryParams.pagenum > 1 &&
                        level == 0
                    ) {
                        this.queryParams.pagenum--
                    }
                    this.getCatInfo()
                    this.catAddDialogVisible = false
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
        },
        // 获取分类列表
        async getCatInfo() {
            // 获取 树菜单列表
            const { data: res } = await this.$http.get('categories', {
                params: {
                    type: 3, //分类
                    pagenum: this.queryParams.pagenum, //当前页面值
                    pagesize: this.queryParams.pagesize //每页显示多少条
                }
            })
            // 异常抛出错误
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.catInfos = res.data.result
            this.queryParams.total = res.data.total
        },
        //列表分页
        // 每页条数变化 回调函数
        handleSizeChange(val) {
            // 接收选取的参数
            this.queryParams.pagesize = val
            this.getCatInfo()
        },
        // 每页页数变化 回调函数
        handleCurrentChange(val) {
            // 接收选取的参数
            this.queryParams.pagenum = val
            this.getCatInfo()
        },
        // 当级联菜单 值发生变化时回调
        handleChange() {
            // 获取当前选中数组
            console.log(this.showCatInfo)
            // 获取数组
            var arrCat = this.showCatInfo
            // 获取数组最后一组值 只关联最后一级
            var arrValue = arrCat[arrCat.length - 1]
            // 获取数组中的参数
            this.catForm.cat_pid = arrValue == undefined ? 0 : arrValue
            this.catForm.cat_level = arrCat.length
            // console.log(this.catForm.cat_pid)
            // console.log(this.catForm.cat_level)
        }
    },
    data() {
        return {
            // 分类列表数据
            catInfos: [],
            // 分类添加对话框 显示状态
            catAddDialogVisible: false,
            // 分类修改对话框 显示状态
            catEditDialogVisible: false,
            // 分页参数
            queryParams: {
                total: 0, //记录总条数
                pagenum: 1, //当前页码值
                pagesize: 5 //每页显示多少条数据
            },
            // 设置表格列
            catColumns: [
                // 设置各个列的属性值
                // label：名称  prop：数据库字段
                { label: '分类名称', prop: 'cat_name' },
                // type： 自定义列 类型  template：要绑定的slot名称
                { label: '排序', type: 'template', template: 'order' },
                { label: '操作', type: 'template', template: 'opt' }
            ],
            // 设置级联菜单数据
            // 一二级别的数据
            catInfosTwo: [],
            // 显示当前选中的数据
            showCatInfo: [],
            // 级联菜数据与字段绑定
            // label-节点名称字段
            // value-节点值
            // children-子级
            selCatForm: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 分类表单属性
            catForm: {
                cat_id: 0,
                cat_name: '',
                cat_pid: 0,
                cat_level: 0
            },
            // 给登录表单设置校验规则
            formRules: {
                // requeired： 必须填写
                // message：错误信息提示
                // trigger:  检验触发器 blur 失去焦点时触发
                cat_name: [
                    {
                        required: true,
                        message: '请输入分类名称',
                        trigger: 'blur'
                    }
                ]
            }
        }
    }
}
</script>

<style lang="less" scoped>
.el-cascader{
  width:100%
}
</style>