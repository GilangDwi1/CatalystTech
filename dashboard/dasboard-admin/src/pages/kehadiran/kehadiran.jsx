import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function AbsensiConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const [filter, setFilter] = useState({
    tanggal: "",
    jenis: "",
  });
  const navigate = useNavigate();

  // form pembuatan config
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: "",
    jenis: "DATANG",
    jam_mulai: "",
    jam_selesai: "",
  });

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/absensi-config");
      setConfigs(res.data);
    } catch (err) {
      console.error("Gagal fetch absensi config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // --- HANDLE CREATE ---
  const handleCreate = async () => {
    try {
      await api.post("/absensi-config", {
        tanggal: formData.tanggal, // YYYY-MM-DD
        jenis: formData.jenis,
        jam_mulai: formData.jam_mulai, // "HH:mm"
        jam_selesai: formData.jam_selesai,
        dibuat_oleh: user.id,
      });

      setFormOpen(false);
      setFormData({
        tanggal: "",
        jenis: "DATANG",
        jam_mulai: "",
        jam_selesai: "",
      });
      fetchConfigs();
    } catch (err) {
      console.error("Gagal membuat config:", err);
      alert(err.response?.data?.message || "Gagal membuat absensi config");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus config ini?")) return;
    try {
      await api.delete(`/absensi-config/${id}`);
      fetchConfigs();
    } catch (err) {
      console.error("Gagal hapus:", err);
    }
  };

  const filteredData = configs.filter((c) => {
    const byTanggal = filter.tanggal
      ? format(new Date(c.tanggal), "yyyy-MM-dd") === filter.tanggal
      : true;
    const byJenis = filter.jenis ? c.jenis === filter.jenis : true;

    return byTanggal && byJenis;
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.tanggal) {
      errors.tanggal = "Tanggal harus diisi";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.tanggal);

      if (selectedDate < today) {
        errors.tanggal = "Tanggal tidak boleh kurang dari hari ini";
      }
    }

    if (!formData.jam_mulai) {
      errors.jam_mulai = "Jam mulai harus diisi";
    }

    if (!formData.jam_selesai) {
      errors.jam_selesai = "Jam selesai harus diisi";
    }

    if (formData.jam_mulai && formData.jam_selesai) {
      const mulai = new Date(`${formData.tanggal}T${formData.jam_mulai}`);
      const selesai = new Date(`${formData.tanggal}T${formData.jam_selesai}`);

      if (mulai >= selesai) {
        errors.jam_selesai = "Jam selesai harus lebih besar dari jam mulai";
      }
    }

    return errors;
  };

  const errors = validateForm();


  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Absensi Config</h1>

        {/* FILTER */}
        <div className="flex gap-3 mb-4">
          <input
            type="date"
            value={filter.tanggal}
            onChange={(e) => setFilter({ ...filter, tanggal: e.target.value })}
            className="border p-2 rounded-md"
          />

          <select
            value={filter.jenis}
            onChange={(e) => setFilter({ ...filter, jenis: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">Semua Jenis</option>
            <option value="DATANG">DATANG</option>
            <option value="PULANG">PULANG</option>
          </select>

          {user?.role === "HRD" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-teal-800 text-white"
            >
              + Buka Absensi
            </Button>
          )}
        </div>

        {/* TABLE */}
        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Jenis</th>
              <th className="p-2">Jam Mulai</th>
              <th className="p-2">Jam Selesai</th>
              <th className="p-2">Dibuat Oleh</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Tidak ada data config
                </td>
              </tr>
            ) : (
              filteredData.map((c) => (
                <tr key={c.id} className="border">
                  <td className="p-2 text-center">
                    {format(new Date(c.tanggal), "dd-MM-yyyy")}
                  </td>
                  <td className="p-2 text-center">{c.jenis}</td>
                  <td className="p-2 text-center">
                    {format(new Date(c.jam_mulai), "HH:mm")}
                  </td>
                  <td className="p-2 text-center">
                    {format(new Date(c.jam_selesai), "HH:mm")}
                  </td>
                  <td className="p-2 text-center">{c.user?.NIP}</td>
                  <td className="p-2 text-center space-x-2">
                    <Button
                      onClick={() => navigate(`/detail/kehadiran/${c.id}`)}
                      className="bg-blue-600 text-white"
                    >
                      Detail
                    </Button>
                    {user?.role === "HRD" && (
                      <Button
                        onClick={() => handleDelete(c.id)}
                        className="bg-red-600 text-white"
                      >
                        Hapus
                      </Button>
                  )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* FORM MODAL */}
        {formOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 w-[400px] rounded-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Buka Absensi Baru</h2>

              <div className="flex flex-col gap-3">
                <label>Tanggal</label>
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                />
                {errors.tanggal && (
                  <p className="text-red-600 text-sm mt-1">{errors.tanggal}</p>
                )}

                <label>Jenis Absen</label>
                <select
                  className="border p-2 rounded"
                  value={formData.jenis}
                  onChange={(e) =>
                    setFormData({ ...formData, jenis: e.target.value })
                  }
                >
                  <option value="DATANG">DATANG</option>
                  <option value="PULANG">PULANG</option>
                </select>

                <label>Jam Mulai</label>
                <input
                  type="time"
                  className="border p-2 rounded"
                  value={formData.jam_mulai}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_mulai: e.target.value })
                  }
                />
                {errors.jam_mulai && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.jam_mulai}
                  </p>
                )}

                <label>Jam Selesai</label>
                <input
                  type="time"
                  className="border p-2 rounded"
                  value={formData.jam_selesai}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_selesai: e.target.value })
                  }
                />
                {errors.jam_selesai && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.jam_selesai}
                  </p>
                )}

                <Button
                  onClick={handleCreate}
                  className="bg-teal-800 text-white mt-3"
                >
                  Simpan
                </Button>

                <Button
                  onClick={() => setFormOpen(false)}
                  className="mt-2 bg-gray-400"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
