// pages/merchant/products/index.js
const app = getApp()
const MerchantProduct = require('../../../services/merchant-product.js')

Page({
  data: {
    activeTab: 'all',
    products: [],
    loading: false
  },

  onLoad() {
    console.log('[商品管理] 页面加载')
    this.loadProducts()
  },

  onShow() {
    console.log('[商品管理] 页面显示')
    // 页面显示时重新加载商品列表，以显示刚添加的商品
    this.loadProducts()
  },

  /**
   * 加载商品列表
   */
  loadProducts() {
    const { activeTab } = this.data
    console.log('[商品管理] 当前activeTab:', activeTab)
    console.log('[商品管理] activeTab类型:', typeof activeTab)

    const status = activeTab === 'all' ? null : activeTab

    console.log('[商品管理] 计算后的status:', status)
    console.log('[商品管理] status类型:', typeof status)
    console.log('[商品管理] 开始加载商品列表, status:', status)
    console.log('[商品管理] 当前token:', wx.getStorageSync('token') ? '存在' : '不存在')

    this.setData({ loading: true })

    MerchantProduct.getProducts(status).then(res => {
      console.log('[商品管理] 加载商品成功:', res)
      console.log('[商品管理] 商品数量:', res.length)
      console.log('[商品管理] 商品列表详情:', JSON.stringify(res))
      this.setData({
        products: res,
        loading: false
      })
    }).catch(err => {
      console.error('[商品管理] 加载商品失败:', err)
      console.error('[商品管理] 错误详情:', JSON.stringify(err))

      this.setData({ loading: false, products: [] })

      // 如果是401错误，提示用户重新登录
      if (err.code === 401) {
        wx.showModal({
          title: '提示',
          content: '登录已过期，请重新登录',
          success: (res) => {
            if (res.confirm) {
              wx.reLaunch({
                url: '/pages/auth/login/index'
              })
            }
          }
        })
        return
      }

      app.showToast(err.msg || '加载失败，请重试')
    })
  },

  /**
   * 切换Tab
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    console.log('[商品管理] 切换Tab:', tab)
    this.setData({ activeTab: tab })
    this.loadProducts()
  },

  /**
   * 添加商品
   */
  addProduct() {
    wx.navigateTo({
      url: '/pages/merchant/product-edit/index'
    })
  },

  /**
   * 编辑商品
   */
  editProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/product-edit/index?id=${id}`
    })
  },

  /**
   * 上下架
   */
  toggleStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const newStatus = status === 'on_sale' ? 'sold_out' : 'on_sale'

    wx.showModal({
      title: '提示',
      content: `确定要${newStatus === 'on_sale' ? '上架' : '下架'}该商品吗？`,
      success: (res) => {
        if (res.confirm) {
          MerchantProduct.updateProductStatus(id, newStatus).then(() => {
            app.showToast('操作成功', 'success')
            this.loadProducts()
          })
        }
      }
    })
  }
})
