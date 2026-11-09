import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function KaryawanFormModal({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  divisi,
  grade,
}) {
  if (!open) return null; // jangan render kalau modal belum dibuka

  return (
    <Dialog open={open} onClose={onClose}>
      {/* DialogContent bawaan akan handle backdrop klik */}
      <DialogContent className="relative bg-white shadow-xl rounded-2xl w-[600px] max-w-full p-6 border border-gray-100">
        {/* Tombol close pojok kanan atas */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          type="button"
        >
          ×
        </button>

        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Data Karyawan
          </DialogTitle>
          <p className="text-gray-500 text-sm">PT. Best Sejati Konesia</p>
        </DialogHeader>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="NIP"
              value={formData.NIP || ""}
              onChange={(e) =>
                setFormData({ ...formData, NIP: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              value={formData.nama || ""}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
          </div>

          {/* Divisi */}
          <select
            id="divisi"
            value={formData.divisi?.id || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                divisi: {
                  ...formData.divisi,
                  id: Number(e.target.value) || undefined,
                },
              })
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="">Pilih Divisi</option>
            {divisi.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </select>

          {/* Grade */}
          <select
            id="grade"
            value={formData.grade?.id || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                grade: {
                  ...formData.grade,
                  id: Number(e.target.value) || undefined,
                },
              })
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="">Pilih Grade</option>
            {grade.map((g) => (
              <option key={g.id} value={g.id}>
                {g.grade}
              </option>
            ))}
          </select>

          <div>
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              value={formData.alamat || ""}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="foto">Foto</Label>
            <Input
              id="foto"
              type="file"
              onChange={(e) =>
                setFormData({ ...formData, foto: e.target.files[0] })
              }
            />
          </div>

          <DialogFooter className="col-span-2 mt-4 flex justify-end gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
