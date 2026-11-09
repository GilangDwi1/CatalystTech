import { useState, useEffect } from "react";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import UserFormModal from "@/components/UserFormModal";
import { Button } from "@/components/ui/button";

// 🔄 Debounce hook
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [karyawan, setKaryawan] = useState([]);

  // 🔍 Gabungkan searchInput ke dalam filters
  const [filters, setFilters] = useState({
    search: "",
    is_active: "",
  });

  const debouncedSearch = useDebounce(filters.search);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

  const fetchUsers = async (params = filters) => {
    setLoading(true);
    try {
      const res = await api.get("/user", {
        params: {
          search: params.search || undefined,
          is_active: params.is_active || undefined,
        },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Gagal memuat data user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKaryawan = async () => {
    try {
      const res = await api.get("/karyawan");
      setKaryawan(res.data);
    } catch (error) {
      console.error("Gagal memuat data karyawan:", error);
    }
  };

  // 🔄 Load awal
  useEffect(() => {
    fetchKaryawan();
    fetchUsers();
  }, []);

  // 🔥 Auto-fetch ketika filter berubah (debounce search)
  useEffect(() => {
    fetchUsers({
      search: debouncedSearch,
      is_active: filters.is_active,
    });
  }, [debouncedSearch, filters.is_active]);

  const handleSubmit = async () => {
    try {
      const payload = {
        id_karyawan: Number(formData.karyawan?.id),
        NIP: formData.karyawan?.NIP,
        password: formData.password,
        role: formData.role,
      };

      if (editId) {
        await api.put(`/user/${editId}`, payload);
      } else {
        await api.post("/user", payload);
      }

      fetchUsers();
      setModalOpen(false);
      setFormData({});
      setEditId(null);
    } catch (error) {
      console.error("Gagal menyimpan user:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus user ini?")) {
      try {
        await api.delete(`/user/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Gagal menghapus user:", error);
      }
    }
  };

  if (loading) return <p className="p-8 ml-64">Memuat data...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
          <Button
            className="bg-teal-700 hover:bg-teal-800 text-white"
            onClick={() => {
              setFormData({});
              setEditId(null);
              setModalOpen(true);
            }}
          >
            + Tambah User
          </Button>
        </div>

        {/* 🔍 Search + Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2 flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Cari NIP atau nama..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status aktif */}
            <select
              value={filters.is_active}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  is_active: e.target.value,
                }))
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
                <th className="p-3 text-center w-16">No</th>
                <th className="p-3">NIP</th>
                <th className="p-3">Nama Karyawan</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    Tidak ada data user ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr
                    key={u.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-center">{idx + 1}</td>
                    <td className="p-3">{u.NIP}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {u.karyawan?.nama || "-"}
                    </td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <Button
                        onClick={() => {
                          setEditId(u.id);
                          setFormData({
                            ...u,
                            karyawan: u.karyawan,
                          });
                          setModalOpen(true);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white h-8 px-3 text-xs"
                      >
                        Edit
                      </Button>

                      <Button
                        onClick={() => handleDelete(u.id)}
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

      {/* Modal */}
      {modalOpen && (
        <UserFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          karyawan={karyawan}
        />
      )}
    </div>
  );
}
