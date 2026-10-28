# SPIP Hack Letter Maker

A single-page letter generator hosted on Vercel. **Save PDF to Google Drive**
sends the finished PDF to a Google Apps Script web app, which checks a
Cloudflare Turnstile token and then saves the file in the team's Drive folder.

```
Browser (Vercel page) ──PDF + Turnstile token──▶ Apps Script ──verify──▶ Cloudflare
                                                     │
                                                     └──▶ Google Drive folder
```

| File | What it is |
| --- | --- |
| `index.html` | The app. Vercel serves it at `/`. |
| `config.js` | Public settings: Apps Script URL and Turnstile site key. |
| `apps-script/Code.gs` | The upload endpoint. Paste it into Apps Script; it is not published on Vercel. |
| `.vercelignore` | Keeps `apps-script/` and this README off the website. |

**Save as PDF / Print** and **Save as my template** work without any setup.

## Setup

### 1. Cloudflare Turnstile

1. In the Cloudflare dashboard, open **Turnstile → Add widget**.
2. Add your Vercel domain (for example `your-app.vercel.app`) as a hostname.
   Add `localhost` too if you want to test locally.
3. Choose **Managed** mode. Copy the **site key** and the **secret key**.

### 2. Google Apps Script

1. Sign in with the Google account that can edit the destination folder, and
   create a project at [script.google.com](https://script.google.com/).
2. Replace the contents of `Code.gs` with `apps-script/Code.gs` from this repo.
   The folder ID is set in `DRIVE_FOLDER_ID` at the top.
3. **Project Settings → Script Properties → Add property**:
   `TURNSTILE_SECRET_KEY` = the Turnstile secret key.
4. In the editor, select `checkSetup` and press **Run**. Approve the Drive and
   external-request permissions. It should log `OK: saving to folder "…"`.
5. **Deploy → New deployment → Web app**, with **Execute as: Me** and
   **Who has access: Anyone**. Copy the web app URL (it ends in `/exec`).

"Anyone" is required so the Vercel page can reach the script. Turnstile is what
stops bots: the script refuses any upload without a valid, unused token.

After changing `Code.gs` later, use **Deploy → Manage deployments → Edit →
Version: New version**. The URL stays the same.

### 3. Vercel

1. Fill in `config.js`:
   ```js
   window.LETTER_CONFIG = {
     saveUrl: 'https://script.google.com/macros/s/…/exec',
     turnstileSiteKey: '0x…'
   };
   ```
2. Import the repository in Vercel. No build step is needed (Framework preset:
   **Other**). Every push redeploys the site.

## Testing locally

Serve the folder (for example `python3 -m http.server`) and open
`http://localhost:8000`. Cloudflare's test keys always pass, which is handy for
trying the flow: site key `1x00000000000000000000AA` with secret key
`1x0000000000000000000000000000000AA`. Switch back to the real keys before
deploying.
# email-maker-spip-hack-27
