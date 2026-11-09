import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  User,
  CalendarDays,
  FileText,
  Trash2,
  Edit,
  Search,
  RotateCcw,
  Download,
  MoreVertical,
} from "lucide-react";

export default function PerizinanPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    divisi: "",
    grade: "",
    jenis: "",
    startDate: "",
    endDate: "",
  });

  // Data for dropdowns
  const [divisiList, setDivisiList] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const jenisOptions = ["SAKIT", "CUTI", "IZIN", "WFH"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [izinRes, divisiRes, gradeRes] = await Promise.all([
        api.get("/izin"),
        api.get("/divisi"),
        api.get("/grade"),
      ]);
      setData(izinRes.data);
      setFilteredData(izinRes.data);
      setDivisiList(divisiRes.data);
      setGradeList(gradeRes.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    const newValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [name]: newValue }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      divisi: "",
      grade: "",
      jenis: "",
      startDate: "",
      endDate: "",
    });
  };

  useEffect(() => {
    let result = data;
    result = result.filter((i) =>
      `${i.karyawan?.nama} ${i.karyawan?.NIP}`
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    );
    if (filters.divisi)
      result = result.filter((i) => i.karyawan?.divisi?.id == filters.divisi);
    if (filters.grade)
      result = result.filter((i) => i.karyawan?.grade?.id == filters.grade);
    if (filters.jenis) result = result.filter((i) => i.jenis === filters.jenis);
    if (filters.startDate)
      result = result.filter(
        (i) => new Date(i.tanggal_mulai) >= new Date(filters.startDate)
      );
    if (filters.endDate)
      result = result.filter(
        (i) => new Date(i.tanggal_selesai) <= new Date(filters.endDate)
      );
    setFilteredData(result);
  }, [filters, data]);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data izin ini?")) {
      try {
        await api.delete(`/izin/${id}/delete`);
        fetchData(); // Refetch data to get the updated list
      } catch (err) {
        console.error("Gagal menghapus data:", err);
        alert("Gagal menghapus data.");
      }
    }
  };

  const getStatusBadge = (jenis) => {
    switch (jenis) {
      case "SAKIT":
        return "bg-yellow-100 text-yellow-800";
      case "CUTI":
        return "bg-blue-100 text-blue-800";
      case "IZIN":
        return "bg-purple-100 text-purple-800";
      case "WFH":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const durasiIzin = (mulai, selesai) => {
    const durasi = differenceInDays(new Date(selesai), new Date(mulai)) + 1;
    return `${durasi} hari`;
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manajemen Perizinan
            </h1>
            <p className="text-gray-500 mt-1">
              Daftar semua izin, sakit, dan cuti karyawan.
            </p>
          </div>
          <Button
            onClick={() => navigate("/Perizinan/create")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-5 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Plus size={20} /> Buat Izin
          </Button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div className="space-y-2">
              <Label>Pencarian</Label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="text"
                  name="search"
                  placeholder="Cari nama / NIP..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="h-10 pl-10"
                />
              </div>
            </div>

            {/* Divisi */}
            <div className="space-y-2">
              <Label>Divisi</Label>
              <Select
                value={filters.divisi || "all"}
                onValueChange={(value) => handleSelectChange("divisi", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisiList.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.nama_divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jenis */}
            <div className="space-y-2">
              <Label>Jenis Izin</Label>
              <Select
                value={filters.jenis || "all"}
                onValueChange={(value) => handleSelectChange("jenis", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {jenisOptions.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="h-10"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={resetFilters}
              variant="ghost"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset Filter
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#2B484F] text-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Karyawan
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Detail Izin
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Alasan
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                  Lampiran
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Karyawan */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.karyawan?.nama}
                      </div>
                      <div className="text-sm text-gray-500">
                        NIP: {item.karyawan?.NIP}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.karyawan?.divisi?.nama_divisi}
                      </div>
                    </td>

                    {/* Detail Izin */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusBadge(
                          item.jenis
                        )}`}
                      >
                        {item.jenis}
                      </span>

                      <div className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                        <CalendarDays size={14} />
                        {format(
                          new Date(item.tanggal_mulai),
                          "dd MMM yyyy"
                        )} –{" "}
                        {format(new Date(item.tanggal_selesai), "dd MMM yyyy")}
                      </div>

                      <div className="text-sm text-gray-500">
                        ({durasiIzin(item.tanggal_mulai, item.tanggal_selesai)})
                      </div>
                    </td>

                    {/* Alasan */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.alasan || "-"}
                      </p>
                    </td>

                    {/* Lampiran */}
                    <td className="px-6 py-4 text-center">
                      {item.lampiran ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL}/uploads/izin/${
                            item.lampiran
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal-600 hover:underline text-sm"
                        >
                          <Download size={16} />
                          Lihat
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center gap-2">
                        {/* Detail */}
                        <Button
                          onClick={() => navigate(`/perizinan/edit/${item.id}`)}
                          className="
        h-9 px-3
        text-xs font-semibold
        bg-blue-600 text-white
        hover:bg-blue-700
        rounded-md
        flex items-center gap-1
        shadow-sm
        transition
      "
                        >
                          Edit
                          <Edit size={14} />
                        </Button>

                        {/* Delete */}
                        <Button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Yakin ingin menghapus data lembur ini?"
                              )
                            ) {
                              handleDelete(item.id);
                            }
                          }}
                          className="
        h-9 px-3
        text-xs font-semibold
        bg-red-600 text-white
        hover:bg-red-700
        rounded-md
        flex items-center gap-1
        shadow-sm
        transition
      "
                        >
                          Hapus
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-gray-500">
                    Tidak ada data izin yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
