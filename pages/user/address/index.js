// pages/user/address/index.js
const Address = require('../../../services/address.js')

Page({
  data: {
    addresses: [],
    from: ''  // 'checkout' | 'profile'
  },

  onLoad(options) {
    this.setData({ from: options.from || 'profile' })
    this.loadAddresses()
  },

  onShow() {
    // 每次显示时重新加载地址列表
    this.loadAddresses()
  },

  /**
   * 加载地址列表
   */
  async loadAddresses() {
    try {
      wx.showLoading({ title: '加载中...' })
      const res = await Address.getAddressList()
      this.setData({ addresses: res.items || [] })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  /**
   * 选择地址（从结算页跳转过来）
   */
  selectAddress(e) {
    const address = e.currentTarget.dataset.address
    if (this.data.from === 'checkout') {
      // 返回结算页并传递选中的地址
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('onAddressSelected', address)
      wx.navigateBack()
    } else {
      // 其他页面跳转到地址编辑
      this.editAddress({ currentTarget: { dataset: { id: address.id } } })
    }
  },

  /**
   * 新增地址
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/user/address/edit/index',
      events: {
        onAddressSaved: () => {
          this.loadAddresses()
        }
      }
    })
  },

  /**
   * 编辑地址
   */
  editAddress(e) {
    const addressId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/address/edit/index?id=${addressId}`,
      events: {
        onAddressSaved: () => {
          this.loadAddresses()
        }
      }
    })
  },

  /**
   * 删除地址
   */
  async deleteAddress(e) {
    const addressId = e.currentTarget.dataset.id

    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗?'
    })

    if (res.confirm) {
      try {
        wx.showLoading({ title: '删除中...' })
        await Address.deleteAddress(addressId)
        wx.hideLoading()
        wx.showToast({ title: '删除成功' })
        this.loadAddresses()
      } catch (err) {
        wx.hideLoading()
        wx.showToast({ title: err.msg || '删除失败', icon: 'none' })
      }
    }
  },

  /**
   * 设置默认地址
   */
  async setDefault(e) {
    const addressId = e.currentTarget.dataset.id
    try {
      wx.showLoading({ title: '设置中...' })
      await Address.setDefaultAddress(addressId)
      wx.hideLoading()
      wx.showToast({ title: '设置成功' })
      this.loadAddresses()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.msg || '设置失败', icon: 'none' })
    }
  }
})
