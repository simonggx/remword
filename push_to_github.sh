#!/bin/bash

echo "🚀 RemWord项目GitHub推送脚本"
echo "================================"
echo ""

# 检查Git状态
echo "📋 检查Git状态..."
git status --porcelain
if [ $? -ne 0 ]; then
    echo "❌ Git仓库未初始化或有问题"
    exit 1
fi

echo "✅ Git仓库状态正常"
echo ""

# 检查是否有远程仓库
echo "🔍 检查远程仓库配置..."
if git remote get-url origin >/dev/null 2>&1; then
    echo "📡 当前远程仓库: $(git remote get-url origin)"
    echo "🔄 移除现有远程仓库..."
    git remote remove origin
fi

# 添加GitHub远程仓库
echo "➕ 添加GitHub远程仓库..."
git remote add origin https://github.com/simonggx/remword.git

if [ $? -eq 0 ]; then
    echo "✅ 远程仓库添加成功"
else
    echo "❌ 远程仓库添加失败"
    exit 1
fi

# 设置主分支
echo "🌿 设置主分支为main..."
git branch -M main

# 推送到GitHub
echo "⬆️ 推送代码到GitHub..."
echo "注意：如果提示认证，请使用您的GitHub用户名和Personal Access Token"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 推送成功！"
    echo "📍 仓库地址: https://github.com/simonggx/remword"
    echo "🌟 建议添加以下标签到仓库："
    echo "   - chrome-extension"
    echo "   - vocabulary-learning" 
    echo "   - translation"
    echo "   - javascript"
    echo "   - manifest-v3"
    echo ""
    echo "📝 仓库描述建议："
    echo "   RemWord - Chrome Extension for Vocabulary Learning with Text Selection and Translation"
else
    echo ""
    echo "❌ 推送失败！"
    echo "可能的原因："
    echo "1. GitHub仓库尚未创建"
    echo "2. 认证失败（需要Personal Access Token）"
    echo "3. 网络连接问题"
    echo ""
    echo "解决方案："
    echo "1. 确保在GitHub上创建了'remword'仓库"
    echo "2. 使用Personal Access Token而不是密码"
    echo "3. 检查网络连接"
fi
