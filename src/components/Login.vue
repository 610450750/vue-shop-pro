<template>
  <div class="loginbox">
    <div class="login">
      <!-- logo图标 -->
      <div class="logo-box">
        <img src="../assets/img/logo.png" alt="logo" class="logo" />
      </div>
      <!-- from表单 rules表单验证 -->
      <el-form ref="formRef" :model="form" :rules="formRules">
        <!-- prop 验证的数据 -->
        <el-form-item prop="username">
          <!-- input 用户名 -->
          <el-input v-model="form.username" placeholder="用户名">
            <i slot="prefix" class="icon iconfont icon-user"></i>
          </el-input>
        </el-form-item>
        <!-- input 密码 -->
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码">
            <i slot="prefix" class="icon iconfont icon-3702mima"></i>
          </el-input>
        </el-form-item>

        <!-- 布局 Layout 布局 24格 -->
        <el-row>
          <!--  offset:栅格左侧的间隔格数 -->
          <el-col :offset="15">
            <!-- button -->
            <el-button type="primary" v-on:click="login">登录</el-button>
            <el-button type="info" v-on:click="reset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                username: 'admin',
                password: '123456'
            },
            // 给登录表单设置校验规则
            formRules: {
                // requeired： 必须填写
                // message：错误信息提示
                // trigger:  检验触发器 blur 失去焦点时触发
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        login() {
            // 使用async await 来解析 Promise
            this.$refs.formRef.validate(async valid => {
                // validate 验证 不通过 为false 通过为 true
                if (valid === true) {
                    // 使用axios 发送post 请求 返回一个Promise
                    const { data: res } = await this.$http.post(
                        'login',
                        this.form
                    )
                    if (res.meta.status !== 200) {
                        return this.$message.error('用户名或密码不存在')
                    }
                    // 登录成功后 服务端会向 前端返回一个 token 校验令牌
                    // 当 token 校验令牌 消失时 应取消当前地址的访问权限 返回到登录页面进行认证
                    // 通过sessionStorage记录token
                    window.sessionStorage.setItem('token', res.data.token)
                    // 路由跳转
                    this.$router.push('/home')
                }
            })
        },
        reset() {
            // 重置表单
            this.$refs.formRef.resetFields()
        }
    }
}
</script>

<style lang="less" scoped>
.loginbox {
    height: 100%;
    background-color: #2b4b6b;
}
.login {
    height: 304px;
    width: 450px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: 4px;
    transform: translate(-50%, -50%);
    .logo-box {
        height: 130px;
        width: 130px;
        border-radius: 50%;
        box-shadow: 0px 0px 10px #eee;
        border: 1px solid #eee;
        padding: 8px;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        .logo {
            border-radius: 50%;
            background-color: #eee;
            width: 100%;
            height: 100%;
        }
    }
    .el-form {
        width: 100%;
        position: absolute;
        bottom: 0px;
        padding: 20px;
        box-sizing: border-box;
        .el-input {
            width: 100%;
        }
    }
}
</style>