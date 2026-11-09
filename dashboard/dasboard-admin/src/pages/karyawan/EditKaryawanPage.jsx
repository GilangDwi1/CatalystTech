import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditKaryawanPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [divisi, setDivisi] = useState([]);
  const [grade, setGrade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [existingAvatar, setExistingAvatar] = useState(null);

  const [formData, setFormData] = useState({
    NIK: "",
    nama: "",
    alamat: "",
    tanggal_lahir: "",
    divisi: { id: "" },
    grade: { id: "" },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisiRes, gradeRes, karyawanRes] = await Promise.all([
          api.get("/divisi"),
          api.get("/grade"),
          api.get(`/karyawan/${id}`),
        ]);
        setDivisi(divisiRes.data);
        setGrade(gradeRes.data);

        const k = karyawanRes.data;
        setFormData({
          NIK: k.NIK || "",
          nama: k.nama || "",
          alamat: k.alamat || "",
          tanggal_lahir: k.tanggal_lahir ? k.tanggal_lahir.split("T")[0] : "",
          divisi: { id: k.divisi?.id || "" },
          grade: { id: k.grade?.id || "" },
        });
        setExistingAvatar(k.foto);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data karyawan");
        navigate("/karyawan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!formData.NIK) return alert("NIK wajib diisi");
    if (!formData.nama) return alert("Nama wajib diisi");
    if (!formData.divisi.id) return alert("Divisi wajib dipilih");

    try {
      setSubmitting(true);
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

      await api.put(`/karyawan/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Data karyawan berhasil diperbarui");
      navigate("/karyawan");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui data");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
       return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 ml-64 p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      );
    }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Edit Karyawan
          </h1>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label>Tanggal Lahir</Label>
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
                  className="w-full border rounded-lg px-3 py-2"
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
                  className="w-full border rounded-lg px-3 py-2"
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

            <div>
              <Label className="block mb-2">Avatar (Opsional)</Label>
              <div className="flex items-center gap-4">
                {existingAvatar && !avatarFile && (
                  <img
                    src={`${
                      import.meta.env.VITE_API_URL
                    }/uploads/avatar/${existingAvatar}`}
                    className="w-16 h-16 rounded-full object-cover border"
                    alt="Current"
                  />
                )}
                {avatarFile && (
                  <img
                    src={URL.createObjectURL(avatarFile)}
                    className="w-16 h-16 rounded-full object-cover border"
                    alt="Preview"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/karyawan")}
                className="border text-white bg-gray-700 py-2 rounded-lg hover:bg-gray-800"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-right">
            <Button
              variant="link"
              className="text-blue-600"
              onClick={() => navigate(`/karyawan/${id}/face-register`)}
            >
              Update Data Wajah (Face Recognition) &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
