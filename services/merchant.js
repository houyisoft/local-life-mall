// services/merchant.js
const { http } = require('../utils/request.js')

/**
 * 商铺相关API
 */
module.exports = {
  /**
   * 获取商铺类型列表
   */
  getTypes() {
    return http.get('/api/user/merchant/types', {}, { needAuth: false })
  },

  /**
   * 按类型获取商铺列表
   * @param {number} typeId 类型ID
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   */
  getMerchantsByType(typeId, page = 1, pageSize = 20) {
    return http.get('/api/user/merchants/type', { typeId, page, pageSize }, { needAuth: false })
  },

  /**
   * 获取所有商铺列表
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   */
  getMerchants(page = 1, pageSize = 20) {
    return http.get('/api/user/merchants', { page, pageSize }, { needAuth: false })
  },

  /**
   * 获取商铺详情
   * @param {number} merchantId 商铺ID
   */
  getMerchantDetail(merchantId) {
    return http.get('/api/user/merchants/detail', { merchantId }, { needAuth: false })
  },

  /**
   * 根据用户ID获取商铺详情
   * @param {number} userId 用户ID
   */
  getMerchantDetailByUserId(userId) {
    return http.get('/api/user/merchants/user', { userId }, { needAuth: false })
  },

  /**
   * 获取商铺的商品列表
   * @param {number} merchantId 商铺ID
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   */
  getMerchantProducts(merchantId, page = 1, pageSize = 20) {
    return http.get('/products', { merchantId, page, pageSize })
  }
}
