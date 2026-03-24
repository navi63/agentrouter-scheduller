# Product Requirements Document (PRD): Stitch Automation & Scheduling

| Status | Version | Target Platform | Last Updated |
| :--- | :--- | :--- | :--- |
| **Draft** | 1.0 | Web (Next.js / TypeScript) | 2026-03-24 |

---

## 1. Overview
**Stitch** adalah aplikasi monitoring dan otomasi router. Modul **Automation & Scheduling** ini bertujuan untuk melakukan otomasi proses `login` dan `logout` pada *agent router* menggunakan session cookie yang diinput secara manual guna mendapatkan credit secara berkala tanpa intervensi manual yang konstan.

## 2. Problem Statement
Proses mendapatkan credit pada agent router mengharuskan user untuk aktif melakukan login/logout pada waktu-waktu tertentu. Melakukan hal ini secara manual untuk banyak akun sangat tidak efisien dan rentan terlewat (human error).

## 3. Goals & Objectives
* **Otomasi Akun:** Mengotomatiskan hit API login/logout menggunakan cookie yang disediakan.
* **Manajemen Kredensial:** Menyimpan dan mengelola banyak session cookie dalam satu tempat.
* **Penjadwalan Fleksibel:** Memberikan kontrol kepada user untuk menentukan kapan aksi pemicu (trigger) dilakukan.
* **Transparansi Operasional:** Menyediakan log history yang jelas untuk audit keberhasilan perolehan credit.

---

## 4. Functional Requirements

### 4.1 Cookie Management
User harus dapat mengelola identitas session yang akan digunakan untuk otomasi.
* **Add Cookie:** Input field untuk `Label Name` dan `Cookie String`.
* **Cookie List:** Menampilkan tabel berisi semua cookie yang tersimpan.
* **Status Indicator:** Menampilkan apakah cookie masih aktif atau sudah expired (berdasarkan respons terakhir dari router).
* **Actions:** Edit label/cookie dan hapus data.

### 4.2 Scheduler Engine
Fitur utama untuk mengatur waktu eksekusi otomatis.
* **Time Picker:** Memilih jam dan menit spesifik untuk pemicu.
* **Frequency:** Pilihan frekuensi (Daily, Weekly, atau Custom Interval).
* **Action Mapping:** Memilih aksi yang akan dijalankan pada jadwal tersebut (Login, Logout, atau Login-then-Logout).
* **Multi-Account Trigger:** Kemampuan untuk menjalankan satu jadwal untuk beberapa cookie sekaligus.

### 4.3 Monitoring & Logs
Panel untuk melihat hasil dari tugas yang dijalankan oleh scheduler.
* **Execution History:** Daftar kronologis dari aktivitas yang dijalankan.
* **Detail Log:**
    * Timestamp eksekusi.
    * Nama Cookie/User.
    * Tipe Aksi (Login/Logout).
    * Status (Success/Failed).
    * Response Message (untuk debugging jika gagal).

---

## 5. Technical Specifications (Proposed Stack)

* **Frontend:** Next.js (App Router), Tailwind CSS.
* **UI Components:** Shadcn/UI atau PrimeReact (khususnya untuk *Virtual Scroller* jika log sangat banyak).
* **State Management:** Zustand (untuk persistensi ringan di sisi client).
* **Data Fetching:** TanStack Query (untuk auto-refresh log history).
* **Backend/Worker:** Node.js Cron Job atau Java Spring Boot Scheduler (menggunakan `RestTemplate` atau `FeignClient`).

---

## 6. User Interface (UI) Mockup Structure

### A. Dashboard Scheduler
Halaman utama menampilkan kartu ringkasan: jumlah cookie aktif, jadwal terdekat, dan status sukses/gagal terakhir.

### B. Table Logs
Tabel dengan fitur *filtering* berdasarkan status (Success/Fail) dan *sorting* berdasarkan waktu terbaru.

### C. Cookie Form
Modal sederhana yang berisi:
```text
[ Label Name (e.g., Router_01) ]
[ Cookie String (Paste value here) ]
[ Save Button ]

---
## 7. Success Metrics
* Pengurangan waktu manual user dalam mengelola login router hingga 90%.
* Keberhasilan eksekusi scheduler di atas 99% (asumsi server aktif).
* Error handling yang tepat saat cookie tidak valid (expired).

