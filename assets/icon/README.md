# 合德本地生活 - 小程序图标

## 🎨 春节版图标 (64×64px)

### 设计元素

| 元素 | 说明 |
|------|------|
| **射日元素** | 橙色太阳 + 金色箭头，象征后羿射日传说 |
| **春节元素** | 顶部红灯笼 + 右上角红包角标(¥) |
| **服务图标** | 美食碗、房屋、购物车、包裹(四象限布局) |
| **配色方案** | 中国红(#E63946/#C1121F) + 金色(#FFD700) |

### 文件说明

```
icon/
├── hede-cny-icon.svg      # SVG 矢量源文件 (推荐)
├── hede-cny-icon.png      # PNG 64×64 像素文件
├── preview.html           # 浏览器预览页面
├── generate-icons.sh      # 图标生成脚本
└── README.md              # 本文档
```

### 使用方法

#### 方法 1: 直接使用 SVG (推荐)
```bash
# SVG 可以在任何尺寸下保持清晰
cp hede-cny-icon.svg /path/to/your/project/assets/icon.svg
```

#### 方法 2: 浏览器预览
```bash
# 在浏览器中打开预览页面
open preview.html

# 或者
# macOS: open preview.html
# Windows: start preview.html
# Linux: xdg-open preview.html
```

#### 方法 3: 重新生成 PNG
```bash
# 运行生成脚本
bash generate-icons.sh

# 或手动转换 (需要安装 ImageMagick)
# brew install imagemagick  # macOS
# convert -background none -resize 64x64 hede-cny-icon.svg hede-cny-icon.png
```

### 小程序图标上传步骤

1. **登录微信小程序后台**
   - 访问: https://mp.weixin.qq.com/

2. **进入设置**
   - 开发 → 开发设置 → 基本配置

3. **上传图标**
   - 点击 "图标" 上传按钮
   - 选择 `hede-cny-icon.png` 文件
   - 系统会自动生成多种尺寸

### 技术规范

| 规格 | 要求 | 实际 |
|------|------|------|
| 尺寸 | 64×64 px | ✓ 64×64 |
| 格式 | PNG | ✓ PNG |
| 大小 | < 120 KB | ✓ 929 B |
| 透明 | 不强制 | ✓ 不透明 |

### 颜色参考

```css
/* 中国红渐变 */
background: linear-gradient(135deg, #E63946 0%, #C1121F 100%);

/* 太阳橙渐变 */
background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);

/* 金色边框 */
border-color: #FFD700;
```

### 品牌故事

**合德本地生活** 融合了以下元素:

- **后羿射日**: 传说中的英雄，代表服务与守护
- **射阳元素**: 仙鹤/射日图形，彰显地方文化特色
- **本地生活**: 四象限图标(美食、房产、购物、配送)展现全方位服务
- **春节氛围**: 红灯笼、红包角标增添节日喜庆

---

*图标设计于 2026 年春节*
