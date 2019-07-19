<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 新增角色 -->
      <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
      <!-- 数据列表 -->
      <!-- :data="infodb" 自动for循环遍历 数据 -->
      <el-table :data="infodb" border style="width:100%">
        <!-- type="expand" 展开行  该内容会在每行中遍历一次-->
        <el-table-column type="expand">
          <!-- 接收插槽中 infodb 数据 -->
          <template slot-scope="info">
            <!-- 遍历一级 -->
            <el-row
              v-for="(item1,k1) in info.row.children"
              :key="item1.id"
              :style="{'border-bottom':'1px solid #EBEEF5','border-top':k1===0?'1px solid #EBEEF5':''}"
            >
              <!-- :span 占比  共24格
              closable  是否可关闭-->
              <el-col :span="5">
                <el-tag
                  ref="tag"
                  closable
                  @close="closeTag(info.row.id,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 遍历二级 -->
                <el-row
                  v-for="(item2,k2) in item1.children"
                  :key="item2.id"
                  :style="{'border-top':'1px solid #EBEEF5','border-top':k2===0?'':'1px solid #EBEEF5'}"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="closeTag(info.row.id,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 遍历三级 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="closeTag(info.row.id,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="310px">
          <!-- 酱油标签 用于 定义 slot-scope="resInfo" 插槽-->
          <template slot-scope="resInfo">
            <!-- 载入 表格 按钮 -->
            <el-tooltip content="编辑角色" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button
                type="primary"
                icon="el-icon-edit"
                :circle="false"
                size="mini"
                @click="editBind(resInfo.row.id)"
              >编辑</el-button>
            </el-tooltip>
            <el-tooltip content="删除角色" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 id-->
              <el-button
                type="danger"
                icon="el-icon-delete"
                :circle="false"
                size="mini"
                @click="delRole(resInfo.row.id)"
              >删除</el-button>
            </el-tooltip>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <!-- 通过 slot-scope 插槽 传递 整条 row角色数据-->
              <el-button
                type="warning"
                icon="el-icon-setting"
                :circle="false"
                size="mini"
                @click="roleBind(resInfo.row)"
              >分配角色</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- dialog 新增 对话框 -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- dialog 修改 对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- dialog 角色分配权限 对话框 -->
      <el-dialog
        title="角色分配权限"
        :visible.sync="roleDialogVisible"
        width="50%"
        @close="roleDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="roleFormRef" :model="roleForm">
          <el-form-item label="当前角色" label-width="85px">
            <el-col :span="12">
              <el-button
                type="danger"
                size="mini"
                style="font-size:14px;font-weight:bold"
              >{{roleForm.roleName}}</el-button>
            </el-col>
          </el-form-item>
          <el-form-item>
            <!--  :data 数据源 :props tree绑定属性值 
            label：名称  value：值 children：上下级关系
            show-checkbox 显示复选框
            node-key="id" 该控件唯一标识
            default-expand-all 默认展开所有节点
            :default-checked-keys=[1,2,3] 选中树节点
            -->
            <el-tree
              ref="tree"
              :data="treedb"
              :props="treedbProps"
              show-checkbox
              node-key="id"
              default-expand-all
              :default-checked-keys="checkKey"
            ></el-tree>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取 消</el-button>
          <!-- 提交分配角色  -->
          <el-button type="primary" @click="roleRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
    created() {
        this.getRoleInfo()
    },
    methods: {
        // 删除分配的权限
        closeTag(rid, id) {
            this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(async () => {
                    const { data: res } = await this.$http.delete(
                        'roles/' + rid + '/rights/' + id
                    )
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    this.getRoleInfo()
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
        },
        // 获取角色列表
        async getRoleInfo() {
            const { data: res } = await this.$http.get('roles')
            // 错误抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.infodb = res.data
        },
        // 重置add表单
        addDialogClose() {
            this.$refs.addFormRef.resetFields()
        },
        // 重置edit表单
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        // 新增角色
        addRole() {
            // 表单验证
            this.$refs.addFormRef.validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.post(
                        'roles',
                        this.addForm
                    )
                    if (res.meta.status !== 201) {
                        return this.$message.error(res.meta.msg)
                    }
                    console.log(res)
                    // 成功提示
                    this.$message.success(res.meta.msg)
                    // 重新载入数据
                    this.getRoleInfo()
                }
            })
        },
        // 根据id 查询一条角色
        async editBind(id) {
            // 打开提示框
            this.editDialogVisible = true
            // 发送请求
            const { data: res } = await this.$http.get('roles/' + id)
            // 错误抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            // 将数据绑定给 form 表单属性
            this.editForm = res.data
        },
        // 修改角色
        editRole() {
            this.$refs.editFormRef.validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put(
                        'roles/' + this.editForm.roleId,
                        this.editForm
                    )
                    // 错误抛出异常
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    //  成功提示信息
                    this.$message.success('更新成功')
                    // 关闭弹窗
                    this.editDialogVisible = false
                    // 从新加载数据
                    this.getRoleInfo()
                }
            })
        },
        // 删除角色
        async delRole(id) {
            this.$confirm('此操作将删除该信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(async () => {
                    // 根据id删除一条角色
                    const { data: res } = await this.$http.delete('roles/' + id)
                    // 失败提示信息
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    // 成功提示信息
                    this.$message.error(res.meta.msg)
                    // 重新载入数据
                    this.getRoleInfo()
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
        },
        // 给角色分配权限 展示列表
        async roleBind(rolerow) {
            // 打开提示框
            this.roleDialogVisible = true
            // 角色表单 把整行数据填充
            this.roleForm = rolerow

            //  权限列表 菜单树
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            console.log(res)
            this.treedb = res.data

            // 该数组接 收 遍历结果
            var idArr = []
            // rolerow 当前角色 信息
            // idArr 数组
            this.getTreeCheck(rolerow, idArr)
            this.checkKey = idArr
        },
        // 递归遍历选中树节点 返回一个数组对象
        getTreeCheck(node, keys) {
            if (!node.children) {
                return keys.push(node.id)
            }
            node.children.forEach(item => {
                return this.getTreeCheck(item, keys)
            })
        },
        // 给角色分配权限
        async roleRights() {
            // 获得checkbox "全选状态” 节点的id,返回数组
            var ids1 = this.$refs.tree.getCheckedKeys()
            // 获得checkbox "半选状态" 节点的id,返回数组
            var ids2 = this.$refs.tree.getHalfCheckedKeys()
            // es6语法 三点运算符 拼接组合 对象 或 数组
            var arrId = [...ids1, ...ids2].join(',')
            // console.log(arrId)

            // 发出请求 更新当前选中节点
            const { data: res } = await this.$http.post(
                'roles/' + this.roleForm.id + '/rights',
                { rids: arrId }
            )
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            this.$message.success(res.meta.msg)
            this.roleDialogVisible = false
            this.getRoleInfo()
        },
        // 关闭权限对话框
        roleDialogClose() {}
    },
    data() {
        return {
            // 角色数据
            infodb: [],
            // 权限树数据
            treedb: [],
            // 权限树 属性
            treedbProps: {
                label: 'authName', //节点名称
                value: 'id', //ID值
                children: 'children' //上下级阶段衔接
            },
            // 选中节点 数组
            checkKey: [],
            // 新增 提示框显示状态
            addDialogVisible: false,
            // 修改 提示框显示状态
            editDialogVisible: false,
            // 给角色分配权限 显示状态
            roleDialogVisible: false,
            // 角色表单属性
            roleForm: {
                id: 0, //角色id
                roleName: '' //角色名称
            },
            // 新增表单属性
            addForm: {
                roleId: 0,
                roleName: '', //角色名称
                roleDesc: '' //角色描述
            },
            // 修改表单属性
            editForm: {
                roleId: 0,
                roleName: '', //角色名称
                roleDesc: '' //角色描述
            },
            // add表单验证
            addFormRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                roleName: [
                    {
                        required: true,
                        message: '角色名称必填项',
                        trigger: 'blur'
                    }
                ]
            },
            // edit表单验证
            editFormRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                roleName: [
                    {
                        required: true,
                        message: '角色名称必填项',
                        trigger: 'blur'
                    }
                ]
            }
        }
    }
}
</script>
  
<style lang="less" scoped>
.el-tag {
    margin: 10px 5px;
}
.el-row {
    display: flex;
    align-items: center;
}
</style>