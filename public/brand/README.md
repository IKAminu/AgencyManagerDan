# Dandurgu brand assets

The primary Dandurgu logo is currently installed as `logo.png`.

- App sidebar: `public/brand/logo.png`
- Browser tab favicon: `public/brand/logo.png`
- Browser title: `Dandurgu Headquarters | Travel Operations` (configured in the root `index.html`)

To replace the logo later, keep the filename `logo.png` and overwrite this file. A transparent PNG is recommended. The app uses the Vite base path automatically, so the same asset path works on GitHub Pages and the future custom domain.

Do not put customer documents, passports, receipts, or other private files in this folder. Anything under `public/` is included in the public website build and can be accessed by anyone who knows its URL.
