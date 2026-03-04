// pages/merchant/orders/index.js
const app = getApp()
const MerchantOrder = require('../../../services/merchant-order.js')

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

  onShow() {
    this.loadOrderList()
  },

  /**
   * 加载订单列表
   */
  loadOrderList() {
    const { activeTab } = this.data
    const status = activeTab === 'all' ? null : activeTab

    this.setData({ loading: true })

    MerchantOrder.getOrders(status).then(res => {
      console.log('[商家订单] 加载成功:', res)
      this.setData({
        orderList: res,
        loading: false
      })
    }).catch(err => {
      console.error('[商家订单] 加载失败:', err)
      this.setData({ loading: false, orderList: [] })
      app.showToast(err.msg || '加载失败')
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
   * 接单
   */
  acceptOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo

    wx.showModal({
      title: '提示',
      content: '确定要接单吗？',
      success: (res) => {
        if (res.confirm) {
          MerchantOrder.acceptOrder(orderNo).then(() => {
            app.showToast('接单成功', 'success')
            this.loadOrderList()
          }).catch(err => {
            app.showToast(err.message || '操作失败1')
          })
        }
      }
    })
  },

  /**
   * 拒单
   */
  rejectOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo

    wx.showModal({
      title: '提示',
      content: '确定要拒单吗？',
      success: (res) => {
        if (res.confirm) {
          MerchantOrder.rejectOrder(orderNo).then(() => {
            app.showToast('已拒单', 'success')
            this.loadOrderList()
          }).catch(err => {
            app.showToast(err.message || '操作失败2')
          })
        }
      }
    })
  },

  /**
   * 发货
   */
  shipOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo

    MerchantOrder.shipOrder(orderNo).then(() => {
      app.showToast('发货成功', 'success')
      this.loadOrderList()
    }).catch(err => {
      app.showToast(err.message || '操作失败3')
    })
  },

  /**
   * 完成订单
   */
  completeOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo

    MerchantOrder.completeOrder(orderNo).then(() => {
      app.showToast('订单已完成', 'success')
      this.loadOrderList()
    }).catch(err => {
      app.showToast(err.message || '操作失败4')
    })
  }
})
