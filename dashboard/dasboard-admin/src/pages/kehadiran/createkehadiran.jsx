import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TambahAbsenManual() {
  const { id } = useParams(); // id_config
  const id_config = Number(id);
  const navigate = useNavigate();

  const [karyawan, setKaryawan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id_karyawan: "",
    jenis: "",
    status: "HADIR",
    waktu: "",
    keterangan: "",
  });

  // Ambil daftar karyawan
  useEffect(() => {
    api
      .get("/karyawan")
      .then((res) => setKaryawan(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async () => {
    if (!form.id_karyawan || !form.jenis || !form.waktu) {
      alert("Mohon lengkapi data wajib (Karyawan, Jenis, Waktu)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_karyawan: Number(form.id_karyawan),
        id_config,
        waktu: new Date(form.waktu).toISOString(),
        jenis: form.jenis,
        status: form.status,
        keterangan: form.keterangan || null,
      };

      await api.post("/absen/manual", payload);

      alert("Absensi manual berhasil ditambahkan!");
      navigate(`/kehadiran/`);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Gagal menambahkan absensi manual."
      );
    } finally {
      setLoading(false);
    }
  };
  console.log(form);
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Tambah Absensi Manual
          </h1>

          {/* Karyawan */}
          <div className="space-y-2">
            <Label>Karyawan</Label>
            <Select
              onValueChange={(value) =>
                setForm({ ...form, id_karyawan: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih karyawan" />
              </SelectTrigger>
              <SelectContent>
                {karyawan.map((k) => (
                  <SelectItem key={k.id} value={String(k.id)}>
                    {k.nama} — {k.divisi?.nama || "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jenis */}
          <div className="space-y-2">
            <Label>Jenis Absensi</Label>
            <Select
              onValueChange={(value) => setForm({ ...form, jenis: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATANG">DATANG</SelectItem>
                <SelectItem value="PULANG">PULANG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(value) => setForm({ ...form, status: value })}
              defaultValue="HADIR"
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HADIR">HADIR</SelectItem>
                <SelectItem value="TERLAMBAT">TERLAMBAT</SelectItem>
                <SelectItem value="PULANG_CEPAT">PULANG_CEPAT</SelectItem>
                <SelectItem value="IZIN">IZIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Waktu */}
          <div className="space-y-2">
            <Label>Waktu Absensi</Label>
            <Input
              type="datetime-local"
              value={form.waktu}
              onChange={(e) => setForm({ ...form, waktu: e.target.value })}
            />
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label>Keterangan (opsional)</Label>
            <Input
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Contoh: alasan terlambat"
            />
          </div>

          {/* Tombol */}
          <div className="flex justify-between pt-4">
            <Button
              className="
        bg-gray-500 text-white
        hover:bg-gray-400
        rounded-md
        flex items-center gap-1
        shadow-sm
        transition
      "
              onClick={() => navigate(-1)}
            >
              Kembali
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-teal-700 hover:bg-teal-800 text-white"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
