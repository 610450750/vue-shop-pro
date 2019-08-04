<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: 'goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 控制当前 选中步骤 下标从0开始  数值类型 activeName-0强制类型转换 -->
      <el-steps :active="activeName-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签选项页  字符串类型-->
      <el-tabs v-model="activeName" tab-position="left" @tab-click="handleClick">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="0">
          <el-form ref="basicInfoRef" :rules="basicInfoRules" :model="basicInfo">
            <el-form-item label="商品名称" prop="goods_name" label-width="100px">
              <el-input v-model="basicInfo.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" label-width="100px">
              <el-input-number
                v-model="basicInfo.goods_price"
                controls-position="right"
                :precision="0"
                :min="0"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" label-width="100px">
              <el-input-number
                label
                v-model="basicInfo.goods_number"
                controls-position="right"
                :precision="0"
                :min="0"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" label-width="100px">
              <el-input-number
                v-model="basicInfo.goods_weight"
                controls-position="right"
                :precision="1"
                :min="0"
              ></el-input-number>
            </el-form-item>
            <!-- 商品分类 -->
            <el-form-item label="商品分类" prop="showCatInfo" label-width="100px">
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
                :options="catInfos"
                :props="selCatForm"
                @change="handleChange"
                :clearable="true"
              ></el-cascader>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- 商品参数 -->
        <el-tab-pane label="商品参数" name="1">
          <el-row :data="paramInfo" v-for="(item1) in paramInfo" :key="item1+Math.random()">
            <el-col
              :span="2"
              style="text-align:right;font-size:14px;padding:10px;color:#666"
            >{{item1.attr_name}}</el-col>
            <el-col :span="22">
              <el-row>
                <el-col>
                  <el-checkbox
                    :checked="true"
                    v-for="(item2) in item1.attr_vals_arr"
                    :key="item2+Math.random()"
                    :label="item2"
                    border
                  ></el-checkbox>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-tab-pane>
        <!-- 商品属性 -->
        <el-tab-pane label="商品属性" name="2">
          <el-form ref="attrInfoRef">
            <el-form-item
              :data="attrInfo"
              v-for="item in attrInfo"
              :key="item+Math.random()"
              :label="item.attr_name"
              label-width="150px"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!-- 
            action 上传api 接口 
            :on-preview="handlePreview" //图片预览回调处理
            :on-remove="handleRemove" //图片删除回调处理
            :on-success="uploadSuccess"//图片上传成功回调
            :file-list="fileList"               //默认图片列表数据
            list-type="picture"               //图片已指定格式显示（text/picture/picture-card）
            headers="uploadParams"      //设置http 请求头信息 设置安全令牌
          -->
          <el-upload
            class="upload-demo"
            action="http://127.0.0.1:8888/api/private/v1/upload"
            list-type="picture"
            :headers="uploadParams"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="uploadSuccess"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <!-- 富文本编辑器（双向数据绑定） -->
          <quill-editor v-model="basicInfo.goods_introduce" ref="myQuillEditor"></quill-editor>
          <el-button size="small" type="primary" @click="addGoods" style="margin-top:10px">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
// 富文本编辑器 样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 富文本编辑器
import { quillEditor } from 'vue-quill-editor'
export default {
    // 注册组件
    components: {
        quillEditor
    },
    created() {
        this.getCatInfo()
    },
    methods: {
        // 添加商品
        async addGoods() {
            // 数据集合
            console.log(this.basicInfo)
            const { data: res } = await this.$http.post('goods', this.basicInfo)
            if (res.meta.status !== 201) {
                this.$message.error(res.meta.msg)
            }
            this.$message.success(res.meta.msg)
            this.$router.push('goods')
        },
        // 图片上传成功回调
        uploadSuccess(result) {
            if (result.meta.status !== 200) {
                return this.$message.error(result.meta.msg)
            }
            // 将图片路径 添加到数组中
            this.basicInfo.pics.push(result.data.tmp_path)
        },
        //图片删除回调处理
        handleRemove() {},
        //图片预览回调处理
        handlePreview() {},
        // 选项卡标签 回调函数
        handleClick() {
            // 选中项
            // console.log(this.activeName)
        },
        // 参数或属性 列表
        async getParamInfo(name) {
            const { data: res } = await this.$http.get(
                // showCasdInfoId选中分类id
                'categories/' + this.showCasdInfoId + '/attributes/',
                // 传递选项卡name属性 only：静态 many：动态
                { params: { sel: name } }
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
            console.log(res.data)
            if (name == 'many') {
                console.log('请求参数：')
                this.paramInfo = res.data
                // 将参数 传递到数组中
                this.basicInfo.attrs = res.data
            } else if (name == 'only') {
                console.log('请求属性:')
                // 将属性 传递到数组中
                this.attrInfo = res.data
                // 使用三点 运算符 将两个数组合并
                this.basicInfo.attrs = [...this.basicInfo.attrs, ...res.data]
            }
        },
        // 获取分类列表
        async getCatInfo() {
            // 获取 树菜单列表
            const { data: res } = await this.$http.get('categories', {
                params: {
                    type: 3 //分类
                }
            })
            console.log(res)
            this.catInfos = res.data
        },
        //下拉列表回调
        handleChange() {
            // 获取 各个层级 ID this.showCatInfo[0,1,2]
            if (this.showCatInfo[2] == undefined) {
                // 如果选中的不是最后一级 则清空
                this.showCatInfo = ''
                this.showCasdInfoId = 0
                this.basicInfo.goods_cat = ''
            } else {
                this.showCasdInfoId = this.showCatInfo[2]
                this.basicInfo.goods_cat =
                    this.showCatInfo[0] +
                    ',' +
                    this.showCatInfo[1] +
                    ',' +
                    this.showCatInfo[2]
            }

            // 初始化清空 参数
            this.basicInfo.attrs = []

            // 根据 最后一级分类id 查询商品参数
            this.getParamInfo('many')
            // 根据 最后一级分类id 查询商品属性
            this.getParamInfo('only')
        }
    },
    data() {
        return {
            // 向服务端请求 设置http头 加入 token 安全令牌
            uploadParams: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 上传图片默认显示 数据
            fileList: [
                // {
                //     name: 'food.jpeg',
                //     url:
                //         'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
                // },
                // {
                //     name: 'food2.jpeg',
                //     url:
                //         'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
                // }
            ],
            //选中选项卡与步骤条 同源双向绑定
            activeName: '0',
            // 设置级联菜单数据
            // 一二级别的数据
            catInfos: [],
            // 选中分类 最后一级 id
            showCasdInfoId: 0,
            // 参数列表 数据
            paramInfo: [],
            // 属性列表 数据
            attrInfo: [],
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
            // 基本信息
            basicInfo: {
                goods_id: 0, //商品ID
                goods_name: '', //商品名称
                goods_cat: '', //商品分类 格式 1,2,3
                goods_price: undefined, //价格
                goods_number: undefined, //数量
                goods_weight: undefined, //重量
                goods_introduce: '', //介绍
                pics: [], //上传图片临时路径（数组）
                attrs: [] //商品的参数（数组），包含 `动态参数` 和 `静态属性`
            },
            // 基本信息验证
            basicInfoRules: {
                // required 必填 message 提示信息 trigger 失去焦点触发
                goods_name: [
                    {
                        required: true,
                        message: '商品名称为必填项',
                        trigger: 'blur'
                    }
                ],
                goods_price: [
                    {
                        required: true,
                        message: '商品名价格为必填项',
                        trigger: 'blur'
                    }
                ],
                goods_number: [
                    {
                        required: true,
                        message: '商品数量为必填项',
                        trigger: 'blur'
                    }
                ],
                goods_weight: [
                    {
                        required: true,
                        message: '商品重量为必填项',
                        trigger: 'blur'
                    }
                ],
                showCatInfo: [
                    {
                        required: true,
                        message: '商品分类为必填项',
                        trigger: 'blur'
                    }
                ]
            }
        }
    }
}
</script>

<style lang="less" scoped>
.el-tabs {
    margin-top: 20px;
    .el-input-number {
        width: 100%;
    }
    .el-checkbox {
        margin-right: 0px;
        margin-bottom: 5px;
    }
}
</style>