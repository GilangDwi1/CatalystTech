import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function KaryawanPage() {
  const navigate = useNavigate();
  const [karyawan, setKaryawan] = useState([]);
  const [divisi, setDivisi] = useState([]);
  const [grade, setGrade] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    divisiId: "",
    gradeId: "",
    is_active: "",
  });
  const [searchInput, setSearchInput] = useState(""); // input sementara
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/karyawan", { params: filters });
      setKaryawan(res.data);
    } catch (error) {
      console.error("Gagal memuat data karyawan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    const [divisiRes, gradeRes] = await Promise.all([
      api.get("/divisi"),
      api.get("/grade"),
    ]);
    setDivisi(divisiRes.data);
    setGrade(gradeRes.data);
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleSearchButton = () => {
    setFilters({ ...filters, search: searchInput });
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      try {
        await api.delete(`/karyawan/${id}`);
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      }
    }
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
  console.log(karyawan);
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
          <Button
            className="bg-teal-700 hover:bg-teal-800"
            onClick={() => navigate("/karyawan/tambah")}
          >
            + Tambah Karyawan
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
                setFilters({ ...filters, divisiId: e.target.value })
              }
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua Divisi</option>
              {divisi.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama_divisi}
                </option>
              ))}
            </select>
            <select
              value={filters.gradeId}
              onChange={(e) =>
                setFilters({ ...filters, gradeId: e.target.value })
              }
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua Grade</option>
              {grade.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.grade}
                </option>
              ))}
            </select>
            <select
              value={filters.is_active}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* 🔹 Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#2B484F] text-white">
              <tr>
                <th className="p-3 text-center w-16">Foto</th>
                <th className="p-3">NIP</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Grade</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Alamat</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {karyawan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                karyawan.map((k) => (
                  <tr
                    key={k.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center">
                        <img
                          src={
                            k.foto
                              ? `${
                                  import.meta.env.VITE_API_URL
                                }/uploads/avatar/${k.foto}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  k.nama
                                )}&background=random&color=fff`
                          }
                          alt={k.nama}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              k.nama
                            )}&background=random&color=fff`;
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-3">{k.NIP}</td>
                    <td className="p-3 font-medium text-gray-900">{k.nama}</td>
                    <td className="p-3">{k.divisi?.nama_divisi || "-"}</td>
                    <td className="p-3">{k.grade?.grade || "-"}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          k.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {k.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-3 truncate max-w-[200px]" title={k.alamat}>
                      {k.alamat}
                    </td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <Button
                        onClick={() => navigate(`/karyawan/${k.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-3 text-xs"
                      >
                        Detail
                      </Button>
                      <Button
                        onClick={() => handleDelete(k.id)}
                        className="bg-red-500 hover:bg-red-600 text-white h-8 px-3 text-xs"
                      >
                        Hapus
                      </Button>
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
