import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";

export default function EditAbsenConfigModal({ open, onClose, config, user }) {
  const [jenis, setJenis] = useState("");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
console.log(config)
  useEffect(() => {
    if (config) {
      setJenis(config.jenis);
      setJamMulai(config.jam_mulai);
      setJamSelesai(config.jam_selesai);
    }
  }, [config]);

  const handleSubmit = async () => {
    try {
      await api.put(`/absen-config/${config.id}`, {
        jenis,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        updated_by: user.name, // untuk audit
      });

      onClose(true); // refresh parent
    } catch (err) {
      console.error("Gagal update config:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // ambil bagian tanggal saja
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Absensi Config</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tanggal (Readonly) */}
          <div>
            <label className="block text-sm mb-1">Tanggal</label>
            <input
              type="date"
              value={formatDate(config?.tanggal) || ""}
              disabled
              className="w-full border rounded p-2 bg-gray-100 text-gray-500"
            />
          </div>

          {/* Jenis */}
          <div>
            <label className="block text-sm mb-1">Jenis</label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="DATANG">DATANG</option>
              <option value="PULANG">PULANG</option>
            </select>
          </div>

          {/* Jam Mulai */}
          <div>
            <label className="block text-sm mb-1">Jam Mulai</label>
            <input
              type="time"
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Jam Selesai */}
          <div>
            <label className="block text-sm mb-1">Jam Selesai</label>
            <input
              type="time"
              value={jamSelesai}
              onChange={(e) => setJamSelesai(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Dibuat Oleh (Readonly) */}
          <div>
            <label className="block text-sm mb-1">Dibuat Oleh</label>
            <input
              type="text"
              value={"" || ""}
              disabled
              className="w-full border rounded p-2 bg-gray-100 text-gray-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onClose(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
