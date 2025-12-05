import { useState, useEffect, } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import KaryawanFormModal from "@/components/KaryawanFormModal";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

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

  const handleSubmit = async () => {
    try {
      // Mapping formData ke payload sesuai schema Prisma
      const payload = {
        NIP: formData.NIP,
        nama: formData.nama,
        alamat: formData.alamat,
        id_divisi: Number(formData.divisi?.id) || undefined,
        id_grade: Number(formData.grade?.id) || undefined,
        foto: formData.foto ?? null,
      };

      if (editId) {
        console.log("Update payload:", payload);
        await api.put(`/karyawan/${editId}`, payload);
      } else {
        console.log("Create payload:", payload);
        await api.post("/karyawan", payload);
      }

      fetchData();
      setModalOpen(false);
      setFormData({});
      setEditId(null);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      console.log(
        "Full URL dipanggil:",
        error.config?.baseURL + error.config?.url
      );
    }
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

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Data Karyawan</h1>
          <Button
            className="bg-teal-800 hover:bg-teal-900"
            onClick={() => navigate("/karyawan/tambah")}
          >
            + Tambah Karyawan
          </Button>
        </div>

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
              setFilters({ ...filters, divisiId: e.target.value })
            }
            className="border rounded-md px-3 py-2"
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
            className="border rounded-md px-3 py-2"
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
            className="border rounded-md px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        {/* 🔹 Table */}
        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2 text-center">NIP</th>
              <th className="p-2 text-center">Nama</th>
              <th className="p-2 text-center">Divisi</th>
              <th className="p-2 text-center">Grade</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Alamat</th>
              <th className="p-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {karyawan.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              karyawan.map((k) => (
                <tr key={k.id}>
                  <td className="p-2 text-center">{k.NIP}</td>
                  <td className="p-2 text-center">{k.nama}</td>
                  <td className="p-2 text-center">
                    {k.divisi?.nama_divisi || "-"}
                  </td>
                  <td className="p-2 text-center">{k.grade?.grade || "-"}</td>
                  <td className="p-2 text-center">
                    {k.is_active ? (
                      <span className="text-green-600 font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center">{k.alamat}</td>
                  <td className="p-2 text-center space-x-2">
                    <Button
                      onClick={() => navigate(`/karyawan/${k.id}`)}
                      className="bg-blue-600 text-white"
                    >
                      Detail
                    </Button>

                    <Button
                      onClick={() => handleDelete(k.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
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

      {modalOpen && (
        <KaryawanFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          divisi={divisi}
          grade={grade}
        />
      )}
    </div>
  );
}
