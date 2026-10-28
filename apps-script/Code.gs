// Upload endpoint for the SPIP Hack Letter Maker (the page itself is hosted on Vercel).
// The page POSTs { token, filename, pdf } here; the Turnstile token is checked with
// Cloudflare before anything is written to Drive.
//
// Setup (see README): put the Turnstile secret key in Project Settings → Script Properties
// as TURNSTILE_SECRET_KEY, run checkSetup once, then deploy as a web app
// (Execute as: Me, Who has access: Anyone).

const DRIVE_FOLDER_ID = '1j_3-brmaFhFRYheYJHlkIA70zhPK1ms_';
// Each A4 page is roughly 400 KB of base64, so this allows multi-page and bilingual letters.
const MAX_PDF_BASE64_SIZE = 10000000;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Run this once from the editor: it asks for Drive and external-request permission
// and confirms the folder and secret are set up.
function checkSetup() {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID).getName();
  if (!PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET_KEY')) {
    throw new Error('Add TURNSTILE_SECRET_KEY in Project Settings → Script Properties.');
  }
  return 'OK: saving to folder "' + folder + '"';
}

function doPost(e) {
  try {
    const body = (e && e.postData && e.postData.contents) || '';
    if (body.length > MAX_PDF_BASE64_SIZE + 10000) throw new Error('The PDF is too large.');
    const request = JSON.parse(body || '{}');

    const pdfBase64 = request.pdf;
    if (typeof pdfBase64 !== 'string' || pdfBase64.length === 0 || pdfBase64.length > MAX_PDF_BASE64_SIZE) {
      throw new Error('The PDF export is empty or too large.');
    }
    if (typeof request.filename !== 'string' || request.filename.trim() === '') {
      throw new Error('A filename is required.');
    }

    verifyTurnstile_(request.token);

    const bytes = Utilities.base64Decode(pdfBase64);
    if (Utilities.newBlob(bytes.slice(0, 5)).getDataAsString() !== '%PDF-') {
      throw new Error('The upload is not a PDF.');
    }
    const safeFilename = request.filename.replace(/[\\/:*?"<>|#%{}~&]/g, '-').slice(0, 180);
    const file = DriveApp.getFolderById(DRIVE_FOLDER_ID)
      .createFile(Utilities.newBlob(bytes, MimeType.PDF, safeFilename + '.pdf'));
    return json_({ ok: true, name: file.getName(), url: file.getUrl() });
  } catch (error) {
    // Always answer with JSON: an uncaught error returns an HTML page the browser cannot read.
    return json_({ ok: false, error: String((error && error.message) || error) });
  }
}

function verifyTurnstile_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET_KEY');
  if (!secret) throw new Error('Drive saving is not set up yet (missing TURNSTILE_SECRET_KEY).');
  if (typeof token !== 'string' || token === '' || token.length > 2048) {
    throw new Error('Missing verification. Please try again.');
  }
  const response = UrlFetchApp.fetch(TURNSTILE_VERIFY_URL, {
    method: 'post',
    payload: { secret: secret, response: token },
    muteHttpExceptions: true
  });
  let result = {};
  try { result = JSON.parse(response.getContentText()); } catch (e) {}
  if (!result.success) {
    throw new Error('Verification failed (' + (result['error-codes'] || ['unknown']).join(', ') + '). Please try again.');
  }
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
