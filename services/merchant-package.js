/**
 * 商家套餐服务
 */
const { http } = require('../utils/request.js')

const MerchantPackage = {
  /**
   * 获取套餐列表
   * @param {Object} params 查询参数
   * @param {string} params.status 套餐状态
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   */
  getPackageList(params = {}) {
    const { status, page = 1, pageSize = 10 } = params
    console.log('[merchant-package] 获取套餐列表，params:', { status, page, pageSize })
    return http.get('/api/merchant/packages', { status, page, pageSize }).then(res => {
      console.log('[merchant-package] 套餐列表接口返回:', res)
      console.log('[merchant-package] 返回类型:', typeof res)
      if (res) {
        console.log('[merchant-package] 返回keys:', Object.keys(res))
      }
      return res
    }).catch(err => {
      console.error('[merchant-package] 获取套餐列表失败:', err)
      throw err
    })
  },

  /**
   * 获取套餐详情
   * @param {number} id 套餐ID
   */
  getPackageDetail(id) {
    return http.get('/api/merchant/packages/detail', { packageId: id })
  },

  /**
   * 创建套餐
   * @param {Object} data 套餐数据
   */
  createPackage(data) {
    return http.post('/api/merchant/packages', data)
  },

  /**
   * 更新套餐
   * @param {number} id 套餐ID
   * @param {Object} data 更新数据
   */
  updatePackage(id, data) {
    // 后端路由是 PUT /packages，packageId 从请求体中获取
    data.packageId = id
    return http.put('/api/merchant/packages', data)
  },

  /**
   * 删除套餐
   * @param {number} id 套餐ID
   */
  deletePackage(id) {
    return http.delete('/api/merchant/packages', { packageIds: [id] })
  },

  /**
   * 上下架套餐
   * @param {number} id 套餐ID
   * @param {string} status 状态 on_sale/sold_out
   */
  updatePackageStatus(id, status) {
    // 后端使用批量状态更新接口
    return http.put('/api/merchant/packages/status', { packageIds: [id], status })
  },

  /**
   * 获取套餐统计
   */
  getPackageStats() {
    console.log('[merchant-package] 获取套餐统计')
    return http.get('/api/merchant/packages/stats').then(res => {
      console.log('[merchant-package] 套餐统计返回:', res)
      return res
    }).catch(err => {
      console.error('[merchant-package] 获取套餐统计失败:', err)
      throw err
    })
  }
}

module.exports = MerchantPackage
