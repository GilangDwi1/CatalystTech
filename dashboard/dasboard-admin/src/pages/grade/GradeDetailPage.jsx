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

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Detail Grade: {grade?.grade ?? "-"}{" "}
            {/* ✅ ubah dari nama → grade */}
          </h1>
          <Button
            onClick={() => navigate("/grade")}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            ← Kembali
          </Button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Daftar karyawan dengan grade ini.
        </p>

        {/* 🔍 Search & Filter */}
        <div className="flex gap-3 mb-4">
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

          <select
            value={filters.divisiId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, divisiId: e.target.value }))
            }
            className="border rounded-md px-3 py-2"
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
                    {k.divisi?.nama_divisi ?? "-"} {/* ✅ nama_divisi */}
                  </td>
                  <td className="p-2 text-center">
                    {k.grade?.grade ?? "-"} {/* ✅ ubah dari nama → grade */}
                  </td>
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
