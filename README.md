# 🌸 Ashame Fansub — Official Website

[![Website Status](https://img.shields.io/website?down_message=offline&up_message=online&url=https%3A%2F%2Fashamefansub.github.io)](https://ashamefansub.github.io)
[![Version](https://img.shields.io/badge/version-v1.3-blue.svg)](https://ashamefansub.github.io)
[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-black?logo=github)](https://ashamefansub.github.io)
[![Trakteer](https://img.shields.io/badge/Support-Trakteer-red?logo=trakteer)](https://trakteer.id/ashame)

Repositori ini berisi kode sumber untuk situs web resmi **Ashame Fansub** (`ashamefansub.github.io`), sebuah fansub independen yang berfokus menerjemahkan drama Jepang (Dorama/Series), film Jepang (Movies), dan konten idol (Nogizaka46 Showroom/Nogiobi) ke dalam Bahasa Indonesia.

---

## 📌 Daftar Isi

- [Tentang Ashame Fansub](#-tentang-ashame-fansub)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Cara Menjalankan Secara Lokal](#-cara-menjalankan-secara-lokal)
- [Panduan Pengelolaan Konten](#-panduan-pengelolaan-konten)
  - [Menambahkan Series/Dorama Baru](#1-menambahkan-seriesdorama-baru)
  - [Menambahkan Movie/Film Baru](#2-menambahkan-moviefilm-baru)
  - [Menambahkan Episode Baru](#3-menambahkan-episode-baru-pada-series-yang-sedang-berjalan)
- [Sistem Komentar (Cusdis)](#-sistem-komentar-cusdis)
- [Mitra & Komunitas](#-mitra--komunitas)
- [Sosial Media & Donasi](#-sosial-media--donasi)
- [Kredit & Hak Cipta](#-kredit--hak-cipta)

---

## 📖 Tentang Ashame Fansub

Nama **Ashame** diambil dari perpaduan dua nama:
- **Ash**: Nama pena dari pendiri (*Ashimaki Michi*).
- **Ame**: Panggilan untuk *Tsutsui Ayame*, anggota generasi ke-4 grup idol Jepang *Nogizaka46*.

Website ini dibangun murni dari awal (*from scratch*) tanpa CMS berat seperti WordPress atau Blogger, melainkan menggunakan teknologi web statis modern yang ringan, cepat, dan di-hosting gratis melalui **GitHub Pages**.

---

## ✨ Fitur Utama

- ⚡ **Ringan & Cepat**: Web statis murni tanpa dependensi framework besar atau runtime server yang kompleks.
- 🌓 **Henshin Tema (Dark / Light Mode)**: Dukungan beralih tema gelap & terang dengan status tersimpan otomatis pada `localStorage` browser.
- 📱 **Desain Responsif**: Antarmuka responsif untuk perangkat desktop maupun mobile / smartphone.
- 🎬 **Katalog Dorama & Film**:
  - Halaman katalog utama dengan badge status (*On Going*, *Tamat*, *Movie*, *Nogiobi*).
  - Halaman rincian proyek: poster, judul kanji/romaji, sinopsis, tombol link informasi eksternal (MyDramaList), dan tautan download per episode.
- 🧩 **Modular Header & Footer**: Komponen header dan footer dimuat secara dinamis via JavaScript `fetch()`, memudahkan pembaruan navigasi di seluruh halaman sekaligus.
- 💬 **Sistem Komentar Terintegrasi**: Menggunakan [Cusdis](https://cusdis.com), platform komentar ringan dan ramah privasi.
- 🔍 **Search & Quick Links**: Form pencarian cepat dan navigasi langsung ke halaman Series, Movie, Showroom, Partner, dan About Me.
- 🌐 **SEO Friendly**: Dilengkapi dengan `sitemap.xml` dan integrasi Google Search Console.

---

## 🛠 Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Struktur semantik standar web modern |
| **Styling** | Vanilla CSS3 | Variabel CSS (`:root`), Flexbox, CSS Grid, animasi transisi |
| **Typography** | Google Fonts & Local Font | *Mochiy Pop One*, *Noto Sans*, *Nunito*, dan font lokal *UD Digi Kyokasho NP-B* |
| **Logika Frontend** | Vanilla JavaScript (ES6+) | Dynamic fetch injection, toggle dark/light mode, scroll-spy navbar |
| **Komentar** | Cusdis API | Embed komentar tanpa iklan dan pelacak pihak ketiga |
| **Hosting** | GitHub Pages | Deployment otomatis melalui branch GitHub |

---

## 📂 Struktur Direktori Proyek

```text
ashame-web/
├── css/
│   ├── styles.css           # Variabel global, reset CSS, navbar header, card konten
│   ├── styles_sub.css       # Layout halaman rincian series/film (poster, sinopsis, download)
│   └── styles_sub2.css      # Styling pendukung: tombol download, tema light mode, sosmed
├── film/
│   ├── index.html           # Halaman katalog seluruh film / movie
│   └── [slug-film].html     # Halaman detail masing-masing film (misal: deguchi-8.html)
├── font/
│   └── UD Digi Kyokasho NP-B.woff2  # Font lokal untuk tipografi khas Jepang
├── footer/
│   ├── footer.html          # Komponen template footer
│   └── footer.js            # Script loader untuk meng-inject footer.html ke DOM
├── header/
│   ├── header.html          # Komponen template navigasi header & search
│   ├── header.js            # Script loader & animasi hide/show navbar saat scroll
│   └── about-me.html        # Halaman biografi & cerita di balik Ashame Fansub
├── img/
│   ├── partner/             # Logo fansub mitra (Frelein, Sukanogi, 46fansina)
│   ├── showroom/            # Gambar thumbnail untuk konten Showroom
│   ├── sub-image/           # Ikon sosial media, foto profil, dan tombol tema
│   ├── favicon.ico          # Favicon website
│   ├── logo.png             # Logo utama Ashame Fansub
│   └── *.jpg / *.png        # Poster drama dan film
├── js/
│   └── henshin-tema.js      # Logika dark/light mode switcher & persistensi localStorage
├── partner/
│   └── index.html           # Halaman daftar partner & afiliasi fansub
├── series/
│   ├── index.html           # Halaman katalog seluruh series / dorama
│   └── [slug-series].html   # Halaman detail series (misal: jigoku-wa-zeni-de-dekiteiru.html)
├── showroom/
│   ├── index.html           # Halaman katalog siaran Showroom Nogizaka46
│   └── tsutsui-ayame.html   # Halaman arsip Showroom Tsutsui Ayame
├── googled536b68481e46f3c.html # Verifikasi kepemilikan Google Search Console
├── index.html               # Halaman utama (Home / Rilis Terbaru)
├── sitemap.xml              # Peta situs untuk indexing mesin pencari
└── README.md                # Dokumentasi proyek ini
```

---

## 💻 Cara Menjalankan Secara Lokal

Karena header dan footer dimuat menggunakan `fetch()` asynchronous, file HTML **tidak dapat dibuka langsung menggunakan protokol `file:///` di browser** karena kebijakan keamanan CORS peramban.

Jalankan proyek menggunakan local HTTP server sederhana dengan salah satu cara berikut:

### Opsi 1: Menggunakan VS Code Live Server (Direkomendasikan)
1. Buka folder proyek ini di Visual Studio Code.
2. Pasang ekstensi **Live Server** (oleh Ritwick Dey).
3. Klik kanan pada file `index.html` dan pilih **Open with Live Server**, atau klik tombol **Go Live** di status bar kanan bawah.

### Opsi 2: Menggunakan Python
Jika sudah terpasang Python 3:
```bash
# Jalankan server pada port 8000
python -m http.server 8000
```
Buka browser dan akses: `http://localhost:8000`

### Opsi 3: Menggunakan Node.js / npx
```bash
npx serve .
```
atau
```bash
npx http-server .
```

---

## 📝 Panduan Pengelolaan Konten

### 1. Menambahkan Series/Dorama Baru
1. Siapkan poster series (rasio 2:3 atau 3:4) dan simpan di folder `img/` (misal: `img/judul-series.jpg`).
2. Duplikasi salah satu template yang ada di folder `series/` (misal: `series/jigoku-wa-zeni-de-dekiteiru.html`) dan simpan dengan nama baru berformat kebab-case: `series/[judul-series].html`.
3. Sesuaikan meta informasi pada file baru:
   - `<title>`: Judul Series Subtitle Indonesia - Ashame
   - Poster: `<img src="../img/judul-series.jpg" ...>`
   - Sinopsis dan judul kanji.
   - Link MyDramaList pada tombol info.
   - Tombol download episode beserta tautannya.
   - Konfigurasi `data-page-id` dan `data-page-url` pada elemen `#cusdis_thread`.
4. Tambahkan kartu (card) series tersebut ke:
   - `index.html` (bagian *Terbaru*).
   - `series/index.html` (katalog series).
5. Daftarkan URL baru ke dalam `sitemap.xml`.

### 2. Menambahkan Movie/Film Baru
1. Simpan poster film di folder `img/`.
2. Duplikasi template dari folder `film/` (misal: `film/mission-kageki.html`).
3. Sesuaikan judul, poster, sinopsis, link download, dan ID Cusdis.
4. Tambahkan kartu pada `index.html` dan `film/index.html`.
5. Daftarkan URL ke `sitemap.xml`.

### 3. Menambahkan Episode Baru pada Series yang Sedang Berjalan
Buka file series terkait di `series/[nama-series].html`, kemudian tambahkan tag tombol baru di dalam kontainer `.button-series`:
```html
<a href="https://link-download-kamu.com" target="_blank" rel="noopener">
    <button class="btn-download-series">05</button>
</a>
```

---

## 💬 Sistem Komentar (Cusdis)

Sistem komentar diintegrasikan menggunakan **Cusdis**. Setiap halaman konten memiliki penanda unik:
```html
<div id="cusdis_thread"
  data-host="https://cusdis.com"
  data-app-id="07dcecc9-8ea6-476c-8d3f-9938cdf2ede1"
  data-page-id="ID_UNIK_HALAMAN"
  data-page-url="https://ashamefansub.github.io/path/ke/halaman.html"
  data-page-title="Judul Konten"
  data-theme="auto">
</div>
<script async defer src="https://cusdis.com/js/cusdis.es.js"></script>
```
> **Catatan**: Pastikan `data-page-id` selalu unik untuk setiap judul agar komentar tidak tertukar antar halaman.

---

## 🤝 Mitra & Komunitas

Ashame Fansub berkolaborasi dengan komunitas dan fansub sesama pecinta jejapangan dan 46 Group:
- **Frelein Fansub**: [fansub.frelein.my.id](https://fansub.frelein.my.id/)
- **Sukanogi**: [@sukanogi.id46](https://www.instagram.com/sukanogi.id46/)
- **46fansina**: [46fansina.com](https://46fansina.com/)

---

## 🌐 Sosial Media & Donasi

Dukung kelangsungan proyek terjemahan dan operasional Ashame Fansub:
- **Trakteer**: [trakteer.id/ashame](https://trakteer.id/ashame)
- **Instagram**: [@ashamefansub](https://www.instagram.com/ashamefansub/)
- **Facebook**: [Ashame Fansub](https://web.facebook.com/profile.php?id=61586188730473&locale=id_ID)
- **X (Twitter)**: [@Ashamefansub](https://x.com/Ashamefansub)
- **TikTok**: [@ashamefansub](https://www.tiktok.com/@ashamefansub)

---

## 📄 Kredit & Hak Cipta

- **Creator & Maintainer**: [Ashimaki Michi (Ash)](header/about-me.html)
- **Desain & Pengembangan Web**: Dibangun oleh Ashimaki Michi dengan masukan dari rekan-rekan fansub.
- **Hak Cipta Konten Video**: Seluruh materi video, audio, dan gambar promosi adalah hak cipta dari masing-masing pemilik lisensi resmi di Jepang (stasiun TV, rumah produksi, manajemen). Subtitle Bahasa Indonesia disediakan murni sebagai bentuk apresiasi non-komersial sesama penggemar.
