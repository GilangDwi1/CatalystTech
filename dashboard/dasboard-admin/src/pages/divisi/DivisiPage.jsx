import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import DivisiFormModal from "@/components/DivisiFormModal";

export default function DivisiPage() {
  const [divisi, setDivisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDivisi = async () => {
    setLoading(true);
    try {
      const res = await api.get("/divisi");
      setDivisi(res.data);
    } catch (err) {
      console.error("Gagal memuat data divisi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus divisi ini?")) {
      try {
        await api.delete(`/divisi/${id}`);
        fetchDivisi();
      } catch (err) {
        console.error("Gagal menghapus divisi:", err);
        alert("Gagal menghapus divisi!");
      }
    }
  };

  useEffect(() => {
    fetchDivisi();
  }, []);

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manajemen Divisi</h1>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            + Tambah Divisi
          </Button>
        </div>

        {/* Table */}
        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2 text-center w-[60px]">No</th>
              <th className="p-2 text-center">Nama Divisi</th>
              <th className="p-2 text-center">Jumlah Karyawan</th>
              <th className="p-2 text-center w-[200px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {divisi.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  Tidak ada divisi tersedia.
                </td>
              </tr>
            ) : (
              divisi.map((d, index) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2 text-center">{d.nama_divisi}</td>
                  <td className="p-2 text-center">
                    {d.activeKaryawanCount || 0}
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <Button
                      onClick={() => navigate(`/divisi/${d.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Detail
                    </Button>
                    <Button
                      onClick={() => handleDelete(d.id)}
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

        {/* Modal Tambah Divisi */}
        <DivisiFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSaved={fetchDivisi}
        />
      </div>
    </div>
  );
}
