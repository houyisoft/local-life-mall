// pages/merchant/packages/index.js
const app = getApp()
const MerchantPackage = require('../../../services/merchant-package.js')

Page({
  data: {
    activeTab: 'all',
    packages: [],
    stats: {
      total: 0,
      onSale: 0,
      soldOut: 0
    },
    loading: false,
    isLoaded: false
  },

  onLoad() {
    // 先加载统计数据，再加载列表
    this.updateStats()
    this.loadPackages()
  },

  onShow() {
    // 只在页面已经加载过后才刷新，避免与 onLoad 冲突
    if (this.data.isLoaded) {
      this.loadPackages()
      this.updateStats()  // 添加：刷新时也更新统计
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadPackages(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载套餐列表
   */
  loadPackages(callback) {
    // 防止重复加载
    if (this.data.loading) {
      if (callback) callback()
      return
    }

    this.setData({ loading: true })

    console.log('[套餐管理] 开始加载套餐列表，status:', this.data.activeTab)

    MerchantPackage.getPackageList({
      status: this.data.activeTab === 'all' ? '' : this.data.activeTab
    }).then(res => {
      console.log('[套餐管理] 接口返回:', res)
      console.log('[套餐管理] 返回数据类型:', typeof res)
      console.log('[套餐管理] 是否为数组:', Array.isArray(res))

      if (res) {
        console.log('[套餐管理] 返回数据keys:', Object.keys(res))
        console.log('[套餐管理] res.items:', res.items)
        console.log('[套餐管理] res.total:', res.total)
      }

      // 尝试多种可能的格式
      let packages = []
      if (Array.isArray(res)) {
        // 直接是数组
        packages = res
      } else if (res && res.items && Array.isArray(res.items)) {
        // { items: [] } 格式
        packages = res.items
      } else if (res && res.list && Array.isArray(res.list)) {
        // { list: [] } 格式
        packages = res.list
      } else if (res && res.data && Array.isArray(res.data)) {
        // { data: [] } 格式
        packages = res.data
      } else if (res && res.data && res.data.items && Array.isArray(res.data.items)) {
        // { data: { items: [] } } 格式
        packages = res.data.items
      } else {
        console.warn('[套餐管理] 无法识别的数据格式，使用空数组')
        packages = []
      }

      console.log('[套餐管理] 处理后的套餐列表:', packages)
      console.log('[套餐管理] 套餐数量:', packages.length)

      this.setData({
        packages: packages,
        loading: false,
        isLoaded: true
      })
      this.updateStats()
      if (callback) callback()
    }).catch(err => {
      console.error('[套餐管理] 加载失败:', err)
      this.setData({
        loading: false,
        isLoaded: true,
        packages: []
      })
      if (callback) callback()
    })
  },

  /**
   * 更新统计数据
   */
  updateStats() {
    console.log('[套餐管理] 开始获取统计数据')
    MerchantPackage.getPackageStats().then(res => {
      console.log('[套餐管理] 统计数据返回:', res)
      console.log('totalCount:',res.totalCount)
      console.log('onSaleCount:',res.onSaleCount)
      console.log('soldOutCount:',res.soldOutCount)
      // 后端返回格式: { totalCount: 0, onSaleCount: 0, soldOutCount: 0, ... }
      if (res) {
        const newStats = {
          total: res.totalCount || 0,
          onSale: res.onSaleCount || 0,
          soldOut: res.soldOutCount || 0
        }
        console.log('[套餐管理] 准备设置的stats:', newStats)

        this.setData({
          stats: newStats
        }, () => {
          console.log('[套餐管理] setData完成，当前stats:', this.data.stats)
        })
      }
    }).catch(err => {
      console.error('[套餐管理] 获取统计数据失败:', err)
      // 失败时保持原有统计数据或设置为0
    })
  },

  /**
   * 切换标签
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return

    this.setData({ activeTab: tab })
    this.loadPackages()
  },

  /**
   * 添加套餐
   */
  addPackage() {
    wx.navigateTo({
      url: '/pages/merchant/package-edit/index'
    })
  },

  /**
   * 编辑套餐
   */
  editPackage(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/package-edit/index?id=${id}`
    })
  },

  /**
   * 切换上下架状态
   */
  toggleStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const newStatus = status === 'on_sale' ? 'sold_out' : 'on_sale'
    const actionText = newStatus === 'on_sale' ? '上架' : '下架'

    wx.showModal({
      title: '提示',
      content: `确定要${actionText}该套餐吗？`,
      success: (res) => {
        if (res.confirm) {
          MerchantPackage.updatePackageStatus(id, newStatus).then(() => {
            app.showToast(`${actionText}成功`, 'success')
            this.loadPackages()
          }).catch(() => {
            app.showToast(`${actionText}失败`)
          })
        }
      }
    })
  },

  /**
   * 删除套餐
   */
  deletePackage(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '确定要删除该套餐吗？删除后无法恢复',
      confirmColor: '#FF0000',
      success: (res) => {
        if (res.confirm) {
          MerchantPackage.deletePackage(id).then(() => {
            app.showToast('删除成功', 'success')
            this.loadPackages()
          }).catch(() => {
            app.showToast('删除失败')
          })
        }
      }
    })
  }
})
