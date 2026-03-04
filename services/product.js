/**
 * 商品服务
 */
const { http } = require('../utils/request.js')

const Product = {
  /**
   * 获取轮播图
   */
  getBanners() {
    return http.get('/api/user/banners')
  },

  /**
   * 获取分类列表
   */
  getCategories() {
    return http.get('/api/user/categories')
  },

  /**
   * 获取商品列表
   * @param {Object} params 查询参数
   * @param {number} params.merchantId 商铺ID
   * @param {number} params.categoryId 分类ID
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   * @param {string} params.keyword 搜索关键词
   * @param {string} params.sort 排序方式 (sales, price_asc, price_desc)
   */
  getProductList(params = {}) {
    console.log('[获取商品列表] 获取商品列表, params:', params)
    const { merchantId, categoryId, page = 1, pageSize = 10, keyword, sort } = params
    return http.get('/api/user/products', {
      merchantId,
      categoryId,
      page,
      pageSize,
      keyword,
      sort
    })
  },

  /**
   * 获取商品详情
   * @param {number} id 商品ID
   */
  getProductDetail(id) {
    return http.get('/api/user/products/detail', { productId: id })
  },

  /**
   * 获取推荐商品
   * @param {number} id 当前商品ID（用于排除）
   * @param {number} limit 数量
   */
  getRecommendProducts(id, limit = 4) {
    return http.get('/api/user/products/recommend', { productId: id, limit })
  },

  /**
   * 搜索商品
   * @param {string} keyword 关键词
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   */
  searchProducts(keyword, page = 1, pageSize = 10) {
    return http.get('/api/user/products/search', {
      keyword,
      page,
      pageSize
    })
  }
}

module.exports = Product
