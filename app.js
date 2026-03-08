/**
 * 小程序入口文件
 */
App({
  globalData: {
    apiBaseUrl: 'http://192.168.10.229:8888', // API基础URL
    userType: '', // user | merchant
    userInfo: null,
    merchantInfo: null,
    cartCount: 0,
    // 默认头像配置
    defaultAvatar: {
      user: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGRjZCMDAiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iI0ZGRiBCQyIvPgogIDxlbGxpcHNlIGN4PSI1MCIgY3k9IjkwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI0ZGRiBCQyIvPgo8L3N2Zz4=',
      merchant: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxMCIgZmlsbD0iIzQ3QzY2MCIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjRkZGI0Ii8+CiAgPGVsbGlwc2UgY3g9IjUwIiBjeT0iOTAiIHJ4PSIzNSIgcnk9IjIwIiBmaWxsPSIjRkZGIjQiLz4KICA8dGV4dCB4PSI1MCIgeT0iNzUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkYiPuWbvueJh+WRmDwvdGV4dD4KPC9zdmc+'
    }
  },

  onLaunch(options) {
    console.log('小程序启动', options)

    // 处理扫码进入
    this.handleScene(options)

    // 获取用户类型
    const userType = wx.getStorageSync('userType') || ''
    this.globalData.userType = userType

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }

    // 获取商家信息
    const merchantInfo = wx.getStorageSync('merchantInfo')
    if (merchantInfo) {
      this.globalData.merchantInfo = merchantInfo
    }

    // 更新购物车数量
    this.updateCartCount()
  },

  onShow(options) {
    console.log('小程序显示', options)

    // 处理扫码进入（从其他页面返回时也需要处理）
    this.handleScene(options)

    // 更新购物车数量
    this.updateCartCount()
  },

  onHide() {
    console.log('小程序隐藏')
  },

  /**
   * 设置用户类型
   */
  setUserType(type) {
    this.globalData.userType = type
    wx.setStorageSync('userType', type)
  },

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  /**
   * 设置商家信息
   */
  setMerchantInfo(merchantInfo) {
    this.globalData.merchantInfo = merchantInfo
    wx.setStorageSync('merchantInfo', merchantInfo)
  },

  /**
   * 清除用户信息
   */
  clearUserInfo() {
    this.globalData.userInfo = null
    this.globalData.userType = ''
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('userType')
  },

  /**
   * 清除商家信息
   */
  clearMerchantInfo() {
    this.globalData.merchantInfo = null
    this.globalData.userType = ''
    wx.removeStorageSync('merchantInfo')
    wx.removeStorageSync('userType')
  },

  /**
   * 更新购物车数量
   */
  updateCartCount() {
    const cart = wx.getStorageSync('cart') || []
    const count = cart.reduce((total, item) => total + item.quantity, 0)
    this.globalData.cartCount = count

    // 通知 TabBar 更新
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        cartCount: count
      })
    }
  },

  /**
   * 格式化价格
   */
  formatPrice(price) {
    return (price / 100).toFixed(2)
  },

  /**
   * 格式化时间
   */
  formatTime(time) {
    if (!time) return ''
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  /**
   * 显示提示
   */
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration
    })
  },

  /**
   * 显示加载
   */
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  },

  /**
   * 隐藏加载
   */
  hideLoading() {
    wx.hideLoading()
  },

  /**
   * 显示确认对话框
   */
  showModal(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  },

  /**
   * 获取默认头像
   * @param {string} type - 'user' | 'merchant'
   */
  getDefaultAvatar(type = 'user') {
    return this.globalData.defaultAvatar[type] || this.globalData.defaultAvatar.user
  },

  /**
   * 获取用户头像（带默认值）
   * @param {string} avatar - 用户头像URL
   * @param {string} type - 'user' | 'merchant'
   */
  getAvatar(avatar, type = 'user') {
    return avatar || this.getDefaultAvatar(type)
  },

  /**
   * 处理场景参数（扫码进入）
   */
  handleScene(options) {
    if (options && options.scene) {
      console.log('[扫码进入] scene:', options.scene)

      try {
        // 解析 scene 参数，格式：merchantId:123
        const scene = decodeURIComponent(options.scene)
        console.log('[扫码进入] 解码后 scene:', scene)

        const params = this.parseScene(scene)
        console.log('[扫码进入] 解析后 params:', params)

        if (params.merchantId) {
          // 跳转到商铺详情页
          console.log('[扫码进入] 跳转到商铺详情, merchantId:', params.merchantId)

          // 延迟跳转，确保小程序已完全启动
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/user/merchant-detail/index?id=${params.merchantId}`,
              fail: (err) => {
                console.error('[扫码进入] 跳转失败:', err)
                // 如果 navigateTo 失败，尝试使用 redirectTo
                wx.redirectTo({
                  url: `/pages/user/merchant-detail/index?id=${params.merchantId}`
                })
              }
            })
          }, 100)
        }
      } catch (err) {
        console.error('[扫码进入] 处理 scene 失败:', err)
      }
    }
  },

  /**
   * 解析 scene 参数
   * 支持格式：key1:value1&key2:value2 或 key1=value1&key2=value2
   */
  parseScene(scene) {
    const params = {}

    if (!scene) {
      return params
    }

    // 按 & 分割参数对
    const pairs = scene.split('&')
    for (const pair of pairs) {
      // 尝试用 : 分割
      let parts = pair.split(':')
      if (parts.length !== 2) {
        // 如果 : 分割失败，尝试用 = 分割
        parts = pair.split('=')
      }

      if (parts.length === 2) {
        const key = parts[0].trim()
        const value = parts[1].trim()
        if (key && value) {
          params[key] = value
        }
      }
    }

    return params
  }
})
