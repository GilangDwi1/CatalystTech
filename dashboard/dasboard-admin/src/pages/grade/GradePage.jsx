import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Trash2, Eye } from "lucide-react";

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [newGrade, setNewGrade] = useState({ grade: "" });
  const navigate = useNavigate();

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get("/grade");
      setGrades(res.data);
    } catch (err) {
      console.error("Gagal memuat data grade:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async () => {
    if (!newGrade.grade.trim()) {
      alert("Nama grade wajib diisi!");
      return;
    }

    try {
      await api.post("/grade", newGrade);
      setModalOpen(false);
      setNewGrade({ grade: "" });
      fetchGrades();
    } catch (err) {
      console.error("Gagal menambahkan grade:", err);
      alert("Gagal menambahkan grade!");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus grade ini?")) {
      try {
        await api.delete(`/grade/${id}`);
        fetchGrades();
      } catch (err) {
        console.error("Gagal menghapus grade:", err);
        alert("Gagal menghapus grade!");
      }
    }
  };

  useEffect(() => {
    fetchGrades();
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
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Grade</h1>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            + Tambah Grade
          </Button>
        </div>

        {/* Card Grid */}
        {grades.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Tidak ada grade tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grades.map((g) => (
              <div
                key={g.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {g.grade}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-6">
                    <Users size={18} className="mr-2" />
                    <span className="text-sm">
                      {g.activeKaryawanCount || 0} Karyawan Aktif
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => navigate(`/grade/${g.id}`)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-blue-600 border border-blue-200"
                  >
                    <Eye size={16} className="mr-2" /> Detail
                  </Button>
                  <Button
                    onClick={() => handleDelete(g.id)}
                    className="flex-1 bg-red-400 hover:bg-red-600 text-red-600 border border-red-200"
                  >
                    <Trash2 size={16} className="mr-2" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🟢 Modal Tambah Grade */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Grade Baru</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-3">
              <label className="text-sm font-medium text-gray-700">
                Nama Grade
              </label>
              <Input
                value={newGrade.grade}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, grade: e.target.value })
                }
                placeholder="Masukkan nama grade"
              />
            </div>

            <DialogFooter className="mt-5">
              <Button
                onClick={() => setModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Batal
              </Button>
              <Button
                onClick={handleAddGrade}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
