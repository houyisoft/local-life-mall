/**
 * 图标转换脚本 - SVG 转 PNG
 * 需要安装: npm install sharp
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const svgPath = path.join(__dirname, 'hede-cny-icon.svg');
  const pngPath = path.join(__dirname, 'hede-cny-icon.png');

  // 读取 SVG 文件
  const svgBuffer = fs.readFileSync(svgPath);

  // 转换为 PNG (64x64px)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(pngPath);

  console.log('✅ 图标转换成功！');
  console.log('📁 SVG 文件:', svgPath);
  console.log('📁 PNG 文件:', pngPath);
}

convertSvgToPng().catch(err => {
  console.error('❌ 转换失败:', err);
  process.exit(1);
});
