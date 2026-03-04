// pages/merchant/register/index.js
const app = getApp()
const { http } = require('../../../utils/request.js')

Page({
  data: {
    formData: {
      typeId: 0,
      name: '',
      logo: '',
      description: '',
      address: '',
      longitude: 0,
      latitude: 0,
      contactName: '',
      contactPhone: '',
      businessHours: ''
    },
    merchantTypes: [],
    typeIndex: null,
    loading: false
  },

  onLoad() {
    this.loadMerchantTypes()
  },

  /**
   * 加载商铺类型
   */
  async loadMerchantTypes() {
    try {
      const types = await http.get('/api/user/merchant/types')
      this.setData({
        merchantTypes: types
      })
    } catch (error) {
      console.error('加载商铺类型失败:', error)
      app.showToast('加载商铺类型失败，请稍后重试')
    }
  },

  /**
   * 选择类型
   */
  onTypeChange(e) {
    const index = parseInt(e.detail.value)
    const type = this.data.merchantTypes[index]
    this.setData({
      typeIndex: index,
      'formData.typeId': type.id
    })
  },

  /**
   * 输入店铺名称
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  /**
   * 输入店铺描述
   */
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  /**
   * 输入店铺地址
   */
  onAddressInput(e) {
    this.setData({
      'formData.address': e.detail.value
    })
  },

  /**
   * 输入联系人姓名
   */
  onContactNameInput(e) {
    this.setData({
      'formData.contactName': e.detail.value
    })
  },

  /**
   * 输入联系人电话
   */
  onContactPhoneInput(e) {
    this.setData({
      'formData.contactPhone': e.detail.value
    })
  },

  /**
   * 输入营业时间
   */
  onBusinessHoursInput(e) {
    this.setData({
      'formData.businessHours': e.detail.value
    })
  },

  /**
   * 选择Logo
   */
  chooseLogo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath

        // 上传图片
        wx.showLoading({ title: '上传中...' })

        console.log('开始上传图片:', tempFilePath)
        console.log('当前token:', wx.getStorageSync('token'))

        http.uploadFile(tempFilePath).then(url => {
          wx.hideLoading()
          console.log('上传成功:', url)
          this.setData({
            'formData.logo': url
          })
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          })
        }).catch(err => {
          wx.hideLoading()
          console.error('上传失败:', err)
          const errMsg = err.msg || err.message || '上传失败'
          wx.showToast({
            title: errMsg,
            icon: 'none'
          })
        })
      }
    })
  },

  /**
   * 表单提交
   */
  async handleSubmit() {
    const { formData, loading, typeIndex } = this.data

    if (loading) return

    // 验证必填字段
    if (!formData.typeId || formData.typeId === 0) {
      app.showToast('请选择店铺类型')
      return
    }

    if (!formData.name) {
      app.showToast('请输入店铺名称')
      return
    }

    if (!formData.address) {
      app.showToast('请输入店铺地址')
      return
    }

    if (!formData.contactName) {
      app.showToast('请输入联系人姓名')
      return
    }

    if (!formData.contactPhone) {
      app.showToast('请输入联系人电话')
      return
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(formData.contactPhone)) {
      app.showToast('请输入正确的联系人电话')
      return
    }

    this.setData({ loading: true })

    try {
      // 调用商家注册接口
      const result = await http.post('/api/user/merchant/register', {
        typeId: formData.typeId,
        name: formData.name,
        logo: formData.logo,
        description: formData.description,
        address: formData.address,
        longitude: formData.longitude,
        latitude: formData.latitude,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        businessHours: formData.businessHours
      })

      this.setData({ loading: false })

      // 保存商家信息到全局
      app.setMerchantInfo({
        id: result.merchantId,
        name: formData.name,
        logo: formData.logo,
        phone: formData.contactPhone
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('自营商家注册失败:', error)
      this.setData({ loading: false })

      const errorMsg = error.msg || error.message || '注册失败，请稍后重试'
      app.showToast(errorMsg)
    }
  }
})
