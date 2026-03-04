/**
 * 商家订单服务
 */
const { http } = require('../utils/request.js')

const MerchantOrder = {
  /**
   * 获取订单列表（简化版，用于订单管理页面）
   * @param {string} status 订单状态
   */
  getOrders(status = null) {
    console.log('[merchant-order] 获取订单列表，status:', status)
    const params = {}
    if (status) {
      params.status = status
    }

    return http.get('/api/merchant/orders', params).then(res => {
      console.log('[merchant-order] 订单列表返回:', res)
      // 后端返回格式: { code: 0, msg: "success", data: { items: [], total: 0 } }
      // http.js 已解析，res 就是 data 部分
      if (res && res.items && Array.isArray(res.items)) {
        console.log('[merchant-order] 从res.items获取订单列表，数量:', res.items.length)
        return res.items
      }
      console.warn('[merchant-order] 数据格式不符合预期，res:', res)
      return []
    }).catch(err => {
      console.error('[merchant-order] 获取订单列表失败:', err)
      throw err
    })
  },

  /**
   * 获取订单列表
   * @param {Object} params 查询参数
   * @param {string} params.status 订单状态
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   */
  getOrderList(params = {}) {
    const { status, page = 1, pageSize = 10 } = params
    return http.get('/api/merchant/orders', { status, page, pageSize })
  },

  /**
   * 获取订单详情
   * @param {string} orderNo 订单号
   */
  getOrderDetail(orderNo) {
    return http.get('/api/merchant/orders/detail', { orderNo })
  },

  /**
   * 接单
   * @param {string} orderNo 订单号
   */
  acceptOrder(orderNo) {
    return http.put('/api/merchant/orders/accept', { orderNo })
  },

  /**
   * 拒单
   * @param {string} orderNo 订单号
   * @param {string} reason 拒单原因
   */
  rejectOrder(orderNo, reason) {
    return http.put('/api/merchant/orders/reject', { orderNo, reason })
  },

  /**
   * 发货
   * @param {string} orderNo 订单号
   */
  shipOrder(orderNo) {
    return http.put('/api/merchant/orders/ship', { orderNo })
  },

  /**
   * 完成订单
   * @param {string} orderNo 订单号
   */
  completeOrder(orderNo) {
    return http.put('/api/merchant/orders/complete', { orderNo })
  },

  /**
   * 获取订单数量统计
   */
  getOrderCount() {
    return http.get('/api/merchant/orders/count')
  },

  /**
   * 获取今日订单统计
   */
  getTodayStats() {
    return http.get('/api/merchant/orders/stats/today')
  }
}

module.exports = MerchantOrder
