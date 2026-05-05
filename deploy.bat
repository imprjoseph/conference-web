@echo off
REM 會議網站系統 - Windows 部署批次檔案
REM Conference Website System - Windows Deployment Batch File

echo 🎯 會議網站系統 GitHub 部署助手
echo =================================

REM 檢查是否在專案目錄
if not exist "index.html" (
    echo ❌ 錯誤：請在專案根目錄執行此批次檔案
    echo 請確認 index.html, admin.html, README.md 檔案存在
    pause
    exit /b 1
)

REM 檢查Git是否安裝
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未安裝Git
    echo 請先安裝Git for Windows：
    echo https://git-scm.com/download/win
    echo.
    echo 安裝完成後重新執行此批次檔案
    pause
    exit /b 1
)

REM 檢查Git狀態
if not exist ".git" (
    echo 📝 初始化Git repository...
    git init
    git add .
    git commit -m "Initial commit: Conference website system"
)

REM 檢查是否有未提交的變更
for /f %%i in ('git status --porcelain 2^>nul') do (
    echo 📝 提交變更...
    git add .
    git commit -m "Update conference website"
    goto :continue
)
:continue

REM 檢查遠端repository
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo 請提供您的GitHub repository URL:
    echo 格式: https://github.com/USERNAME/REPOSITORY.git
    set /p repo_url="Repository URL: "

    if "!repo_url!"=="" (
        echo ❌ 錯誤：Repository URL不能為空
        pause
        exit /b 1
    )

    git remote add origin "!repo_url!"
)

REM 推送到GitHub
echo.
echo 🚀 推送到GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 成功推送到GitHub！
    echo.
    echo 📋 後續步驟：
    echo 1. 前往您的GitHub repository
    echo 2. 點擊 Settings 標籤
    echo 3. 向下捲動到 Pages 區塊
    echo 4. 在 Source 下拉選單選擇 main 分支
    echo 5. 點擊 Save
    echo 6. 等待幾分鐘，網站將上線
    echo.
    echo 🔗 您的網站將在以下網址：
    for /f "tokens=*" %%i in ('git remote get-url origin') do (
        set repo_url=%%i
    )
    for /f "tokens=2 delims=/" %%i in ("!repo_url!") do set username=%%i
    for /f "tokens=3 delims=/" %%i in ("!repo_url!") do set repo=%%i
    set repo=!repo:.git=!
    echo https://!username!.github.io/!repo!/
    echo.
    echo ⚠️  重要提醒：
    echo - 請在 index.html 和 admin.html 中更新 API_BASE_URL
    echo - 請在 Google Apps Script 中設定正確的 SHEET_ID
    echo - 請修改預設的管理員密碼
) else (
    echo.
    echo ❌ 推送失敗，請檢查：
    echo - Repository URL 是否正確
    echo - 您的GitHub權限
    echo - 網路連線
)

echo.
pause