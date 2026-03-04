// pages/user/order-detail/index.js
const app = getApp()
const Order = require('../../../services/order.js')
const Merchant = require('../../../services/merchant.js')

Page({
  data: {
    orderId: null,
    orderNo: null,
    orderDetail: null,
    loading: true,
    showMerchantModal: false,
    merchantDetail: null
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({
        title: '订单ID不能为空',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({ orderId: id })
    this.loadOrderDetail()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadOrderDetail(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载订单详情
   */
  loadOrderDetail(callback) {
    const { orderId } = this.data

    this.setData({ loading: true })

    Order.getOrderDetail(orderId).then(res => {
      console.log('[订单详情] 原始数据:', res)
      console.log('[订单详情] merchantUserId:', res.merchantUserId)

      // 处理价格显示格式
      const products = (res.products || []).map(p => ({
        ...p,
        priceDisplay: (p.price / 100).toFixed(2)
      }))

      this.setData({
        orderDetail: {
          ...res,
          products,
          totalPriceDisplay: (res.totalPrice / 100).toFixed(2),
          deliveryFeeDisplay: (res.deliveryFee / 100).toFixed(2),
          discountDisplay: (res.discount / 100).toFixed(2),
          actualPriceDisplay: (res.actualPrice / 100).toFixed(2)
        },
        orderNo: res.orderNo,
        loading: false
      })
      if (callback) callback()
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
      if (callback) callback()
    })
  },

  /**
   * 复制订单号
   */
  copyOrderNo() {
    const { orderNo } = this.data
    wx.setClipboardData({
      data: orderNo,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 取消订单
   */
  cancelOrder() {
    const { orderNo } = this.data

    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          Order.cancelOrder(orderNo).then(() => {
            app.showToast('已取消订单', 'success')
            this.loadOrderDetail()
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
  confirmReceipt() {
    const { orderNo } = this.data

    wx.showModal({
      title: '提示',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          Order.confirmReceipt(orderNo).then(() => {
            app.showToast('已确认收货', 'success')
            this.loadOrderDetail()
          }).catch(err => {
            app.showToast(err.message || '操作失败')
          })
        }
      }
    })
  },

  /**
   * 联系商家
   */
  contactMerchant() {
    const { orderDetail } = this.data
    console.log('[联系商家] orderDetail:', orderDetail)
    console.log('[联系商家] merchantUserId:', orderDetail?.merchantUserId)
    console.log('[联系商家] merchantId:', orderDetail?.merchantId)

    // 优先使用 merchantUserId，如果不存在或为0则使用 merchantId
    let merchantId = orderDetail?.merchantId
    let useUserIdApi = false

    if (orderDetail?.merchantUserId && orderDetail.merchantUserId > 0) {
      merchantId = orderDetail.merchantUserId
      useUserIdApi = true
    }

    if (!orderDetail || !merchantId) {
      wx.showToast({
        title: '商家信息不存在',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 根据是否有有效的 merchantUserId 来决定调用哪个API
    const apiCall = useUserIdApi
      ? Merchant.getMerchantDetailByUserId(merchantId)
      // : Merchant.getMerchantDetail(merchantId)
      : Merchant.getMerchantDetailByUserId(merchantId)

    apiCall.then(res => {
      console.log('[联系商家] 商家详情:', res)
      this.setData({
        merchantDetail: res,
        showMerchantModal: true,
        loading: false
      })
    }).catch(err => {
      console.log('[联系商家] 获取失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: err.message || '获取商家信息失败',
        icon: 'none'
      })
    })
  },

  /**
   * 关闭商家弹窗
   */
  closeMerchantModal() {
    this.setData({
      showMerchantModal: false,
      merchantDetail: null
    })
  },

  /**
   * 拨打商家电话
   */
  callMerchant() {
    const { merchantDetail } = this.data
    if (!merchantDetail || !merchantDetail.contactPhone) {
      wx.showToast({
        title: '商家电话不存在',
        icon: 'none'
      })
      return
    }

    wx.makePhoneCall({
      phoneNumber: merchantDetail.contactPhone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 查看物流
   */
  viewLogistics() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 返回首页
   */
  backToHome() {
    wx.switchTab({
      url: '/pages/user/home/index'
    })
  }
})
