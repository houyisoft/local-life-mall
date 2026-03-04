// pages/merchant/qrcode/index.js
const app = getApp()
const { http } = require('../../../utils/request.js')

Page({
  data: {
    merchantId: null,
    merchantInfo: null,
    qrCodeUrl: '',
    loading: false
  },

  onLoad() {
    const merchantInfo = app.globalData.merchantInfo
    if (merchantInfo && merchantInfo.id) {
      this.setData({
        merchantId: merchantInfo.id,
        merchantInfo: merchantInfo
      })
    } else {
      app.showToast('请先登录')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 生成二维码
   */
  async generateQRCode() {
    const { merchantId } = this.data

    if (!merchantId) {
      app.showToast('商家信息不存在')
      return
    }

    this.setData({ loading: true })

    try {
      // 调用后端API生成二维码
      http.post('/api/merchant/qrcode', { width: 430 }).then(res => {
        console.log('[二维码] 生成成功:', res)

        this.setData({
          qrCodeUrl: res.qrCodeUrl,
          loading: false
        })

        app.showToast('生成成功', 'success')
      }).catch(err => {
        console.error('[二维码] 生成失败:', err)
        this.setData({ loading: false })
        app.showToast(err.msg || '生成失败')
      })
    } catch (err) {
      console.error('[二维码] 生成失败:', err)
      this.setData({ loading: false })
      app.showToast('生成失败')
    }
  },

  /**
   * 保存二维码到相册
   */
  saveQRCode() {
    const { qrCodeUrl } = this.data

    if (!qrCodeUrl) {
      app.showToast('请先生成二维码')
      return
    }

    // 如果是 base64 格式，需要先保存为临时文件
    if (qrCodeUrl.startsWith('data:')) {
      this.saveBase64Image(qrCodeUrl)
    } else {
      // 普通URL，直接下载
      this.downloadImage(qrCodeUrl)
    }
  },

  /**
   * 保存 base64 图片
   */
  saveBase64Image(base64Data) {
    const base64Image = base64Data.split(',')[1]
    const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`

    wx.getFileSystemManager().writeFile({
      filePath: filePath,
      data: base64Image,
      encoding: 'base64',
      success: () => {
        this.saveToPhotosAlbum(filePath)
      },
      fail: (err) => {
        console.error('[二维码] 保存临时文件失败:', err)
        app.showToast('保存失败')
      }
    })
  },

  /**
   * 下载网络图片
   */
  downloadImage(url) {
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          this.saveToPhotosAlbum(res.tempFilePath)
        } else {
          app.showToast('下载失败')
        }
      },
      fail: (err) => {
        console.error('[二维码] 下载失败:', err)
        app.showToast('下载失败')
      }
    })
  },

  /**
   * 保存到相册
   */
  saveToPhotosAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        app.showToast('已保存到相册', 'success')
      },
      fail: (err) => {
        console.error('[二维码] 保存到相册失败:', err)
        if (err.errMsg.includes('auth deny')) {
          // 用户拒绝授权，引导用户开启权限
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        } else {
          app.showToast('保存失败')
        }
      }
    })
  },

  /**
   * 重新生成二维码
   */
  regenerateQRCode() {
    wx.showModal({
      title: '提示',
      content: '确定要重新生成二维码吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            qrCodeUrl: ''
          })
          this.generateQRCode()
        }
      }
    })
  }
})
