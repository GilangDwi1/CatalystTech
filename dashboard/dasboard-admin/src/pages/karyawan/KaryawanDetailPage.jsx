import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function KaryawanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [karyawan, setKaryawan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredAbsen, setFilteredAbsen] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [showPhoto, setShowPhoto] = useState(false);

  const fetchKaryawan = async () => {
    try {
      const res = await api.get(`/karyawan/${id}`);
      setKaryawan(res.data);
    } catch (err) {
      console.error("Gagal mengambil detail karyawan:", err);
      setError("Gagal memuat data karyawan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltered = async () => {
    if (!id) return;

    const params = new URLSearchParams();
    params.append("id_karyawan", Number(id));

    if (selectedDate) {
      const isoDate = selectedDate.toLocaleDateString("en-CA");
      params.append("tanggal", isoDate);
    }

    try {
      const res = await api.get(`/absen/filtered?${params.toString()}`);
      setFilteredAbsen(res.data);
    } catch (err) {
      console.error("Gagal mengambil absensi:", err);
    }
  };

  const handleNonaktifkan = async () => {
    try {
      await api.put(`/karyawan/${id}/nonaktif`);
      alert("Karyawan berhasil dinonaktifkan");
      fetchKaryawan();
    } catch (err) {
      console.error("Gagal menonaktifkan karyawan", err);
      alert("Terjadi kesalahan saat menonaktifkan karyawan");
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [id]);

  // REFRESH absensi saat tanggal berubah
  useEffect(() => {
    fetchFiltered();
  }, [selectedDate]);

  function formatTanggal(waktu) {
    const d = new Date(waktu);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  }

  function formatWaktu(waktu) {
    const d = new Date(waktu);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

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

  if (error || !karyawan)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center">
          <p className="text-red-500 font-medium">
            {error || "Data karyawan tidak ditemukan."}
          </p>
        </div>
      </div>
    );

  const isActive =
    karyawan.is_active && (karyawan.user ? karyawan.user.is_active : true);

  const photoUrl = karyawan.foto
    ? `${import.meta.env.VITE_API_URL}/uploads/avatar/${karyawan.foto}`
    : "https://placeholdit.com/1200x630/9e9fa0/ffffff?text=Foto";
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Detail Karyawan</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/karyawan/edit/${id}`)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm transition font-medium"
            >
              Edit Data
            </button>
            <button
              onClick={() => navigate("/karyawan")}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition"
            >
              ← Kembali
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Profile & Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              {/* FOTO */}
              <img
                src={photoUrl}
                alt={karyawan.nama}
                onClick={() => setShowPhoto(true)}
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-50 shadow-sm cursor-pointer hover:scale-105 transition"
              />

              <h2 className="font-semibold text-lg">{karyawan.nama}</h2>

              {/* ================= MODAL FOTO ================= */}
              {showPhoto && (
                <div
                  className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                  onClick={() => setShowPhoto(false)}
                >
                  <div
                    className="relative bg-white rounded-xl p-4 max-w-lg w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* BUTTON CLOSE */}
                    <button
                      onClick={() => setShowPhoto(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                    >
                      ✕
                    </button>

                    {/* FOTO BESAR */}
                    <img
                      src={photoUrl}
                      alt={karyawan.nama}
                      className="w-full h-auto rounded-lg object-contain"
                    />

                    <p className="mt-3 text-center text-sm text-gray-600">
                      {karyawan.nama}
                    </p>
                  </div>
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {karyawan.nama}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {karyawan.divisi?.nama_divisi ?? "-"}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isActive ? "Aktif" : "Nonaktif"}
              </span>

              <div className="w-full mt-6 border-t pt-6 text-left space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    NIP
                  </label>
                  <p className="text-gray-900 font-medium">{karyawan.NIP}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    NIK
                  </label>
                  <p className="text-gray-900 font-medium">
                    {karyawan.NIK ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    Grade
                  </label>
                  <p className="text-gray-900 font-medium">
                    {karyawan.grade?.grade ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    Tanggal Lahir
                  </label>
                  <p className="text-gray-900 font-medium">
                    {karyawan.tanggal_lahir
                      ? new Date(karyawan.tanggal_lahir).toLocaleDateString(
                          "id-ID",
                          { dateStyle: "long" }
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    Alamat
                  </label>
                  <p className="text-gray-900 font-medium">
                    {karyawan.alamat || "-"}
                  </p>
                </div>
              </div>

              <div className="w-full mt-6 pt-2">
                <button
                  onClick={handleNonaktifkan}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Attendance History */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-bold text-gray-800 text-lg">
                  Riwayat Kehadiran
                </h3>
                <div className="w-full sm:w-auto">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Filter Tanggal"
                      value={selectedDate}
                      onChange={(v) => setSelectedDate(v)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                        field: { clearable: true },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#2B484F] text-white font-medium border-b">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Datang</th>
                      <th className="p-3">Pulang</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAbsen.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-6 text-center text-gray-500"
                        >
                          Tidak ada data absensi
                        </td>
                      </tr>
                    ) : (
                      filteredAbsen.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition">
                          <td className="p-3 text-center">{index + 1}</td>
                          <td className="p-3">{formatTanggal(row.tanggal)}</td>
                          <td className="p-3">
                            {row.datang ? formatWaktu(row.datang) : "-"}
                          </td>
                          <td className="p-3">
                            {row.pulang ? formatWaktu(row.pulang) : "-"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                row.status === "HADIR"
                                  ? "bg-green-100 text-green-700"
                                  : row.status === "TERLAMBAT"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td
                            className="p-3 truncate max-w-[150px]"
                            title={row.lokasi}
                          >
                            {row.lokasi ?? "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
