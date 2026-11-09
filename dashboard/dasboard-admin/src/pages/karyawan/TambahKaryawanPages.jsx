import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import fastapi from "@/api/axiosInstance_FastApi";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TambahKaryawanPage() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [divisi, setDivisi] = useState([]);
  const [grade, setGrade] = useState([]);
  const [loading, setLoading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [embeddingPhotos, setEmbeddingPhotos] = useState([]);
  const [embeddingError, setEmbeddingError] = useState("");
  const [embeddingProgress, setEmbeddingProgress] = useState(0);

  const [formData, setFormData] = useState({
    NIK: "",
    nama: "",
    alamat: "",
    tanggal_lahir: "",
    divisi: { id: "" },
    grade: { id: "" },
  });

  useEffect(() => {
    const fetchFilters = async () => {
      const [divisiRes, gradeRes] = await Promise.all([
        api.get("/divisi"),
        api.get("/grade"),
      ]);
      setDivisi(divisiRes.data);
      setGrade(gradeRes.data);
    };
    fetchFilters();
  }, []);

  /* ================== FACE CAPTURE ================== */
  const handleCapture = () => {
    if (embeddingPhotos.length >= 1) {
      setEmbeddingError("Maksimal 1 foto wajah");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setEmbeddingError("Gagal mengambil foto");
      return;
    }

    // Foto wajah
    setEmbeddingPhotos([imageSrc]);

    // Avatar otomatis dari foto wajah
    setAvatarPreview(imageSrc);

    setEmbeddingError("");
  };

  /* ================== RESEET FACE CAPTURE ================== */
  const handleResetCapture = () => {
    setEmbeddingPhotos([]);
    setAvatarPreview(null);
    setEmbeddingError("");
    setEmbeddingProgress(0);
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/jpeg" });
  };

  /* ================== SUBMIT ================== */
  const handleSubmit = async () => {
    if (!formData.NIK) return alert("NIK wajib diisi");
    if (!/^\d+$/.test(formData.NIK)) return alert("NIK harus berupa angka");
    if (!formData.nama) return alert("Nama wajib diisi");
    if (!formData.tanggal_lahir) return alert("Tanggal Lahir wajib diisi");
    if (!formData.divisi.id) return alert("Divisi wajib dipilih");
    if (!formData.alamat) return alert("Alamat wajib diisi");

    try {
      setLoading(true);
      setEmbeddingProgress(0);

      const form = new FormData();
      form.append("NIK", formData.NIK);
      form.append("nama", formData.nama);
      form.append("tanggal_lahir", formData.tanggal_lahir);
      form.append("alamat", formData.alamat);
      form.append("id_divisi", formData.divisi.id);
      form.append("id_grade", formData.grade.id);
      if (avatarPreview) {
        const avatarBlob = dataURItoBlob(avatarPreview);
        form.append("avatar", avatarBlob, "avatar.jpg");
      }

      const res = await api.post("/karyawan", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newId = res.data.NIP;

      /* ===== UPLOAD EMBEDDING KE FASTAPI ===== */
      if (embeddingPhotos.length > 0) {
        const formEmbedding = new FormData();
        embeddingPhotos.forEach((photo, index) => {
          const blob = dataURItoBlob(photo);
          formEmbedding.append("file", blob, `face_${index + 1}.jpg`);
        });

        await fastapi.post(`/register/${newId}`, formEmbedding, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setEmbeddingProgress(percent);
          },
        });
      }

      alert("Karyawan berhasil ditambahkan");
      navigate("/karyawan");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* ================= HEADER ================= */}
          <h1 className="text-2xl font-bold text-gray-800">
            Form Tambah Karyawan
          </h1>
          {/* ================= FACE CAPTURE ================= */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Foto Wajah</h2>

            <div className="flex gap-8 items-start">
              {/* ================= PREVIEW ================= */}
              <div className="flex flex-col items-center min-w-[120px]">
                <p className="text-sm font-medium mb-2">Preview</p>

                {avatarPreview ? (
                  <>
                    <img
                      src={avatarPreview}
                      className="w-24 h-24 rounded-xl border object-cover"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCapture}
                      className="mt-2 bg-red-700 hover:bg-red-800 text-white"
                    >
                      Hapus & Ambil Ulang
                    </Button>
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center text-xs text-gray-400">
                    Belum ada foto
                  </div>
                )}
              </div>

              {/* ================= DIVIDER ================= */}
              <div className="h-[180px] w-px bg-gray-200" />

              {/* ================= WEBCAM ================= */}
              <div className="flex gap-6">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-[260px] rounded-xl border"
                />

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleCapture}
                    disabled={embeddingPhotos.length >= 1}
                    className="bg-teal-700 hover:bg-teal-800"
                  >
                    Ambil Foto
                  </Button>

                  <p className="text-sm text-gray-600">Foto digunakan untuk:</p>
                  <ul className="text-sm text-gray-600 list-disc ml-4">
                    <li>Avatar karyawan</li>
                    <li>Face Recognition</li>
                  </ul>

                  {embeddingError && (
                    <p className="text-sm text-red-600">{embeddingError}</p>
                  )}

                  {embeddingProgress > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">
                        Upload & Proses Wajah ({embeddingProgress}%)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${embeddingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= FORM CARD ================= */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>
                  NIK<span className="label-required">*</span>
                </Label>
                <Input
                  value={formData.NIK}
                  onChange={(e) =>
                    setFormData({ ...formData, NIK: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nama</Label>
                <Input
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Tanggal Lahir</Label>
                <Input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_lahir: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Divisi</Label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.divisi.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      divisi: { id: e.target.value },
                    })
                  }
                >
                  <option value="">Pilih Divisi</option>
                  {divisi.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama_divisi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Grade</Label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.grade.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grade: { id: e.target.value },
                    })
                  }
                >
                  <option value="">Pilih Grade</option>
                  {grade.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Alamat</Label>
                <Input
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* ================= ACTION ================= */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/karyawan")}
              className="bg-gray-700 hover:bg-gray-800"
            >
              Batal
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                loading || (embeddingProgress > 0 && embeddingProgress < 100)
              }
              className="bg-teal-700 hover:bg-teal-800"
            >
              {loading ? "Menyimpan..." : "Simpan Karyawan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
