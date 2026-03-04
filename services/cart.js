/**
 * 购物车服务
 */
const { http } = require('../utils/request.js')

const Cart = {
  /**
   * 获取购物车列表
   */
  getCartList() {
    return http.get('/api/user/cart')
  },

  /**
   * 添加到购物车
   * @param {Object} data 请求数据
   * @param {string} data.itemType 商品类型 (product/package)
   * @param {number} data.productId 商品ID
   * @param {string} data.spec 规格
   * @param {Array} data.specOptions 规格选项
   * @param {number} data.quantity 数量
   */
  addToCart(data) {
    return http.post('/api/user/cart', data)
  },

  /**
   * 更新购物车项数量
   * @param {number} id 购物车项ID (主键)
   * @param {number} quantity 数量
   */
  updateQuantity(id, quantity) {
    const body = { id, quantity }
    console.log('[Cart Service] updateQuantity - id:', id)
    console.log('[Cart Service] updateQuantity - quantity:', quantity)
    return http.put('/api/user/cart/quantity', body)
  },

  /**
   * 切换选中状态
   * @param {number} id 购物车项ID (主键)
   * @param {boolean} selected 选中状态
   */
  toggleSelected(id, selected) {
    return http.put('/api/user/cart/selected', { id, selected })
  },

  /**
   * 切换商家组选中状态
   * @param {number} merchantId 商家ID
   * @param {boolean} selected 选中状态
   */
  toggleMerchantSelected(merchantId, selected) {
    return http.put('/api/user/cart/selected/merchant', {
      merchantId,
      selected
    })
  },

  /**
   * 切换全部选中状态
   * @param {boolean} selected 选中状态
   */
  toggleAllSelected(selected) {
    return http.put('/api/user/cart/selected/all', { selected })
  },

  /**
   * 删除购物车项
   * @param {Array<number>} ids 购物车项ID数组 (主键数组)
   */
  removeItems(ids) {
    return http.post('/api/user/cart/delete', { ids })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    return http.delete('/api/user/cart')
  },

  /**
   * 获取选中的购物车项
   */
  getSelectedItems() {
    return http.get('/api/user/cart/selected')
  },

  /**
   * 获取购物车数量
   */
  getCartCount() {
    return http.get('/api/user/cart/count')
  },

  /**
   * 按商家分组获取购物车
   */
  getCartByMerchant() {
    return http.get('/api/user/cart/merchant')
  },

  /**
   * 批量添加到购物车（用于立即购买）
   * @param {Array} items 商品项数组
   */
  batchAdd(items) {
    return http.post('/api/user/cart/batch', { items })
  }
}

module.exports = Cart
