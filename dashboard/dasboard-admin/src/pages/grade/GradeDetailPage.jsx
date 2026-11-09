import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function GradeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState(null);
  const [karyawan, setKaryawan] = useState([]);
  const [filteredKaryawan, setFilteredKaryawan] = useState([]);
  const [divisi, setDivisi] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ divisiId: "" });

  // helper untuk normalisasi field
  const getNip = (k) => String(k.nip ?? k.NIP ?? "").toLowerCase();
  const getNama = (k) => String(k.nama ?? "").toLowerCase();
  const getDivisiId = (k) =>
    String(k.divisi?.id ?? k.id_divisi ?? "").toString();

  // ambil grade + karyawan
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/grade/${id}`);
      setGrade(res.data);
      const list = res.data.karyawan ?? [];
      setKaryawan(list);
      setFilteredKaryawan(list);
    } catch (error) {
      console.error("Gagal memuat detail grade:", error);
      setKaryawan([]);
      setFilteredKaryawan([]);
    } finally {
      setLoading(false);
    }
  };

  // ambil daftar divisi untuk dropdown
  const fetchDivisi = async () => {
    try {
      const res = await api.get("/divisi");
      setDivisi(res.data);
    } catch (error) {
      console.error("Gagal memuat daftar divisi:", error);
      setDivisi([]);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchDivisi();
  }, [id]);

  // jalankan filter setiap kali karyawan, searchInput, atau filters berubah
  useEffect(() => {
    let result = [...karyawan];
    const search = searchInput.trim().toLowerCase();

    // filter divisi bila ada
    if (filters.divisiId) {
      result = result.filter((k) => {
        const dId = getDivisiId(k);
        return String(dId) === String(filters.divisiId);
      });
    }

    // filter nama / nip bila ada
    if (search !== "") {
      result = result.filter((k) => {
        const nip = getNip(k);
        const nama = getNama(k);
        return nip.includes(search) || nama.includes(search);
      });
    }

    setFilteredKaryawan(result);
  }, [karyawan, searchInput, filters.divisiId]);

  const handleSearchButton = () => {
    setSearchInput((s) => s);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Detail Grade: {grade?.grade ?? "-"}{" "}
            {/* ✅ ubah dari nama → grade */}
          </h1>
          <Button
            onClick={() => navigate("/grade")}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            ← Kembali
          </Button>
        </div>

        {/* 🔍 Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2 flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Cari nama atau NIP..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchButton();
                }}
                className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button
                onClick={handleSearchButton}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Cari
              </Button>
            </div>

            <select
              value={filters.divisiId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, divisiId: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua Divisi</option>
              {divisi.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama_divisi} {/* ✅ ubah dari d.nama → d.nama_divisi */}
                </option>
              ))}
            </select>

            <Button
              onClick={() => {
                setSearchInput("");
                setFilters({ divisiId: "" });
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* 📋 Tabel Karyawan */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#2B484F] text-white">
              <tr>
                <th className="p-3">NIP</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Grade</th>
                <th className="p-3">No. Telepon</th>
                <th className="p-3">Alamat</th>
              </tr>
            </thead>
            <tbody>
              {filteredKaryawan.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    Tidak ada karyawan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredKaryawan.map((k) => (
                  <tr
                    key={k.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{k.NIP ?? "-"}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {k.nama ?? "-"}
                    </td>
                    <td className="p-3">
                      {k.divisi?.nama_divisi ?? "-"} {/* ✅ nama_divisi */}
                    </td>
                    <td className="p-3">
                      {k.grade?.grade ?? "-"} {/* ✅ ubah dari nama → grade */}
                    </td>
                    <td className="p-3">{k.no_telp ?? "-"}</td>
                    <td className="p-3 truncate max-w-[200px]" title={k.alamat}>
                      {k.alamat ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
