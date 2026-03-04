// pages/auth/login/index.js
const app = getApp()
const { Auth } = require('../../../services/auth.js')

Page({
  data: {
    isMerchant: false, // 自营商家选项，默认不选中（用户）
    phone: '',
    password: '',
    agreed: false,
    loading: false
  },

  onLoad(options) {
    // 检查是否已登录
    const userType = app.globalData.userType
    if (userType) {
      this.redirectToHome(userType)
    }
  },

  /**
   * 切换自营商家选项
   */
  toggleMerchant() {
    this.setData({ isMerchant: !this.data.isMerchant })
    const role = this.data.isMerchant ? 'merchant' : 'user'
    console.log('切换身份:', role)
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
   * 跳转到注册页面
   */
  goToRegister() {
    wx.navigateTo({
      url: '/pages/user/register/index'
    })
  },

  /**
   * 切换协议同意
   */
  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  /**
   * 查看用户协议
   */
  viewProtocol() {
    wx.navigateTo({
      url: '/pages/common/agreement/index?type=protocol'
    })
  },

  /**
   * 查看隐私政策
   */
  viewPrivacy() {
    wx.navigateTo({
      url: '/pages/common/agreement/index?type=privacy'
    })
  },

  /**
   * 手机号登录
   */
  async handleLogin() {
    const { isMerchant, phone, password, agreed, loading } = this.data

    if (loading) return

    // 验证是否同意协议
    if (!agreed) {
      app.showToast('请先同意用户协议和隐私政策')
      return
    }

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      app.showToast('请输入正确的手机号')
      return
    }

    // 验证密码
    if (!password || password.length < 6) {
      app.showToast('请输入密码，至少6位')
      return
    }

    // 确定登录角色
    const selectedRole = isMerchant ? 'merchant' : 'user'

    this.setData({ loading: true })

    try {
      // 调用登录接口（使用密码登录）
      const loginResult = await Auth.login(phone, password, selectedRole)

      this.setData({ loading: false })

      // 保存用户类型
      app.setUserType(selectedRole)

      // 保存用户信息
      if (selectedRole === 'user') {
        app.setUserInfo({
          id: loginResult.userId,
          nickname: loginResult.nickname || '用户',
          avatar: loginResult.avatar || '',
          phone: loginResult.phone
        })

        app.showToast('登录成功', 'success')

        // 跳转到用户首页
        setTimeout(() => {
          this.redirectToHome('user')
        }, 500)
      } else {
        // 商家登录
        app.setMerchantInfo({
          id: loginResult.userId,
          name: '商家',
          logo: '',
          phone: loginResult.phone
        })

        // 判断是否首次登录商家
        if (loginResult.isFirstMerchant) {
          app.showToast('登录成功，请完善店铺信息', 'success')

          // 跳转到商家注册页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/merchant/register/index'
            })
          }, 500)
        } else {
          app.showToast('登录成功', 'success')

          // 跳转到商家首页
          setTimeout(() => {
            this.redirectToHome('merchant')
          }, 500)
        }
      }
    } catch (error) {
      console.error('登录失败:', error)
      this.setData({ loading: false })

      // 显示错误信息
      const errorMsg = error.msg || error.message || '登录失败，请稍后重试'
      app.showToast(errorMsg)
    }
  },

  /**
   * 微信登录（仅用户端可用）
   */
  async handleWechatLogin() {
    const { isMerchant, agreed } = this.data

    if (!agreed) {
      app.showToast('请先同意用户协议和隐私政策')
      return
    }

    // 自营商家不支持微信登录
    if (isMerchant) {
      app.showToast('自营商家仅支持手机号密码登录')
      return
    }

    wx.showLoading({ title: '登录中...', mask: true })

    try {
      // 获取微信code
      const loginRes = await wx.login()

      // 调用微信登录接口（不获取手机号）
      const loginResult = await Auth.wxLogin({
        code: loginRes.code,
        nickname: '',
        avatar: '',
        gender: 0
      })

      wx.hideLoading()

      // 保存用户类型（固定为用户）
      const selectedRole = 'user'
      app.setUserType(selectedRole)

      // 保存用户信息
      if (selectedRole === 'user') {
        app.setUserInfo({
          id: loginResult.userId,
          nickname: loginResult.nickname || '微信用户',
          avatar: loginResult.avatar || '',
          phone: loginResult.phone || ''
        })

        wx.showToast({ title: '登录成功', icon: 'success' })

        // 跳转到用户首页
        setTimeout(() => {
          this.redirectToHome('user')
        }, 500)
      } else {
        // 商家登录
        app.setMerchantInfo({
          id: loginResult.userId,
          name: '微信商家',
          logo: loginResult.avatar || '',
          phone: loginResult.phone || ''
        })

        // 判断是否首次登录商家
        if (loginResult.isFirstMerchant) {
          wx.showToast({ title: '登录成功，请完善店铺信息', icon: 'success' })

          // 跳转到商家注册页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/merchant/register/index'
            })
          }, 500)
        } else {
          wx.showToast({ title: '登录成功', icon: 'success' })

          // 跳转到商家首页
          setTimeout(() => {
            this.redirectToHome('merchant')
          }, 500)
        }
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      wx.hideLoading()

      // 显示错误信息
      const errorMsg = error.msg || error.message || '登录失败，请稍后重试'
      app.showToast(errorMsg)
    }
  },

  /**
   * 支付宝登录
   */
  handleAlipayLogin() {
    app.showToast('暂不支持支付宝登录')
  },

  /**
   * 跳转到首页
   */
  redirectToHome(userType) {
    wx.switchTab({
      url: userType === 'user' ? '/pages/user/home/index' : '/pages/merchant/home/index'
    })
  }
})
