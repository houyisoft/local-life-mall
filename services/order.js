/**
 * 订单服务（用户端）
 */
const { http } = require('../utils/request.js')

const Order = {
  /**
   * 获取订单列表
   * @param {Object} params 查询参数
   * @param {string} params.status 订单状态 (all, pending, paid, accepted, shipped, completed, cancelled)
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   */
  getOrderList(params = {}) {
    const { status = 'all', page = 1, pageSize = 10 } = params
    return http.get('/api/user/orders', { status, page, pageSize })
  },

  /**
   * 获取订单详情
   * @param {string} orderNo 订单号
   */
  getOrderDetail(orderNo) {
    return http.get('/api/user/orders/detail', { orderNo })
  },

  /**
   * 创建订单
   * @param {Object} data 订单数据
   * @param {Array} data.items 商品项
   * @param {Object} data.address 收货地址
   * @param {number} data.deliveryFee 配送费
   * @param {number} data.discount 优惠金额
   * @param {string} data.remark 备注
   */
  createOrder(data) {
    return http.post('/api/user/orders', data)
  },

  /**
   * 取消订单
   * @param {string} orderNo 订单号
   * @param {string} reason 取消原因
   */
  cancelOrder(orderNo, reason) {
    return http.post('/api/user/orders/cancel', { orderNo, reason })
  },

  /**
   * 确认收货
   * @param {string} orderNo 订单号
   */
  confirmReceipt(orderNo) {
    return http.post('/api/user/orders/confirm', { orderNo })
  },

  /**
   * 支付订单
   * @param {string} orderNo 订单号
   */
  payOrder(orderNo) {
    return http.post('/api/user/orders/pay', { orderNo })
  },

  /**
   * 获取订单状态枚举
   */
  getOrderStatusEnum() {
    return http.get('/api/user/orders/status/enum')
  },

  /**
   * 获取默认收货地址
   */
  getDefaultAddress() {
    return http.get('/api/user/address/default')
  },

  /**
   * 预览订单（从数据库重新加载最新数据并计算价格）
   * @param {Object} data 预览数据
   * @param {number} data.merchantId 商家ID
   * @param {Array} data.ids 购物车项ID列表
   */
  previewOrder(data) {
    return http.post('/api/user/orders/preview', data)
  },

  /**
   * 获取订单数量统计
   */
  getOrderCount() {
    return http.get('/api/user/orders/count')
  }
}

module.exports = Order
