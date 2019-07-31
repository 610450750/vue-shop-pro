<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!--  提示文本-->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 下拉列表 
                expand-trigger="hover"  鼠标滑过显示子级菜单 
                v-model="value"  当前显示数据
                :options="options"  级联选择器数据
                @change 当值变化时回调
                :props 给级联菜单绑定（名称，id，子级字段）
          :clearable 是否支持清空-->
          <el-cascader
            expand-trigger="hover"
            v-model="showCasdInfo"
            :options="CasdInfo"
            :props="CasdForm"
            @change="handleChange"
            :clearable="true"
          ></el-cascader>
        </el-col>
        <el-col>
          <!-- 标签选项卡  activeName：监控与设置 name="many"属性值-->
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <!-- 动态参数 -->
            <el-tab-pane label="动态参数" name="many">
              <!-- 按钮 -->
              <el-button type="primary" :disabled="btnzt" size="mini" @click="addBtn">添加参数</el-button>
              <!-- 表格 -->
              <el-table :data="paramInfo" border style="width: 100%">
                <!-- type="expand" 是否展开 -->
                <!-- 展开模板 -->
                <el-table-column type="expand">
                  <template slot-scope="info">
                    <!-- 标签 -->
                    <el-tag
                      v-for="(item,index) in info.row.attr_vals_arr"
                      :key="item+Math.random()"
                      closable
                      :disable-transitions="true"
                      @close="delTag(info.row,index)"
                    >{{item}}</el-tag>
                    <!-- 新增标签 -->
                    <el-input
                      class="input-new-tag"
                      v-if="inputVisible"
                      v-model="inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(info.row)"
                      @blur="handleInputConfirm(info.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 列信息 -->
                <el-table-column prop="attr_id" type="index" label="#" width="60"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                <el-table-column label="操作">
                  <!-- 获取参数slot-scope 回调 -->
                  <template slot-scope="parInfo">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      @click="editBind(parInfo.row)"
                    >编辑</el-button>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="delParam(parInfo.row)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 静态属性 -->
            <el-tab-pane label="静态属性" name="only">
              <!-- 按钮 -->
              <el-button type="primary" :disabled="btnzt" size="mini" @click="addBtn">添加属性</el-button>
              <!-- 表格 -->
              <el-table :data="paramInfo" border style="width: 100%">
                <!-- type="expand" 是否展开 -->
                <!-- 展开模板 -->
                <el-table-column type="expand">
                  <template slot-scope="info">
                    <!-- 标签 -->
                    <el-tag
                      v-for="(item,index) in info.row.attr_vals_arr"
                      :key="item+Math.random()"
                      closable
                      :disable-transitions="true"
                      @close="delTag(info.row,index)"
                    >{{item}}</el-tag>
                    <!-- 新增标签 -->
                    <el-input
                      class="input-new-tag"
                      v-if="inputVisible"
                      v-model="inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(info.row)"
                      @blur="handleInputConfirm(info.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 列信息 -->
                <el-table-column prop="attr_id" type="index" label="#" width="60"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                <el-table-column label="操作">
                  <!-- 获取参数slot-scope 回调 -->
                  <template slot-scope="parInfo">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      @click="editBind(parInfo.row)"
                    >编辑</el-button>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="delParam(parInfo.row)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>

      <!-- 添加参数的Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog
        :title="'添加'+dialogTitle"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="addFormRef" :rules="addFormRules" :model="addParamForm" label-width="80px">
          <el-form-item :label="'添加'+dialogTitle" prop="attr_name">
            <el-input v-model="addParamForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="addParam">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数的Dialog弹框区 -->
      <!-- :visible.sync 是否弹窗 true | false -->
      <!-- @close关闭弹框时触发 -->
      <el-dialog
        :title="'修改'+dialogTitle"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!--  rules 启用表单校验 prop 在函数中接收 input-->
        <el-form ref="editFormRef" :rules="editFormRules" :model="editParamForm" label-width="80px">
          <el-form-item :label="'修改'+dialogTitle" prop="attr_name">
            <el-input v-model="editParamForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <!-- 提交添加表单 客户端校验 与 服务端校验  -->
          <el-button type="primary" @click="editParam">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
    // 初始化
    created() {
        // 下拉列表
        this.getCasdInfo()
    },
    methods: {
        /*---------- 显示 ----------*/
        // 参数列表
        async getParamInfo() {
            const { data: res } = await this.$http.get(
                'categories/' + this.showCasdInfoId + '/attributes/',
                // 传递选项卡name属性 only：静态 many：动态
                { params: { sel: this.activeName } }
            )
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            // 遍历参数中attr_vals所有属性 通过空格分隔 遍历成数组
            res.data.forEach(item => {
                // 过滤空数组
                if (item.attr_vals == '') {
                    // 当内容为空时 创建一个空数组 不包含空格
                    return (item.attr_vals_arr = [])
                }
                // 将数组中字符串内容用空格拆分 添加到新数组中
                item.attr_vals_arr = item.attr_vals.split(' ')
            })
            console.log(res)

            this.paramInfo = res.data
        },
        // 获取下拉列表
        async getCasdInfo() {
            const { data: res } = await this.$http.get('categories', {
                params: {
                    type: 3
                }
            })
            // 报错抛出异常
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            this.CasdInfo = res.data
        },
        // 下拉列表回调函数
        handleChange() {
            // showCasdInfo[0,1,2] 回调函数独有方法
            // 可以获取当前数组中各个层级ID
            // 获取最后一级ID
            this.showCasdInfoId = this.showCasdInfo[2]
            // 最后一级ID不能为空
            if (this.showCasdInfoId) {
                // 当选中最后一级时
                // 获取参数列
                this.getParamInfo()
                // 按钮解除禁用
                this.btnzt = false
            } else {
                // 重置 下拉列表内容
                this.showCasdInfo = []
                // 重置 按钮禁用状态
                this.btnzt = true
                // 重置 参数表单数据
                this.paramInfo = []
            }
        },
        // 选项卡回调
        handleClick() {
            if (this.showCasdInfoId) {
                // 获取参数列
                this.getParamInfo()
            }
            // 判断当前选中 静态还是 动态 设置对应的弹窗 title 显示
            console.log(this.activeName)
            if (this.activeName == 'only') {
                this.dialogTitle = '属性'
            } else if (this.activeName == 'many') {
                this.dialogTitle = '参数'
            }
            //  console.log(this.dialogTitle)
        },
        // 单击切换按钮 触发
        showInput() {
            // 切换输入框
            this.inputVisible = true
            // nextTick 在vue 渲染到html 完成时设置焦点
            this.$nextTick(_ => {
                // $refs.saveTagInput 获取组件 中的$refs.input 焦点
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        /*---------- 子标签 新增和删除 ----------*/
        // 添加标签内容
        // 标签输入框 按回车和失去焦点时
        async handleInputConfirm(row) {
            if (this.inputValue.trim() != '') {
                // 将输入框内容 添加到 数组中
                row.attr_vals_arr.push(this.inputValue.trim())

                // 数组转字符串
                var newarr = row.attr_vals_arr.join(' ')
                // 修改状态 only 静态 || many 动态
                this.paramForm.attr_sel = this.activeName
                // 参数中子数组
                this.paramForm.attr_vals = newarr
                // 参数名称
                this.paramForm.attr_name = row.attr_name

                const { data: res } = await this.$http.put(
                    'categories/' + row.cat_id + '/attributes/' + row.attr_id,
                    this.paramForm
                )
                // 异常抛出
                if (res.meta.status !== 200) {
                    return this.$message.error(res.meta.msg)
                }
                console.log(res)
            }
            // 切换按钮
            this.inputVisible = false
            // 清空输入框内容
            this.inputValue = ''
        },
        // 删除标签内容
        //  row：记录ID index：当前元素中数组选中索引id
        delTag(row, index) {
            this.$confirm('此操作将删除该标签, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(async () => {
                    // 记录ID   选中数组索引id
                    // console.log(row.attr_id, index)
                    // 客户端删除
                    row.attr_vals_arr.splice(index, 1)

                    // 数组转字符串
                    var newarr = row.attr_vals_arr.join(' ')
                    // 修改状态 only 静态 || many 动态
                    this.paramForm.attr_sel = this.activeName
                    // 参数中子数组
                    this.paramForm.attr_vals = newarr
                    // 参数名称
                    this.paramForm.attr_name = row.attr_name
                    // console.log(this.paramForm)
                    // // 字符串转数组
                    // var s = 'abc,abcd,aaa'
                    // // 在每个逗号(,)处进行分解  ["abc", "abcd", "aaa"]
                    // var ss = s.split(',')
                    // //遍历数组
                    // row.attr_vals_arr.forEach(item => {
                    //     newarr += item + ' '
                    // })
                    ////截取字符串
                    // if (newarr.length > 0) {
                    //     newarr = newarr.substr(newarr.length - 1,1)
                    // }

                    // 将新参数 存入
                    // 服务端删除   (实际上做更新操作)
                    const { data: res } = await this.$http.put(
                        'categories/' +
                            row.cat_id +
                            '/attributes/' +
                            row.attr_id,
                        this.paramForm
                    )
                    // 异常抛出
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    console.log(res)
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
        },
        /*---------- 参数 增删改 ----------*/
        // 添加弹窗按钮
        addBtn() {
            this.addDialogVisible = true
        },
        //添加参数 或 属性
        addParam() {
            this.$refs.addFormRef.validate(async val => {
                if (val) {
                    // this.showCasdInfoId 最后一级分类
                    const { data: res } = await this.$http.post(
                        'categories/' + this.showCasdInfoId + '/attributes',
                        {
                            attr_name: this.addParamForm.attr_name,
                            attr_sel: this.activeName
                        }
                    )
                    // 报错抛出异常
                    if (res.meta.status !== 201) {
                        return this.$message.error(res.meta.msg)
                    }
                    console.log(res)
                    this.$message.success(res.meta.msg)
                    this.addDialogVisible = false
                    this.getParamInfo()
                }
            })
        },
        // 关闭add弹窗 事件
        addDialogClose() {
            this.$refs.addFormRef.resetFields()
        },
        // 修改初始化 显示
        editBind(row) {
            // 打开窗体
            this.editDialogVisible = true
            // 分类ID
            this.editParamForm.cat_id = row.cat_id
            // 记录ID
            this.editParamForm.attr_id = row.attr_id
            // 修改状态 only 静态 || many 动态
            this.editParamForm.attr_sel = this.activeName
            // 参数中子数组
            this.editParamForm.attr_vals = row.attr_vals
            // 参数名称
            this.editParamForm.attr_name = row.attr_name
            // 将数据填充完毕 传递给 editParamForm模型
            console.log(this.editParamForm)
        },
        // 修改参数
        editParam() {
            this.$refs.editFormRef.validate(async val => {
                if (val) {
                    const { data: res } = await this.$http.put(
                        'categories/' +
                            this.editParamForm.cat_id +
                            '/attributes/' +
                            this.editParamForm.attr_id,
                        this.editParamForm
                    )
                    // 异常抛出
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    console.log(res)

                    this.editDialogVisible = false
                    this.$message.success(res.meta.msg)
                    this.getParamInfo()
                }
            })
        },
        // 删除参数
        delParam(row) {
            this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(async () => {
                    const { data: res } = await this.$http.delete(
                        'categories/' +
                            row.cat_id +
                            '/attributes/' +
                            row.attr_id
                    )
                    // 错误抛出异常
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    this.getParamInfo()
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
        },
        // 关闭edit弹窗 事件
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        }
    },
    data() {
        return {
            // 参数列表 数据
            paramInfo: [],
            // 参数表单属性
            paramForm: {
                attr_id: 0,
                attr_name: '',
                cat_id: '',
                attr_sel: 'many',
                attr_write: 'list',
                attr_vals: []
            },
            // 新增表单属性
            addParamForm: {
                attr_name: '',
                cat_id: '',
                attr_sel: 'many',
                attr_write: 'list',
                attr_vals: ''
            },
            // 新增验证
            addFormRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                attr_name: [
                    {
                        required: true,
                        message: '参数名称为必填项',
                        trigger: 'blur'
                    }
                ]
            },
            // 修改表单属性
            editParamForm: {
                attr_name: '',
                cat_id: '',
                attr_sel: 'many',
                attr_write: 'list',
                attr_vals: []
            },
            // 修改验证
            editFormRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                attr_name: [
                    {
                        required: true,
                        message: '参数名称为必填项',
                        trigger: 'blur'
                    }
                ]
            },
            // 添加弹窗显示状态
            addDialogVisible: false,
            editDialogVisible: false,
            // 弹窗显示标题
            dialogTitle: '参数',
            // 按钮禁用状态
            btnzt: true,
            // 标签选项卡 与name值绑定 only：静态 many：动态
            activeName: 'many',
            // 下拉列表选中ID
            showCasdInfoId: 0,
            // 下拉列表选中值
            showCasdInfo: [],
            // 下拉列表值
            CasdInfo: [],
            // 级联菜数据与字段绑定
            // label-节点名称
            // value-节点值
            // children-关联字段
            CasdForm: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 按钮与输入框 切换状态
            // true：显示输入框 false：显示按钮
            inputVisible: false,
            // 输入框值
            inputValue: ''
        }
    }
}
</script>

<style lang="less" scoped>
.el-col {
    margin-top: 15px;
    .el-cascader {
        width: 260px;
    }
    .el-tag {
        margin: 10px 5px;
    }
    .input-new-tag {
        width: 200px;
    }
}
</style>