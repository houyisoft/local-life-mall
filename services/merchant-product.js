/**
 * 商家商品服务
 */
const { http } = require('../utils/request.js')

const MerchantProduct = {
  /**
   * 获取商品列表（简化版，用于商品管理页面）
   * @param {string} status 商品状态
   */
  getProducts(status = null) {
    console.log('[merchant-product] 获取商品列表，status:', status)
    console.log('[merchant-product] status类型:', typeof status)
    console.log('[merchant-product] status为真?:', !!status)

    const params = {}
    // 确保只在status不是null、undefined、空字符串或'all'时才添加参数
    if (status && status !== 'all') {
      params.status = status
      console.log('[merchant-product] 设置status参数:', status)
    } else {
      console.log('[merchant-product] 不设置status参数，status:', status)
    }

    console.log('[merchant-product] 最终请求参数:', params)
    console.log('[merchant-product] 请求URL:', '/api/merchant/products')

    return http.get('/api/merchant/products', params).then(res => {
      console.log('[merchant-product] http.get返回:', res)
      console.log('[merchant-product] 返回数据类型:', typeof res)
      console.log('[merchant-product] 返回数据keys:', res ? Object.keys(res) : 'res is null/undefined')

      // http.js 解析后，res 就是 responseData.data
      // 后端返回: { code: 0, msg: "success", data: { total: 0, items: [] } }
      // http.js 会返回 data 部分，即 { total: 0, items: [] }

      if (res && res.items && Array.isArray(res.items)) {
        console.log('[merchant-product] 从res.items获取商品列表，数量:', res.items.length)
        return res.items
      }

      console.warn('[merchant-product] 数据格式不符合预期，res:', res)
      return []
    }).catch(err => {
      console.error('[merchant-product] 获取商品列表失败:', err)
      throw err
    })
  },

  /**
   * 获取商品列表
   * @param {Object} params 查询参数
   * @param {string} params.status 商品状态
   * @param {number} params.categoryId 分类ID
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   */
  getProductList(params = {}) {
    const { status, categoryId, page = 1, pageSize = 10 } = params
    return http.get('/api/merchant/products', { status, categoryId, page, pageSize })
  },

  /**
   * 获取商品详情
   * @param {number} id 商品ID
   */
  getProductDetail(id) {
    return http.get('/api/merchant/products/detail', { productId: id })
  },

  /**
   * 创建商品
   * @param {Object} data 商品数据
   */
  createProduct(data) {
    return http.post('/api/merchant/products', data)
  },

  /**
   * 更新商品
   * @param {number} id 商品ID
   * @param {Object} data 更新数据
   */
  updateProduct(id, data) {
    // 后端路由是 PUT /products，productId 从请求体中获取
    // 所以需要在 data 中添加 productId
    data.productId = id
    return http.put('/api/merchant/products', data)
  },

  /**
   * 删除商品
   * @param {number} id 商品ID
   */
  deleteProduct(id) {
    return http.delete('/api/merchant/products', { productIds: [id] })
  },

  /**
   * 批量删除商品
   * @param {Array<number>} ids 商品ID数组
   */
  batchDeleteProducts(ids) {
    return http.delete('/api/merchant/products/batch', { ids })
  },

  /**
   * 上下架商品
   * @param {number} id 商品ID
   * @param {string} status 状态 on_sale/sold_out
   */
  updateProductStatus(id, status) {
    // 后端使用批量接口，需要传递 productIds 数组
    return http.put('/api/merchant/products/status', { productIds: [id], status })
  },

  /**
   * 批量上下架
   * @param {Array<number>} ids 商品ID数组
   * @param {string} status 状态
   */
  batchUpdateStatus(ids, status) {
    return http.put('/api/merchant/products/status/batch', { ids, status })
  },

  /**
   * 获取商品分类
   */
  getCategories() {
    console.log('[merchant-product] 请求商品分类，URL:', '/api/merchant/categories')
    return http.get('/api/merchant/categories').then(res => {
      console.log('[merchant-product] 分类接口返回:', res)
      return res
    }).catch(err => {
      console.error('[merchant-product] 分类接口错误:', err)
      throw err
    })
  },

  /**
   * 创建商品分类
   * @param {Object} data 分类数据
   */
  createCategory(data) {
    return http.post('/api/merchant/categories', data)
  },

  /**
   * 获取商品统计
   */
  getProductStats() {
    return http.get('/api/merchant/products/stats')
  }
}

module.exports = MerchantProduct
