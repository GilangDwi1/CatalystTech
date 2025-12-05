import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function DivisiDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [divisi, setDivisi] = useState(null);
  const [karyawan, setKaryawan] = useState([]);
  const [filteredKaryawan, setFilteredKaryawan] = useState([]);
  const [gradeList, setGradeList] = useState([]); // ✅ dropdown grade
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ gradeId: "" }); // ✅ filter by grade

  // helpers
  const getNip = (k) => String(k.nip ?? k.NIP ?? "").toLowerCase();
  const getNama = (k) => String(k.nama ?? "").toLowerCase();
  const getGradeId = (k) => String(k.grade?.id ?? k.id_grade ?? "").toString();

  // ambil detail divisi + karyawan
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/divisi/${id}`);
      setDivisi(res.data);
      const list = res.data.karyawan ?? [];
      setKaryawan(list);
      setFilteredKaryawan(list);
    } catch (error) {
      console.error("Gagal memuat detail divisi:", error);
      setKaryawan([]);
      setFilteredKaryawan([]);
    } finally {
      setLoading(false);
    }
  };

  // ambil daftar grade untuk dropdown
  const fetchGradeList = async () => {
    try {
      const res = await api.get("/grade");
      setGradeList(res.data);
    } catch (error) {
      console.error("Gagal memuat daftar grade:", error);
      setGradeList([]);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchGradeList();
  }, [id]);

  // jalankan filter setiap kali searchInput atau filters berubah
  useEffect(() => {
    let result = [...karyawan];
    const search = searchInput.trim().toLowerCase();

    // filter grade bila ada
    if (filters.gradeId) {
      result = result.filter((k) => getGradeId(k) === String(filters.gradeId));
    }

    // filter nama / NIP bila ada
    if (search !== "") {
      result = result.filter((k) => {
        const nip = getNip(k);
        const nama = getNama(k);
        return nip.includes(search) || nama.includes(search);
      });
    }

    setFilteredKaryawan(result);
  }, [karyawan, searchInput, filters.gradeId]);

  const handleSearchButton = () => setSearchInput((s) => s);

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Detail Divisi: {divisi?.nama_divisi ?? "-"}
          </h1>
          <Button
            onClick={() => navigate("/divisi")}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            ← Kembali
          </Button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Daftar karyawan dalam divisi ini.
        </p>

        {/* 🔍 Search & Filter */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchButton();
            }}
            className="border rounded-md px-3 py-2 w-1/3"
          />
          <Button
            onClick={handleSearchButton}
            className="bg-teal-800 hover:bg-teal-900 text-white"
          >
            Search
          </Button>

          {/* 🔽 Dropdown Grade */}
          <select
            value={filters.gradeId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, gradeId: e.target.value }))
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="">Semua Grade</option>
            {gradeList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.grade}
              </option>
            ))}
          </select>

          <Button
            onClick={() => {
              setSearchInput("");
              setFilters({ gradeId: "" });
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Reset
          </Button>
        </div>

        {/* 📋 Tabel Karyawan */}
        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2 text-center">NIP</th>
              <th className="p-2 text-center">Nama</th>
              <th className="p-2 text-center">Divisi</th>
              <th className="p-2 text-center">Grade</th>
              <th className="p-2 text-center">No. Telepon</th>
              <th className="p-2 text-center">Alamat</th>
            </tr>
          </thead>
          <tbody>
            {filteredKaryawan.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Tidak ada karyawan yang sesuai filter.
                </td>
              </tr>
            ) : (
              filteredKaryawan.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="p-2 text-center">{k.NIP ?? "-"}</td>
                  <td className="p-2 text-center">{k.nama ?? "-"}</td>
                  <td className="p-2 text-center">
                    {divisi?.nama_divisi ?? "-"}
                  </td>
                  <td className="p-2 text-center">{k.grade?.grade ?? "-"}</td>
                  <td className="p-2 text-center">{k.no_telp ?? "-"}</td>
                  <td className="p-2 text-center">{k.alamat ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
