#!/bin/bash

# 會議網站系統 - GitHub 部署腳本
# Conference Website System - GitHub Deployment Script

echo "🎯 會議網站系統 GitHub 部署助手"
echo "================================="

# 檢查是否在專案目錄
if [ ! -f "index.html" ] || [ ! -f "admin.html" ] || [ ! -f "README.md" ]; then
    echo "❌ 錯誤：請在專案根目錄執行此腳本"
    echo "請確認 index.html, admin.html, README.md 檔案存在"
    exit 1
fi

# 檢查Git狀態
if [ ! -d ".git" ]; then
    echo "📝 初始化Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Conference website system"
fi

# 檢查是否有未提交的變更
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 提交變更..."
    git add .
    git commit -m "Update conference website"
fi

# 檢查遠端repository
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "請提供您的GitHub repository URL:"
    echo "格式: https://github.com/USERNAME/REPOSITORY.git"
    read -p "Repository URL: " repo_url

    if [ -z "$repo_url" ]; then
        echo "❌ 錯誤：Repository URL不能為空"
        exit 1
    fi

    git remote add origin "$repo_url"
fi

# 推送到GitHub
echo ""
echo "🚀 推送到GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 成功推送到GitHub！"
    echo ""
    echo "📋 後續步驟："
    echo "1. 前往您的GitHub repository"
    echo "2. 點擊 Settings 標籤"
    echo "3. 向下捲動到 Pages 區塊"
    echo "4. 在 Source 下拉選單選擇 main 分支"
    echo "5. 點擊 Save"
    echo "6. 等待幾分鐘，網站將上線"
    echo ""
    echo "🔗 您的網站將在以下網址："
    repo_name=$(basename "$repo_url" .git)
    username=$(echo "$repo_url" | sed -n 's|https://github.com/\([^/]*\)/.*|\1|p')
    echo "https://$username.github.io/$repo_name/"
    echo ""
    echo "⚠️  重要提醒："
    echo "- 請在 index.html 和 admin.html 中更新 API_BASE_URL"
    echo "- 請在 Google Apps Script 中設定正確的 SHEET_ID"
    echo "- 請修改預設的管理員密碼"
else
    echo ""
    echo "❌ 推送失敗，請檢查："
    echo "- Repository URL 是否正確"
    echo "- 您的GitHub權限"
    echo "- 網路連線"
    exit 1
fi