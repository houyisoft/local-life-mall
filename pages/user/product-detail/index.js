// pages/user/product-detail/index.js
const app = getApp()
const Product = require('../../../services/product.js')
const Cart = require('../../../services/cart.js')

Page({
  data: {
    productId: null,
    product: null,
    selectedSpecs: {},
    quantity: 1,
    cartCount: 0,
    loading: true
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ productId: parseInt(id) })
      this.loadProductDetail()
    }
    this.updateCartCount()
  },

  /**
   * 加载商品详情
   */
  loadProductDetail() {
    const { productId } = this.data

    Product.getProductDetail(productId).then(product => {
      if (product) {
        // 初始化默认规格选择
        const selectedSpecs = {}
        if (product.specs && product.specs.length > 0) {
          product.specs.forEach((spec, index) => {
            const option = spec.options[0]
            selectedSpecs[index] = option.name || option
          })
        }

        this.setData({ product, selectedSpecs })
      } else {
        app.showToast('商品不存在1')
      }
      this.setData({ loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  /**
   * 判断规格是否选中
   */
  isSpecSelected(specs, specIndex, option) {
    const selectedName = this.data.selectedSpecs[specIndex]
    const optionName = option.name || option
    return selectedName === optionName
  },

  /**
   * 选择规格
   */
  selectSpec(e) {
    const { specIndex, option } = e.currentTarget.dataset
    const optionName = option.name || option

    this.setData({
      [`selectedSpecs.${specIndex}`]: optionName
    })
  },

  /**
   * 增加数量
   */
  increaseQuantity() {
    const { quantity, product } = this.data
    if (quantity >= product.stock) {
      app.showToast('已达库存上限')
      return
    }
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
    const urls = this.data.product.images
    wx.previewImage({
      current: url,
      urls
    })
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
    wx.switchTab({
      url: '/pages/user/cart/index'
    })
  },

  /**
   * 跳转到商家
   */
  async goToMerchant() {
    const { product } = this.data
    if (!product || !product.merchantId) {
      app.showToast('商家信息加载中')
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
      url: `/pages/user/merchant-detail/index?id=${product.merchantId}`
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
    const { product, selectedSpecs, quantity } = this.data

    // 检查是否选择完整规格
    if (product.specs && product.specs.length > 0) {
      const selectedCount = Object.keys(selectedSpecs).length
      if (selectedCount < product.specs.length) {
        app.showToast('请选择完整规格')
        return
      }
    }

    // 构造规格选项数据
    const specOptions = []
    let specText = []

    if (product.specs && product.specs.length > 0) {
      product.specs.forEach((spec, index) => {
        const selectedValue = selectedSpecs[index]
        specOptions.push({
          name: spec.name,
          value: selectedValue
        })
        specText.push(`${spec.name}:${selectedValue}`)
      })
    }

    Cart.addToCart({
      productId: product.id,
      quantity: quantity,
      spec: specText.join(' '),
      specOptions: specOptions
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
    const { product, selectedSpecs, quantity } = this.data

    // 检查是否选择完整规格
    if (product.specs && product.specs.length > 0) {
      const selectedCount = Object.keys(selectedSpecs).length
      if (selectedCount < product.specs.length) {
        app.showToast('请选择完整规格')
        return
      }
    }

    // 构造规格选项数据
    const specOptions = []
    let specText = []

    if (product.specs && product.specs.length > 0) {
      product.specs.forEach((spec, index) => {
        const selectedValue = selectedSpecs[index]
        specOptions.push({
          name: spec.name,
          value: selectedValue
        })
        specText.push(`${spec.name}:${selectedValue}`)
      })
    }

    // 将商品添加到购物车并跳转到结算页
    Cart.batchAdd([{
      productId: product.id,
      quantity: quantity,
      spec: specText.join(' '),
      specOptions: specOptions
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
