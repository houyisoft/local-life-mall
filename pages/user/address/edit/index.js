// pages/user/address/edit/index.js
const Address = require('../../../../services/address.js')

Page({
  data: {
    addressId: null,
    formData: {
      userName: '',
      userPhone: '',
      province: '江苏省',
      city: '盐城市',
      district: '射阳县',
      detail: '',
      isDefault: false
    },
    regionText: '江苏省盐城市射阳县'
  },

  onLoad(options) {
    // 设置页面标题
    if (options.id) {
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
      this.setData({ addressId: options.id })
      this.loadAddress(options.id)
    } else {
      wx.setNavigationBarTitle({
        title: '新增地址'
      })
    }
  },

  /**
   * 加载地址详情
   */
  async loadAddress(id) {
    try {
      wx.showLoading({ title: '加载中...' })
      const res = await Address.getAddressDetail(id)
      this.setData({
        formData: {
          userName: res.userName,
          userPhone: res.userPhone,
          province: res.province,
          city: res.city,
          district: res.district,
          detail: res.detail,
          isDefault: res.isDefault
        },
        regionText: `${res.province}${res.city}${res.district}`
      })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  /**
   * 显示地区选择器
   */
  showRegionPicker() {
    const that = this
    // 使用微信小程序的地区选择组件
    // 这里使用 picker mode="region" 的简化版本
    // 在实际项目中可以使用更完善的省市区选择器组件
    wx.showToast({
      title: '请点击下方选择器选择地区',
      icon: 'none'
    })
  },

  /**
   * 地区选择变更
   */
  onRegionChange(e) {
    const value = e.detail.value
    this.setData({
      'formData.province': value[0],
      'formData.city': value[1],
      'formData.district': value[2],
      regionText: value.join('')
    })
  },

  /**
   * 输入框变更
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  /**
   * 切换默认地址
   */
  onDefaultSwitchChange(e) {
    this.setData({
      'formData.isDefault': e.detail.value
    })
  },

  /**
   * 提交表单
   */
  async handleSubmit() {
    const { formData, addressId } = this.data

    // 表单验证
    if (!formData.userName) {
      return wx.showToast({ title: '请输入收货人', icon: 'none' })
    }
    if (!formData.userPhone) {
      return wx.showToast({ title: '请输入手机号', icon: 'none' })
    }
    if (!/^1\d{10}$/.test(formData.userPhone)) {
      return wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
    }
    if (!this.data.regionText) {
      return wx.showToast({ title: '请选择地区', icon: 'none' })
    }
    if (!formData.detail) {
      return wx.showToast({ title: '请输入详细地址', icon: 'none' })
    }

    try {
      wx.showLoading({ title: '保存中...' })

      if (addressId) {
        // 更新
        await Address.updateAddress(addressId, formData)
      } else {
        // 新增
        await Address.createAddress(formData)
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功' })

      // 通知父页面刷新
      const eventChannel = this.getOpenerEventChannel()
      if (eventChannel) {
        eventChannel.emit('onAddressSaved')
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.msg || '保存失败', icon: 'none' })
    }
  }
})
