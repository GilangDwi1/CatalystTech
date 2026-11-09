import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  CalendarDays,
  Clock,
  User,
  Users,
  ArrowRight,
} from "lucide-react";

export default function LemburConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
  });

  const [errors, setErrors] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= FETCH =================
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      let url = "/lembur-config";

      if (selectedDate) {
        url += `?tanggal=${format(selectedDate, "yyyy-MM-dd")}`;
      }

      const res = await api.get(url);
      setConfigs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [selectedDate]);

  // ================= VALIDASI =================
  const validateForm = () => {
    const err = {};

    if (!formData.tanggal) {
      err.tanggal = "Tanggal wajib diisi";
    }

    if (!formData.jam_mulai) {
      err.jam_mulai = "Jam mulai wajib diisi";
    }

    if (!formData.jam_selesai) {
      err.jam_selesai = "Jam selesai wajib diisi";
    }

    if (formData.tanggal && formData.jam_mulai && formData.jam_selesai) {
      const mulai = new Date(`${formData.tanggal}T${formData.jam_mulai}`);
      const selesai = new Date(`${formData.tanggal}T${formData.jam_selesai}`);

      if (selesai <= mulai) {
        err.jam_selesai = "Jam selesai harus lebih besar dari jam mulai";
      }
    }

    return err;
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    const validation = validateForm();
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    try {
      await api.post("/lembur-config", {
        ...formData,
        dibuat_oleh: user.id,
      });

      setFormOpen(false);
      setFormData({
        tanggal: "",
        jam_mulai: "",
        jam_selesai: "",
      });

      fetchConfigs();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuat config lembur");
    }
  };

  const formatTanggal = (date, options) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      ...options,
    });
  };

  const formatJam = (date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Konfigurasi Lembur
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola jadwal dan waktu lembur karyawan.
            </p>
          </div>
          {user?.role === "HRD" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Buka Lembur
            </Button>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
          <CalendarDays className="text-gray-400" />
          <div className="w-64">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter Berdasarkan Tanggal"
                value={selectedDate}
                onChange={(v) => setSelectedDate(v)}
                slotProps={{
                  field: { clearable: true },
                  textField: {
                    size: "small",
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Content */}
        {configs.length === 0 ? (
          <div className="text-center mt-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-800">
              Tidak Ada Konfigurasi Lembur
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada konfigurasi lembur untuk tanggal yang dipilih.
            </p>
            {user?.role === "HRD" && (
              <Button
                onClick={() => setFormOpen(true)}
                className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                + Buat Konfigurasi Baru
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#2B484F]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span>Tanggal</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Jam Lembur</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>Dibuat Oleh</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>Jumlah Karyawan</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTanggal(item.tanggal)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTanggal(item.tanggal, { weekday: "long" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {formatJam(item.jam_mulai)} -{" "}
                        {formatJam(item.jam_selesai)}
                      </div>
                      <div className="text-sm text-gray-500">{`${item.durasi_menit} Menit`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.author?.nama || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                      {item.summary || 0} Orang
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1"
                        onClick={() => navigate(`/lembur/detail/${item.id}`)}
                      >
                        <span>Detail</span>
                        <ArrowRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL CREATE */}
        {formOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
              <div className="bg-teal-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Buka Lembur Baru
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-teal-600 rounded-full p-1 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                  />
                  {errors.tanggal && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tanggal}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                      value={formData.jam_mulai}
                      onChange={(e) =>
                        setFormData({ ...formData, jam_mulai: e.target.value })
                      }
                    />
                    {errors.jam_mulai && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.jam_mulai}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                      value={formData.jam_selesai}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jam_selesai: e.target.value,
                        })
                      }
                    />
                    {errors.jam_selesai && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.jam_selesai}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setFormOpen(false)}
                    className="flex-1 bg-gray-500 border border-gray-500 text-white hover:bg-gray-400"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreate}
                    className="flex-1 bg-teal-700 hover:bg-teal-800 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Simpan Konfigurasi
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
