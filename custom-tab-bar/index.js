// custom-tab-bar/index.js
const app = getApp()

Component({
  data: {
    selected: 0,
    userType: 'user',
    pendingCount: 0
  },

  lifetimes: {
    attached() {
      this.updateTabBar()
    }
  },

  methods: {
    /**
     * 更新TabBar状态
     */
    updateTabBar() {
      const userType = wx.getStorageSync('userType') || 'user'
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]

      // 检查currentPage是否存在，避免初始化时页面栈为空报错
      if (!currentPage) {
        this.setData({ userType, selected: 0 })
        return
      }

      const route = currentPage.route

      let selected = 0

      // 用户端Tab索引
      const userTabs = [
        'pages/user/home/index',
        'pages/user/orders/index',
        'pages/user/profile/index'
      ]

      // 商家端Tab索引
      const merchantTabs = [
        'pages/merchant/home/index',
        'pages/merchant/products/index',
        'pages/merchant/orders/index',
        'pages/merchant/profile/index'
      ]

      if (userType === 'user') {
        selected = userTabs.indexOf(route)
      } else {
        selected = merchantTabs.indexOf(route)
      }

      this.setData({
        userType,
        selected: selected >= 0 ? selected : 0
      })
    },

    /**
     * 切换Tab
     */
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset
      const { selected } = this.data

      if (index === selected) return

      wx.switchTab({
        url: path
      })
    }
  }
})
