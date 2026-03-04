// pages/user/home/index.js
const app = getApp()
const Merchant = require('../../../services/merchant.js')

Page({
  data: {
    // 当前位置
    location: '定位中...',
    // 搜索关键词
    searchKeyword: '',
    // 轮播图
    banners: [],
    // 商铺类型列表
    merchantTypes: [],
    // 按类型分组的商铺列表 { typeId: { type, merchants: [], hasMore: true } }
    typeMerchants: {},
    // 页面加载状态
    pageLoading: true,
    // 加载错误状态
    loadError: false,
    // 折叠状态
    collapsedSections: {}
  },

  onLoad(options) {
    this.loadData()
    this.getLocation()
  },

  onShow() {
    app.updateCartCount()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadData(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载初始数据
   */
  loadData(callback) {
    this.setData({ pageLoading: true, loadError: false })

    Promise.all([
      this.loadBanners(),
      Merchant.getTypes()
    ]).then(([bannerData, types]) => {
      console.log('[首页] 轮播图数据:', bannerData)
      console.log('[首页] 商铺类型:', types)

      // bannerData 格式是 {banners: [...]}, 需要取出 banners 数组
      const banners = bannerData.banners || []

      this.setData({
        banners,
        merchantTypes: types,
        pageLoading: false,
        loadError: false,
        typeMerchants: {},
        collapsedSections: {}
      })

      // 加载每个类型下的商铺
      if (types && types.length > 0) {
        this.loadAllTypeMerchants()
      }

      if (callback) callback()
    }).catch(err => {
      console.error('[首页] 加载失败:', err)
      this.setData({ pageLoading: false, loadError: true })
      wx.showToast({
        title: '网络加载失败',
        icon: 'none'
      })
      if (callback) callback()
    })
  },

  /**
   * 切换折叠状态
   */
  toggleSection(e) {
    const typeId = e.currentTarget.dataset.typeId
    const collapsedSections = this.data.collapsedSections
    collapsedSections[typeId] = !collapsedSections[typeId]
    this.setData({ collapsedSections })
  },

  /**
   * 点击轮播图
   */
  onBannerTap(e) {
    const link = e.currentTarget.dataset.link
    if (link) {
      wx.navigateTo({ url: link }).catch(() => {
        // 如果不是页面路径，可能是其他链接
        console.log('[首页] 跳转链接:', link)
      })
    }
  },

  /**
   * 加载轮播图（从Product服务获取）
   */
  loadBanners() {
    const Product = require('../../../services/product.js')
    return Product.getBanners()
  },

  /**
   * 加载所有类型的商铺
   */
  loadAllTypeMerchants() {
    const { merchantTypes } = this.data

    // 为每个类型加载商铺（前6个）
    merchantTypes.forEach(type => {
      this.loadTypeMerchants(type.id, 1, 6, true)
    })
  },

  /**
   * 加载指定类型的商铺
   * @param {number} typeId 类型ID
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   * @param {boolean} init 是否初始化（清空原有数据）
   */
  loadTypeMerchants(typeId, page = 1, pageSize = 6, init = false) {
    const { typeMerchants } = this.data

    // 初始化类型数据
    if (!typeMerchants[typeId]) {
      typeMerchants[typeId] = {
        type: null,
        merchants: [],
        hasMore: true,
        loading: false
      }
    }

    const typeData = typeMerchants[typeId]

    // 避免重复加载
    if (typeData.loading) return

    typeData.loading = true

    if (init) {
      typeData.merchants = []
      typeData.hasMore = true
    }

    this.setData({ typeMerchants })

    Merchant.getMerchantsByType(typeId, page, pageSize).then(res => {
      const { typeMerchants } = this.data
      const newData = typeMerchants[typeId]

      // 找到类型信息
      const type = this.data.merchantTypes.find(t => t.id === typeId)
      newData.type = type

      // 合并商铺列表
      const merchants = res.items || []
      newData.merchants = page === 1 ? merchants : [...newData.merchants, ...merchants]
      newData.hasMore = merchants.length >= pageSize
      newData.loading = false

      this.setData({ typeMerchants })
    }).catch(err => {
      console.error('[首页] 加载商铺失败:', err)
      const { typeMerchants } = this.data
      typeMerchants[typeId].loading = false
      this.setData({ typeMerchants })
    })
  },

  /**
   * 获取位置信息
   */
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 这里可以调用逆地理编码获取具体地址
        this.setData({ location: '当前位置' })
      },
      fail: () => {
        this.setData({ location: '点击定位' })
      }
    })
  },

  /**
   * 点击定位
   */
  onTapLocation() {
    wx.showToast({ title: '定位功能开发中', icon: 'none' })
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  /**
   * 跳转到搜索页
   */
  goToSearch() {
    wx.navigateTo({
      url: '/pages/user/search/index'
    })
  },

  /**
   * 点击类型图标 - 跳转到该类型的商铺列表页
   */
  onTapType(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: `/pages/user/merchant-list/index?typeId=${id}&typeName=${name}`
    })
  },

  /**
   * 点击商铺卡片 - 跳转到商铺详情
   */
  onTapMerchant(e) {
    const id = e.currentTarget.dataset.id
    console.log('[首页] 点击商铺, id:', id)
    console.log('[首页] dataset:', e.currentTarget.dataset)

    // 直接跳转到商铺详情页
    wx.navigateTo({
      url: `/pages/user/merchant-detail/index?id=${id}`
    })
  },

  /**
   * 加载更多商铺
   */
  loadMoreMerchants(e) {
    const typeId = e.currentTarget.dataset.id
    const typeData = this.data.typeMerchants[typeId]

    if (!typeData || !typeData.hasMore || typeData.loading) return

    const currentPage = Math.ceil(typeData.merchants.length / 6) + 1
    this.loadTypeMerchants(typeId, currentPage, 6, false)
  }
})
