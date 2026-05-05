# 會議活動官方網站系統

一個完整的會議活動官方網站系統，包含前台展示和後台管理功能。支援雙語（中文/英文）、響應式設計，並整合Google Sheets作為資料庫。

## 功能特色

### 前台功能
- 🎨 現代化響應式設計
- 🌐 雙語支援（中文/英文）
- 📱 手機友善介面
- ⏰ 會議倒數計時器
- 👥 講師介紹頁面
- 📅 會議議程展示
- 🗺️ 交通資訊整合
- 📸 歷年會議相簿
- 📝 Google Forms報名整合
- 🔒 個資保護宣告

### 後台管理
- 🔐 安全登入系統
- ⚙️ 網站基本設定
- 👤 講師資料管理
- 📋 議程管理
- 🚗 交通資訊管理
- 📜 個資宣告管理
- 📚 歷年會議管理
- 🎛️ 網站狀態控制

## 技術架構

- **後端**: Google Apps Script
- **資料庫**: Google Sheets
- **前端**: HTML5, CSS3, JavaScript
- **圖片儲存**: Google Drive
- **報名系統**: Google Forms
- **部署**: GitHub Pages + Google Apps Script

## 快速開始

### 1. 準備Google服務

#### 建立Google Sheets資料庫
1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新試算表
3. 複製試算表ID（網址中的長字串）

#### 設定Google Apps Script
1. 前往 [Google Apps Script](https://script.google.com)
2. 建立新專案
3. 複製 `Code.gs` 的內容到編輯器
4. 將 `SHEET_ID` 變數改為您的試算表ID
5. 儲存並部署為網路應用程式
6. 設定權限：`任何人`（包括匿名使用者）
7. 複製部署後的網址

### 2. 部署到GitHub

#### 建立GitHub Repository
```bash
# 建立新專案資料夾
mkdir conference-website
cd conference-website

# 初始化Git
git init

# 建立主要檔案
# 複製 index.html, admin.html, README.md 到此資料夾

# 提交到Git
git add .
git commit -m "Initial commit: Conference website system"
```

#### 推送到GitHub
```bash
# 建立GitHub repository
# 前往 https://github.com/new 建立新repository

# 推送到GitHub（請將 USERNAME/REPO 改為您的資訊）
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

#### 啟用GitHub Pages
1. 前往您的GitHub repository
2. 點擊 **Settings** 標籤
3. 向下捲動到 **Pages** 區塊
4. 在 **Source** 下拉選單選擇 **main** 分支
5. 點擊 **Save**
6. 等待幾分鐘，您的網站將在 `https://USERNAME.github.io/REPO/` 上線

### 3. 設定網站

#### 更新API網址
在 `index.html` 和 `admin.html` 中找到：
```javascript
const API_BASE_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
```
將其改為您的Google Apps Script部署網址。

#### 初始化資料庫
1. 在Google Apps Script編輯器中執行 `initSheets()` 函數
2. 檢查Google Sheets是否正確建立了所有工作表

#### 設定管理員帳號
預設帳號：`admin` / `admin123`
建議在Google Sheets的 `AdminUsers` 工作表中修改密碼。

## 檔案結構

```
conference-system/
├── Code.gs              # Google Apps Script 後端程式碼
├── index.html           # 前台網站
├── admin.html           # 後台管理介面
└── README.md           # 說明文件
```

## 設定說明

### 網站狀態
在後台設定中可以控制網站狀態：
- **draft**: 顯示建置中頁面
- **live**: 正常運作
- **closed**: 顯示活動結束頁面

### 報名狀態
- **coming_soon**: 顯示「報名尚未開放」
- **open**: 開放報名
- **closed**: 報名截止

### 雙語支援
系統自動偵測瀏覽器語言，也可以在網站上手動切換語言。

## 自訂設定

### 樣式修改
- 修改CSS變數來自訂顏色
- 調整響應式斷點
- 自訂字體和間距

### 功能擴展
- 新增更多欄位到Google Sheets
- 擴展API端點
- 新增更多頁面

## 故障排除

### 常見問題

**Q: 無法載入資料**
A: 檢查Google Apps Script的部署設定和權限

**Q: 管理員無法登入**
A: 確認帳號密碼正確，且在AdminUsers工作表中狀態為啟用

**Q: 圖片不顯示**
A: 確保圖片URL是公開可存取的Google Drive連結

**Q: 報名表單無法開啟**
A: 檢查Google Forms連結是否正確設定

### 開發模式
如果需要在本地開發：
1. 使用本地伺服器開啟HTML檔案
2. 修改API_BASE_URL為您的Apps Script網址
3. 注意CORS限制

## 授權

此專案僅供學習和非商業用途。

## 技術支援

如果您在部署或使用過程中遇到問題，請：

1. 檢查瀏覽器控制台的錯誤訊息
2. 確認所有設定都正確
3. 查看Google Apps Script的執行記錄
4. 檢查Google Sheets的資料格式

## 更新日誌

### v1.0.0
- 初始版本發佈
- 完整的會議網站系統
- 前後台管理功能
- 雙語支援
- 響應式設計

---

**注意**: 部署前請務必修改所有預設的API網址、帳號密碼和試算表ID，以確保安全性。