// pages/user/search/index.js
const app = getApp()
const Product = require('../../../services/product.js')

Page({
  data: {
    keyword: '',
    searched: false,
    products: [],
    history: [],
    hotSearch: [],
    loading: false
  },

  onLoad() {
    this.loadSearchData()
  },

  /**
   * 加载搜索数据
   */
  loadSearchData() {
    // 从本地存储获取搜索历史
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ history })
  },

  /**
   * 输入
   */
  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  /**
   * 搜索
   */
  onSearch() {
    const { keyword } = this.data
    if (!keyword.trim()) {
      app.showToast('请输入搜索关键词')
      return
    }

    this.performSearch(keyword)

    // 保存到搜索历史
    let history = this.data.history
    const index = history.indexOf(keyword)
    if (index > -1) {
      history.splice(index, 1)
    }
    history.unshift(keyword)
    history = history.slice(0, 10)
    this.setData({ history })
    // 保存到本地存储
    wx.setStorageSync('searchHistory', history)
  },

  /**
   * 执行搜索
   */
  performSearch(keyword) {
    this.setData({ loading: true, searched: true })

    Product.searchProducts(keyword).then(res => {
      this.setData({
        products: res.list,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  /**
   * 清空输入
   */
  onClear() {
    this.setData({ keyword: '' })
  },

  /**
   * 取消
   */
  onCancel() {
    wx.navigateBack()
  },

  /**
   * 搜索历史
   */
  searchHistory(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.onSearch()
  },

  /**
   * 热门搜索
   */
  searchHot(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.onSearch()
  },

  /**
   * 清空历史
   */
  clearHistory() {
    this.setData({ history: [] })
    wx.removeStorageSync('searchHistory')
  },

  /**
   * 跳转到商品详情
   */
  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/product-detail/index?id=${id}`
    })
  }
})
