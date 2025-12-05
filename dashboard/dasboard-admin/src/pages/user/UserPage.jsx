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

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manajemen User</h1>
          <Button
            className="bg-teal-800 hover:bg-teal-900"
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
        <div className="flex gap-3 mb-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Cari NIP atau nama..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="border rounded-md px-3 py-2 w-1/3"
          />

          {/* Status aktif */}
          <select
            value={filters.is_active}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                is_active: e.target.value,
              }))
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
              <th className="p-2 text-center">No</th>
              <th className="p-2 text-center">NIP</th>
              <th className="p-2 text-center">Nama Karyawan</th>
              <th className="p-2 text-center">Role</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Tidak ada data user ditemukan.
                </td>
              </tr>
            ) : (
              users.map((u, idx) => (
                <tr key={u.id}>
                  <td className="p-2 text-center">{idx + 1}</td>
                  <td className="p-2 text-center">{u.NIP}</td>
                  <td className="p-2 text-center">{u.karyawan?.nama || "-"}</td>
                  <td className="p-2 text-center capitalize">{u.role}</td>
                  <td className="p-2 text-center">
                    {u.is_active ? (
                      <span className="text-green-600 font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      onClick={() => {
                        setEditId(u.id);
                        setFormData({
                          ...u,
                          karyawan: u.karyawan,
                        });
                        setModalOpen(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white mr-2"
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => handleDelete(u.id)}
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
