// pages/user/merchant-detail/index.js
const Merchant = require('../../../services/merchant.js')
const Product = require('../../../services/product.js')
const Package = require('../../../services/package.js')
const Cart = require('../../../services/cart.js')

Page({
  data: {
    merchantId: 0,
    merchant: null,
    products: [],
    packages: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    detailLoading: true,
    // 购物车相关
    cartItems: {},
    cartType: {},
    totalAmount: 0,
    totalCount: 0,
    addingCart: {}
  },

  onLoad(options) {
    const { id } = options
    console.log('[商铺详情] 接收到的参数 options:', options)
    console.log('[商铺详情] 商铺ID:', id)
    const merchantId = parseInt(id)
    console.log('[商铺详情] 解析后的 merchantId:', merchantId)
    this.setData({
      merchantId
    })
    // 先加载商铺详情，获取 userId 后再加载商品和套餐
    this.loadMerchantDetail(() => {
      // 先加载商品和套餐，完成后再加载购物车并计算合计
      this.loadProducts(() => {
        this.loadPackages(() => {
          // 商品和套餐都加载完成后再加载购物车
          this.loadCartState()
        })
      })
    })
  },

  /**
   * 页面显示时重新加载购物车状态，保持数据同步
   */
  onShow() {
    // 如果商铺数据已加载，则刷新购物车状态
    if (this.data.merchant) {
      // 先清空购物车状态
      this.setData({
        cartItems: {},
        cartType: {},
        totalAmount: 0,
        totalCount: 0
      }, () => {
        // 清空完成后再加载购物车数据，并重新计算合计
        this.loadCartState()
      })
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1, products: [], hasMore: true })
    this.loadMerchantDetail(() => {
      this.loadProducts(() => {
        wx.stopPullDownRefresh()
      })
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProducts()
    }
  },

  /**
   * 加载商铺详情
   */
  loadMerchantDetail(callback) {
    Merchant.getMerchantDetail(this.data.merchantId).then(res => {
      console.log('[商铺详情] 商铺详情数据:', res)
      console.log('[商铺详情] merchant.userId:', res.userId)
      console.log('[商铺详情] merchant.id:', res.id)

      this.setData({
        merchant: res,
        detailLoading: false
      })

      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: res.name || '商铺详情'
      })

      if (callback) callback()
    }).catch(err => {
      console.error('[商铺详情] 加载失败:', err)
      this.setData({ detailLoading: false })
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
      // 加载失败时不再调用callback，阻止后续操作
    })
  },

  /**
   * 加载商品列表
   */
  loadProducts(callback) {
    if (this.data.loading) return

    // 检查商家数据是否已加载
    if (!this.data.merchant || !this.data.merchant.userId) {
      console.error('[商铺详情] 商家数据未加载，无法加载商品')
      if (callback) callback()
      return
    }

    this.setData({ loading: true })

    // 使用商铺的 userId 来查询商品
    const merchantUserId = this.data.merchant.userId

    console.log('[商铺详情] 查询商品, merchantUserId:', merchantUserId)

    // 使用 Product 服务获取商品列表
    Product.getProductList({
      merchantId: merchantUserId,
      page: this.data.page,
      pageSize: this.data.pageSize
    }).then(data => {
      const products = data.items || []
      const hasMore = products.length >= this.data.pageSize

      this.setData({
        products: this.data.page === 1 ? products : [...this.data.products, ...products],
        hasMore,
        loading: false
      })

      console.log('[商铺详情] 商品列表:', products)
      console.log('[商铺详情] 商品ID列表:', products.map(p => ({ id: p.id, name: p.name })))

      if (callback) callback()
    }).catch(err => {
      console.error('[商品列表] 加载失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      if (callback) callback()
    })
  },

  /**
   * 加载套餐列表
   */
  loadPackages(callback) {
    // 使用商铺的 userId 来查询套餐
    // 必须使用 merchant.userId，不能用 merchantId（商家表的ID）
    if (!this.data.merchant || !this.data.merchant.userId) {
      console.error('[商铺详情] 商家数据未加载，无法加载套餐')
      if (callback) callback()
      return
    }

    const merchantUserId = this.data.merchant.userId

    console.log('[商铺详情] 查询套餐, merchantUserId:', merchantUserId)

    Package.getPackageList(merchantUserId).then(data => {
      const packages = data.items || []
      this.setData({ packages })
      console.log('[商铺详情] 套餐列表:', packages)
      if (callback) callback()
    }).catch(err => {
      console.error('[套餐列表] 加载失败:', err)
      // 套餐加载失败不影响整体使用，只记录错误
      if (callback) callback()
    })
  },

  /**
   * 加载更多商品
   */
  loadMoreProducts() {
    this.setData({
      page: this.data.page + 1
    })
    this.loadProducts()
  },

  /**
   * 点击商品卡片
   */
  onTapProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/product-detail/index?id=${id}`
    })
  },

  /**
   * 点击套餐卡片
   */
  onTapPackage(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/package-detail/index?id=${id}`
    })
  },

  /**
   * 联系商家
   */
  onContactMerchant() {
    const { merchant } = this.data
    if (!merchant) return

    wx.makePhoneCall({
      phoneNumber: merchant.contactPhone || '',
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 查看位置
   */
  onViewLocation() {
    const { merchant } = this.data
    if (!merchant) return

    // 这里可以使用地图组件查看位置
    wx.showToast({
      title: '地图功能开发中',
      icon: 'none'
    })
  },

  /**
   * 加载购物车状态
   */
  async loadCartState() {
    try {
      const cartData = await Cart.getCartByMerchant()
      // 使用商家表的ID，而不是用户表的ID
      const merchantId = this.data.merchantId

      console.log('[加载购物车] cartData:', cartData)
      console.log('[加载购物车] 当前商家ID:', merchantId)
      console.log('[加载购物车] merchant.userId:', this.data.merchant?.userId)
      console.log('[加载购物车] merchant.id:', this.data.merchant?.id)

      // cartData 是按商家分组的数组，找到当前商家的组
      const merchantGroup = cartData.find(group => group.merchantId === merchantId)

      console.log('[加载购物车] 当前商家分组:', merchantGroup)

      // 获取该商家下的所有购物车项
      const merchantCartItems = merchantGroup ? merchantGroup.items : []

      console.log('[加载购物车] 商家购物车项:', merchantCartItems)

      // 构建 cartItems 和 cartType
      const cartItems = {}
      const cartType = {}

      merchantCartItems.forEach(item => {
        const itemType = item.itemType
        const productId = item.productId
        const key = `${itemType}_${productId}`  // 使用组合key区分商品和套餐
        console.log('[加载购物车] 构建key:', key, 'itemType:', itemType, 'productId:', productId, 'quantity:', item.quantity)
        cartItems[key] = item.quantity
        cartType[key] = itemType
      })

      console.log('[加载购物车] 最终 cartItems:', cartItems)
      console.log('[加载购物车] 最终 cartType:', cartType)

      this.setData({ cartItems, cartType })
      this.calculateTotal()

    } catch (error) {
      console.error('[加载购物车] 失败:', error)
    }
  },

  /**
   * 添加到购物车
   */
  async onAddToCart(e) {
    console.log("onAddTOCart!!!!");
    const { id, type, item } = e.currentTarget.dataset
    const itemKey = `${type}_${id}`  // 使用组合key

    // 防止重复点击
    if (this.data.addingCart[itemKey]) {
      return
    }

    // 设置loading状态
    this.setData({
      [`addingCart.${itemKey}`]: true
    })

    try {
      if (type === 'product') {
        await this.addProductToCart(item)
      } else if (type === 'package') {
        await this.addPackageToCart(item)
      }

      // 更新数量 - 一次性更新，避免多次setData
      const currentCount = this.data.cartItems[itemKey] || 0
      const newCount = currentCount + 1

      this.setData({
        [`cartItems.${itemKey}`]: newCount,
        [`cartType.${itemKey}`]: type,
        [`addingCart.${itemKey}`]: false
      })

      // 重新计算总价
      this.calculateTotal()

    } catch (error) {
      console.error('[添加购物车] 失败:', error)
      this.setData({
        [`addingCart.${itemKey}`]: false
      })
      wx.showToast({
        title: error.msg || error.message || '添加失败',
        icon: 'none'
      })
    }
  },

  /**
   * 添加商品到购物车（处理规格）
   */
  async addProductToCart(product) {
    // 检查是否有规格
    if (product.specs && product.specs.length > 0) {
      // 有规格：选择第一个规格选项
      const specOptions = []
      let specText = []

      product.specs.forEach(spec => {
        const firstOption = spec.options[0]
        const optionValue = firstOption.name || firstOption
        specOptions.push({
          name: spec.name,
          value: optionValue
        })
        specText.push(`${spec.name}:${optionValue}`)
      })

      // 调用购物车服务
      await Cart.addToCart({
        itemType: "product",
        productId: product.id,
        quantity: 1,
        spec: specText.join(' '),
        specOptions: specOptions
      })

    } else {
      // 无规格：直接添加
      await Cart.addToCart({
        itemType: "product",
        productId: product.id,
        quantity: 1,
        spec: '',
        specOptions: []
      })
    }
  },

  /**
   * 添加套餐到购物车
   */
  async addPackageToCart(pkg) {
    // 套餐使用固定参数
    await Cart.addToCart({
      productId: pkg.id,
      itemType: "package",
      quantity: 1,
      spec: '套餐',
      specOptions: [{ name: '类型', value: '套餐' }]
    })
  },

  /**
   * 减少数量
   */
  async onDecreaseQuantity(e) {
    const { id, type, item } = e.currentTarget.dataset
    const itemKey = `${type}_${id}`  // 使用组合key
    const currentCount = this.data.cartItems[itemKey] || 0

    if (currentCount <= 0) {
      return
    }

    if (currentCount === 1) {
      // 数量为1时，减到0，从购物车移除
      try {
        await this.removeFromCart(parseInt(id), type)

        this.setData({
          [`cartItems.${itemKey}`]: 0
        })

        // 重新计算总价
        this.calculateTotal()

      } catch (error) {
        console.error('[移除购物车] 失败:', error)
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    } else {
      // 数量大于1，减少数量
      try {
        await this.updateCartItemQuantity(parseInt(id), currentCount - 1, type)

        this.setData({
          [`cartItems.${itemKey}`]: currentCount - 1
        })

        // 重新计算总价
        this.calculateTotal()

      } catch (error) {
        console.error('[更新数量] 失败:', error)
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    }
  },

  /**
   * 从购物车移除商品
   */
  async removeFromCart(itemId, type) {
    const cartData = await Cart.getCartByMerchant()
    const merchantId = this.data.merchant.userId || this.data.merchantId

    // 找到当前商家的组
    const merchantGroup = cartData.find(group => group.merchantId === merchantId)

    if (!merchantGroup) return

    // 在该商家的 items 中查找对应的购物车项（同时匹配 productId 和 itemType）
    const cartItem = merchantGroup.items.find(item => item.productId === itemId && item.itemType === type)

    if (cartItem) {
      await Cart.removeItems([cartItem.id])
    }
  },

  /**
   * 更新购物车项数量
   */
  async updateCartItemQuantity(itemId, newQuantity, type) {
    const cartData = await Cart.getCartByMerchant()
    const merchantId = this.data.merchant.userId || this.data.merchantId

    // 找到当前商家的组
    const merchantGroup = cartData.find(group => group.merchantId === merchantId)

    if (!merchantGroup) return

    // 在该商家的 items 中查找对应的购物车项（同时匹配 productId 和 itemType）
    const cartItem = merchantGroup.items.find(item => item.productId === itemId && item.itemType === type)

    if (cartItem) {
      await Cart.updateQuantity(cartItem.id, newQuantity)
    }
  },

  /**
   * 计算总价和总数量
   */
  calculateTotal() {
    let totalAmount = 0
    let totalCount = 0

    // 遍历 cartItems
    Object.keys(this.data.cartItems).forEach(key => {
      const count = this.data.cartItems[key]
      const type = this.data.cartType[key]

      if (count > 0) {
        // 解析 key: "product_123" 或 "package_456"
        const id = parseInt(key.split('_')[1])

        // 根据类型找到对应的商品/套餐
        let item = null
        if (type === 'product') {
          item = this.data.products.find(p => p.id == id)
        } else if (type === 'package') {
          item = this.data.packages.find(p => p.id == id)
        }

        if (item) {
          totalAmount += item.price * count
          totalCount += count
        }
      }
    })

    this.setData({
      totalAmount,
      totalCount
    })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空函数，用于阻止点击数量选择器时触发卡片跳转
  },

  /**
   * 查看购物车
   */
  onViewCart() {
    wx.navigateTo({
      url: '/pages/user/cart/index'
    })
  },

  /**
   * 去结算
   */
  onCheckout() {
    const { totalCount } = this.data

    if (totalCount === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      })
      return
    }

    // 跳转到确认订单页面
    wx.navigateTo({
      url: '/pages/user/checkout/index'
    })
  }
})
