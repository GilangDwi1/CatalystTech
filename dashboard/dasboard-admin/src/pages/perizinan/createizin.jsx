import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "@/api/axiosInstance";
import Sidebar from "@/components/Sidebar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function TambahIzinPage() {
  const navigate = useNavigate();

  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalSelesai, setTanggalSelesai] = useState(null);
  const [errorTanggal, setErrorTanggal] = useState("");


  const [form, setForm] = useState({
    tanggalMulai: "",
    tanggalSelesai: "",
    jenisIzin: "IZIN",
    keterangan: "",
    filePendukung: null,
  });

  useEffect(() => {
    api
      .get("/karyawan?is_active=true")
      .then((res) => {
        const options = res.data.map((k) => ({
          value: k.id,
          label: `${k.nama} - ${k.NIP} `,
        }));
        setKaryawanOptions(options);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    const newForm = {
      ...form,
      [name]: files ? files[0] : value,
    };

    if (
      newForm.tanggalMulai &&
      newForm.tanggalSelesai &&
      new Date(newForm.tanggalSelesai) < new Date(newForm.tanggalMulai)
    ) {
      setErrorTanggal("Tanggal tidak valid");
    } else {
      setErrorTanggal("");
    }

    setForm(newForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedKaryawan) {
      alert("Karyawan wajib dipilih");
      return;
    }

    if (errorTanggal) return;

    const body = new FormData();
    body.append("id_karyawan", selectedKaryawan.value);
    body.append("jenis", form.jenisIzin);
    body.append(
      "tanggal_mulai",
      tanggalMulai ? tanggalMulai.toISOString().split("T")[0] : ""
    );
    body.append(
      "tanggal_selesai",
      tanggalSelesai ? tanggalSelesai.toISOString().split("T")[0] : ""
    );
    body.append("alasan", form.keterangan);
    if (form.filePendukung) body.append("lampiran", form.filePendukung);

    try {
      await api.post("/izin", body);
      alert("Izin berhasil ditambahkan");

      // ✅ REDIRECT KE HALAMAN PERIZINAN
      navigate("/perizinan");
    } catch (err) {
      console.error(err);
      alert("Gagal menambah izin");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Tambah Izin Karyawan
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ================= KARYAWAN (REACT SELECT) ================= */}
            <div>
              <label className="block mb-1 font-medium">Karyawan</label>
              <Select
                options={karyawanOptions}
                value={selectedKaryawan}
                onChange={setSelectedKaryawan}
                placeholder="Cari nama atau NIP..."
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    zIndex: 20,
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 30,
                  }),
                }}
                menuPortalTarget={document.body}
              />
            </div>
            <label className="block mb-1 font-medium">Tanggal</label>
            {/* ================= TANGGAL ================= */}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TANGGAL MULAI */}
                <DatePicker
                  label="Tanggal Mulai"
                  value={tanggalMulai}
                  onChange={(value) => {
                    setTanggalMulai(value);

                    if (tanggalSelesai && value && tanggalSelesai < value) {
                      setErrorTanggal("Tanggal tidak valid");
                    } else {
                      setErrorTanggal("");
                    }
                  }}
                  slotProps={{
                    field: { clearable: true },
                    textField: {
                      variant: "outlined",
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />

                {/* TANGGAL SELESAI */}
                <DatePicker
                  label="Tanggal Selesai"
                  value={tanggalSelesai}
                  minDate={tanggalMulai} // 🔒 disable sebelum tanggal mulai
                  onChange={(value) => {
                    setTanggalSelesai(value);

                    if (tanggalMulai && value && value < tanggalMulai) {
                      setErrorTanggal("Tanggal tidak valid");
                    } else {
                      setErrorTanggal("");
                    }
                  }}
                  slotProps={{
                    field: { clearable: true },
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: Boolean(errorTanggal),
                      helperText: errorTanggal,
                    },
                  }}
                />
              </div>
            </LocalizationProvider>

            {/* ================= JENIS IZIN ================= */}
            <div>
              <label className="block mb-2 font-medium">Jenis Izin</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["IZIN", "SAKIT", "CUTI", "WFH"].map((j) => (
                  <label
                    key={j}
                    className={`flex justify-center items-center rounded-lg border py-2 cursor-pointer ${
                      form.jenisIzin === j
                        ? "bg-teal-600 text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisIzin"
                      value={j}
                      checked={form.jenisIzin === j}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {j}
                  </label>
                ))}
              </div>
            </div>

            {/* ================= KETERANGAN ================= */}
            <div>
              <label className="block mb-1 font-medium">Keterangan</label>
              <textarea
                name="keterangan"
                rows={3}
                value={form.keterangan}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* ================= FILE ================= */}
            <div>
              <label className="block mb-1 font-medium">
                File Pendukung (Opsional)
              </label>
              <input
                type="file"
                name="filePendukung"
                onChange={handleChange}
                className="w-full border rounded-lg p-2 bg-gray-50"
              />
            </div>

            {/* ================= ACTION BUTTON ================= */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/perizinan")}
                className="w-1/2 border text-white bg-gray-700 py-2 rounded-lg hover:bg-gray-800"
              >
                Batalkan
              </button>

              <button
                type="submit"
                disabled={!!errorTanggal}
                className="w-1/2 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                Simpan Izin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
