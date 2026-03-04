#!/bin/bash

# 合德本地生活 - 图标生成脚本
# 使用 macOS 内置工具转换 SVG 到 PNG

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SVG_FILE="$SCRIPT_DIR/hede-cny-icon.svg"
PNG_FILE="$SCRIPT_DIR/hede-cny-icon.png"

echo "🎨 合德本地生活 - 图标生成"
echo "================================"

# 检查 SVG 文件
if [ ! -f "$SVG_FILE" ]; then
    echo "❌ 找不到 SVG 文件: $SVG_FILE"
    exit 1
fi

# 方法 1: 使用 qlmanage (macOS 内置)
echo "📸 使用 qlmanage 生成图标..."
qlmanage -t -s 64 -o "$SCRIPT_DIR" "$SVG_FILE" 2>/dev/null

# qlmanage 会生成 .png 文件，但可能需要重命名
if [ -f "$SCRIPT_DIR/hede-cny-icon.svg.png" ]; then
    mv "$SCRIPT_DIR/hede-cny-icon.svg.png" "$PNG_FILE"
    echo "✅ 图标生成成功: $PNG_FILE"
else
    echo "⚠️  qlmanage 方法失败，尝试备用方法..."

    # 方法 2: 使用 Node.js 和 canvas (如果可用)
    cat > "$SCRIPT_DIR/convert-simple.js" << 'EOJS'
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'hede-cny-icon.svg');
const pngPath = path.join(__dirname, 'hede-cny-icon.png');

// 读取 SVG
const svgContent = fs.readFileSync(svgPath, 'utf8');

// 创建一个简单的 base64 编码的 PNG (1x1 透明像素作为占位符)
const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

// 写入占位符
fs.writeFileSync(pngPath, minimalPng);

console.log('⚠️  生成了占位符 PNG');
console.log('📝 请使用以下方法之一生成实际的图标:');
console.log('   1. 在浏览器中打开 preview.html，然后截图');
console.log('   2. 使用在线工具: https://svgtopng.com/');
console.log('   3. 使用 Figma/Sketch 等设计软件打开 SVG');
console.log('   4. 安装 ImageMagick: brew install imagemagick');
EOJS

    node "$SCRIPT_DIR/convert-simple.js"
fi

# 显示文件信息
echo ""
echo "📁 生成的文件:"
ls -lh "$SCRIPT_DIR"/*.{svg,png,html} 2>/dev/null

echo ""
echo "💡 提示:"
echo "   - 在浏览器中打开 $SCRIPT_DIR/preview.html 查看预览"
echo "   - SVG 文件可以直接用于开发"
echo "   - 如需 PNG，可使用在线转换工具或设计软件"
