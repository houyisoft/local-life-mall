// pages/common/agreement/index.js
Page({
  data: {
    type: 'protocol', // 'protocol' | 'privacy'
    title: '用户协议'
  },

  onLoad(options) {
    const { type = 'protocol' } = options

    this.setData({
      type,
      title: type === 'protocol' ? '用户协议' : '隐私政策'
    })

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.title
    })
  }
})
