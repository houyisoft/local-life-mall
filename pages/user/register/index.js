// pages/user/register/index.js
const app = getApp()
const { Auth } = require('../../../services/auth.js')

Page({
  data: {
    selectedRole: 'user', // user | merchant
    phone: '',
    password: '',
    nickname: '',
    loading: false
  },

  /**
   * 选择角色
   */
  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ selectedRole: role })
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  /**
   * 密码输入
   */
  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  /**
   * 昵称输入
   */
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  /**
   * 注册
   */
  async handleRegister() {
    const { selectedRole, phone, password, nickname, loading } = this.data

    if (loading) return

    // 验证角色
    if (!selectedRole) {
      app.showToast('请选择您的身份')
      return
    }

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      app.showToast('请输入正确的手机号')
      return
    }

    // 验证密码
    if (!password || password.length < 6) {
      app.showToast('密码至少6位')
      return
    }

    // 验证昵称
    if (!nickname.trim()) {
      app.showToast('请输入昵称')
      return
    }

    this.setData({ loading: true })

    try {
      // 调用注册接口（不再需要验证码参数）
      const registerResult = await Auth.register(phone, password, selectedRole)

      console.log('注册成功，返回数据:', registerResult)
      console.log('当前token:', wx.getStorageSync('token'))

      this.setData({ loading: false })

      // 保存用户类型和信息
      app.setUserType(selectedRole)
      app.setUserInfo({
        id: registerResult.userId,
        nickname: nickname,
        avatar: registerResult.avatar || '',
        phone: phone
      })

      app.showToast('注册成功，请登录', 'success')

      // 跳转到登录页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/auth/login/index'
        })
      }, 1500)
    } catch (error) {
      console.error('注册失败:', error)
      this.setData({ loading: false })

      // 显示错误信息
      const errorMsg = error.msg || error.message || '注册失败，请稍后重试'
      app.showToast(errorMsg)
    }
  },

  /**
   * 跳转到登录
   */
  goToLogin() {
    wx.navigateBack()
  }
})
