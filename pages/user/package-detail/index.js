// pages/user/package-detail/index.js
const app = getApp()
const Package = require('../../../services/package.js')
const Cart = require('../../../services/cart.js')

Page({
  data: {
    packageId: null,
    packageDetail: null,
    quantity: 1,
    cartCount: 0,
    loading: true
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ packageId: parseInt(id) })
      this.loadPackageDetail()
    }
    this.updateCartCount()
  },

  /**
   * 加载套餐详情
   */
  loadPackageDetail() {
    const { packageId } = this.data

    Package.getPackageDetail(packageId).then(pkg => {
      if (pkg) {
        this.setData({ packageDetail: pkg })
      } else {
        app.showToast('套餐不存在')
      }
      this.setData({ loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  /**
   * 增加数量
   */
  increaseQuantity() {
    const { quantity } = this.data
    this.setData({ quantity: quantity + 1 })
  },

  /**
   * 减少数量
   */
  decreaseQuantity() {
    const { quantity } = this.data
    if (quantity <= 1) {
      return
    }
    this.setData({ quantity: quantity - 1 })
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = this.data.packageDetail.images
    wx.previewImage({
      current: url,
      urls
    })
  },

  /**
   * 跳转到商品详情
   */
  goToProduct(e) {
    const productId = e.currentTarget.dataset.id
    if (productId) {
      wx.navigateTo({
        url: `/pages/user/product-detail/index?id=${productId}`
      })
    }
  },

  /**
   * 更新购物车数量
   */
  updateCartCount() {
    const count = Cart.getCartCount()
    this.setData({ cartCount: count })
  },

  /**
   * 跳转到购物车
   */
  goToCart() {
    wx.navigateTo({
      url: '/pages/user/cart/index'
    })
  },

  /**
   * 跳转到商家
   */
  async goToMerchant() {
    const { packageDetail } = this.data
    if (!packageDetail || !packageDetail.merchantId) {
      return
    }

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
      url: `/pages/user/merchant-detail/index?id=${packageDetail.merchantId}`
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
  },

  /**
   * 添加到购物车
   */
  handleAddToCart() {
    const { packageDetail, quantity } = this.data

    if (!packageDetail) {
      app.showToast('套餐信息加载中')
      return
    }

    Cart.addToCart({
      itemType: 'package',  // 重要：指定商品类型为套餐
      productId: packageDetail.id,
      quantity: quantity,
      spec: '套餐',
      specOptions: [{ name: '类型', value: '套餐' }]
    }).then(() => {
      app.showToast('已加入购物车', 'success')
      this.updateCartCount()
      app.updateCartCount()
    }).catch(err => {
      console.error('[加入购物车] 失败:', err)
      app.showToast(err.msg || '加入购物车失败')
    })
  },

  /**
   * 立即购买
   */
  handleBuyNow() {
    const { packageDetail, quantity } = this.data

    if (!packageDetail) {
      app.showToast('套餐信息加载中')
      return
    }

    // 将套餐添加到购物车并跳转到结算页
    Cart.batchAdd([{
      itemType: 'package',  // 重要：指定商品类型为套餐
      productId: packageDetail.id,
      quantity: quantity,
      spec: '套餐',
      specOptions: [{ name: '类型', value: '套餐' }]
    }]).then(() => {
      wx.navigateTo({
        url: '/pages/user/checkout/index'
      })
    }).catch(err => {
      console.error('[立即购买] 失败:', err)
      app.showToast(err.msg || '操作失败')
    })
  }
})
