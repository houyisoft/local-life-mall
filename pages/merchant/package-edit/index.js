// pages/merchant/package-edit/index.js
const app = getApp()
const MerchantPackage = require('../../../services/merchant-package.js')
const MerchantProduct = require('../../../services/merchant-product.js')
const Upload = require('../../../services/upload.js')

Page({
  data: {
    packageId: null,
    name: '',
    desc: '',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    items: [],
    products: [],
    loading: false
  },

  onLoad(options) {
    const { id } = options
    console.log('[套餐编辑] onLoad, options:', options)

    if (id) {
      this.setData({ packageId: parseInt(id) })
      // 设置导航栏标题为编辑套餐
      wx.setNavigationBarTitle({
        title: '编辑套餐'
      })
    } else {
      // 设置导航栏标题为添加套餐
      wx.setNavigationBarTitle({
        title: '添加套餐'
      })
    }
    // 先加载商品列表，加载完成后再加载套餐详情
    this.loadProducts()
  },

  /**
   * 加载套餐详情
   */
  loadPackageDetail() {
    console.log('[套餐编辑] 开始加载套餐详情，packageId:', this.data.packageId)
    MerchantPackage.getPackageDetail(this.data.packageId).then(pkg => {
      console.log('[套餐编辑] 套餐详情返回:', pkg)
      if (pkg) {
        // 处理商品列表索引，确保 items 存在且是数组
        const pkgItems = pkg.items || []
        const items = pkgItems.map(item => ({
          ...item,
          productIndex: this.data.products.findIndex(p => p.id === item.productId)
        }))

        // 处理图片：后端返回的是 images 数组，取第一张
        const imageUrl = (pkg.images && pkg.images.length > 0) ? pkg.images[0] : ''
        console.log('[套餐编辑] 处理后的图片URL:', imageUrl)

        this.setData({
          name: pkg.name,
          desc: pkg.description,
          price: (pkg.price / 100).toFixed(2),
          originalPrice: pkg.originalPrice ? (pkg.originalPrice / 100).toFixed(2) : '',
          stock: pkg.stock,
          image: imageUrl,
          items
        })
      }
    }).catch(err => {
      console.error('[套餐编辑] 加载套餐详情失败:', err)
    })
  },

  /**
   * 加载商品列表
   */
  loadProducts() {
    console.log('[套餐编辑] 开始加载商品列表...')

    // 只获取已上架的商品
    MerchantProduct.getProducts('on_sale').then(res => {
      console.log('[套餐编辑] 商品列表返回:', res)
      // getProducts 返回的是商品数组
      const products = res || []
      console.log('[套餐编辑] 处理后的商品列表:', products)
      console.log('[套餐编辑] 商品数量:', products.length)

      this.setData({ products }, () => {
        // 商品列表加载完成后，如果是编辑套餐，再加载套餐详情
        if (this.data.packageId) {
          this.loadPackageDetail()
        }
      })
    }).catch(err => {
      console.error('[套餐编辑] 加载商品列表失败:', err)
      app.showToast(err.msg || '加载商品列表失败')
    })
  },

  /**
   * 选择图片
   */
  async chooseImage() {
    try {
      // 选择图片
      const tempFiles = await Upload.chooseImage(1)
      console.log('[套餐编辑] 选择的图片:', tempFiles)

      if (tempFiles.length === 0) return

      const tempPath = tempFiles[0]
      wx.showLoading({ title: '上传中...' })

      // 上传图片到COS
      console.log('[套餐编辑] 开始上传图片:', tempPath)
      const result = await Upload.uploadImage(tempPath, 'package')
      console.log('[套餐编辑] 上传成功:', result)

      wx.hideLoading()
      this.setData({ image: result.url })
      app.showToast('上传成功', 'success')
    } catch (err) {
      wx.hideLoading()
      console.error('[套餐编辑] 上传失败:', err)
      app.showToast(err.message || '上传失败')
    }
  },

  /**
   * 删除图片
   */
  deleteImage() {
    this.setData({ image: '' })
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onDescInput(e) { this.setData({ desc: e.detail.value }) },
  onPriceInput(e) { this.setData({ price: e.detail.value }) },
  onOriginalPriceInput(e) { this.setData({ originalPrice: e.detail.value }) },
  onStockInput(e) { this.setData({ stock: e.detail.value }) },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空方法，仅用于阻止事件冒泡
  },

  /**
   * 切换商品下拉列表显示/隐藏
   */
  toggleProductDropdown(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    // 关闭其他下拉列表
    items.forEach((item, i) => {
      if (i !== index) {
        item.showProductDropdown = false
      }
    })
    // 切换当前下拉列表
    items[index].showProductDropdown = !items[index].showProductDropdown
    this.setData({ items })
  },

  /**
   * 选择商品
   */
  selectProduct(e) {
    const itemIndex = e.currentTarget.dataset.itemIndex
    const productIndex = e.currentTarget.dataset.productIndex
    const product = this.data.products[productIndex]
    const items = [...this.data.items]
    items[itemIndex] = {
      ...items[itemIndex],
      productId: product.id,
      productName: product.name,
      productIndex,
      showProductDropdown: false
    }
    this.setData({ items })
  },

  /**
   * 添加套餐商品
   */
  addPackageItem() {
    if (this.data.items.length >= 10) {
      app.showToast('最多添加10个商品')
      return
    }
    const items = [...this.data.items, {
      productId: null,
      productName: '',
      productIndex: null,
      quantity: 1,
      spec: '',
      showProductDropdown: false
    }]
    this.setData({ items })
  },

  /**
   * 删除套餐商品
   */
  deletePackageItem(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items.splice(index, 1)
    this.setData({ items })
  },

  /**
   * 增加套餐商品数量
   */
  increaseItemQuantity(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items[index].quantity = (items[index].quantity || 1) + 1
    this.setData({ items })
  },

  /**
   * 减少套餐商品数量
   */
  decreaseItemQuantity(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    if (items[index].quantity > 1) {
      items[index].quantity = items[index].quantity - 1
      this.setData({ items })
    }
  },

  /**
   * 输入数量
   */
  onQuantityInput(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items[index].quantity = parseInt(e.detail.value) || 1
    this.setData({ items })
  },

  /**
   * 输入规格
   */
  onSpecInput(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items[index].spec = e.detail.value
    this.setData({ items })
  },

  /**
   * 提交表单
   */
  handleSubmit() {
    const { packageId, name, desc, price, originalPrice, stock, image, items, loading } = this.data

    if (loading) return

    // 验证必填项
    if (!name.trim()) {
      app.showToast('请输入套餐名称')
      return
    }

    if (!image) {
      app.showToast('请上传套餐图片')
      return
    }

    if (!price || parseFloat(price) <= 0) {
      app.showToast('请输入套餐价格')
      return
    }

    if (items.length === 0) {
      app.showToast('请添加套餐商品')
      return
    }

    // 验证商品项
    for (let i = 0; i < items.length; i++) {
      if (!items[i].productId) {
        app.showToast(`请选择第${i + 1}个商品`)
        return
      }
      if (!items[i].quantity || items[i].quantity <= 0) {
        app.showToast(`请输入第${i + 1}个商品的数量`)
        return
      }
    }

    if (stock === '' || parseInt(stock) < 0) {
      app.showToast('请输入库存数量')
      return
    }

    this.setData({ loading: true })

    const data = {
      name,
      desc,
      price: Math.round(parseFloat(price) * 100),
      originalPrice: originalPrice ? Math.round(parseFloat(originalPrice) * 100) : 0,
      stock: parseInt(stock),
      images: image ? [image] : [],  // 后端期望的是 images 数组
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        spec: item.spec
      }))
    }

    console.log('[提交表单] 最终提交的data:', JSON.stringify(data))

    const request = packageId
      ? MerchantPackage.updatePackage(packageId, data)
      : MerchantPackage.createPackage(data)

    request.then(() => {
      this.setData({ loading: false })
      app.showToast(packageId ? '修改成功' : '发布成功', 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch((err) => {
      this.setData({ loading: false })
      app.showToast(err.message || '操作失败5')
    })
  }
})
