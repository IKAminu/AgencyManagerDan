# Dandurgu Headquarters

An internal operations application for Dandurgu Air Travel & Tours Ltd. It gives leads, customers, packages, bookings, travellers, payments, supplier obligations and document references one connected home.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide and a prepared Supabase client. The current demonstration uses coherent in-memory mock records.

## Run locally

1. Install Node 22 and pnpm 10.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env.local`.
4. Keep `VITE_USE_MOCK_DATA=true`.
5. Run `pnpm dev`.

Useful checks: `pnpm typecheck`, `pnpm build`, and `pnpm format`.

## Data modes

- `VITE_USE_MOCK_DATA=true`: uses demonstration records. Newly created records last for the browser session and are not database records.
- `VITE_USE_MOCK_DATA=false`: activates the Supabase service path. Do this only after deploying and reviewing the proposed schema, authentication and RLS.

Never put a Supabase service-role key or a private Meta/Google token in a `VITE_` variable.

## Project structure

Presentation is in `src/pages`, `src/layouts`, and `src/components`. Operational calculations are in `src/lib/business.ts`. Typed records are in `src/types`, mock data in `src/data`, and the replaceable data boundary in `src/services`.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys `dist`. In the repository settings, enable Pages with **GitHub Actions** as the source. For a custom domain, add the domain in Pages settings, then configure the exact DNS records supplied by GitHub at the DNS provider. The app does not hardcode the planned domain.

The included `404.html` returns nested SPA URLs to the root. For project-subpath deployment, set `VITE_BASE_PATH`; the intended custom subdomain uses `/`.

## Install on a phone

- iPhone/iPad: open the deployed site in Safari, tap Share, then **Add to Home Screen**.
- Android: open it in Chrome, open the menu, then choose **Install app** or **Add to Home screen**.

The manifest provides standalone display preparation. Offline data access is not implemented or claimed.

## Current scope

Implemented in the frontend: all primary module routes, responsive navigation, global mock search, derived notifications, sorting-ready tables, search/filter controls, dashboard calculations, manual lead/customer/booking/payment/traveller forms, financial rules, and PWA metadata.

Mocked: records and record creation. Prepared but not connected: Supabase, authentication, Google Drive, website capture and Meta. Complex detail editing, server persistence, file upload and automated integrations remain later work. See `IMPLEMENTATION_STATUS.md`.
