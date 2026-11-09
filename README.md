# CatalystTech

CatalystTech adalah proyek yang terdiri dari aplikasi mobile Flutter, dashboard admin berbasis React, backend NestJS, dan API pengenalan wajah berbasis FastAPI.

## Komponen

| Direktori | Teknologi | Fungsi |
| --- | --- | --- |
| `catalys_mobileapp/catalys_tech` | Flutter / Dart | Aplikasi mobile |
| `dashboard/dasboard-admin` | React, Vite, JavaScript | Dashboard admin |
| `backend/backend_catalys` | NestJS, TypeScript, Prisma | Backend utama |
| `facerecognition_api/facerecognition_api` | FastAPI, Python, OpenCV | API untuk registrasi, pembaruan, pengenalan, dan penghapusan data wajah |

## Persiapan

Pasang tools yang sesuai dengan komponen yang ingin dijalankan:

- Flutter SDK dan Dart
- Node.js dan npm
- Python 3 dan pip
- Database yang sesuai dengan konfigurasi Prisma backend

Clone repositori:

```bash
git clone https://github.com/GilangDwi1/CatalystTech.git
cd CatalystTech
```

Setiap komponen dijalankan secara terpisah dari direktori masing-masing. Pastikan konfigurasi environment dan layanan yang dibutuhkan sudah disiapkan sebelum menjalankan aplikasi.

## Menjalankan aplikasi mobile

```bash
cd catalys_mobileapp/catalys_tech
flutter pub get
flutter run
```

## Menjalankan dashboard admin

```bash
cd dashboard/dasboard-admin
npm install
npm run dev
```

Untuk membuat build produksi atau menjalankan preview build:

```bash
npm run build
npm run preview
```

## Menjalankan backend

```bash
cd backend/backend_catalys
npm install
```

Atur environment backend, termasuk koneksi database yang dibutuhkan Prisma. Setelah database siap, jalankan perintah Prisma yang sesuai dengan skema dan alur migrasi proyek, lalu mulai server dalam mode pengembangan:

```bash
npm run start:dev
```

Skrip lain yang tersedia:

```bash
npm run build
npm run start:prod
npm test
npm run test:e2e
```

## Menjalankan Face Recognition API

API FastAPI berada di `facerecognition_api/facerecognition_api`. Pastikan dependensi Python dan model yang dibutuhkan oleh kode sudah tersedia, kemudian jalankan dari direktori tersebut:

```bash
cd facerecognition_api/facerecognition_api
uvicorn app:app --reload
```

Endpoint yang didefinisikan:

| Method | Path | Keterangan |
| --- | --- | --- |
| `GET` | `/` | Memeriksa status API |
| `POST` | `/ping` | Ping API |
| `POST` | `/recognize` | Mengenali wajah dari unggahan file |
| `POST` | `/register/{nip}` | Mendaftarkan wajah untuk NIP |
| `PUT` | `/update/{nip}` | Memperbarui data wajah untuk NIP |
| `DELETE` | `/delete/{NIP}` | Menghapus encoding dan foto wajah untuk NIP |

Berkas gambar dikirim sebagai multipart form field bernama `file` pada endpoint yang memerlukannya. Dokumentasi interaktif FastAPI biasanya tersedia di `/docs` setelah server berjalan.

## Catatan konfigurasi dan keamanan

- Jangan commit kredensial, token, atau nilai rahasia dari file environment. Gunakan konfigurasi lokal yang tidak dibagikan.
- Atur URL layanan dan CORS sesuai lingkungan deployment; jangan menggunakan konfigurasi terbuka untuk produksi tanpa peninjauan.
- Data wajah merupakan data biometrik sensitif. Pastikan pengumpulan, akses, penyimpanan, dan penghapusannya mengikuti kebijakan privasi serta aturan yang berlaku.
- API pengenalan wajah memerlukan dependensi dan berkas model yang sesuai; README ini tidak menetapkan versi atau sumber model yang belum dikonfigurasi dalam repositori.

## Status proyek

Repositori ini berisi beberapa komponen yang dikembangkan dan dijalankan secara terpisah. Lihat direktori masing-masing untuk kode, dependensi, dan konfigurasi lebih lanjut.
