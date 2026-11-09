import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import {
  Plus,
  ArrowLeft,
  User,
  Clock,
  Trash2,
  X,
  CalendarDays,
} from "lucide-react";

export default function LemburDetailPage() {
  const { id } = useParams(); // id_config_lembur
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [lembur, setLembur] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState([]);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get(`/lembur-config/${id}`);
      setConfig(res.data);
    } catch (err) {
      console.error("Gagal ambil config lembur", err);
    }
  };

  const fetchLembur = async () => {
    try {
      const res = await api.get(`/lembur/config/${id}`);
      setLembur(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKaryawan = async () => {
    try {
      const res = await api.get("/karyawan?is_active=true");
      const existingIds = new Set(lembur.map(l => l.id_karyawan));
      const filteredOptions = res.data
        .filter(k => !existingIds.has(k.id))
        .map((k) => ({
          value: k.id,
          label: `${k.nama} (${k.NIP})`,
        }));
      setKaryawanOptions(filteredOptions);
    } catch (err) {
      console.error("Gagal ambil karyawan", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchConfig(), fetchLembur()]).finally(() => setLoading(false));
  }, [id]);
  
  useEffect(() => {
    if (formOpen) {
      fetchKaryawan();
    }
  }, [formOpen, lembur]);


  const handleCreate = async () => {
    if (selectedKaryawan.length === 0) {
      alert("Pilih minimal 1 karyawan");
      return;
    }

    try {
      await api.post("/lembur/bulk", {
        id_config_lembur: Number(id),
        id_karyawan_list: selectedKaryawan.map((k) => k.value),
      });

      setSelectedKaryawan([]);
      setFormOpen(false);
      fetchLembur();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan lembur");
    }
  };

  const handleDelete = async (idLembur) => {
    if (!confirm("Yakin hapus data lembur karyawan ini?")) return;

    try {
      await api.delete(`/lembur/${idLembur}`);
      fetchLembur();
    } catch {
      alert("Gagal menghapus data");
    }
  };

  const formatTanggal = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      weekday: 'long', day: "2-digit", month: "long", year: "numeric",
    });

  const formatJam = (date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit",
    });

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detail Lembur</h1>
            {config && (
              <div className="flex items-center gap-4 mt-2 text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>{formatTanggal(config.tanggal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    {formatJam(config.jam_mulai)} –{" "}
                    {formatJam(config.jam_selesai)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/lembur-config-page")}
              className="
        bg-gray-500 text-white
        hover:bg-gray-400
        rounded-md
        flex items-center gap-1
        shadow-sm
        transition
      "
            >
              <ArrowLeft size={16} />
              Kembali
            </Button>
            {user?.role === "HRD" && (
              <Button
                onClick={() => setFormOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Karyawan
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#2B484F]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Karyawan
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Waktu Lembur
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Durasi
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lembur.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-white">
                    <p className="text-lg">
                      Belum ada karyawan yang ditambahkan
                    </p>
                    <p className="text-sm">
                      Klik tombol "Tambah Karyawan" untuk memulai.
                    </p>
                  </td>
                </tr>
              ) : (
                lembur.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.karyawan?.nama}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.karyawan?.NIP}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatJam(item.jam_mulai)} -{" "}
                      {formatJam(item.jam_selesai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                      {item.durasi_menit} menit
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user?.role === "HRD" && (
                        <Button
                          variant="ghost"
                          className="bg-red-400 hover:bg-red-600 text-red-600 border border-red-200"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {formOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
              <div className="bg-teal-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">
                  Tambah Karyawan Lembur
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-2 mb-6">
                  <label className="font-semibold text-sm text-gray-700">
                    Pilih Karyawan
                  </label>
                  <Select
                    isMulti
                    options={karyawanOptions}
                    value={selectedKaryawan}
                    onChange={setSelectedKaryawan}
                    placeholder="Pilih satu atau lebih karyawan..."
                    noOptionsMessage={() =>
                      "Semua karyawan aktif sudah ditambahkan"
                    }
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#d1d5db",
                        borderRadius: "0.5rem",
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    menuPortalTarget={document.body}
                  />
                  <p className="text-xs text-gray-500">
                    Hanya menampilkan karyawan yang belum ada di daftar lembur
                    ini.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setFormOpen(false)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreate}
                    className="flex-1 bg-teal-700 hover:bg-teal-800 text-white"
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
