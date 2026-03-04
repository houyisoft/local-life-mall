// pages/merchant/profile/index.js
const app = getApp()
const { http } = require('../../../utils/request.js')

Page({
  data: {
    merchantInfo: {},
    merchantTypes: [],
    typeIndex: 0,
    showTypeDropdown: false,
    loading: false,
    defaultAvatar: '',  // 默认头像
    businessHours: {
      isOpen: false,      // 营业状态：true-营业中，false-休息中
      openTime: '09:00',   // 开始时间
      closeTime: '22:00',  // 结束时间
      notice: ''           // 营业提示
    }
  },

  onLoad() {
    // 设置默认头像
    this.setData({
      defaultAvatar: app.getDefaultAvatar('merchant')
    })
    this.loadData()
    this.loadMerchantTypes()
  },

  onShow() {
    this.loadData()
  },

  /**
   * 加载商家信息
   */
  async loadData() {
    try {
      const res = await http.get('/api/user/merchant/info')
      console.log('[商家设置] 获取商家信息成功:', res)
      console.log('[商家设置] logo:', res.logo)

      // 根据 status 设置营业状态开关
      const isOpen = res.status === 'active'

      this.setData({
        merchantInfo: {
          id: res.merchantId,
          name: res.name || '',
          logo: res.logo || '',
          description: res.description || '',
          address: res.address || '',
          longitude: res.longitude || 0,
          latitude: res.latitude || 0,
          contactName: res.contactName || '',
          contactPhone: res.contactPhone || '',
          businessHours: res.businessHours || '',
          status: res.status || 'active',
          typeId: res.typeId || 0,
          typeName: res.typeName || ''
        },
        businessHours: {
          isOpen: isOpen,
          openTime: '09:00',
          closeTime: '22:00',
          notice: ''
        }
      })

      console.log('[商家设置] 设置后的 merchantInfo:', this.data.merchantInfo)

      // 如果有店铺类型，设置当前选中的索引
      if (res.typeId && this.data.merchantTypes.length > 0) {
        const typeIndex = this.data.merchantTypes.findIndex(t => t.id === res.typeId)
        if (typeIndex >= 0) {
          this.setData({ typeIndex })
        }
      }
    } catch (error) {
      console.error('加载商家信息失败:', error)
      app.showToast('加载失败')
    }
  },

  /**
   * 加载店铺类型列表
   */
  async loadMerchantTypes() {
    try {
      const res = await http.get('/api/user/merchant/types')
      console.log('[商家设置] 获取店铺类型成功:', res)

      // 后端返回格式: { code: 0, msg: "success", data: types }
      const types = res.data || res || []
      console.log('[商家设置] 处理后的店铺类型:', types)
      console.log('[商家设置] 店铺类型数量:', types.length)

      this.setData({
        merchantTypes: types
      })

      // 如果商家信息已加载且有类型ID，设置当前索引
      if (this.data.merchantInfo.typeId) {
        const typeIndex = types.findIndex(t => t.id === this.data.merchantInfo.typeId)
        if (typeIndex >= 0) {
          this.setData({ typeIndex })
        }
      }
    } catch (error) {
      console.error('加载店铺类型失败:', error)
    }
  },

  /**
   * 选择头像
   */
  chooseLogo() {
    console.log('[商家设置] 点击更换头像')
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[商家设置] 选择图片成功:', res)
        const tempFilePath = res.tempFiles[0].tempFilePath

        // 上传图片，显示更详细的加载提示
        wx.showLoading({
          title: '上传中...',
          mask: true  // 防止触摸穿透
        })

        http.uploadFile(tempFilePath).then(url => {
          wx.hideLoading()
          console.log('[商家设置] 上传成功:', url)
          const merchantInfo = { ...this.data.merchantInfo }
          merchantInfo.logo = url
          this.setData({ merchantInfo })
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          })
        }).catch(err => {
          wx.hideLoading()
          console.error('[商家设置] 上传失败:', err)

          // 显示更友好的错误提示
          let errorMsg = '上传失败'
          if (err.message && err.message.includes('超时')) {
            errorMsg = '网络超时，请检查网络后重试'
          } else if (err.msg) {
            errorMsg = err.msg
          } else if (err.message) {
            errorMsg = err.message
          }

          wx.showModal({
            title: '上传失败',
            content: errorMsg + '\n\n是否重试？',
            confirmText: '重试',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 用户点击重试，递归调用上传
                this.retryUpload(tempFilePath)
              }
            }
          })
        })
      },
      fail: (err) => {
        console.error('[商家设置] 选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 重试上传
   */
  retryUpload(filePath) {
    wx.showLoading({ title: '上传中...', mask: true })

    http.uploadFile(filePath).then(url => {
      wx.hideLoading()
      const merchantInfo = { ...this.data.merchantInfo }
      merchantInfo.logo = url
      this.setData({ merchantInfo })
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('[商家设置] 重试上传失败:', err)
      wx.showToast({
        title: '上传失败，请稍后重试',
        icon: 'none'
      })
    })
  },

  onNameInput(e) {
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.name = e.detail.value
    this.setData({ merchantInfo })
  },

  onDescInput(e) {
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.description = e.detail.value
    this.setData({ merchantInfo })
  },

  onAddressInput(e) {
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.address = e.detail.value
    this.setData({ merchantInfo })
  },

  onContactNameInput(e) {
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.contactName = e.detail.value
    this.setData({ merchantInfo })
  },

  onContactPhoneInput(e) {
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.contactPhone = e.detail.value
    this.setData({ merchantInfo })
  },

  onBusinessHoursInput(e) {
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.businessHours = e.detail.value
    this.setData({ merchantInfo })
  },

  /**
   * 营业状态开关变化
   */
  onOpenChange(e) {
    const isOpen = e.detail.value
    const businessHours = { ...this.data.businessHours }
    businessHours.isOpen = isOpen
    this.setData({ businessHours })
    console.log('[商家设置] 营业状态变化:', isOpen ? '营业中' : '休息中')
  },

  /**
   * 开始时间变化
   */
  onOpenTimeChange(e) {
    const businessHours = { ...this.data.businessHours }
    businessHours.openTime = e.detail.value
    this.setData({ businessHours })
  },

  /**
   * 结束时间变化
   */
  onCloseTimeChange(e) {
    const businessHours = { ...this.data.businessHours }
    businessHours.closeTime = e.detail.value
    this.setData({ businessHours })
  },

  /**
   * 营业提示输入
   */
  onNoticeInput(e) {
    const businessHours = { ...this.data.businessHours }
    businessHours.notice = e.detail.value
    this.setData({ businessHours })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空方法，仅用于阻止事件冒泡
  },

  /**
   * 切换店铺类型下拉列表
   */
  toggleTypeDropdown() {
    console.log('[商家设置] 切换店铺类型下拉列表，当前状态:', this.data.showTypeDropdown)
    this.setData({
      showTypeDropdown: !this.data.showTypeDropdown
    })
  },

  /**
   * 选择店铺类型
   */
  selectType(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const merchantType = this.data.merchantTypes[index]
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.typeId = merchantType.id
    merchantInfo.typeName = merchantType.name
    this.setData({
      typeIndex: index,
      merchantInfo,
      showTypeDropdown: false
    })
    console.log('[商家设置] 选择店铺类型:', merchantType)
  },

  /**
   * 店铺类型选择变化（原生picker，已废弃）
   */
  onTypeChange(e) {
    const index = parseInt(e.detail.value)
    const merchantType = this.data.merchantTypes[index]
    const merchantInfo = { ...this.data.merchantInfo }
    merchantInfo.typeId = merchantType.id
    merchantInfo.typeName = merchantType.name
    this.setData({
      typeIndex: index,
      merchantInfo
    })
    console.log('[商家设置] 选择店铺类型:', merchantType)
  },

  /**
   * 保存修改
   */
  async handleSave() {
    const { merchantInfo, loading, businessHours } = this.data

    console.log('[商家设置] 开始保存，merchantInfo:', merchantInfo)
    console.log('[商家设置] businessHours:', businessHours)

    if (loading) return

    // 验证必填项
    if (!merchantInfo.name.trim()) {
      app.showToast('请输入店铺名称')
      return
    }

    if (!merchantInfo.address.trim()) {
      app.showToast('请输入店铺地址')
      return
    }

    if (!merchantInfo.contactName.trim()) {
      app.showToast('请输入联系人姓名')
      return
    }

    if (!merchantInfo.contactPhone.trim()) {
      app.showToast('请输入联系电话')
      return
    }

    if (!/^1[3-9]\d{9}$/.test(merchantInfo.contactPhone)) {
      app.showToast('请输入正确的手机号')
      return
    }

    this.setData({ loading: true })

    try {
      // 根据 businessHours.isOpen 设置 status
      // isOpen = true -> status = 'active' (营业中)
      // isOpen = false -> status = 'inactive' (休息中)
      const status = businessHours.isOpen ? 'active' : 'inactive'

      console.log('[商家设置] 准备保存，营业状态:', status)

      // 构建营业时间字符串
      const businessHoursStr = businessHours.isOpen
        ? `${businessHours.openTime}-${businessHours.closeTime}`
        : '休息中'

      // 调用后端接口更新商家信息
      await http.put('/api/user/merchant/info', {
        name: merchantInfo.name,
        logo: merchantInfo.logo,
        description: merchantInfo.description,
        address: merchantInfo.address,
        longitude: merchantInfo.longitude,
        latitude: merchantInfo.latitude,
        contactName: merchantInfo.contactName,
        contactPhone: merchantInfo.contactPhone,
        businessHours: businessHoursStr,
        typeId: merchantInfo.typeId || 0,
        status: status  // 关键：传递营业状态
      })

      console.log('[商家设置] 保存成功，准备跳转')

      // 更新本地merchantInfo的status
      merchantInfo.status = status
      app.setMerchantInfo(merchantInfo)

      this.setData({ loading: false })
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 延迟跳转到商家首页
      setTimeout(() => {
        console.log('[商家设置] 开始跳转到商家首页')
        wx.switchTab({
          url: '/pages/merchant/home/index',
          success: () => {
            console.log('[商家设置] 跳转成功')
          },
          fail: (err) => {
            console.error('[商家设置] 跳转失败:', err)
          }
        })
      }, 1500)
    } catch (error) {
      console.error('保存失败:', error)
      this.setData({ loading: false })
      const errorMsg = error.msg || error.message || '保存失败'
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
    }
  },

  /**
   * 跳转到二维码页面
   */
  goToQRCode() {
    wx.navigateTo({
      url: '/pages/merchant/qrcode/index'
    })
  },

  /**
   * 退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearMerchantInfo()
          wx.reLaunch({
            url: '/pages/auth/login/index'
          })
        }
      }
    })
  }
})
