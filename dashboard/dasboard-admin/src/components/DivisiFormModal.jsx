import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/api/axiosInstance";

export default function DivisiFormModal({ open, onOpenChange, onSaved }) {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nama.trim()) {
      alert("Nama divisi wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/divisi", { nama_divisi: nama });
      setNama("");
      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Gagal menambahkan divisi:", err);
      alert("Gagal menambahkan divisi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Divisi Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          <label className="text-sm font-medium text-gray-700">
            Nama Divisi
          </label>
          <Input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama divisi"
          />
        </div>

        <DialogFooter className="mt-5">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
