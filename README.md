# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
# Sport OBC

Aplikasi web Sport OBC menggunakan React, TypeScript, dan Vite.

## Persyaratan

- Node.js 20.19+ atau 22.12+
- npm

## Instalasi

Clone repository, lalu masuk ke folder proyek:

```bash
git clone <URL_REPOSITORY>
cd sport-obc
```

Pasang dependency sesuai lockfile:

```bash
npm ci
```

Buat file konfigurasi lokal dari contoh. Di PowerShell:

```powershell
Copy-Item .env.example .env
```

Di macOS/Linux:

```bash
cp .env.example .env
```

Jalankan aplikasi dalam mode development:

```bash
npm run dev
```

Buka alamat lokal yang ditampilkan Vite di terminal.

## Perintah lainnya

```bash
npm run build    # Type-check dan build untuk production
npm run preview  # Preview hasil build production
npm run lint     # Jalankan ESLint
```

## Environment variables

`.env.example` adalah template konfigurasi. Saat ini aplikasi menggunakan environment variable; `VITE_API_BASE_URL` disediakan sebagai tempat konfigurasi URL backend saat integrasi API ditambahkan.

Salin template ke `.env-example` untuk konfigurasi lokal.
