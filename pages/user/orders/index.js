// pages/user/orders/index.js
const app = getApp()
const Order = require('../../../services/order.js')

Page({
  data: {
    activeTab: 'all',
    orderList: [],
    loading: false
  },

  onLoad(options) {
    const { activeTab } = options
    if (activeTab) {
      this.setData({ activeTab })
    }

    this.loadOrderList()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadOrderList(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载订单列表
   */
  loadOrderList(callback) {
    const { activeTab } = this.data
    const status = activeTab === 'all' ? null : activeTab

    this.setData({ loading: true })

    Order.getOrderList({ status }).then(res => {
      this.setData({
        orderList: res.list,
        loading: false
      })
      if (callback) callback()
    }).catch(() => {
      this.setData({ loading: false })
      if (callback) callback()
    })
  },

  /**
   * 切换Tab
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.loadOrderList()
  },

  /**
   * 跳转到订单详情
   */
  goToOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/order-detail/index?id=${id}`
    })
  },

  /**
   * 取消订单
   */
  cancelOrder(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          Order.cancelOrder(id).then(() => {
            app.showToast('已取消订单', 'success')
            this.loadOrderList()
          }).catch(err => {
            app.showToast(err.message || '取消失败')
          })
        }
      }
    })
  },

  /**
   * 确认收货
   */
  confirmReceipt(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          Order.confirmReceipt(id).then(() => {
            app.showToast('已确认收货', 'success')
            this.loadOrderList()
          }).catch(err => {
            app.showToast(err.message || '操作失败7')
          })
        }
      }
    })
  }
})
