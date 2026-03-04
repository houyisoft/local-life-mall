// pages/merchant/product-edit/index.js
const app = getApp()
const MerchantProduct = require('../../../services/merchant-product.js')
const Upload = require('../../../services/upload.js')

Page({
  data: {
    productId: null,
    name: '',
    desc: '',
    price: '',
    originalPrice: '',
    stock: '',
    images: [],
    uploadingImages: [], // 正在上传的图片（显示加载状态）
    categories: [],
    categoryIndex: 0,
    selectedCategory: '',
    categoryId: null,
    showCategoryDropdown: false,
    specs: [],
    allTags: [
      { name: 'hot', label: '🔥 热卖', selected: false },
      { name: 'new', label: '✨ 新品', selected: false },
      { name: 'discount', label: '💰 特价', selected: false }
    ],
    selectedTags: [],
    loading: false,
    showAddCategory: false,
    newCategoryName: '',
    inputFocused: false
  },

  onLoad(options) {
    const { id } = options
    console.log('[商品编辑] onLoad, options:', options)

    if (id) {
      this.setData({ productId: parseInt(id) })
      this.loadProductDetail()
      // 设置导航栏标题为编辑商品
      wx.setNavigationBarTitle({
        title: '编辑商品'
      })
      console.log('[商品编辑] 设置标题为: 编辑商品')
    } else {
      // 新增时，默认添加一张空图片位置
      this.setData({ images: [] })
      // 设置导航栏标题为添加商品
      wx.setNavigationBarTitle({
        title: '添加商品'
      })
      console.log('[商品编辑] 设置标题为: 添加商品')
    }

    // 加载分类列表
    this.loadCategories()
  },

  onShow() {
    // onShow 时也设置一下标题，确保正确
    const title = this.data.productId ? '编辑商品' : '添加商品'
    console.log('[商品编辑] onShow, 设置标题为:', title)
    wx.setNavigationBarTitle({
      title: title
    })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空方法，仅用于阻止事件冒泡
  },

  /**
   * 防止弹窗背景滚动
   */
  preventTouchMove() {
    // 空方法，仅用于阻止弹窗下的页面滚动
  },

  /**
   * 加载商品详情
   */
  loadProductDetail() {
    MerchantProduct.getProductDetail(this.data.productId).then(product => {
      if (product) {
        const categoryIndex = this.data.categories.findIndex(c => c.id === product.categoryId)

        // 处理标签
        const allTags = this.data.allTags.map(tag => ({
          ...tag,
          selected: product.tags && product.tags.includes(tag.name)
        }))

        // 处理规格
        const specs = product.specs ? product.specs.map(spec => ({
          name: spec.name,
          options: spec.options ? spec.options.map(opt => ({ name: opt })) : []
        })) : []

        this.setData({
          name: product.name,
          desc: product.desc,
          price: (product.price / 100).toFixed(2),
          originalPrice: product.originalPrice ? (product.originalPrice / 100).toFixed(2) : '',
          stock: product.stock,
          images: product.images || [],
          categoryId: product.categoryId,
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
          selectedCategory: product.categoryName || '',
          specs,
          allTags
        })
      }
    })
  },

  /**
   * 加载分类列表
   */
  loadCategories() {
    console.log('[商品编辑] 开始加载分类列表...')
    console.log('[商品编辑] 当前token:', wx.getStorageSync('token') ? '存在' : '不存在')

    MerchantProduct.getCategories().then(res => {
      console.log('[商品编辑] 后端返回原始数据:', res)

      // 后端返回格式: { items: [...] }
      const categories = res.items || res || []
      console.log('[商品编辑] 处理后的分类列表:', categories)
      console.log('[商品编辑] 分类数量:', categories.length)

      // 打印第一个分类的详细信息
      if (categories.length > 0) {
        console.log('[商品编辑] 第一个分类:', categories[0])
      }

      this.setData({ categories })
      // 如果是新商品，设置默认分类
      if (!this.data.productId && categories.length > 0) {
        console.log('[商品编辑] 设置默认分类')
        this.setData({
          categoryId: categories[0].id,
          selectedCategory: categories[0].name,
          categoryIndex: 0
        })
      }
    }).catch(err => {
      console.error('[商品编辑] 加载分类列表失败:', err)
      console.error('[商品编辑] 错误详情:', JSON.stringify(err))

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

      app.showToast(err.msg || '加载分类失败')
    })
  },

  /**
   * 选择图片
   */
  async chooseImage() {
    const remainCount = 5 - this.data.images.length
    if (remainCount <= 0) {
      app.showToast('最多只能上传5张图片')
      return
    }

    try {
      // 选择图片
      const tempFiles = await Upload.chooseImage(remainCount)
      console.log('[商品编辑] 选择的图片:', tempFiles)

      // 添加到上传中列表（用于显示加载状态）
      const uploadingImages = tempFiles.map(path => ({
        tempPath: path,
        uploading: true
      }))
      this.setData({
        uploadingImages: [...this.data.uploadingImages, ...uploadingImages]
      })

      // 逐个上传图片
      for (let i = 0; i < tempFiles.length; i++) {
        const tempPath = tempFiles[i]
        try {
          console.log('[商品编辑] 开始上传图片:', tempPath)
          const result = await Upload.uploadImage(tempPath, 'product')
          console.log('[商品编辑] 上传成功:', result)

          // 从上传中列表移除
          const uploadingImages = this.data.uploadingImages.filter(img => img.tempPath !== tempPath)
          this.setData({ uploadingImages })

          // 添加到已上传列表
          this.setData({
            images: [...this.data.images, result.url]
          })
        } catch (err) {
          console.error('[商品编辑] 上传失败:', err)
          // 从上传中列表移除失败的
          const uploadingImages = this.data.uploadingImages.filter(img => img.tempPath !== tempPath)
          this.setData({ uploadingImages })
          app.showToast(err.message || '上传失败')
        }
      }
    } catch (err) {
      console.error('[商品编辑] 选择图片失败:', err)
    }
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onDescInput(e) { this.setData({ desc: e.detail.value }) },
  onPriceInput(e) { this.setData({ price: e.detail.value }) },
  onOriginalPriceInput(e) { this.setData({ originalPrice: e.detail.value }) },
  onStockInput(e) { this.setData({ stock: e.detail.value }) },

  /**
   * 切换分类下拉列表显示/隐藏
   */
  toggleCategoryDropdown() {
    console.log('[下拉列表] 切换状态，当前分类数量:', this.data.categories.length)
    console.log('[下拉列表] 分类数据:', this.data.categories)
    console.log('[下拉列表] 切换前状态:', this.data.showCategoryDropdown)
    this.setData({
      showCategoryDropdown: !this.data.showCategoryDropdown
    })
    console.log('[下拉列表] 切换后状态:', !this.data.showCategoryDropdown)
  },

  /**
   * 选择分类
   */
  selectCategory(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const category = this.data.categories[index]
    this.setData({
      categoryId: category.id || category.ID,
      selectedCategory: category.name || category.Name,
      categoryIndex: index,
      showCategoryDropdown: false
    })
  },

  /**
   * 打开添加分类弹窗
   */
  openAddCategory() {
    this.setData({ showAddCategory: true, newCategoryName: '' })
  },

  /**
   * 关闭添加分类弹窗
   */
  closeAddCategory() {
    // 如果输入框有焦点，不关闭弹窗
    if (this.data.inputFocused) {
      console.log('[商品编辑] 输入框有焦点，不关闭弹窗')
      return
    }
    this.setData({ showAddCategory: false, newCategoryName: '' })
  },

  /**
   * 输入新分类名称
   */
  onNewCategoryNameInput(e) {
    this.setData({ newCategoryName: e.detail.value })
  },

  /**
   * 输入框获得焦点
   */
  onInputFocus(e) {
    console.log('[商品编辑] 输入框获得焦点')
    this.setData({ inputFocused: true })
  },

  /**
   * 输入框失去焦点
   */
  onInputBlur(e) {
    console.log('[商品编辑] 输入框失去焦点')
    this.setData({ inputFocused: false })
  },

  /**
   * 确认添加分类
   */
  async confirmAddCategory() {
    const { newCategoryName } = this.data
    if (!newCategoryName.trim()) {
      app.showToast('请输入分类名称')
      return
    }

    try {
      const result = await MerchantProduct.createCategory({ name: newCategoryName.trim() })
      console.log('[商品编辑] 创建分类成功:', result)

      // 重新加载分类列表
      await this.loadCategories()

      // 选择新创建的分类（最后一个）
      const categories = this.data.categories
      console.log('[商品编辑] 当前的分类列表:', categories)

      if (categories.length > 0) {
        const newCategory = categories[categories.length - 1]
        this.setData({
          categoryId: newCategory.ID || newCategory.id,
          selectedCategory: newCategory.Name || newCategory.name,
          categoryIndex: categories.length - 1
        })
        console.log('[商品编辑] 选中新分类:', newCategory)
      }

      this.setData({ showAddCategory: false, inputFocused: false })
      app.showToast('分类添加成功', 'success')
    } catch (error) {
      console.error('[商品编辑] 创建分类失败:', error)
      app.showToast(error.msg || error.message || '添加分类失败')
    }
  },

  /**
   * 添加规格组
   */
  addSpecGroup() {
    if (this.data.specs.length >= 2) {
      app.showToast('最多添加2个规格')
      return
    }
    const specs = [...this.data.specs, { name: '', options: [] }]
    this.setData({ specs })
  },

  /**
   * 删除规格组
   */
  deleteSpecGroup(e) {
    const index = e.currentTarget.dataset.index
    const specs = [...this.data.specs]
    specs.splice(index, 1)
    this.setData({ specs })
  },

  /**
   * 规格名称输入
   */
  onSpecNameInput(e) {
    const index = e.currentTarget.dataset.index
    const specs = [...this.data.specs]
    specs[index].name = e.detail.value
    this.setData({ specs })
  },

  /**
   * 添加规格值
   */
  addSpecValue(e) {
    const index = e.currentTarget.dataset.index
    const specs = [...this.data.specs]
    if (specs[index].options.length >= 10) {
      app.showToast('最多添加10个规格值')
      return
    }
    specs[index].options.push({ name: '' })
    this.setData({ specs })
  },

  /**
   * 删除规格值
   */
  deleteSpecValue(e) {
    const { index, optionIndex } = e.currentTarget.dataset
    const specs = [...this.data.specs]
    specs[index].options.splice(optionIndex, 1)
    this.setData({ specs })
  },

  /**
   * 规格值输入
   */
  onSpecValueInput(e) {
    const { index, optionIndex } = e.currentTarget.dataset
    const specs = [...this.data.specs]
    specs[index].options[optionIndex].name = e.detail.value
    this.setData({ specs })
  },

  /**
   * 切换标签
   */
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    const allTags = this.data.allTags.map(item => {
      if (item.name === tag) {
        return { ...item, selected: !item.selected }
      }
      return item
    })
    this.setData({ allTags })
  },

  /**
   * 提交表单
   */
  handleSubmit() {
    const { productId, name, desc, price, originalPrice, stock, images, categoryId, specs, allTags, loading } = this.data

    if (loading) return

    // 验证必填项
    if (!name.trim()) {
      app.showToast('请输入商品名称')
      return
    }

    if (images.length === 0) {
      app.showToast('请上传商品图片')
      return
    }

    if (!price || parseFloat(price) <= 0) {
      app.showToast('请输入商品价格')
      return
    }

    if (!categoryId) {
      app.showToast('请选择商品分类')
      return
    }

    if (stock === '' || parseInt(stock) < 0) {
      app.showToast('请输入商品库存')
      return
    }

    // 验证规格
    for (let i = 0; i < specs.length; i++) {
      if (!specs[i].name.trim()) {
        app.showToast(`请填写第${i + 1}个规格名称`)
        return
      }
      if (specs[i].options.length === 0) {
        app.showToast(`请添加第${i + 1}个规格的规格值`)
        return
      }
      for (let j = 0; j < specs[i].options.length; j++) {
        if (!specs[i].options[j].name.trim()) {
          app.showToast(`请填写第${i + 1}个规格的第${j + 1}个规格值`)
          return
        }
      }
    }

    this.setData({ loading: true })

    // 获取选中的标签
    const selectedTags = allTags.filter(tag => tag.selected).map(tag => tag.name)

    console.log('[提交表单] 原始specs数据:', JSON.stringify(specs))
    console.log('[提交表单] specs数量:', specs.length)

    const processedSpecs = specs.map(spec => ({
      name: spec.name,
      options: spec.options.map(opt => opt.name).filter(name => name && name.trim())
    }))

    console.log('[提交表单] 处理后的specs数据:', JSON.stringify(processedSpecs))

    const data = {
      name,
      description: desc || '',  // 后端期望的是 description 字段，确保始终发送
      price: Math.round(parseFloat(price) * 100),
      originalPrice: originalPrice && originalPrice > 0 ? Math.round(parseFloat(originalPrice) * 100) : 0,  // 只有当原价大于0时才设置
      stock: parseInt(stock),
      images,
      categoryId,
      tags: selectedTags,
      specs: processedSpecs,
      status: productId ? undefined : 'on_sale'  // 新增商品时默认状态为已上架
    }

    // 如果是更新商品，且原价为0，则不发送原价字段（避免覆盖现有原价）
    if (productId && data.originalPrice === 0) {
      delete data.originalPrice
    }

    console.log('[提交表单] 最终提交的data:', JSON.stringify(data))

    // 如果是更新商品，需要在data中添加productId
    if (productId) {
      data.productId = productId
    }

    const request = productId
      ? MerchantProduct.updateProduct(productId, data)
      : MerchantProduct.createProduct(data)

    console.log('[提交表单] 开始发送请求，productId:', productId)
    console.log('[提交表单] 请求URL:', productId ? `PUT /api/merchant/products/${productId}` : 'POST /api/merchant/products')

    request.then(() => {
      console.log('[提交表单] 请求成功')
      this.setData({ loading: false })
      app.showToast(productId ? '修改成功' : '发布成功', 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch((err) => {
      console.error('[提交表单] 请求失败:', err)
      console.error('[提交表单] 错误详情:', JSON.stringify(err))
      console.error('[提交表单] 错误信息:', err.message, err.code, err.msg)
      this.setData({ loading: false })
      app.showToast(err.message || err.msg || '操作失败6')
    })
  }
})
