#!/bin/bash

# 浏览器扩展打包脚本
# 用于创建可发布到商店的扩展包

echo "🎁 开始打包扩展..."

# 从 manifest.json 读取版本号
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
OUTPUT_FILE="extension-v${VERSION}.zip"

# 删除旧的打包文件
if [ -f "$OUTPUT_FILE" ]; then
  echo "🗑️  删除旧的打包文件..."
  rm "$OUTPUT_FILE"
fi

# 打包必需文件
echo "📦 打包文件..."
zip -rq "$OUTPUT_FILE" \
  manifest.json \
  background.js \
  popup.html \
  src/popup/ \
  icon16.svg \
  icon48.svg \
  icon128.svg \
  icon16.png \
  icon48.png \
  icon128.png

# 检查打包结果
if [ $? -eq 0 ]; then
  echo "✅ 打包成功！"
  echo "📄 输出文件: $OUTPUT_FILE"
  echo "📊 文件大小: $(du -h $OUTPUT_FILE | cut -f1)"
  echo ""
  echo "📋 包含的文件:"
  unzip -l "$OUTPUT_FILE"
  echo ""
  echo "🚀 你可以将此文件上传到 Chrome Web Store 或 Edge Add-ons"
else
  echo "❌ 打包失败！"
  exit 1
fi
