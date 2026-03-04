// pages/user/profile/edit/index.js
const app = getApp()
const { http } = require('../../../../utils/request.js')
const Upload = require('../../../../services/upload.js')

Page({
  data: {
    formData: {
      nickname: '',
      gender: 0,
      phone: '',
      avatar: ''
    },
    loading: false,
    from: '', // register | profile
    defaultAvatar: ''  // 默认头像
  },

  onLoad(options) {
    const from = options.from || 'profile'
    this.setData({
      from,
      defaultAvatar: app.getDefaultAvatar('user')
    })
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  /**
   * 从后端加载用户信息
   */
  loadUserInfo() {
    http.get('/api/user/profile').then(res => {
      this.setData({
        formData: {
          nickname: res.nickname || '',
          gender: res.gender || 0,
          phone: res.phone || '',
          avatar: res.avatar || ''
        }
      })
      // 同步更新全局数据
      app.setUserInfo({
        nickname: res.nickname || '',
        gender: res.gender || 0,
        phone: res.phone || '',
        avatar: res.avatar || ''
      })
    }).catch(err => {
      console.error('加载用户信息失败:', err)
      // 如果接口失败，尝试使用本地缓存的数据
      const userInfo = app.globalData.userInfo || {}
      this.setData({
        formData: {
          nickname: userInfo.nickname || '',
          gender: userInfo.gender || 0,
          phone: userInfo.phone || '',
          avatar: userInfo.avatar || ''
        }
      })
    })
  },

  /**
   * 选择头像
   */
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  /**
   * 上传头像
   */
  async uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...', mask: true })

    try {
      // 使用统一的上传服务，type 为 'avatar'
      const uploadRes = await Upload.uploadImage(filePath, 'avatar')

      wx.hideLoading()

      this.setData({
        'formData.avatar': uploadRes.url
      })

      app.showToast('上传成功', 'success')
    } catch (error) {
      wx.hideLoading()
      console.error('上传失败:', error)
      app.showToast(error.message || '上传失败，请重试')
    }
  },

  /**
   * 昵称输入
   */
  onNicknameInput(e) {
    this.setData({
      'formData.nickname': e.detail.value
    })
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    })
  },

  /**
   * 选择性别
   */
  selectGender(e) {
    const gender = parseInt(e.currentTarget.dataset.gender)
    this.setData({
      'formData.gender': gender
    })
  },

  /**
   * 提交表单
   */
  async handleSubmit() {
    const { formData, loading } = this.data

    if (loading) return

    // 验证昵称
    if (!formData.nickname.trim()) {
      app.showToast('请输入昵称')
      return
    }

    // 验证手机号（如果输入了）
    if (formData.phone && formData.phone.trim()) {
      if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        app.showToast('请输入正确的手机号')
        return
      }
    }

    this.setData({ loading: true })

    try {
      // 调用更新用户资料接口
      await this.updateProfile(formData)

      this.setData({ loading: false })

      // 更新本地用户信息
      app.setUserInfo({
        ...app.globalData.userInfo,
        nickname: formData.nickname,
        gender: formData.gender,
        phone: formData.phone,
        avatar: formData.avatar
      })

      app.showToast('保存成功', 'success')

      // 从"我的"页面进入，保存后返回"我的"页面
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (error) {
      console.error('保存失败:', error)
      this.setData({ loading: false })
      app.showToast('保存失败，请重试')
    }
  },

  /**
   * 更新用户资料
   */
  updateProfile(data) {
    return http.put('/api/user/profile', {
      nickname: data.nickname,
      gender: data.gender,
      phone: data.phone,
      avatar: data.avatar
    })
  },

  /**
   * 跳过
   */
  handleSkip() {
    wx.showModal({
      title: '提示',
      content: '是否跳过完善信息？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})
