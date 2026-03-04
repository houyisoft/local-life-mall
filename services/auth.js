/**
 * 认证服务
 */
const { http, setToken, getToken } = require('../utils/request.js')

const Auth = {
  /**
   * 手机号登录
   * @param {string} phone 手机号
   * @param {string} password 密码
   * @param {string} userType 用户类型 user|merchant
   */
  login(phone, password, userType = 'user') {
    return http.post('/api/user/auth/login', {
      phone,
      password,
      userType
    }).then(res => {
      // 保存token
      if (res.token) {
        setToken(res.token)
      }
      return res
    })
  },

  /**
   * 用户注册
   * @param {string} phone 手机号
   * @param {string} password 密码
   * @param {string} userType 用户类型 user|merchant
   */
  register(phone, password, userType = 'user') {
    return http.post('/api/user/auth/register', {
      phone,
      password,
      userType
    }).then(res => {
      // 保存token
      if (res.token) {
        setToken(res.token)
      }
      return res
    })
  },

  /**
   * 微信登录
   * @param {object} params 登录参数
   * @param {string} params.code 微信code
   * @param {string} params.encryptedData 加密的手机号数据（可选）
   * @param {string} params.iv 加密算法初始向量（可选）
   * @param {string} params.nickname 昵称（可选）
   * @param {string} params.avatar 头像（可选）
   * @param {number} params.gender 性别（可选）
   */
  wxLogin(params) {
    return http.post('/api/user/auth/wx-login', params).then(res => {
      // 保存token
      if (res.token) {
        setToken(res.token)
      }
      return res
    })
  },

  /**
   * 刷新token
   * @param {string} token 旧token
   */
  refreshToken(token) {
    return http.post('/api/user/auth/refresh-token', {
      token
    }).then(res => {
      // 保存新token
      if (res.token) {
        setToken(res.token)
      }
      return res
    })
  },

  /**
   * 退出登录
   */
  logout() {
    return http.post('/api/user/merchant/auth/logout')
  }
}

module.exports = { Auth }
