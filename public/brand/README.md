# Dandurgu brand assets

Place the main Dandurgu logo in this folder as:

- `logo.svg` (recommended): transparent SVG, with no unnecessary canvas padding.
- `logo.png` (alternative): transparent PNG, preferably at least 1000 px wide.

The intended app asset path for the primary logo is:

`/AgencyManagerDan/brand/logo.svg`

When the logo is supplied, the app's sidebar/header can be updated to use it. Keep the existing `public/favicon.svg` and `public/app-icon.svg` for the browser favicon and install icon; the main logo should not replace those automatically.

Do not put customer documents, passports, receipts, or other private files in this public folder. Anything placed under `public/` is included in the public website build and can be accessed by anyone who knows its URL.
