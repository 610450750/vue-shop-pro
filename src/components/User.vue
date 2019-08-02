<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
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
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 报表区 -->
      <!-- 
          :data="infodb" 可以直接使用 data中的对象 
          :data="bind()"  可以使用一个函数 返回的对象
          例如bind中 封装了一个 返回对象,该对象在data数据通过条件进行筛选后重新返回一个对象
      -->
      <!-- <el-table :data="infodb" border> -->
      <el-table :data="infodb" border>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="状态" width="80px">
          <!-- slot-scope="info" 利用插槽 返回当前对象 通过 row来接收字段值  
          当状态发生改变时触发 change 回调函数-->
          <el-switch
            v-model="resInfo.row.mg_state"
            slot-scope="resInfo"
            @change="editSwitchState($event,resInfo.row.id)"
          ></el-switch>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <!-- 酱油标签 用于 定义 slot-scope="resInfo" 插槽-->
          <template slot-scope="resInfo">
            <!-- 载入 表格 按钮 -->
            <el-tooltip content="修改用户" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button
                type="primary"
                icon="el-icon-edit"
                :circle="false"
                size="mini"
                @click="editBind(resInfo.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除用户" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button
                type="danger"
                icon="el-icon-delete"
                :circle="false"
                size="mini"
                @click="delUser(resInfo.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button
                type="warning"
                icon="el-icon-setting"
                :circle="false"
                size="mini"
                @click="roleBind(resInfo.row.id)"
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

      <!-- 添加用户的Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 新增角色的Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog
        title="用户分配角色"
        :visible.sync="roleDialogVisible"
        width="50%"
        @close="roleDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="roleInfoRef" :rules="roleUserInfoRules" :model="roleUserInfo">
          <el-form-item label="当前用户名" label-width="100px">
            <el-col :span="14">
              <el-input v-model="roleUserInfo.username" :disabled="true"></el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="当前角色" prop="rid" label-width="100px">
            <el-select v-model="roleUserInfo.rid" placeholder="请选择">
              <el-option
                v-for="item in roleInfo"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="roleUser">确 定</el-button>
        </span>
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
        // 自定义表单校验器
        var checkMobile = (rule, value, callback) => {
            // 校验手机号码规则: 13/5/7/8/9后接9位数字（一共11位）
            if (!/^1[35789]\d{9}$/.test(value)) {
                return callback(new Error('手机号码格式不正确'))
            }
            // 校验通过
            callback() //继续执行
        }

        return {
            // 角色弹框
            roleDialogVisible: false,
            // 用户id 查询 角色 id 和当前用户名称
            roleUserInfo: {
                username: '', //用户名称
                rid: '' //角色ID
            },
            roleUserInfoRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                rid: [
                    { required: true, message: '角色为必填项', trigger: 'blur' }
                ]
            },
            //  role 数据
            roleInfo: [],
            // edit表单属性
            editForm: {
                id: 0,
                username: '',
                email: '',
                mobile: ''
            },
            // edit表单验证
            editFormRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                username: [
                    { required: true, message: '用户名必填项', trigger: 'blur' }
                ],
                mobile: [
                    {
                        required: true,
                        message: '手机号必填项',
                        trigger: 'blur'
                    }
                    // // validator 自定义校验 函数
                    // { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 修改弹框
            editDialogVisible: false,

            // 添加表单属性
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // add表单验证
            addFormRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                username: [
                    { required: true, message: '用户名必填项', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码必填项', trigger: 'blur' }
                ],
                mobile: [
                    {
                        required: true,
                        message: '手机号必填项',
                        trigger: 'blur'
                    }
                    // // validator 自定义校验 函数
                    // { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 新增弹框
            addDialogVisible: false,
            // 用户数据
            infodb: [],
            //  请求参数
            queryParams: {
                query: '', //搜索条件
                pagenum: 1, //当前页数
                pagesize: 5, //每页显示条数
                total: 0 //总条数
            }
        }
    },
    methods: {
        // 获取用户列表
        async getUserInfo() {
            // es7 获取 promise 结构 data中的 res
            const { data: res } = await this.$http.get('users', {
                params: this.queryParams
            })
            // 请求失败异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            // 获取数组
            this.infodb = res.data.users
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
        // exc |  clear时 清空并 载入数据
        clear() {
            this.queryParams.query = ''
            this.queryParams.pagenum = 1
            this.getUserInfo()
        },
        // 重置add表单
        addDialogClose() {
            // 重置表单
            this.$refs.addFormRef.resetFields()
        },
        // 新增数据
        addUser() {
            // 表单域验证 validate 回调函数 valid 参数为布尔值 通过验证true 未通过false
            this.$refs.addFormRef.validate(async valid => {
                if (valid) {
                    // 服务端验证
                    const { data: res } = await this.$http.post(
                        'users',
                        this.addForm
                    )
                    console.log(res)
                    // 新增失败抛出异常
                    if (res.meta.status !== 201) {
                        return this.$message.error(res.meta.msg)
                    }
                    // 隐藏当前 Dialog 对话框
                    this.addDialogVisible = false
                    // 弹出成功 提示信息
                    this.$message.success(res.meta.msg)
                    // 重新加载数据
                    this.getUserInfo()
                }
            })
        },
        // 删除数据
        delUser(id) {
            this.$confirm('此操作将删除该信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(async () => {
                    if (id === 500) {
                        return this.$message.error('系统最高权限不能被删除')
                    }
                    const { data: res } = await this.$http.delete('users/' + id)
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    // 提示成功
                    this.$message.success(res.meta.msg)
                    //如果当前页面只有一条数据 被删除后 当前页数减一
                    if (
                        this.infodb.length === 1 &&
                        this.queryParams.pagenum > 1
                    ) {
                        this.queryParams.pagenum--
                    }
                    // 重新载入数据
                    this.getUserInfo()
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
        },
        // 根据ID查询当前用户数据
        async editBind(id) {
            // 显示弹框
            this.editDialogVisible = true
            // 根据ID查询当前用户数据
            const { data: res } = await this.$http.get('users/' + id)
            console.log(res)
            // 失败抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            this.editForm = res.data
            // this.$message.success(res.meta.msg)
        },
        // 修改用户
        editUser() {
            // 表单域验证 validate 回调函数 valid 参数为布尔值 通过验证true 未通过false
            this.$refs.editFormRef.validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put(
                        'users/' + this.editForm.id,
                        this.editForm
                    )
                    // 失败抛出异常
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    // 提示成功信息
                    this.$message.success(res.meta.msg)
                    // 修改成功隐藏弹窗户
                    this.editDialogVisible = false
                    // 重新加载数据
                    this.getUserInfo()
                }
            })
        },
        // 开关回调函数 $event 当前状态 id 参数 (状态发生改变时触发)
        async editSwitchState($event, id) {
            // 获取 开关按钮 状态 和参数
            console.log($event, id)
            const { data: res } = await this.$http.put(
                'users/' + id + '/state/' + $event
            )
            console.log(res)
            // 失败抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            // 更新成功提示
            this.$message.success(res.meta.msg)
        },
        //重置edit表单
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        // 执行自动搜索 功能
        // 数据自动筛选函数 返回一个新的infodb 数据对象
        // 当前数据为与分页有绑定关系 再此分页功能 不能实现同步
        bind() {
            // 过滤数组 this.infodb.filter(function(内容){return 条件})    把符合条件的内容返回
            // 当前this 指向在filter 函数中, 使用箭头函数 将this 指向全局 来获取this.queryParams.query
            var newInfoDb = this.infodb.filter(itme => {
                // 将返回值 return 回数组 是否包含includes
                return itme.username.includes(this.queryParams.query)
            })
            return newInfoDb
        },
        // 根据用户ID查询 关联角色
        async roleBind(id) {
            this.roleDialogVisible = true
            const { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            // console.log(res)
            this.roleUserInfo = res.data

            // 获取角色列表
            const { data: res1 } = await this.$http.get('roles')
            if (res1.meta.status !== 200) {
                return this.$message.error(res1.meta.msg)
            }
            console.log(res1)
            this.roleInfo = res1.data
        },
        // 分配用户角色
        async roleUser() {
            console.log(this.roleUserInfo.rid)
            const { data: res } = await this.$http.put(
                'users/' + this.roleUserInfo.id + '/role',
                this.roleUserInfo
            )
            // 修改失败抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            // 关闭提示框
            this.roleDialogVisible = false
            // 提示成功
            this.$message.success(res.meta.msg)
            // 载入数据
            this.getUserInfo()
        },
        // 角色 重置表单
        roleDialogClose() {
            this.$refs.roleInfoRef.resetFields()
        }
    }
}
</script>

<style lang="less" scoped>
</style>