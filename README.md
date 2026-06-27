<div align="center">

# SehatGuardian AI

**Preventive Health Intelligence for India**

Culturally-aware, multilingual AI for early Diabetes & Blood Pressure risk awareness — guidance, not diagnosis.

[![Live Demo](https://img.shields.io/badge/Live-sehat--mitra.lovable.app-0d9488?style=flat-square)](https://sehat-mitra.lovable.app)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Backend-Lovable%20Cloud-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285f4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## Overview

**SehatGuardian AI** is a preventive health platform that helps users in India understand their risk for two of the most prevalent lifestyle diseases — **Type 2 Diabetes** and **Hypertension** — through a culturally-aware, multilingual, AI-powered assessment.

The product is intentionally **assistive, not diagnostic**. Every output is framed as guidance, supported by a mandatory medical disclaimer, and tuned for the Indian context (diet, lifestyle, vernacular language, regional risk patterns).

> Aligned with **UN SDG 3 — Good Health & Well-being**.

---

## Key Features

| Module | Description |
| --- | --- |
| **3-Layer Risk Engine** | Population baseline + personal modifiers + interaction effects to estimate Diabetes & BP risk. |
| **Meal Scanner** | AI vision (Gemini 2.5 Flash) analyzes Indian meals for carb and salt impact — no calorie counting. |
| **Lab Report Decoder** | Upload a lab PDF/image; receive plain-language explanations of every marker. |
| **Know Yourself More** | Conversational deep-dive that contextualizes risk with lifestyle, family history, and habits. |
| **Rooted in Indian Wellness** | Ayurveda- and Yoga-informed, non-prescriptive lifestyle guidance, fully translated. |
| **Health Journey Dashboard** | Action plans, trend charts, assessment history, and PDF export. |
| **Institution Dashboard** | Anonymous, aggregated campus wellness analytics for colleges/NGOs with AI campaign generator, predictive alerts, and heatmaps. |
| **Multilingual UI** | English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी. |

---

## Tech Stack

**Frontend** — React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui, Radix UI, React Router, TanStack Query, Recharts, jsPDF.

**Backend (Lovable Cloud)** — PostgreSQL with Row-Level Security, Deno Edge Functions (serverless microservices), Supabase Auth (JWT), Supabase Storage.

**AI** — Google Gemini 2.5 Flash via Lovable AI Gateway for vision, multilingual reasoning, and structured JSON outputs.

**Security** — RLS on every public table, `SECURITY DEFINER` helpers with pinned `search_path`, role-based access via a dedicated `user_roles` table, JWT-gated edge functions, payload size limits.

---

## Architecture

```text
                ┌─────────────────────────────────────────┐
                │   React + Vite + Tailwind (PWA-ready)   │
                │   i18n  •  TanStack Query  •  shadcn    │
                └────────────────────┬────────────────────┘
                                     │  HTTPS / JWT
                ┌────────────────────▼────────────────────┐
                │             Lovable Cloud               │
                │  ┌────────────┐  ┌────────────────────┐ │
                │  │ Postgres   │  │  Edge Functions    │ │
                │  │  + RLS     │  │  calculate-risk    │ │
                │  │  + Roles   │  │  analyze-meal      │ │
                │  │            │  │  decode-lab-report │ │
                │  │            │  │  know-yourself     │ │
                │  └────────────┘  └─────────┬──────────┘ │
                └────────────────────────────┼────────────┘
                                             │
                                ┌────────────▼────────────┐
                                │  Lovable AI Gateway     │
                                │  Gemini 2.5 Flash       │
                                └─────────────────────────┘
```

---

## Project Structure

```text
src/
├── components/          # UI + feature components (incl. institution/*)
├── pages/               # Routes: Index, Auth, Dashboard, History, Profile, Institution
├── contexts/            # LanguageContext (i18n)
├── translations/        # en, hi, ta, te, bn, mr
├── hooks/               # useAuth, use-toast, use-mobile
├── integrations/supabase # auto-generated client & types (do not edit)
├── utils/               # PDF generators, helpers
└── data/                # Wellness knowledge base

supabase/
├── functions/           # Deno edge functions
└── migrations/          # SQL schema, RLS, policies
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and `npm` (or `bun`)

### Install & Run
```bash
git clone <your-repo-url>
cd sehatguardian
npm install
npm run dev
```
The app starts on `http://localhost:8080`. Backend (database, auth, edge functions) runs on Lovable Cloud — no local setup required.

### Build
```bash
npm run build      # production build
npm run preview    # preview production build
```

---

## Responsible-Use Disclaimer

SehatGuardian AI is an **educational and assistive tool**. It does **not** diagnose, treat, prescribe, or replace professional medical advice. AI outputs may be inaccurate. Always consult a qualified healthcare professional for medical decisions.

---

## License

This project is released for educational and demonstration purposes. All third-party trademarks belong to their respective owners.

---

<div align="center">
Built with care for India 🇮🇳 — <strong>SehatGuardian Team</strong>
</div>
