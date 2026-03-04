/**
 * 地址服务
 */
const { http } = require('../utils/request.js')

const Address = {
  /**
   * 获取地址列表
   */
  getAddressList() {
    return http.get('/api/user/address')
  },

  /**
   * 获取地址详情
   * @param {number} id 地址ID
   */
  getAddressDetail(id) {
    return http.get(`/api/user/address/${id}`)
  },

  /**
   * 创建地址
   * @param {Object} data 地址数据
   * @param {string} data.userName 收货人
   * @param {string} data.userPhone 手机号
   * @param {string} data.province 省份
   * @param {string} data.city 城市
   * @param {string} data.district 区县
   * @param {string} data.detail 详细地址
   * @param {boolean} data.isDefault 是否默认
   */
  createAddress(data) {
    return http.post('/api/user/address', data)
  },

  /**
   * 更新地址
   * @param {number} id 地址ID
   * @param {Object} data 地址数据
   */
  updateAddress(id, data) {
    return http.put(`/api/user/address/${id}`, data)
  },

  /**
   * 删除地址
   * @param {number} id 地址ID
   */
  deleteAddress(id) {
    return http.delete(`/api/user/address/${id}`)
  },

  /**
   * 设置默认地址
   * @param {number} id 地址ID
   */
  setDefaultAddress(id) {
    return http.put(`/api/user/address/${id}/default`)
  }
}

module.exports = Address
