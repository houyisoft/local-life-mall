// pages/user/merchant-list/index.js
const Merchant = require('../../../services/merchant.js')

Page({
  data: {
    typeId: 0,
    typeName: '',
    merchants: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    listLoading: true
  },

  onLoad(options) {
    const { typeId, typeName } = options
    this.setData({
      typeId: parseInt(typeId),
      typeName: decodeURIComponent(typeName || '')
    })

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.typeName || '精选店铺'
    })

    this.loadMerchants()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1, merchants: [], hasMore: true })
    this.loadMerchants(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreMerchants()
    }
  },

  /**
   * 加载商铺列表
   */
  loadMerchants(callback) {
    if (this.data.loading) return

    this.setData({ loading: true })

    Merchant.getMerchantsByType(this.data.typeId, this.data.page, this.data.pageSize).then(res => {
      const merchants = res.items || []
      const hasMore = merchants.length >= this.data.pageSize

      this.setData({
        merchants: this.data.page === 1 ? merchants : [...this.data.merchants, ...merchants],
        hasMore,
        loading: false,
        listLoading: false
      })

      if (callback) callback()
    }).catch(err => {
      console.error('[商铺列表] 加载失败:', err)
      this.setData({ loading: false, listLoading: false })
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
      if (callback) callback()
    })
  },

  /**
   * 加载更多
   */
  loadMoreMerchants() {
    this.setData({
      page: this.data.page + 1
    })
    this.loadMerchants()
  },

  /**
   * 点击商铺卡片
   */
  async onTapMerchant(e) {
    const id = e.currentTarget.dataset.id
    console.log('[商铺列表] 点击商铺, id:', id)

    const app = getApp()
    const userInfo = app.globalData.userInfo || {}

    // 检查用户是否绑定手机号
    if (!userInfo.phone || userInfo.phone === '') {
      // 弹出提示框引导用户完善信息
      const confirmed = await this.showPhoneBindDialog()
      if (confirmed) {
        // 用户点击确认，跳转到用户信息编辑页面
        wx.navigateTo({
          url: '/pages/user/profile/edit/index?from=merchant'
        })
      }
      return
    }

    // 已绑定手机号，正常跳转到商铺详情页
    wx.navigateTo({
      url: `/pages/user/merchant-detail/index?id=${id}`
    })
  },

  /**
   * 显示手机号绑定提示对话框
   */
  showPhoneBindDialog() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '提示',
        content: '为了更好地为您服务，请先完善个人信息并绑定手机号',
        confirmText: '去完善',
        cancelText: '暂不',
        success: (res) => {
          resolve(res.confirm)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }
})
