import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import DivisiFormModal from "@/components/DivisiFormModal";
import { Users, Trash2, Eye } from "lucide-react";

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Divisi</h1>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            + Tambah Divisi
          </Button>
        </div>

        {/* Card Grid */}
        {divisi.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Tidak ada divisi tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisi.map((d) => (
              <div
                key={d.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {d.nama_divisi}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-6">
                    <Users size={18} className="mr-2" />
                    <span className="text-sm">
                      {d.activeKaryawanCount || 0} Karyawan Aktif
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => navigate(`/divisi/${d.id}`)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-blue-600 border border-blue-200"
                  >
                    <Eye size={16} className="mr-2" /> Detail
                  </Button>
                  <Button
                    onClick={() => handleDelete(d.id)}
                    className="flex-1 bg-red-400 hover:bg-red-600 text-red-600 border border-red-200"
                  >
                    <Trash2 size={16} className="mr-2" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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
