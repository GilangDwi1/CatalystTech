import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // ubah sesuai backend kamu
});

// ✅ Tambah Authorization header otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Logout otomatis kalau token invalid / expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired atau tidak valid. Logout otomatis...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // arahkan ke login
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------
// 🎯 FACE RECOGNITION API
// ----------------------------------------------------------------------

export const faceApi = {
  // ⬆ Upload 1 foto (dari 5 foto registrasi)
  uploadFace: (karyawanId, blob) => {
    const form = new FormData();
    form.append("foto", blob);

    return api.post(`/karyawan/${karyawanId}/faces/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 📊 Status jumlah foto, contoh response:
  // { count: 3, completed: false }
  getFaceStatus: (karyawanId) =>
    api.get(`/karyawan/${karyawanId}/faces/status`),

  // 🗑 Hapus semua foto wajah
  resetFaces: (karyawanId) => api.delete(`/karyawan/${karyawanId}/faces/reset`),

  // 🧠 Generate embedding → kirim data ke FastAPI
  generateEmbedding: (karyawanId) =>
    api.post(`/karyawan/${karyawanId}/faces/generate-embedding`),
};

export default api;
