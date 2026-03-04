/**
 * 工具函数
 */

/**
 * 格式化价格（分转元）
 * @param {number} price 价格（分）
 * @param {boolean} symbol 是否显示符号
 * @returns {string}
 */
export function formatPrice(price, symbol = true) {
  const formatted = (price / 100).toFixed(2)
  return symbol ? `¥${formatted}` : formatted
}

/**
 * 格式化时间
 * @param {string|Date} time 时间
 * @param {string} format 格式
 * @returns {string}
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm') {
  if (!time) return ''

  const date = time instanceof Date ? time : new Date(time)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取相对时间
 * @param {string|Date} time 时间
 * @returns {string}
 */
export function getRelativeTime(time) {
  if (!time) return ''

  const date = time instanceof Date ? time : new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatTime(time, 'YYYY-MM-DD')
  }
}

/**
 * 防抖
 * @param {Function} func 函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function debounce(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流
 * @param {Function} func 函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function throttle(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) return
    timer = setTimeout(() => {
      func.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 深拷贝
 * @param {*} obj 对象
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))

  const cloned = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean}
 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证密码
 * @param {string} password 密码
 * @returns {boolean}
 */
export function validatePassword(password) {
  return password.length >= 6 && password.length <= 20
}

/**
 * 计算密码强度
 * @param {string} password 密码
 * @returns {string} weak | medium | strong
 */
export function getPasswordStrength(password) {
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

/**
 * 获取图片后缀
 * @param {string} url 图片URL
 * @returns {string}
 */
export function getImageExtension(url) {
  const match = url.match(/\.([^.?]+)(?:\?|$)/)
  return match ? match[1].toLowerCase() : 'jpg'
}

/**
 * 检查是否为图片URL
 * @param {string} url URL
 * @returns {boolean}
 */
export function isImageUrl(url) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  const extension = getImageExtension(url)
  return imageExtensions.includes(extension)
}

/**
 * 数组去重
 * @param {Array} arr 数组
 * @param {string} key 对象数组的去重键
 * @returns {Array}
 */
export function unique(arr, key) {
  if (!key) {
    return [...new Set(arr)]
  }
  const seen = new Set()
  return arr.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分组
 * @param {Array} arr 数组
 * @param {string} key 分组键
 * @returns {Object}
 */
export function groupBy(arr, key) {
  return arr.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

/**
 * 数组排序
 * @param {Array} arr 数组
 * @param {string} key 排序键
 * @param {string} order 排序方式 asc | desc
 * @returns {Array}
 */
export function sortBy(arr, key, order = 'asc') {
  return [...arr].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })
}

export default {
  formatPrice,
  formatTime,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validatePassword,
  getPasswordStrength,
  getImageExtension,
  isImageUrl,
  unique,
  groupBy,
  sortBy
}
