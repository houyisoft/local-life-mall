// pages/user/checkout/index.js
const app = getApp()
const Cart = require('../../../services/cart.js')
const Order = require('../../../services/order.js')

Page({
  data: {
    address: null,
    orderItems: [],
    totalPrice: 0,
    deliveryFee: 300,
    discount: 0,
    actualPrice: 0,
    remark: '',
    loading: false,
    merchantId: 0,  // 添加商家ID
    merchantName: '',
    // 配送时间
    deliveryTime: {
      type: 'immediate',      // 'immediate' | 'scheduled'
      scheduledTime: '',      // 预约时间字符串
      estimatedTime: '30分钟内送达'
    }
  },

  onLoad() {
    this.loadData()
    this.initDeliveryTime()
  },

  /**
   * 初始化配送时间
   */
  initDeliveryTime() {
    const now = new Date()
    const hour = now.getHours()

    // 假设商家营业时间 9:00-22:00
    if (hour >= 9 && hour < 22) {
      this.setData({
        'deliveryTime.type': 'immediate',
        'deliveryTime.estimatedTime': '30分钟内送达'
      })
    } else {
      // 非营业时间默认预约明天中午
      this.setData({
        'deliveryTime.type': 'scheduled',
        'deliveryTime.scheduledTime': '明天 12:00-13:00',
        'deliveryTime.estimatedTime': '预约配送'
      })
    }
  },

  /**
   * 加载结算数据
   */
  async loadData() {
    wx.showLoading({ title: '加载中...' })

    try {
      // 获取默认地址
      const address = await Order.getDefaultAddress()

      // 获取购物车中选中的商品ID
      const selectedItems = await Cart.getCartByMerchant()
      const checkedItems = []
      const cartIds = []

      selectedItems.forEach(group => {
        group.items.forEach(item => {
          if (item.selected) {
            checkedItems.push(item)
            cartIds.push(item.id)
          }
        })
      })

      if (checkedItems.length === 0) {
        wx.hideLoading()
        wx.showToast({
          title: '请选择商品',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        return
      }

      // 从后端获取最新的订单数据（重新计算价格）
      const firstItem = checkedItems[0]
      const previewData = await Order.previewOrder({
        merchantId: firstItem.merchantId,
        ids: cartIds
      })

      wx.hideLoading()

      this.setData({
        address,
        orderItems: previewData.items,
        totalPrice: previewData.totalPrice,
        deliveryFee: previewData.deliveryFee,
        discount: previewData.discount,
        actualPrice: previewData.actualPrice,
        merchantId: previewData.merchantId,
        merchantName: previewData.merchantName
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.msg || err.message || '加载失败',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 选择配送时间
   */
  selectDeliveryTime() {
    const timeOptions = this.generateTimeOptions()

    wx.showActionSheet({
      itemList: timeOptions,
      success: (res) => {
        if (!res.cancel) {
          const selected = timeOptions[res.tapIndex]
          if (res.tapIndex === 0) {
            // 尽快送达
            this.setData({
              'deliveryTime.type': 'immediate',
              'deliveryTime.estimatedTime': '30分钟内送达',
              'deliveryTime.scheduledTime': ''
            })
          } else {
            // 预约时间
            this.setData({
              'deliveryTime.type': 'scheduled',
              'deliveryTime.scheduledTime': selected,
              'deliveryTime.estimatedTime': '预约配送'
            })
          }
        }
      }
    })
  },

  /**
   * 生成配送时间选项
   */
  generateTimeOptions() {
    const options = ['尽快送达 (预计30分钟)']
    const now = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      const dateStr = i === 0 ? '今天' : i === 1 ? '明天' :
                      `${date.getMonth() + 1}月${date.getDate()}日`

      // 添加常用时段
      options.push(`${dateStr} 11:00-12:00`)
      options.push(`${dateStr} 12:00-13:00`)
      options.push(`${dateStr} 17:00-18:00`)
      options.push(`${dateStr} 18:00-19:00`)
    }

    return options
  },

  /**
   * 选择地址
   */
  selectAddress() {
    wx.navigateTo({
      url: '/pages/user/address/index?from=checkout',
      events: {
        // 监听地址选择回调
        onAddressSelected: (address) => {
          this.setData({ address })
        }
      }
    })
  },

  /**
   * 备注输入
   */
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  /**
   * 提交订单
   */
  handleSubmit() {
    const { address, orderItems, deliveryFee, discount, remark, deliveryTime, loading, merchantId } = this.data

    if (loading) return

    if (!address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 构建订单数据
    const orderData = {
      merchantId: merchantId,  // 使用页面保存的商家ID
      ids: orderItems.map(item => item.id),
      receiverName: address.userName,
      receiverPhone: address.userPhone,
      receiverAddress: address.detailAddress,
      remark: remark,
      deliveryType: deliveryTime.type,
      scheduledTime: deliveryTime.scheduledTime || null
    }

    // 创建订单
    Order.createOrder(orderData).then(res => {
      this.setData({ loading: false })

      // 清空购物车中已购买的商品
      const ids = orderItems.map(item => item.id).filter(id => id)
      if (ids.length > 0) {
        Cart.removeItems(ids)
        app.updateCartCount()
      }

      // 下单成功，跳转到订单详情页
      wx.showToast({
        title: '下单成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/user/order-detail/index?id=${res.orderNo}`
        })
      }, 1500)
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({
        title: err.msg || err.message || '提交失败',
        icon: 'none'
      })
    })
  }
})
