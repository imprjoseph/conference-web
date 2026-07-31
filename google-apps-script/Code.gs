/**
 * 2026 智慧網路 SIG 研討會－網站 API
 * 部署方式請參閱同目錄 README.md。
 */

const DEFAULT_SPREADSHEET_ID = '1r82HCNk51leDTqTptNPis1cnvP9TMx-54i7ZRIyPGLY';

const SHEET_SCHEMAS = Object.freeze({
  Settings: ['key', 'value', '備註'],
  About: ['id', 'title_zh', 'title_en', 'content_zh', 'content_en', 'sort_order', 'is_visible'],
  Speakers: ['id', 'name_zh', 'name_en', 'title_zh', 'title_en', 'organization_zh', 'organization_en', 'photo_url', 'short_bio_zh', 'short_bio_en', 'full_bio_zh', 'full_bio_en', 'expertise_zh', 'expertise_en', 'sort_order', 'is_visible'],
  Agenda: ['id', 'date', 'start_time', 'end_time', 'title_zh', 'title_en', 'speaker_zh', 'speaker_en', 'location_zh', 'location_en', 'type', 'notes_zh', 'notes_en', 'sort_order', 'is_visible'],
  Traffic: ['id', 'type', 'title_zh', 'title_en', 'description_zh', 'description_en', 'sort_order', 'is_visible'],
  Privacy: ['title_zh', 'title_en', 'content_zh', 'content_en', 'checkbox_text_zh', 'checkbox_text_en'],
  PastEvents: ['id', 'year', 'title_zh', 'title_en', 'description_zh', 'description_en', 'album_url', 'featured_image_url', 'sort_order', 'is_visible'],
  News: ['id', 'date', 'type', 'title_zh', 'title_en', 'content_zh', 'content_en', 'link_url', 'sort_order', 'is_visible'],
  Sponsors: ['id', 'tier', 'name_zh', 'name_en', 'logo_url', 'website_url', 'sort_order', 'is_visible'],
  Downloads: ['id', 'category', 'title_zh', 'title_en', 'file_url', 'sort_order', 'is_visible'],
  FAQ: ['id', 'question_zh', 'question_en', 'answer_zh', 'answer_en', 'sort_order', 'is_visible'],
  FormFields: ['key', 'label_zh', 'label_en', 'type', 'required', 'half', 'sort_order', 'is_visible'],
  Registrations: ['timestamp', 'name', 'email', 'phone', 'org', 'title', 'remarks', 'status', 'admin_notes'],
  Subscribers: ['timestamp', 'email', 'language', 'status']
});

const READ_ACTIONS = Object.freeze({
  getAbout: 'About',
  getSpeakers: 'Speakers',
  getAgenda: 'Agenda',
  getTraffic: 'Traffic',
  getPastEvents: 'PastEvents',
  getNews: 'News',
  getSponsors: 'Sponsors',
  getDownloads: 'Downloads',
  getFaq: 'FAQ',
  getFormFields: 'FormFields'
});

const SAVE_ACTIONS = Object.freeze({
  saveAbout: { sheet: 'About', key: 'about' },
  saveSpeakers: { sheet: 'Speakers', key: 'speakers' },
  saveAgenda: { sheet: 'Agenda', key: 'agenda' },
  saveTraffic: { sheet: 'Traffic', key: 'traffic' },
  savePastEvents: { sheet: 'PastEvents', key: 'pastEvents' },
  saveNews: { sheet: 'News', key: 'news' },
  saveSponsors: { sheet: 'Sponsors', key: 'sponsors' },
  saveDownloads: { sheet: 'Downloads', key: 'downloads' },
  saveFaq: { sheet: 'FAQ', key: 'faq' }
});

function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  try {
    const params = (e && e.parameter) || {};
    const payload = parsePayload_(params.payload);
    const action = params.action || payload.action || 'getSettings';
    const result = route_(action, params, payload);
    return json_(Object.assign({ success: true }, result || {}));
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return json_({ success: false, error: error.message || String(error) });
  }
}

function route_(action, params, payload) {
  if (requiresAdmin_(action)) requireAdminSession_(params, payload);
  if (READ_ACTIONS[action]) return { data: readVisibleRows_(READ_ACTIONS[action]) };
  if (SAVE_ACTIONS[action]) {
    const config = SAVE_ACTIONS[action];
    const items = payload[config.key];
    upsertRows_(config.sheet, Array.isArray(items) ? items : [items]);
    return { message: '儲存成功' };
  }

  switch (action) {
    case 'getSettings': return { data: getSettings_() };
    case 'getPrivacy': return { data: readFirstRow_('Privacy') };
    case 'adminLogin': return adminLogin_(payload.username, payload.password);
    case 'adminLogout': return adminLogout_(params, payload);
    case 'saveSettings': saveSettings_(payload.settings || {}); return { message: '設定已儲存' };
    case 'saveSingleSetting': saveSingleSetting_(params.key || payload.key, params.value !== undefined ? params.value : payload.value); return { message: '設定已儲存' };
    case 'savePrivacy': savePrivacy_(payload.privacy || {}); return { message: '隱私權內容已儲存' };
    case 'saveRegistrant': return saveRegistrant_(params);
    case 'saveSubscriber': return saveSubscriber_(params);
    case 'deleteRow': deleteRow_(payload.sheetName, payload.id); return { message: '刪除成功' };
    case 'saveConfig': saveConfig_(payload.config || {}); return { message: '連線設定已儲存' };
    case 'initSheets': ensureSheets_(); return { message: '工作表檢查完成' };
    case 'health': return { data: { status: 'ok', spreadsheet_id: getSpreadsheetId_() } };
    default: throw new Error('不支援的 action：' + action);
  }
}

/** 首次使用：在 Apps Script 編輯器執行一次，設定後台帳密。 */
function setAdminCredentials(username, password, displayName) {
  if (!username || !password || String(password).length < 10) {
    throw new Error('請設定帳號及至少 10 個字元的密碼');
  }
  const salt = Utilities.getUuid() + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperties({
    ADMIN_USERNAME: String(username),
    ADMIN_PASSWORD_SALT: salt,
    ADMIN_PASSWORD_HASH: hash_(salt + ':' + String(password)),
    ADMIN_DISPLAY_NAME: String(displayName || username)
  });
}

/** 可選：如需改綁其他 Sheet，可在編輯器執行 setSpreadsheetId('ID')。 */
function setSpreadsheetId(spreadsheetId) {
  if (!spreadsheetId) throw new Error('Spreadsheet ID 不可為空');
  SpreadsheetApp.openById(String(spreadsheetId));
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', String(spreadsheetId));
}

function adminLogin_(username, password) {
  const props = PropertiesService.getScriptProperties();
  const expectedUser = props.getProperty('ADMIN_USERNAME');
  const expectedHash = props.getProperty('ADMIN_PASSWORD_HASH');
  let salt = props.getProperty('ADMIN_PASSWORD_SALT');
  if (!expectedUser || !expectedHash) throw new Error('尚未設定管理員帳密，請先執行 setAdminCredentials');

  const normalizedUser = String(username || '').trim();
  const attemptsKey = 'login-attempts:' + hash_(normalizedUser || 'unknown');
  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(attemptsKey) || 0);
  if (attempts >= 5) return { success: false, error: '登入失敗次數過多，請於 15 分鐘後再試' };

  const candidateHash = salt
    ? hash_(salt + ':' + String(password || ''))
    : hash_(String(password || ''));
  if (normalizedUser !== expectedUser || !safeEquals_(candidateHash, expectedHash)) {
    cache.put(attemptsKey, String(attempts + 1), 900);
    return { success: false, error: '帳號或密碼錯誤' };
  }

  cache.remove(attemptsKey);
  if (!salt) {
    salt = Utilities.getUuid() + Utilities.getUuid();
    props.setProperties({
      ADMIN_PASSWORD_SALT: salt,
      ADMIN_PASSWORD_HASH: hash_(salt + ':' + String(password || ''))
    });
  }

  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('admin-session:' + hash_(token), expectedUser, 21600);
  return {
    user: { username: expectedUser, name: props.getProperty('ADMIN_DISPLAY_NAME') || expectedUser },
    adminToken: token,
    expiresIn: 21600
  };
}

function requiresAdmin_(action) {
  return !!SAVE_ACTIONS[action] || [
    'saveSettings', 'saveSingleSetting', 'savePrivacy', 'deleteRow',
    'saveConfig', 'initSheets'
  ].indexOf(action) >= 0;
}

function requireAdminSession_(params, payload) {
  const token = String((payload && payload.adminToken) || (params && params.adminToken) || '');
  if (!token || !CacheService.getScriptCache().get('admin-session:' + hash_(token))) {
    throw new Error('管理員登入已失效，請重新登入');
  }
}

function adminLogout_(params, payload) {
  const token = String((payload && payload.adminToken) || (params && params.adminToken) || '');
  if (token) CacheService.getScriptCache().remove('admin-session:' + hash_(token));
  return { message: '已登出' };
}

function getSpreadsheetId_() {
  return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID;
}

function db_() {
  return SpreadsheetApp.openById(getSpreadsheetId_());
}

function sheet_(name) {
  const sheet = db_().getSheetByName(name);
  if (!sheet) throw new Error('找不到工作表：' + name);
  return sheet;
}

function getSettings_() {
  const rows = values_(sheet_('Settings'));
  const result = {};
  rows.slice(1).forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) result[key] = normalizeValue_(row[1]);
  });
  return result;
}

function saveSettings_(settings) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    Object.keys(settings).forEach(function(key) { saveSingleSetting_(key, settings[key]); });
  } finally {
    lock.releaseLock();
  }
}

function saveSingleSetting_(key, value) {
  key = String(key || '').trim();
  if (!key) throw new Error('設定鍵值不可為空');
  const sheet = sheet_('Settings');
  const values = values_(sheet);
  let rowNumber = 0;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === key) { rowNumber = i + 1; break; }
  }
  const safeValue = safeCell_(value);
  if (rowNumber) sheet.getRange(rowNumber, 2).setValue(safeValue);
  else sheet.appendRow([safeCell_(key), safeValue, '']);
}

function readVisibleRows_(sheetName) {
  return readRows_(sheetName).filter(function(item) {
    return item.is_visible === undefined || truthy_(item.is_visible);
  }).sort(function(a, b) {
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function readRows_(sheetName) {
  const rows = values_(sheet_(sheetName));
  if (!rows.length) return [];
  const headers = rows[0].map(String);
  return rows.slice(1).filter(function(row) {
    return row.some(function(value) { return value !== ''; });
  }).map(function(row) {
    const item = {};
    headers.forEach(function(header, index) { item[header] = normalizeValue_(row[index]); });
    return item;
  });
}

function readFirstRow_(sheetName) {
  const rows = readRows_(sheetName);
  return rows.length ? rows[0] : {};
}

function upsertRows_(sheetName, items) {
  if (!items || !items.length || !items[0]) throw new Error('沒有可儲存的資料');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = sheet_(sheetName);
    const headers = header_(sheet);
    const keyName = headers.indexOf('id') >= 0 ? 'id' : headers[0];
    items.forEach(function(item) {
      if (!item[keyName]) item[keyName] = Utilities.getUuid();
      const current = values_(sheet);
      let rowNumber = 0;
      for (let i = 1; i < current.length; i++) {
        if (String(current[i][headers.indexOf(keyName)]) === String(item[keyName])) { rowNumber = i + 1; break; }
      }
      const row = headers.map(function(header) { return safeCell_(item[header] === undefined ? '' : item[header]); });
      if (rowNumber) sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
      else sheet.appendRow(row);
    });
  } finally {
    lock.releaseLock();
  }
}

function savePrivacy_(privacy) {
  const sheet = sheet_('Privacy');
  const headers = header_(sheet);
  const row = headers.map(function(header) { return safeCell_(privacy[header] || ''); });
  if (sheet.getLastRow() < 2) sheet.appendRow(row);
  else sheet.getRange(2, 1, 1, headers.length).setValues([row]);
}

function saveRegistrant_(params) {
  if (String(params.website || '').trim()) return { message: '已收到報名資料', email_sent: false };

  const email = cleanText_(params.email, 254).toLowerCase();
  const name = cleanText_(params.name, 100);
  const org = cleanText_(params.org, 200);
  const title = cleanText_(params.title, 150);
  if (!name || !email || !org || !title) throw new Error('姓名、Email、所屬單位與職稱為必填');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email 格式不正確');

  const cache = CacheService.getScriptCache();
  const rateKey = 'registration:' + hash_(email);
  if (cache.get(rateKey)) throw new Error('此 Email 剛完成報名，請稍後再試');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet_('Registrations').appendRow([
      new Date(), safeCell_(name), safeCell_(email), safeCell_(cleanText_(params.phone, 50)),
      safeCell_(org), safeCell_(title), safeCell_(cleanText_(params.remarks, 1000)),
      'received', ''
    ]);
  } finally {
    lock.releaseLock();
  }

  cache.put(rateKey, '1', 600);

  return { message: '已收到報名資料', email_sent: sendRegistrationReceipt_(email, {
    name: name,
    email: email,
    phone: cleanText_(params.phone, 50),
    org: org,
    title: title,
    remarks: cleanText_(params.remarks, 1000)
  }) };
}

function saveSubscriber_(params) {
  if (String(params.website || '').trim()) return { message: '訂閱成功' };
  const email = cleanText_(params.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email 格式不正確');
  const cache = CacheService.getScriptCache();
  const rateKey = 'subscriber:' + hash_(email);
  if (cache.get(rateKey)) throw new Error('請稍後再試');
  cache.put(rateKey, '1', 300);
  const existing = readRows_('Subscribers').some(function(item) { return String(item.email).toLowerCase() === email; });
  if (!existing) sheet_('Subscribers').appendRow([new Date(), safeCell_(email), safeCell_(params.language || 'zh'), 'active']);
  return { message: '訂閱成功' };
}

function sendRegistrationReceipt_(email, registrant) {
  const settings = getSettings_();
  const title = settings.conference_title_zh || '會議活動';
  const contactEmail = settings.contact_email || 'arlena@impr.com.tw';
  if (String(settings.receipt_email_enabled || 'true').toLowerCase() === 'false') return null;

  const variables = {
    name: registrant.name || '',
    email: registrant.email || '',
    phone: registrant.phone || '',
    org: registrant.org || '',
    job_title: registrant.title || '',
    remarks: registrant.remarks || '',
    conference_title: title,
    conference_title_zh: settings.conference_title_zh || title,
    conference_title_en: settings.conference_title_en || '',
    conference_date: settings.conference_date || '',
    conference_location: settings.conference_location_zh || settings.conference_location_en || '',
    contact_email: contactEmail
  };
  const oldDefaultSubject = '【{{conference_title}}】已收到您的報名資料';
  const oldDefaultBody = [
    '{{name}} 您好：',
    '',
    '我們已收到您參加「{{conference_title}}」的報名資料。',
    '主辦單位審核完成後，將再以 Email 通知。',
    '',
    '此信由系統自動寄出，請勿直接回覆。'
  ].join('\n');
  const requestedBodyWithExtraBlank = [
    '{{name}} 您好：',
    '',
    '感謝您報名參加由工業技術研究院主辦的 「2026 智慧網路 SIG 研討會」！',
    '',
    '我們已收到您的報名資料，為確保報名資格及活動品質，主辦單位將進行報名資格審核，並於 2026 年 8 月 31 日（星期一）23:59 前完成審核作業。',
    '',
    '審核通過者，將統一寄發 「報名確認信」，信件中將包含您的入場編號及活動相關資訊，敬請留意您的電子信箱。',
    '',
    '姓名\t{{name}}',
    'Email\t{{email}}',
    '聯絡電話\t{{phone}}',
    '所屬單位（公司、法人、學校等）\t{{org}}',
    '職稱\t{{job_title}}',
    '備註\t{{remarks}}',
    '',
    '若您需要更正報名資料，或有任何疑問，歡迎與主辦單位聯繫：',
    'Email： {{contact_email}}',
    '再次感謝您的支持與報名，期待與您在研討會相見！',
    '',
    '',
    '敬祝',
    '順心愉快',
    '工業技術研究院 資訊與通訊研究所',
    '2026 智慧網路 SIG 研討會 工作小組 敬上'
  ].join('\n');
  const defaultSubject = '2026智慧網路 SIG 研討會 - 已收到您的報名資訊';
  const defaultBody = [
    '{{name}} 您好：',
    '',
    '感謝您報名參加由工業技術研究院主辦的 「2026 智慧網路 SIG 研討會」！',
    '',
    '我們已收到您的報名資料，為確保報名資格及活動品質，主辦單位將進行報名資格審核，並於 2026 年 8 月 31 日（星期一）23:59 前完成審核作業。',
    '',
    '審核通過者，將統一寄發 「報名確認信」，信件中將包含您的入場編號及活動相關資訊，敬請留意您的電子信箱。',
    '',
    '姓名\t{{name}}',
    'Email\t{{email}}',
    '聯絡電話\t{{phone}}',
    '所屬單位（公司、法人、學校等）\t{{org}}',
    '職稱\t{{job_title}}',
    '備註\t{{remarks}}',
    '若您需要更正報名資料，或有任何疑問，歡迎與主辦單位聯繫：',
    'Email： {{contact_email}}',
    '再次感謝您的支持與報名，期待與您在研討會相見！',
    '',
    '',
    '敬祝',
    '順心愉快',
    '工業技術研究院 資訊與通訊研究所',
    '2026 智慧網路 SIG 研討會 工作小組 敬上'
  ].join('\n');
  // 客戶指定「收到報名資訊」通知信需固定使用此版，避免後台舊模板覆蓋。
  const subjectTemplate = defaultSubject;
  const bodyTemplate = defaultBody;
  const subject = renderTemplate_(subjectTemplate, variables);
  const body = removeDietaryLine_(renderTemplate_(bodyTemplate, variables));
  const senderName = renderTemplate_(settings.receipt_email_sender_name || '{{conference_title}}', variables);
  const replyTo = String(settings.receipt_email_reply_to || contactEmail || '').trim().slice(0, 254);

  try {
    const mailOptions = {
      to: email,
      subject: subject,
      htmlBody: textToHtml_(body),
      name: senderName
    };
    if (replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) mailOptions.replyTo = replyTo;
    MailApp.sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('報名通知信寄送失敗：' + error.message);
    return false;
  }
}

function deleteRow_(sheetName, id) {
  if (!SHEET_SCHEMAS[sheetName]) throw new Error('不允許操作工作表：' + sheetName);
  if (!id) throw new Error('缺少資料 ID');
  const sheet = sheet_(sheetName);
  const headers = header_(sheet);
  const idIndex = headers.indexOf('id');
  if (idIndex < 0) throw new Error('此工作表沒有 id 欄位');
  const rows = values_(sheet);
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][idIndex]) === String(id)) { sheet.deleteRow(i + 1); return; }
  }
  throw new Error('找不到指定資料');
}

function saveConfig_(config) {
  if (config.sheet_id) setSpreadsheetId(config.sheet_id);
  if (config.api_url) PropertiesService.getScriptProperties().setProperty('API_URL', String(config.api_url));
}

function ensureSheets_() {
  const spreadsheet = db_();
  Object.keys(SHEET_SCHEMAS).forEach(function(name) {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      const headers = SHEET_SCHEMAS[name];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e5e7eb');
      sheet.setFrozenRows(1);
    }
  });
  spreadsheet.setSpreadsheetTimeZone('Asia/Taipei');
}

function parsePayload_(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch (error) { throw new Error('payload JSON 格式錯誤'); }
}

function values_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (!lastRow || !lastColumn) return [];
  return sheet.getRange(1, 1, lastRow, lastColumn).getValues();
}

function header_(sheet) {
  const values = values_(sheet);
  if (!values.length) throw new Error(sheet.getName() + ' 缺少標題列');
  return values[0].map(String);
}

function normalizeValue_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, 'Asia/Taipei', "yyyy-MM-dd'T'HH:mm:ssXXX");
  return value;
}

function truthy_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
}

function safeCell_(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean' || typeof value === 'number' || value instanceof Date) return value;
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function cleanText_(value, maxLength) {
  const text = String(value === null || value === undefined ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
  if (text.length > maxLength) throw new Error('輸入內容超過長度限制');
  return text;
}

function hash_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(byte) { const value = byte < 0 ? byte + 256 : byte; return ('0' + value.toString(16)).slice(-2); }).join('');
}

function safeEquals_(left, right) {
  left = String(left || '');
  right = String(right || '');
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

function escapeHtml_(text) {
  return String(text || '').replace(/[&<>"']/g, function(char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

function renderTemplate_(template, variables) {
  return String(template || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function(match, key) {
    return variables[key] === undefined || variables[key] === null ? '' : String(variables[key]);
  });
}

function removeDietaryLine_(text) {
  return String(text || '').split('\n').filter(function(line) {
    return !/(飲食需求|餐食需求|dietary)/i.test(line);
  }).join('\n');
}

function textToHtml_(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map(function(paragraph) {
      return '<p>' + escapeHtml_(paragraph).replace(/\t/g, '&emsp;').replace(/\n/g, '<br>') + '</p>';
    })
    .join('');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
