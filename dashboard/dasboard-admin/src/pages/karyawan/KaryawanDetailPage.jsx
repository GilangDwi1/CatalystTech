import { useEffect, useState, } from "react";
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
  const [selectedDate, setSelectedDate] = useState(null);
  

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

  console.log(karyawan);

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

  const filteredAbsen = !selectedDate
    ? karyawan?.absen || [] // Kalau tanggal kosong, tampil semua absen
    : karyawan?.absen?.filter((a) => {
        const d = new Date(a.waktu);

        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      }) || [];

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!karyawan) return <p className="p-6">Data karyawan tidak ditemukan.</p>;

  const isActive =
    karyawan.is_active && (karyawan.user ? karyawan.user.is_active : true);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Detail Karyawan</h1>
          <button
            onClick={() => navigate("/karyawan")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ← Kembali
          </button>
        </div>

        {/* Basic Information Card */}
        <div className="bg-white shadow-sm rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Foto + Info kiri */}
          <div className="col-span-1 flex gap-4">
            <img
              src={
                karyawan.foto
                  ? `http://localhost:3000/uploads/avatar/${karyawan.foto}`
                  : "https://placeholdit.com/1200x630/9e9fa0/ffffff?text=Foto"
              }
              alt={karyawan.nama}
              className="w-28 h-28 shadow-md rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold">{karyawan.nama}</h2>
              <p className="text-gray-600">NIP: {karyawan.NIP}</p>
              <p className="text-gray-600">NIK: {karyawan.NIK ?? "-"}</p>
              <p className="text-gray-600 mt-1">
                Status: {karyawan.is_active ? "Aktif" : "Nonaktif"}
              </p>
            </div>
          </div>

          {/* Info kanan */}
          <div className="col-span-2 grid grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Tanggal Lahir:</strong>
              <br />{" "}
              {karyawan.tanggal_lahir
                ? new Date(karyawan.tanggal_lahir).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <strong>Divisi:</strong>
              <br /> {karyawan.divisi?.nama_divisi ?? "-"}
            </p>
            <p>
              <strong>Grade:</strong>
              <br /> {karyawan.grade?.grade ?? "-"}
            </p>
            <p>
              <strong>Alamat:</strong>
              <br /> {karyawan.alamat}
            </p>
          </div>
        </div>
        <div className="gap-2">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Filter Tanggal"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              TextField={(params) => (
                <input {...params} className="border p-1 rounded" />
              )}
              slotProps={{ field: { clearable: true } }}
            />
          </LocalizationProvider>
        </div>

        {/* Riwayat Absen */}
        <div>
          <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden text-left table-fixed">
            <thead className="bg-[#2B484F] text-white">
              <tr>
                <th className="p-4">No</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">Waku</th>
                <th className="p-2">Jenis</th>
                <th className="p-2">Status</th>
                <th className="p-2">Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsen.map((item, index) => (
                <tr key={item.id}>
                  <td className="p-4">{index + 1}</td>
                  <td className="p-2">{formatTanggal(item.waktu)}</td>
                  <td className="p-2">{formatWaktu(item.waktu)}</td>
                  <td className="p-2">{item.jenis}</td>
                  <td className="p-2">{item.status}</td>
                  <td className="p-2">{item.lokasi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tombol Nonaktifkan */}
        <div className="bg-white shadow-sm rounded-2xl p-6">
          {isActive ? (
            <button
              onClick={handleNonaktifkan}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow"
            >
              Nonaktifkan Karyawan
            </button>
          ) : (
            <button
              onClick={handleNonaktifkan}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
            >
              Aktifkan Karyawan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}