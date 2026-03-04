// pages/merchant/home/index.js
const app = getApp()
const { http, clearToken } = require('../../../utils/request.js')

Page({
  data: {
    merchantInfo: {},
    stats: {
      todayOrders: 0,
      todaySales: 0,
      pendingOrders: 0,
      totalProducts: 0
    },
    pendingOrders: [],
    loading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  /**
   * 加载数据
   */
  async loadData() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      // 并行获取商家信息、统计数据和待处理订单
      const [merchantInfo, stats, orders] = await Promise.all([
        this.getMerchantInfo(),
        this.getTodayStats(),
        this.getPendingOrders()
      ])

      this.setData({
        merchantInfo: merchantInfo || {},
        stats: stats || this.data.stats,
        pendingOrders: orders || [],
        loading: false
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setData({ loading: false })

      // 如果是未登录，跳转到登录页
      if (error.code === 401) {
        wx.reLaunch({
          url: '/pages/auth/login/index'
        })
        return
      }

      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 获取商家信息
   */
  getMerchantInfo() {
    return http.get('/api/user/merchant/info').then(res => {
      return {
        id: res.merchantId,
        name: res.name,
        logo: res.logo,
        description: res.description,
        address: res.address,
        contactName: res.contactName,
        contactPhone: res.contactPhone,
        businessHours: res.businessHours,
        status: res.status
      }
    })
  },

  /**
   * 获取今日统计
   */
  getTodayStats() {
    return http.get('/api/merchant/orders/stats/today').then(res => {
      return {
        todayOrders: res.todayOrders || 0,
        todaySales: res.todayRevenue || 0,
        pendingOrders: res.pendingOrders || 0,
        totalProducts: res.totalProducts || 0
      }
    }).catch(() => {
      // 如果统计接口失败，返回默认值
      return {
        todayOrders: 0,
        todaySales: 0,
        pendingOrders: 0,
        totalProducts: 0
      }
    })
  },

  /**
   * 获取待处理订单
   */
  getPendingOrders() {
    return http.get('/api/merchant/orders', { status: 'paid', limit: 5 }).then(res => {
      return (res.list || []).map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalPrice: order.totalPrice,
        createTime: order.createTime,
        items: order.items || []
      }))
    }).catch(() => {
      return []
    })
  },

  /**
   * 编辑商家信息
   */
  editMerchant() {
    console.log('[商家首页] 点击编辑按钮')
    wx.switchTab({
      url: '/pages/merchant/profile/index'
    })
  },

  /**
   * 商品管理
   */
  goToProducts() {
    console.log('[商家首页] 点击商品管理')
    wx.switchTab({
      url: '/pages/merchant/products/index'
    })
  },

  /**
   * 订单管理
   */
  goToOrders() {
    console.log('[商家首页] 点击订单管理')
    wx.switchTab({
      url: '/pages/merchant/orders/index'
    })
  },

  /**
   * 套餐管理
   */
  goToPackages() {
    console.log('[商家首页] 点击套餐管理')
    wx.navigateTo({
      url: '/pages/merchant/packages/index'
    })
  },

  /**
   * 店铺设置
   */
  goToProfile() {
    console.log('[商家首页] 点击店铺设置')
    wx.switchTab({
      url: '/pages/merchant/profile/index'
    })
  },

  /**
   * 处理订单
   */
  handleOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/orders/index?orderId=${id}`
    })
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '退出中...' })

          // 检查是否有token，如果有则调用后端接口
          const token = wx.getStorageSync('token')

          const doLogout = () => {
            // 无论接口是否成功，都清除本地存储
            clearToken()
            app.clearMerchantInfo()

            wx.hideLoading()

            // 跳转到登录页
            wx.reLaunch({
              url: '/pages/auth/login/index'
            })
          }

          if (token) {
            // 有token，调用后端退出登录接口
            http.post('/api/merchant/auth/logout').then(() => {
              doLogout()
            }).catch((error) => {
              console.error('退出登录接口调用失败:', error)
              doLogout()
            })
          } else {
            // 没有token，直接退出
            doLogout()
          }
        }
      }
    })
  }
})
