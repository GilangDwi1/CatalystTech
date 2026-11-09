import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  X,
  Plus,
  CalendarDays,
  Clock,
  User,
  ArrowRight,
  LogIn,
  LogOut,
} from "lucide-react";

export default function AbsensiConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  // form pembuatan config
  const [formOpen, setFormOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tanggal: "",
    jenis: "DATANG",
    jam_mulai: "",
    batas_absen: "",
    jam_selesai: "",
  });

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      let url = "/absensi-config/halamanKehadiran";

      if (selectedDate) {
        const tgl = selectedDate.toISOString().split("T")[0];
        url += `?tanggal=${tgl}`;
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

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = {};

    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.tanggal);

      if (selectedDate < today) {
        newErrors.tanggal = "Tanggal tidak boleh kurang dari hari ini";
      }
    }

    if (!formData.jam_mulai) {
      newErrors.jam_mulai = "Jam mulai harus diisi";
    }

    if (formData.jenis === "DATANG" && !formData.batas_absen) {
      newErrors.batas_absen = "Batas absen karyawan harus diisi";
    }

    if (!formData.jam_selesai) {
      newErrors.jam_selesai = "Jam selesai harus diisi";
    }

    if (formData.jam_mulai && formData.jam_selesai) {
      const mulai = new Date(`${formData.tanggal}T${formData.jam_mulai}`);
      const selesai = new Date(`${formData.tanggal}T${formData.jam_selesai}`);

      if (mulai >= selesai) {
        newErrors.jam_selesai = "Jam selesai harus lebih besar dari jam mulai";
      }
    }

    return newErrors;
  };

  // --- HANDLE CREATE ---
  const handleCreate = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await api.post("/absensi-config", {
        tanggal: formData.tanggal,
        jenis: formData.jenis,
        jam_mulai: formData.jam_mulai,
        batas_absen: formData.batas_absen,
        jam_selesai: formData.jam_selesai,
        dibuat_oleh: user.id,
      });

      setFormOpen(false);
      setFormData({
        tanggal: "",
        jenis: "DATANG",
        jam_mulai: "",
        batas_absen: "",
        jam_selesai: "",
      });
      setErrors({});

      fetchConfigs();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuat absensi config");
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

  const formatJam = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Konfigurasi Absensi
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola jadwal dan waktu absensi karyawan.
            </p>
          </div>
          {user?.role === "HRD" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Buka Absensi
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

        {/* Content Grid */}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-800">
              Tidak Ada Konfigurasi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada konfigurasi absensi untuk tanggal yang dipilih.
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
                      <User size={16} />
                      <span>Dibuat Oleh</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <LogIn size={16} className="text-teal-500" />
                      <span>Absen Datang</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={16} className="text-orange-500" />
                      <span>Absen Pulang</span>
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
                  <tr key={item.tanggal}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTanggal(item.tanggal)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTanggal(item.tanggal, { weekday: "long" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.dibuat_oleh || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.datang ? (
                        <div className="text-sm text-gray-900 font-semibold">
                          {formatJam(item.datang.jam_mulai)} -{" "}
                          {formatJam(item.datang.jam_selesai)}
                        </div>
                      ) : (
                        <span className="text-xs italic text-red-500">
                          Belum Dibuat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.pulang ? (
                        <div className="text-sm text-gray-900 font-semibold">
                          {formatJam(item.pulang.jam_mulai)} -{" "}
                          {formatJam(item.pulang.jam_selesai)}
                        </div>
                      ) : (
                        <span className="text-xs italic text-red-500">
                          Belum Dibuat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            navigate(
                              `/detail/kehadiran/${format(
                                new Date(item.tanggal),
                                "yyyy-MM-dd"
                              )}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1"
                        >
                          <ArrowRight size={14} />
                        </Button>
                        {(user?.role === "HRD" || user?.role === "admin") && (
                          <>
                            {item.datang && (
                              <Button
                                onClick={() =>
                                  navigate(
                                    `/kehadiran/${item.datang.id}/create-manual`
                                  )
                                }
                                className="bg-teal-100 text-teal-800 hover:bg-teal-200 h-9 w-9 text-xs font-bold rounded-md"
                                title="Manual Datang"
                              >
                                +D
                              </Button>
                            )}
                            {item.pulang && (
                              <Button
                                onClick={() =>
                                  navigate(
                                    `/kehadiran/${item.pulang.id}/create-manual`
                                  )
                                }
                                className="bg-orange-100 text-orange-800 hover:bg-orange-200 h-9 w-9 text-xs font-bold rounded-md"
                                title="Manual Pulang"
                              >
                                +P
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORM MODAL */}
        {formOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
              {/* Header */}
              <div className="bg-teal-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Buka Absensi Baru
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-teal-600 rounded-full p-1 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Tanggal */}
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

                {/* Jenis Absen */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jenis Absen
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm appearance-none bg-white"
                      value={formData.jenis}
                      onChange={(e) =>
                        setFormData({ ...formData, jenis: e.target.value })
                      }
                    >
                      <option value="DATANG">DATANG</option>
                      <option value="PULANG">PULANG</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Jam Mulai & Selesai Grid */}
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

                {/* Batas Absen (Conditional) */}
                {formData.jenis === "DATANG" && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-semibold text-gray-700">
                      Batas Absen (Terlambat)
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                      value={formData.batas_absen}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          batas_absen: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Karyawan yang absen setelah jam ini akan dianggap
                      terlambat.
                    </p>
                    {errors.batas_absen && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.batas_absen}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setFormOpen(false)}
                    className="flex-1 bg-gray-500 text-white hover:bg-gray-300"
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
