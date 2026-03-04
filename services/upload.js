/**
 * 上传服务
 */
const { CONFIG } = require('../utils/request.js')

const Upload = {
  /**
   * 上传单张图片
   * @param {string} filePath 本地文件路径
   * @param {string} type 业务类型 (product, merchant, avatar等)
   * @param {string} userType 用户类型 (user | merchant)，默认根据当前登录用户类型自动判断
   */
  uploadImage(filePath, type = 'product', userType) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token') || ''

      // 如果没有指定用户类型，从存储中获取
      if (!userType) {
        userType = wx.getStorageSync('userType') || 'user'
      }

      // 根据用户类型选择不同的上传接口
      const apiPath = userType === 'merchant' ? '/api/merchant/upload/image' : '/api/user/upload/image'
      const uploadUrl = `${CONFIG.BASE_URL}${apiPath}?type=${type}`

      console.log('[上传服务] 开始上传')
      console.log('[上传服务] URL:', uploadUrl)
      console.log('[上传服务] Token:', token ? '有' : '无')
      console.log('[上传服务] 文件路径:', filePath)

      wx.uploadFile({
        url: uploadUrl,
        filePath,
        name: 'file',
        timeout: 120000,  // 设置超时时间为120秒
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          console.log('[上传服务] 响应状态码:', res.statusCode)
          console.log('[上传服务] 响应数据:', res.data)

          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 0) {
                console.log('[上传服务] 成功:', data.data)
                resolve(data.data)
              } else {
                console.error('[上传服务] 业务错误:', data)
                reject(new Error(data.msg || '上传失败'))
              }
            } catch (e) {
              console.error('[上传服务] 解析响应失败:', e)
              reject(new Error('解析响应失败'))
            }
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          console.error('[上传服务] 上传失败:', err)
          let errMsg = '上传失败'
          if (err.errMsg && err.errMsg.includes('timeout')) {
            errMsg = '上传超时，请检查网络或稍后重试'
          } else if (err.errMsg && err.errMsg.includes('fail')) {
            errMsg = '网络连接失败，请检查网络'
          }
          reject(new Error(errMsg))
        }
      })
    })
  },

  /**
   * 批量上传图片
   * @param {string[]} filePaths 本地文件路径数组
   * @param {string} type 业务类型
   */
  uploadImages(filePaths, type = 'product') {
    const promises = filePaths.map(filePath => this.uploadImage(filePath, type))
    return Promise.all(promises)
  },

  /**
   * 选择并上传图片
   * @param {number} count 最大选择数量
   * @param {string} type 业务类型
   */
  chooseAndUpload(count = 1, type = 'product') {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          try {
            const tempFiles = res.tempFiles.map(f => f.tempFilePath)
            const results = await this.uploadImages(tempFiles, type)
            resolve(results)
          } catch (err) {
            reject(err)
          }
        },
        fail: reject
      })
    })
  },

  /**
   * 从相册选择图片（不上传）
   * @param {number} count 最大选择数量
   */
  chooseImage(count = 1) {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          resolve(res.tempFiles.map(f => f.tempFilePath))
        },
        fail: reject
      })
    })
  }
}

module.exports = Upload
