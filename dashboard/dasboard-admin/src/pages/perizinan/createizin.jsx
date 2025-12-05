import { useState, useEffect } from "react";
import api from "@/api/axiosInstance"; // ← sudah include JWT
import Sidebar from "@/components/Sidebar";

export default function TambahIzinPage() {
  const [karyawanList, setKaryawanList] = useState([]);

  const [form, setForm] = useState({
    karyawanId: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    jenisIzin: "IZIN",
    keterangan: "",
    filePendukung: null,
  });

  useEffect(() => {
    api
      .get("/karyawan") // mengambil list karyawan (dengan JWT)
      .then((res) => setKaryawanList(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    body.append("id_karyawan", form.karyawanId); // HARUS ini
    body.append("jenis", form.jenisIzin); // HARUS ini (IZIN, SAKIT, CUTI, WFH)
    body.append("tanggal_mulai", form.tanggalMulai); // HARUS snake_case
    body.append("tanggal_selesai", form.tanggalSelesai);
    body.append("alasan", form.keterangan);
    if (form.filePendukung) body.append("lampiran", form.filePendukung);


    try {
      await api.post("/izin", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Izin berhasil ditambahkan");

      setForm({
        karyawanId: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        jenisIzin: "IZIN",
        keterangan: "",
        filePendukung: null,
      });
    } catch (err) {
      console.error(err);
      alert("Gagal menambah izin");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Tambah Izin Karyawan</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Karyawan */}
            <div>
              <label className="block mb-1 font-semibold">Karyawan</label>
              <select
                name="karyawanId"
                value={form.karyawanId}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              >
                <option value="">-- Pilih Karyawan --</option>
                {karyawanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.nip})
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal mulai */}
            <div>
              <label className="block mb-1 font-semibold">Tanggal Mulai</label>
              <input
                type="date"
                name="tanggalMulai"
                value={form.tanggalMulai}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>

            {/* Tanggal selesai */}
            <div>
              <label className="block mb-1 font-semibold">
                Tanggal Selesai
              </label>
              <input
                type="date"
                name="tanggalSelesai"
                value={form.tanggalSelesai}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>

            {/* Jenis izin */}
            <div>
              <label className="block mb-2 font-semibold">Jenis Izin</label>

              <div className="grid grid-cols-2 gap-3">
                {["IZIN", "SAKIT", "CUTI", "WFH"].map((j) => (
                  <label
                    key={j}
                    className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="jenisIzin"
                      value={j}
                      checked={form.jenisIzin === j}
                      onChange={handleChange}
                    />
                    {j}
                  </label>
                ))}
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block mb-1 font-semibold">Keterangan</label>
              <textarea
                name="keterangan"
                rows={3}
                value={form.keterangan}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              ></textarea>
            </div>

            {/* File pendukung */}
            <div>
              <label className="block mb-1 font-semibold">
                File Pendukung (Opsional)
              </label>

              <div className="border rounded p-3 bg-gray-50">
                <input
                  type="file"
                  name="filePendukung"
                  onChange={handleChange}
                  className="w-full"
                />

                {form.filePendukung && (
                  <p className="mt-2 text-sm text-gray-600">
                    File dipilih: <strong>{form.filePendukung.name}</strong>
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Simpan Izin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
