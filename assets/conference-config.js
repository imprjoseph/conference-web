/**
 * 會議網站共用設定
 *
 * 建立另一個會議網站時，複製整個專案後只需要修改這個檔案。
 * 會議內容（名稱、日期、講者、議程等）仍由管理後台維護。
 */
window.CONFERENCE_CONFIG = Object.freeze({
    // 用來區隔瀏覽器快取；每個會議請使用不同、且不要包含空白的代碼。
    siteId: '2026sig',

    // Google Apps Script 部署為 Web App 後取得的 /exec 網址。
    apiUrl: 'https://script.google.com/macros/s/AKfycbyanPD18kZADKVgNxTGMcHGksqmsAp9lcHQSIMm-1SMKGZxZGWkpd3c1cYZK6yPsPOe4Q/exec',

    // API 尚未載入前，瀏覽器分頁顯示的名稱。
    siteTitle: '2026 智慧網路 SIG 研討會｜AI-RAN 商業化與產業應用',
    adminTitle: '會議網站管理後台'
});
