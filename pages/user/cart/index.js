// pages/user/cart/index.js
const app = getApp()
const Cart = require('../../../services/cart.js')

Page({
  data: {
    cartList: [],
    allSelected: false,
    selectedCount: 0,
    totalPrice: 0
  },

  onShow() {
    this.loadCartList()
  },

  /**
   * 加载购物车列表
   */
  async loadCartList() {
    try {
      // 获取按商家分组的购物车数据
      const merchantGroups = await Cart.getCartByMerchant()
      console.log('[购物车] API返回的原始数据:', JSON.stringify(merchantGroups, null, 2))

      // 计算总价格：直接使用后端返回的每个商家的totalPrice之和
      let backendTotalPrice = 0
      let selectedCount = 0
      let allSelected = true

      merchantGroups.forEach(group => {
        console.log(`[购物车] loadCartList - 商家: ${group.merchantName}, 后端计算的总价: ${group.totalPrice}分`)
        backendTotalPrice += group.totalPrice || 0

        // 计算选中数量和全选状态
        let groupAllSelected = true
        if (group.items) {
          group.items.forEach(item => {
            if (item.selected) {
              selectedCount += item.quantity
            } else {
              groupAllSelected = false
              allSelected = false
            }
          })
          group.selected = groupAllSelected && group.items.length > 0
        } else {
          group.selected = false
          allSelected = false
        }
      })

      console.log(`[购物车] loadCartList - 后端计算的总价: ${backendTotalPrice}分 (¥${(backendTotalPrice / 100).toFixed(2)})`)
      console.log(`[购物车] loadCartList - 选中商品数: ${selectedCount}`)

      this.setData({
        cartList: merchantGroups,
        totalPrice: backendTotalPrice,  // 直接使用后端计算的总价
        selectedCount,
        allSelected
      })
    } catch (err) {
      console.error('[购物车] 加载失败:', err)
      this.setData({ cartList: [], totalPrice: 0, selectedCount: 0, allSelected: false })
    }
  },

  /**
   * 计算总价和选中数量
   */
  calculateTotal(cartList) {
    let selectedCount = 0
    let totalPrice = 0
    let allSelected = true

    console.log('[购物车] calculateTotal - 开始计算，cartList:', JSON.stringify(cartList, null, 2))

    cartList.forEach(group => {
      // 检查该商家下是否所有商品都被选中
      let groupAllSelected = true
      console.log(`[购物车] calculateTotal - 处理商家: ${group.merchantName} (merchantId: ${group.merchantId})`)
      console.log(`[购物车] calculateTotal - 商家items数量: ${group.items.length}`)

      group.items.forEach(item => {
        console.log(`[购物车] calculateTotal - 商品: ${item.productName}, itemType: ${item.itemType}, price: ${item.price} (类型: ${typeof item.price}), quantity: ${item.quantity}, selected: ${item.selected}`)
        if (item.selected) {
          const itemTotal = item.price * item.quantity
          selectedCount += item.quantity
          totalPrice += itemTotal
          console.log(`[购物车] calculateTotal - 选中商品小计: ${itemTotal}分, 累计总价: ${totalPrice}分`)
        } else {
          groupAllSelected = false
          allSelected = false
        }
      })
      // 设置商家的选中状态
      group.selected = groupAllSelected && group.items.length > 0
      console.log(`[购物车] calculateTotal - 商家${group.merchantName}的选中状态: ${group.selected}`)
    })

    if (cartList.length === 0) {
      allSelected = false
    }

    this.setData({
      allSelected,
      selectedCount,
      totalPrice
    })

    console.log('[购物车] calculateTotal - 最终结果 - 选中商品数:', selectedCount, '总价(分):', totalPrice, '总价(元):', (totalPrice / 100).toFixed(2))
  },

  /**
   * 切换商家选中状态
   */
  toggleMerchant(e) {
    const merchantId = e.currentTarget.dataset.merchantId
    const group = this.data.cartList.find(g => g.merchantId === merchantId)

    if (!group) return

    const selected = !group.selected

    Cart.toggleMerchantSelected(merchantId, selected).then(() => {
      this.loadCartList()
      app.updateCartCount()
    }).catch(err => {
      console.error('[购物车] 切换商家选中状态失败:', err)
      app.showToast(err.msg || '操作失败')
    })
  },

  /**
   * 切换单个商品选中状态
   */
  toggleItem(e) {
    const id = e.currentTarget.dataset.id
    Cart.toggleSelected(id).then(() => {
      this.loadCartList()
      app.updateCartCount()
    }).catch(err => {
      console.error('[购物车] 切换选中状态失败:', err)
      app.showToast(err.msg || '操作失败')
    })
  },

  /**
   * 修改数量
   */
  changeQuantity(e) {
    const { id, delta } = e.currentTarget.dataset
    const cartList = this.data.cartList

    console.log('[购物车] changeQuantity - id:', id, 'delta:', delta)

    // 查找当前商品
    let currentItem = null
    for (const group of cartList) {
      const item = group.items.find(i => i.id === id)
      if (item) {
        currentItem = item
        break
      }
    }

    if (!currentItem) {
      console.error('[购物车] changeQuantity - 未找到商品:', id)
      return
    }

    const newQuantity = currentItem.quantity + delta
    console.log('[购物车] changeQuantity - 当前数量:', currentItem.quantity, 'newQuantity:', newQuantity)

    // 如果数量减到0或更少，调用更新API（后端会自动删除）
    if (newQuantity <= 0) {
      console.log('[购物车] changeQuantity - 数量将为0，准备删除商品')
      Cart.updateQuantity(id, 0).then(() => {
        console.log('[购物车] changeQuantity - 删除成功')
        this.loadCartList()
        app.updateCartCount()
      }).catch(err => {
        console.error('[购物车] changeQuantity - 删除失败:', err)
        console.error('[购物车] changeQuantity - 错误详情:', JSON.stringify(err))
        app.showToast(err.msg || '操作失败')
      })
      return
    }

    console.log('[购物车] changeQuantity - 更新数量为:', newQuantity)
    Cart.updateQuantity(id, newQuantity).then(() => {
      this.loadCartList()
      app.updateCartCount()
    })
  },

  /**
   * 全选/取消全选
   */
  toggleSelectAll() {
    const { allSelected } = this.data
    // 调用切换全部选中状态的接口
    Cart.toggleAllSelected(!allSelected).then(() => {
      this.loadCartList()
      app.updateCartCount()
    }).catch(err => {
      console.error('[购物车] 全选操作失败:', err)
      app.showToast(err.msg || '操作失败')
    })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          Cart.clearCart().then(() => {
            this.loadCartList()
            app.updateCartCount()
            app.showToast('已清空购物车')
          }).catch(err => {
            console.error('[购物车] 清空失败:', err)
            app.showToast(err.msg || '清空失败')
          })
        }
      }
    })
  },

  /**
   * 去结算
   */
  goToCheckout() {
    if (this.data.selectedCount === 0) {
      app.showToast('请选择商品')
      return
    }

    wx.navigateTo({
      url: '/pages/user/checkout/index'
    })
  },

  /**
   * 返回首页
   */
  goToHome() {
    wx.switchTab({
      url: '/pages/user/home/index'
    })
  }
})
