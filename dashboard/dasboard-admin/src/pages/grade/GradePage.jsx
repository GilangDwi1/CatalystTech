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

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(grades);

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

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manajemen Grade</h1>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            + Tambah Grade
          </Button>
        </div>

        {/* Table */}
        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2 text-center w-[60px]">No</th>
              <th className="p-2 text-center">Grade</th>
              <th className="p-2 text-center">Jumlah Karyawan</th>
              <th className="p-2 text-center w-[200px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  Tidak ada grade tersedia.
                </td>
              </tr>
            ) : (
              grades.map((g, index) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2 text-center">{g.grade}</td>
                  <td className="p-2 text-center">
                    {g.activeKaryawanCount || 0}
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <Button
                      onClick={() => navigate(`/grade/${g.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Detail
                    </Button>
                    <Button
                      onClick={() => handleDelete(g.id)}
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
