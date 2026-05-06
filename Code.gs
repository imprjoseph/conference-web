// ═══════════════════════════════════════════════════════════════
// 會議活動官方網站系統 - Google Apps Script 後端
// Conference Official Website System - Google Apps Script Backend
// ═══════════════════════════════════════════════════════════════

// 設定 Google Sheets ID（部署時請更換為您的試算表ID）
const SHEET_ID = '12RUMRu1mcjI8xEjq1ajWKxZkblrCvRkuTmNpgM9ewH4';

// 工作表名稱定義
const SHEETS = {
  SETTINGS: 'Settings',
  ABOUT: 'About',
  SPEAKERS: 'Speakers',
  AGENDA: 'Agenda',
  TRAFFIC: 'Traffic',
  PRIVACY: 'Privacy',
  PAST_EVENTS: 'PastEvents',
  ADMIN_USERS: 'AdminUsers'
};

// ═══════════════════════════════════════════════════════════════
// 初始化工作表
// ═══════════════════════════════════════════════════════════════
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 設定工作表
  const settingsSheet = createOrGetSheet(ss, SHEETS.SETTINGS);
  settingsSheet.clear();
  settingsSheet.appendRow(['key', 'value', 'description']);
  settingsSheet.appendRow(['site_status', 'draft', '網站狀態：draft/live/closed']);
  settingsSheet.appendRow(['registration_status', 'coming_soon', '報名狀態：coming_soon/open/closed']);
  settingsSheet.appendRow(['registration_start_at', '', '報名開始時間']);
  settingsSheet.appendRow(['registration_end_at', '', '報名截止時間']);
  settingsSheet.appendRow(['event_start_at', '', '會議開始時間']);
  settingsSheet.appendRow(['event_end_at', '', '會議結束時間']);
  settingsSheet.appendRow(['custom_domain', '', '自訂網域名稱']);
  settingsSheet.appendRow(['maintenance_message_zh', '網站建置中，請稍後再訪', '中文建置中訊息']);
  settingsSheet.appendRow(['maintenance_message_en', 'Website under construction, please visit later', '英文建置中訊息']);
  settingsSheet.appendRow(['closed_message_zh', '活動已圓滿結束，感謝您的參與', '中文活動結束訊息']);
  settingsSheet.appendRow(['closed_message_en', 'Event has ended successfully, thank you for your participation', '英文活動結束訊息']);
  settingsSheet.appendRow(['conference_title_zh', '會議名稱', '會議名稱中文']);
  settingsSheet.appendRow(['conference_title_en', 'Conference Title', '會議名稱英文']);
  settingsSheet.appendRow(['conference_subtitle_zh', '會議副標題', '會議副標題中文']);
  settingsSheet.appendRow(['conference_subtitle_en', 'Conference Subtitle', '會議副標題英文']);
  settingsSheet.appendRow(['conference_date', '', '會議日期']);
  settingsSheet.appendRow(['conference_location_zh', '會議地點', '會議地點中文']);
  settingsSheet.appendRow(['conference_location_en', 'Conference Location', '會議地點英文']);
  settingsSheet.appendRow(['hero_image_url', '', '主視覺圖片URL']);
  settingsSheet.appendRow(['registration_form_url', '', 'Google Form報名連結']);
  settingsSheet.appendRow(['google_maps_embed', '', 'Google Maps嵌入碼']);

  // 會議介紹工作表
  const aboutSheet = createOrGetSheet(ss, SHEETS.ABOUT);
  aboutSheet.clear();
  aboutSheet.appendRow(['id', 'title_zh', 'title_en', 'content_zh', 'content_en', 'image_url', 'sort_order', 'is_visible']);
  aboutSheet.appendRow(['1', '會議介紹', 'About Conference', '會議內容說明...', 'Conference description...', '', '1', 'true']);

  // 講師工作表
  const speakersSheet = createOrGetSheet(ss, SHEETS.SPEAKERS);
  speakersSheet.clear();
  speakersSheet.appendRow(['id', 'name_zh', 'name_en', 'title_zh', 'title_en', 'organization_zh', 'organization_en', 'short_bio_zh', 'short_bio_en', 'full_bio_zh', 'full_bio_en', 'topic_zh', 'topic_en', 'expertise_zh', 'expertise_en', 'photo_url', 'sort_order', 'is_visible']);
  speakersSheet.appendRow(['1', '張講師', 'Dr. Zhang', '教授', 'Professor', '台灣大學', 'National Taiwan University', '簡短介紹...', 'Short bio...', '詳細介紹...', 'Full bio...', '演講題目', 'Presentation Topic', '專長領域', 'Expertise', '', '1', 'true']);

  // 議程工作表
  const agendaSheet = createOrGetSheet(ss, SHEETS.AGENDA);
  agendaSheet.clear();
  agendaSheet.appendRow(['id', 'date', 'start_time', 'end_time', 'title_zh', 'title_en', 'speaker_zh', 'speaker_en', 'location_zh', 'location_en', 'notes_zh', 'notes_en', 'sort_order', 'is_visible']);
  agendaSheet.appendRow(['1', '2024-01-01', '09:00', '10:00', '開幕典禮', 'Opening Ceremony', '主持人', 'Moderator', '大廳', 'Main Hall', '備註', 'Notes', '1', 'true']);

  // 交通資訊工作表
  const trafficSheet = createOrGetSheet(ss, SHEETS.TRAFFIC);
  trafficSheet.clear();
  trafficSheet.appendRow(['id', 'type', 'title_zh', 'title_en', 'content_zh', 'content_en', 'sort_order', 'is_visible']);
  trafficSheet.appendRow(['1', 'address', '會場地址', 'Venue Address', '地址內容...', 'Address content...', '1', 'true']);
  trafficSheet.appendRow(['2', 'mrt', '捷運資訊', 'MRT Info', '捷運資訊...', 'MRT information...', '2', 'true']);

  // 個資宣告工作表
  const privacySheet = createOrGetSheet(ss, SHEETS.PRIVACY);
  privacySheet.clear();
  privacySheet.appendRow(['id', 'title_zh', 'title_en', 'content_zh', 'content_en', 'checkbox_text_zh', 'checkbox_text_en']);
  privacySheet.appendRow(['1', '個資蒐集告知事項', 'Privacy Policy', '個資內容...', 'Privacy content...', '我已閱讀並同意個資蒐集、處理及利用告知事項', 'I have read and agree to the privacy policy']);

  // 歷年會議工作表
  const pastEventsSheet = createOrGetSheet(ss, SHEETS.PAST_EVENTS);
  pastEventsSheet.clear();
  pastEventsSheet.appendRow(['id', 'year', 'title_zh', 'title_en', 'description_zh', 'description_en', 'album_url', 'featured_image_url', 'sort_order', 'is_visible']);
  pastEventsSheet.appendRow(['1', '2023', '2023年會議', '2023 Conference', '會議簡介...', 'Conference description...', 'https://drive.google.com/drive/folders/...', '', '1', 'true']);

  // 管理員帳號工作表
  const adminSheet = createOrGetSheet(ss, SHEETS.ADMIN_USERS);
  adminSheet.clear();
  adminSheet.appendRow(['id', 'username', 'password', 'name', 'role', 'is_active']);
  adminSheet.appendRow(['1', 'admin', 'admin123', '系統管理員', 'admin', 'true']);

  return '工作表初始化完成！請檢查各工作表是否正確建立。';
}

function createOrGetSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

// ═══════════════════════════════════════════════════════════════
// Web App 主入口
// ═══════════════════════════════════════════════════════════════
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'home';

  if (action === 'admin') {
    return HtmlService.createHtmlOutputFromFile('admin')
      .setTitle('會議網站管理後台')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (action === 'home') {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('會議活動官方網站')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return jsonOutput(handleApiAction(action, e.parameter));
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function jsonOutput(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleApiAction(action, data) {
  switch (action) {
    case 'getSettings':
      return { success: true, data: getSettings() };
    case 'getAbout':
      return { success: true, data: getAboutSections() };
    case 'getSpeakers':
      return { success: true, data: getSpeakers() };
    case 'getAgenda':
      return { success: true, data: getAgenda() };
    case 'getTraffic':
      return { success: true, data: getTraffic() };
    case 'getPrivacy':
      return { success: true, data: getPrivacy() };
    case 'getPastEvents':
      return { success: true, data: getPastEvents() };
    case 'adminLogin':
      return adminLogin(data.username, data.password);
    case 'saveSettings':
      return saveSettings(data.settings);
    case 'saveAbout':
      return saveAbout(data.about);
    case 'saveSpeakers':
      return saveSpeakers(data.speakers);
    case 'saveAgenda':
      return saveAgenda(data.agenda);
    case 'saveTraffic':
      return saveTraffic(data.traffic);
    case 'savePrivacy':
      return savePrivacy(data.privacy);
    case 'savePastEvents':
      return savePastEvents(data.pastEvents);
    default:
      return { success: false, error: '未知的動作' };
  }
}

// ═══════════════════════════════════════════════════════════════
// API 處理函數
// ═══════════════════════════════════════════════════════════════
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  try {
    return jsonOutput(handleApiAction(action, data));
  } catch (error) {
    return jsonOutput({ success: false, error: error.toString() });
  }
}

// ═══════════════════════════════════════════════════════════════
// 資料讀取函數
// ═══════════════════════════════════════════════════════════════
function getSettings() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const settings = {};

  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }

  return settings;
}

function getAboutSections() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.ABOUT);
  const data = sheet.getDataRange().getValues();
  const about = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === 'true') { // is_visible
      about.push({
        id: data[i][0],
        title_zh: data[i][1],
        title_en: data[i][2],
        content_zh: data[i][3],
        content_en: data[i][4],
        image_url: data[i][5],
        sort_order: parseInt(data[i][6])
      });
    }
  }

  return about.sort((a, b) => a.sort_order - b.sort_order);
}

function getSpeakers() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.SPEAKERS);
  const data = sheet.getDataRange().getValues();
  const speakers = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][17] === 'true') { // is_visible
      speakers.push({
        id: data[i][0],
        name_zh: data[i][1],
        name_en: data[i][2],
        title_zh: data[i][3],
        title_en: data[i][4],
        organization_zh: data[i][5],
        organization_en: data[i][6],
        short_bio_zh: data[i][7],
        short_bio_en: data[i][8],
        full_bio_zh: data[i][9],
        full_bio_en: data[i][10],
        topic_zh: data[i][11],
        topic_en: data[i][12],
        expertise_zh: data[i][13],
        expertise_en: data[i][14],
        photo_url: data[i][15],
        sort_order: parseInt(data[i][16])
      });
    }
  }

  return speakers.sort((a, b) => a.sort_order - b.sort_order);
}

function getAgenda() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.AGENDA);
  const data = sheet.getDataRange().getValues();
  const agenda = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][13] === 'true') { // is_visible
      agenda.push({
        id: data[i][0],
        date: data[i][1],
        start_time: data[i][2],
        end_time: data[i][3],
        title_zh: data[i][4],
        title_en: data[i][5],
        speaker_zh: data[i][6],
        speaker_en: data[i][7],
        location_zh: data[i][8],
        location_en: data[i][9],
        notes_zh: data[i][10],
        notes_en: data[i][11],
        sort_order: parseInt(data[i][12])
      });
    }
  }

  return agenda.sort((a, b) => a.sort_order - b.sort_order);
}

function getTraffic() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.TRAFFIC);
  const data = sheet.getDataRange().getValues();
  const traffic = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === 'true') { // is_visible
      traffic.push({
        id: data[i][0],
        type: data[i][1],
        title_zh: data[i][2],
        title_en: data[i][3],
        content_zh: data[i][4],
        content_en: data[i][5],
        sort_order: parseInt(data[i][6])
      });
    }
  }

  return traffic.sort((a, b) => a.sort_order - b.sort_order);
}

function getPrivacy() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.PRIVACY);
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) return null;

  return {
    id: data[1][0],
    title_zh: data[1][1],
    title_en: data[1][2],
    content_zh: data[1][3],
    content_en: data[1][4],
    checkbox_text_zh: data[1][5],
    checkbox_text_en: data[1][6]
  };
}

function getPastEvents() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.PAST_EVENTS);
  const data = sheet.getDataRange().getValues();
  const events = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][9] === 'true') { // is_visible
      events.push({
        id: data[i][0],
        year: data[i][1],
        title_zh: data[i][2],
        title_en: data[i][3],
        description_zh: data[i][4],
        description_en: data[i][5],
        album_url: data[i][6],
        featured_image_url: data[i][7],
        sort_order: parseInt(data[i][8])
      });
    }
  }

  return events.sort((a, b) => b.year - a.year); // 按年份降序排列
}

// ═══════════════════════════════════════════════════════════════
// 管理員登入
// ═══════════════════════════════════════════════════════════════
function adminLogin(username, password) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.ADMIN_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === username && data[i][2] === password && data[i][5] === 'true') {
      return {
        success: true,
        user: {
          id: data[i][0],
          username: data[i][1],
          name: data[i][3],
          role: data[i][4]
        }
      };
    }
  }

  return { success: false, error: '帳號或密碼錯誤' };
}

// ═══════════════════════════════════════════════════════════════
// 資料儲存函數
// ═══════════════════════════════════════════════════════════════
function saveSettings(settings) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();

  // 更新設定值
  for (let key in settings) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(settings[key]);
        break;
      }
    }
  }

  return { success: true, message: '設定已儲存' };
}

function saveAbout(about) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.ABOUT);
  sheet.clear();
  sheet.appendRow(['id', 'title_zh', 'title_en', 'content_zh', 'content_en', 'image_url', 'sort_order', 'is_visible']);

  about.forEach(item => {
    sheet.appendRow([
      item.id,
      item.title_zh,
      item.title_en,
      item.content_zh,
      item.content_en,
      item.image_url,
      item.sort_order,
      item.is_visible
    ]);
  });

  return { success: true, message: '會議介紹已儲存' };
}

function saveSpeakers(speakers) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.SPEAKERS);
  sheet.clear();
  sheet.appendRow(['id', 'name_zh', 'name_en', 'title_zh', 'title_en', 'organization_zh', 'organization_en', 'short_bio_zh', 'short_bio_en', 'full_bio_zh', 'full_bio_en', 'topic_zh', 'topic_en', 'expertise_zh', 'expertise_en', 'photo_url', 'sort_order', 'is_visible']);

  speakers.forEach(speaker => {
    sheet.appendRow([
      speaker.id,
      speaker.name_zh,
      speaker.name_en,
      speaker.title_zh,
      speaker.title_en,
      speaker.organization_zh,
      speaker.organization_en,
      speaker.short_bio_zh,
      speaker.short_bio_en,
      speaker.full_bio_zh,
      speaker.full_bio_en,
      speaker.topic_zh,
      speaker.topic_en,
      speaker.expertise_zh,
      speaker.expertise_en,
      speaker.photo_url,
      speaker.sort_order,
      speaker.is_visible
    ]);
  });

  return { success: true, message: '講師資料已儲存' };
}

function saveAgenda(agenda) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.AGENDA);
  sheet.clear();
  sheet.appendRow(['id', 'date', 'start_time', 'end_time', 'title_zh', 'title_en', 'speaker_zh', 'speaker_en', 'location_zh', 'location_en', 'notes_zh', 'notes_en', 'sort_order', 'is_visible']);

  agenda.forEach(item => {
    sheet.appendRow([
      item.id,
      item.date,
      item.start_time,
      item.end_time,
      item.title_zh,
      item.title_en,
      item.speaker_zh,
      item.speaker_en,
      item.location_zh,
      item.location_en,
      item.notes_zh,
      item.notes_en,
      item.sort_order,
      item.is_visible
    ]);
  });

  return { success: true, message: '議程資料已儲存' };
}

function saveTraffic(traffic) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.TRAFFIC);
  sheet.clear();
  sheet.appendRow(['id', 'type', 'title_zh', 'title_en', 'content_zh', 'content_en', 'sort_order', 'is_visible']);

  traffic.forEach(item => {
    sheet.appendRow([
      item.id,
      item.type,
      item.title_zh,
      item.title_en,
      item.content_zh,
      item.content_en,
      item.sort_order,
      item.is_visible
    ]);
  });

  return { success: true, message: '交通資訊已儲存' };
}

function savePrivacy(privacy) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.PRIVACY);
  sheet.clear();
  sheet.appendRow(['id', 'title_zh', 'title_en', 'content_zh', 'content_en', 'checkbox_text_zh', 'checkbox_text_en']);

  sheet.appendRow([
    privacy.id,
    privacy.title_zh,
    privacy.title_en,
    privacy.content_zh,
    privacy.content_en,
    privacy.checkbox_text_zh,
    privacy.checkbox_text_en
  ]);

  return { success: true, message: '個資宣告已儲存' };
}

function savePastEvents(pastEvents) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.PAST_EVENTS);
  sheet.clear();
  sheet.appendRow(['id', 'year', 'title_zh', 'title_en', 'description_zh', 'description_en', 'album_url', 'featured_image_url', 'sort_order', 'is_visible']);

  pastEvents.forEach(event => {
    sheet.appendRow([
      event.id,
      event.year,
      event.title_zh,
      event.title_en,
      event.description_zh,
      event.description_en,
      event.album_url,
      event.featured_image_url,
      event.sort_order,
      event.is_visible
    ]);
  });

  return { success: true, message: '歷年會議已儲存' };
}