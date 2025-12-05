import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
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

  const [avatarFile, setAvatarFile] = useState(null);
  const [embeddingPhotos, setEmbeddingPhotos] = useState([]); // max 5 foto

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

  const handleCapture = () => {
    if (embeddingPhotos.length >= 5) return;

    const imageSrc = webcamRef.current.getScreenshot();
    setEmbeddingPhotos([...embeddingPhotos, imageSrc]);
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: "image/jpeg" });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const form = new FormData();
      form.append("NIK", formData.NIK);
      form.append("nama", formData.nama);
      form.append("tanggal_lahir", formData.tanggal_lahir);
      form.append("alamat", formData.alamat);
      form.append("id_divisi", formData.divisi.id);
      form.append("id_grade", formData.grade.id);

      if (avatarFile) {
        form.append("avatar", avatarFile);
      }

      const res = await api.post("http://localhost:3000/karyawan", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newId = res.data.id;

      // === Upload embedding ke FastAPI ===
      if (embeddingPhotos.length > 0) {
        const formEmbedding = new FormData();

        embeddingPhotos.forEach((photo, index) => {
          const blob = dataURItoBlob(photo);
          formEmbedding.append("file", blob, `photo_${index + 1}.jpg`);
        });

        await api.post(
          `http://localhost:5000/register/${newId}`,
          formEmbedding,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      alert("Karyawan berhasil ditambahkan!");
      navigate("/karyawan");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Tambah Karyawan</h1>

        {/* ==== FORM DATA DIRI ==== */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <Label>NIK</Label>
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
            <Label>Tanggla Lahir</Label>
            <Input
              type="date"
              value={formData.tanggal_lahir}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_lahir: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Divisi</Label>
            <select
              className="border rounded p-2 w-full"
              value={formData.divisi.id}
              onChange={(e) =>
                setFormData({ ...formData, divisi: { id: e.target.value } })
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
              className="border rounded p-2 w-full"
              value={formData.grade.id}
              onChange={(e) =>
                setFormData({ ...formData, grade: { id: e.target.value } })
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

          <div className="col-span-2">
            <Label>Alamat</Label>
            <Input
              value={formData.alamat}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
            />
          </div>
        </div>

        {/* ==== UPLOAD AVATAR ==== */}
        <div className="mt-8">
          <Label className="block mb-2">Avatar</Label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className="
      block 
      w-full 
      text-sm 
      text-gray-900 
      border border-gray-300 
      rounded-lg 
      cursor-pointer 
      bg-gray-50 
      focus:outline-none
      file:mr-4 
      file:py-2 
      file:px-4 
      file:rounded-l-lg 
      file:border-0 
      file:text-sm 
      file:font-semibold 
      file:bg-gray-200 
      file:text-gray-700 
      hover:file:bg-gray-300
    "
          />

          {avatarFile && (
            <img
              src={URL.createObjectURL(avatarFile)}
              className="w-24 h-24 mt-4 rounded-lg border object-cover"
            />
          )}
        </div>

        {/* ==== EMBEDDING KAMERA ==== */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">
            Foto Embedding Wajah (Opsional, max 5)
          </h2>

          <div className="flex gap-6">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-[300px] rounded-xl border"
            />

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleCapture}
                disabled={embeddingPhotos.length >= 5}
                className="bg-teal-700 text-white"
              >
                Ambil Foto
              </Button>

              <p>{embeddingPhotos.length} / 5 foto diambil</p>

              <div className="grid grid-cols-5 gap-2">
                {embeddingPhotos.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-16 h-16 object-cover border rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BUTTON AKSI */}
        <div className="mt-10 flex justify-end gap-4">
          <Button
            className="bg-gray-300 text-black"
            onClick={() => navigate("/karyawan")}
          >
            Batal
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-800 hover:bg-teal-900 text-white"
          >
            {loading ? "Menyimpan..." : "Simpan Karyawan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
