/**
 * 套餐服务
 */
const { http } = require('../utils/request.js')

const Package = {
  /**
   * 获取商铺的套餐列表
   * @param {number} merchantId 商铺的userId
   * @param {number} page 页码
   * @param {number} pageSize 每页数量
   */
  getPackageList(merchantId, page = 1, pageSize = 20) {
    console.log('[获取商铺的套餐列表] 获取套餐列表, merchantId:', merchantId)
    const userId = merchantId
    return http.get('/api/user/packages', {
      userId,
      page,
      pageSize
    })
  },

  /**
   * 获取套餐详情
   * @param {number} id 套餐ID
   */
  getPackageDetail(id) {
    return http.get('/api/user/packages/detail', { packageId: id })
  }
}

module.exports = Package
