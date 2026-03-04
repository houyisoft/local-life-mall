/**
 * 统一网络请求封装
 * 基于微信小程序 wx.request 封装
 */

// API基础配置
const CONFIG = {
  // 开发环境使用局域网IP（微信开发者工具对localhost可能有超时限制）
  BASE_URL: 'https://www.starbigmarket.cn',
  // BASE_URL: 'http://121.4.44.153:8888',
  // BASE_URL: 'http://192.168.10.181:8888',
  // BASE_URL: 'http://127.0.0.1:8888',
  // 生产环境请替换为实际域名
  // BASE_URL: 'https://api.example.com',
  TIMEOUT: 120000  // 120秒 = 2分钟（订单接口需要更长时间）
}

// 获取存储的token
const getToken = () => {
  return wx.getStorageSync('token') || ''
}

// 保存token
const setToken = (token) => {
  wx.setStorageSync('token', token)
}

// 清除token
const clearToken = () => {
  wx.removeStorageSync('token')
}

/**
 * 网络请求封装
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址（相对路径或完整URL）
 * @param {string} options.method - 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data - 请求数据
 * @param {Object} options.params - URL查询参数（GET请求使用）
 * @param {boolean} options.needAuth - 是否需要认证，默认true
 * @param {string} options.contentType - Content-Type，默认application/json
 * @returns {Promise}
 */
const request = (options) => {
  const {
    url,
    method = 'GET',
    data = null,
    params = null,
    needAuth = true,
    contentType = 'application/json'
  } = options

  // 构建完整URL
  let fullUrl = url.startsWith('http') ? url : CONFIG.BASE_URL + url

  // 添加查询参数
  if (params) {
    console.log('[request] 原始params:', params)
    console.log('[request] params keys:', Object.keys(params))
    const query = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    console.log('[request] 生成的query字符串:', query)
    if (query) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + query
    }
    console.log('[request] 最终URL:', fullUrl)
  }

  // 构建请求头
  const header = {
    'content-type': contentType
  }

  // 添加认证token
  if (needAuth) {
    const token = getToken()
    console.log('[request] Token状态:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      url: fullUrl
    })
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('[request] 缺少token，请求可能失败:', fullUrl)
    }
  }

  console.log('[request] 发起请求:', { url: fullUrl, method: method.toUpperCase(), timeout: CONFIG.TIMEOUT })

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: method.toUpperCase(),
      data: data,
      header: header,
      timeout: CONFIG.TIMEOUT,
      success: (res) => {
        const { statusCode, data: responseData } = res

        console.log('[request] 请求成功:', { url: options.url, statusCode, responseData })

        // HTTP状态码检查
        if (statusCode >= 200 && statusCode < 300) {
          // 业务状态码检查
          // 后端返回格式：{ code: 0, msg: "success", data: ... }
          if (responseData.code === 0 || responseData.code === undefined) {
            const result = responseData.data !== undefined ? responseData.data : responseData
            console.log('[request] 解析成功，返回数据:', result)
            resolve(result)
          } else {
            // 业务错误
            console.error('[request] 业务错误:', {
              url: options.url,
              code: responseData.code,
              msg: responseData.msg
            })
            handleError(responseData)
            reject(responseData)
          }
        } else if (statusCode === 401) {
          // 未授权，清除token并跳转登录
          clearToken()
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          })
          // 可以在这里跳转到登录页
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            })
          }, 1500)
          reject({ code: 401, msg: '未授权' })
        } else if (statusCode === 403) {
          wx.showToast({
            title: '无权限访问',
            icon: 'none'
          })
          reject({ code: 403, msg: '无权限' })
        } else if (statusCode === 404) {
          wx.showToast({
            title: '请求资源不存在',
            icon: 'none'
          })
          reject({ code: 404, msg: '资源不存在' })
        } else if (statusCode >= 500) {
          wx.showToast({
            title: '服务器错误',
            icon: 'none'
          })
          reject({ code: statusCode, msg: '服务器错误' })
        } else {
          reject({ code: statusCode, msg: '请求失败', data: responseData })
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        wx.showToast({
          title: '网络请求失败1',
          icon: 'none'
        })
        reject({ code: -1, msg: '网络请求失败2', err })
      }
    })
  })
}

/**
 * 错误处理
 * @param {Object} error - 错误对象
 */
const handleError = (error) => {
  const msg = error.msg || error.message || '请求失败'
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
}

// 快捷方法
const http = {
  get: (url, params, options = {}) => {
    return request({
      url,
      method: 'GET',
      params,
      ...options
    })
  },

  post: (url, data, options = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },

  put: (url, data, options = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },

  delete: (url, data, options = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  },

  /**
   * 上传文件
   * @param {string} filePath - 本地文件路径
   * @param {string} name - 文件对应的key，默认为file
   * @param {Object} formData - 额外的表单数据
   */
  uploadFile: (filePath, name = 'file', formData = {}) => {
    return new Promise((resolve, reject) => {
      const token = getToken()
      const uploadUrl = CONFIG.BASE_URL + '/api/user/upload/image'

      console.log('[上传] 开始上传')
      console.log('[上传] URL:', uploadUrl)
      console.log('[上传] Token:', token ? '有' : '无')
      console.log('[上传] 文件路径:', filePath)

      wx.uploadFile({
        url: uploadUrl,
        filePath: filePath,
        name: name,
        formData: formData,
        timeout: CONFIG.TIMEOUT,  // 添加超时配置
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          console.log('[上传] 响应状态码:', res.statusCode)
          console.log('[上传] 响应数据:', res.data)

          if (res.statusCode !== 200) {
            reject({ code: res.statusCode, msg: `HTTP错误: ${res.statusCode}`, data: res.data })
            return
          }

          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              console.log('[上传] 成功:', data.data.url || data.data)
              resolve(data.data.url || data.data)
            } else {
              console.error('[上传] 业务错误:', data)
              handleError(data)
              reject(data)
            }
          } catch (e) {
            console.error('[上传] 解析响应失败:', e, res.data)
            reject({ code: -1, msg: '解析响应失败', data: res.data })
          }
        },
        fail: (err) => {
          console.error('[上传] 网络请求失败:', err)
          let errMsg = '上传失败'
          if (err.errMsg && err.errMsg.includes('timeout')) {
            errMsg = '上传超时，请检查网络或稍后重试'
          } else if (err.errMsg && err.errMsg.includes('fail')) {
            errMsg = '网络连接失败，请检查网络'
          }
          wx.showToast({
            title: errMsg,
            icon: 'none',
            duration: 3000
          })
          reject({ code: -1, msg: errMsg, err })
        }
      })
    })
  }
}

module.exports = {
  request,
  http,
  getToken,
  setToken,
  clearToken,
  CONFIG
}
