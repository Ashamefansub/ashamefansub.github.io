# 🤖 AGENTS.md — Standar & Best Practices Proyek Next.js + TypeScript

Dokumen ini berisi panduan, konvensi kode, arsitektur, dan *best practices* standar pengembangan untuk proyek **Ashame Fansub** saat bertransisi dan dikembangkan menggunakan **Next.js (App Router)** dan **TypeScript**.

Setiap agen pengembang atau kontributor wajib mengikuti aturan di bawah ini guna menjaga kode tetap bersih, terstruktur, aman terhadap tipe data (*type-safe*), dan berkinerja tinggi.

---

## 📌 1. Prinsip Utama Arsitektur

1. **App Router (`app/`) sebagai Standar**: Gunakan App Router, bukan Pages Router.
2. **Server Components by Default**:
   - Jadikan setiap komponen sebagai **React Server Component (RSC)** secara default.
   - Gunakan `'use client'` hanya pada komponen daun (*leaf components*) yang benar-benar memerlukan interaktivitas browser, state (`useState`, `useReducer`), lifecycle (`useEffect`), event listener, atau akses ke Web API (seperti `localStorage` tema).
3. **Static Site Generation (SSG) & Static Export**:
   - Karena website di-host di **GitHub Pages**, konfigurasi `next.config.ts` wajib mendukung static export:
     ```typescript
     const nextConfig: import('next').NextConfig = {
       output: 'export',
       images: {
         unoptimized: true, // Diperlukan untuk static export tanpa Node server
       },
       // basePath jika di-host di sub-path (misal /repo-name), atau kosong jika root domain/subdomain
     };
     export default nextConfig;
     ```
4. **Content-Driven & Modular**:
   - Pisahkan data konten (daftar series, film, metadata episode) ke dalam struktur data terpisah (JSON / TS / MDX) agar penambahan episode baru tidak perlu menyentuh markup komponen.

---

## 📂 2. Konvensi Struktur Folder

```text
src/ (atau root)
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (HTML shell, font global, meta dasar)
│   ├── page.tsx              # Homepage (Hero Spotlight + Grid YouTube 16:9)
│   ├── series/
│   │   ├── page.tsx          # Katalog Series
│   │   └── [slug]/
│   │       └── page.tsx      # Detail & download episode per series (generateStaticParams)
│   ├── film/
│   │   ├── page.tsx          # Katalog Film / Movie
│   │   └── [slug]/
│   │       └── page.tsx      # Detail & download film (generateStaticParams)
│   ├── showroom/
│   ├── partner/
│   ├── about-me/
│   ├── not-found.tsx         # Halaman 404 custom
│   ├── robots.ts             # SEO robots.txt generator
│   └── sitemap.ts            # SEO dynamic sitemap generator
├── components/
│   ├── ui/                   # Komponen atomik murni (Button, Badge, Input, Card)
│   ├── layout/               # Header mengambang, Footer, Container, Navigation
│   ├── features/             # Komponen fitur spesifik:
│   │   ├── hero/             # Hero Spotlight rilis terbaru
│   │   ├── catalog/          # YouTube-style Grid, Video Card 16:9, Filter Pills
│   │   ├── comments/         # Wrapper integrasi Cusdis
│   │   └── theme/            # Theme Switcher (Dark/Light provider & toggle)
├── content/                  # Data sumber konten (data series, film, episode)
│   ├── series/               # Data TypeScript / JSON per series
│   └── films/                # Data TypeScript / JSON per film
├── lib/                      # Helper fungsional, konstanta global, utilities
│   ├── utils.ts              # Fungsi bantu umum (cn / clsx, format tanggal)
│   └── constants.ts          # Link sosmed, navigasi menu, konfigurasi site
├── types/                    # Definisi tipe & interface TypeScript
│   ├── content.ts            # Tipe Series, Movie, Episode, DownloadLink
│   └── navigation.ts         # Tipe menu & filter
└── styles/
    └── globals.css           # Design tokens, variabel warna (True Black / White), font
```

---

## 🟦 3. Standar & Best Practices TypeScript

1. **Strict Type-Checking**:
   - Aktifkan `"strict": true` di `tsconfig.json`.
   - Hindari penggunaan tipe `any`. Jika tipe belum diketahui, gunakan `unknown` dan lakukan *type narrowing* atau *type guard*.
2. **Definisi Model Data yang Jelas (`types/content.ts`)**:
   ```typescript
   export type ContentStatus = 'ongoing' | 'tamat' | 'movie' | 'showroom';

   export interface DownloadSource {
     label: string;      // Contoh: "01", "02", "HD 720p", "FHD 1080p"
     url: string;
     provider?: 'direct' | 'trakteer' | 'shortlink';
   }

   export interface MediaItem {
     id: string;
     slug: string;
     title: string;
     japaneseTitle?: string;
     category: 'series' | 'film' | 'showroom';
     status: ContentStatus;
     year: number;
     synopsis: string;
     thumbnailUrl: string; // Rasio 16:9 untuk grid
     posterUrl?: string;    // Rasio 2:3 untuk poster vertikal detail
     myDramaListUrl?: string;
     episodes?: DownloadSource[];
     featured?: boolean;    // Penanda untuk Hero Spotlight
     releasedAt: string;    // ISO Date string: "2026-10-18"
   }
   ```
3. **Props Typing**:
   - Selalu buat interface atau type terpisah untuk setiap komponen:
     ```typescript
     interface ContentCardProps {
       item: MediaItem;
       priority?: boolean;
     }
     export function ContentCard({ item, priority = false }: ContentCardProps) {
       // ...
     }
     ```
4. **Path Alias**:
   - Wajib menggunakan alias `@/*` untuk memudahkan refactor dan mencegah *relative path traversal hell* (`../../components`):
     ```typescript
     import { ContentCard } from '@/components/features/catalog/ContentCard';
     import type { MediaItem } from '@/types/content';
     ```

---

## 🎨 4. Standar Desain & UI (Minimalis Modern)

1. **Rasio Thumbnail 16:9 (YouTube-Style Grid)**:
   - Kontainer gambar wajib menggunakan rasio 16:9 (`aspect-video` atau `aspect-ratio: 16 / 9`).
   - Gunakan `object-fit: cover` untuk memastikan gambar tidak gepeng.
   - Terapkan `overflow: hidden` pada container kartu agar animasi zoom gambar saat hover tidak bocor keluar.
2. **Warna Tema (True Black vs. Clean White)**:
   - **Night Mode**:
     - Background: `#000000` (OLED True Black).
     - Surface / Card: `#0f0f11` atau `#141416`.
     - Border: `rgba(255, 255, 255, 0.08)` atau `#222226`.
     - Text Primary: `#ededed`.
   - **Day Mode**:
     - Background: `#ffffff`.
     - Surface / Card: `#f8fafc`.
     - Border: `#e2e8f0`.
     - Text Primary: `#0f172a`.
3. **Floating Header Modern**:
   - Tetap mengambang (*fixed pill*) dengan efek kaca:
     ```css
     backdrop-filter: blur(16px);
     -webkit-backdrop-filter: blur(16px);
     ```
   - Border halus 1px dan shadow lembut (*ambient elevation*).
4. **Hero Spotlight**:
   - Card paling atas rilis terbaru dibuat menonjol (full-width banner 16:9 atau split layout 60:40) dengan tag mencolok ("Rilis Terbaru").

---

## ⚡ 5. Performa & SEO

1. **Optimalisasi Gambar**:
   - Gunakan komponen `next/image` untuk rendering gambar.
   - Berikan atribut `width` dan `height` atau `fill` dengan `sizes` yang tepat untuk mencegah *Cumulative Layout Shift (CLS)*.
   - Atur `priority={true}` hanya untuk gambar di Hero Spotlight (LCP optimization), dan `loading="lazy"` untuk kartu di grid bawah.
2. **Metadata API (SEO)**:
   - Setiap halaman wajib mengekspor objek `metadata` atau fungsi `generateMetadata`:
     ```typescript
     export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
       return {
         title: `${item.title} Subtitle Indonesia - Ashame Fansub`,
         description: item.synopsis.slice(0, 150),
         openGraph: {
           images: [item.thumbnailUrl],
         },
       };
     }
     ```
3. **Accessibility (a11y)**:
   - Selalu sertakan atribut `alt` yang deskriptif pada setiap tag gambar.
   - Semua elemen interaktif (tombol filter, switcher tema) harus memiliki `aria-label` yang jelas.

---

## 🔄 6. Alur Kerja & Kontrol Kualitas Kode

1. **Linting & Format**:
   - Pastikan kode lulus pemeriksaan ESLint dan TypeScript compiler tanpa error (`npm run build` berhasil).
2. **Konvensi Penamaan**:
   - Komponen React: `PascalCase.tsx` (contoh: `ContentCard.tsx`, `HeroSpotlight.tsx`).
   - File utilitas & tipe: `camelCase.ts` atau `kebab-case.ts` (contoh: `formatDate.ts`, `content.ts`).
   - Direktori route: `kebab-case` (contoh: `about-me/`, `tsutsui-ayame/`).
3. **Git Commit Message Standard**:
   - Gunakan format Conventional Commits:
     - `feat: ...` untuk fitur baru.
     - `fix: ...` untuk perbaikan bug.
     - `style: ...` untuk perubahan styling/UI.
     - `refactor: ...` untuk restrukturisasi kode tanpa mengubah fungsionalitas.
     - `docs: ...` untuk pembaruan dokumentasi.
