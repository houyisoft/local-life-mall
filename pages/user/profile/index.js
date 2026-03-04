// pages/user/profile/index.js
const app = getApp()
const { http } = require('../../../utils/request.js')

Page({
  data: {
    userInfo: {},
    defaultAvatar: ''  // 默认头像
  },

  onLoad() {
    // 设置默认头像
    this.setData({
      defaultAvatar: app.getDefaultAvatar('user')
    })
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
    // 更新购物车数量
    app.updateCartCount()
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    http.get('/api/user/profile').then(res => {
      // 同步更新全局用户信息
      app.setUserInfo({
        avatar: res.avatar || '',
        nickname: res.nickname || '用户',
        phone: res.phone || '',
        gender: res.gender || 0
      })

      this.setData({
        userInfo: {
          avatar: res.avatar || '',
          nickname: res.nickname || '用户',
          phone: res.phone || ''
        }
      })
    }).catch(err => {
      console.error('加载用户信息失败:', err)
    })
  },

  /**
   * 跳转到订单列表
   */
  goToOrders(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab) {
      wx.navigateTo({
        url: `/pages/user/orders/index?activeTab=${tab}`
      })
    } else {
      wx.switchTab({
        url: '/pages/user/orders/index'
      })
    }
  },

  /**
   * 收货地址
   */
  goToAddress() {
    wx.navigateTo({
      url: '/pages/user/address/index'
    })
  },

  /**
   * 优惠券
   */
  goToCoupons() {
    app.showToast('优惠券中心')
  },

  /**
   * 我的积分
   */
  goToPoints() {
    app.showToast('积分明细')
  },

  /**
   * 设置 - 跳转到用户信息编辑页面
   */
  goToSettings() {
    wx.navigateTo({
      url: '/pages/user/profile/edit/index'
    })
  },

  /**
   * 退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearUserInfo()
          // 使用 reLaunch 而非 redirectTo，因为当前是 tabBar 页面
          wx.reLaunch({
            url: '/pages/auth/login/index'
          })
        }
      }
    })
  }
})
