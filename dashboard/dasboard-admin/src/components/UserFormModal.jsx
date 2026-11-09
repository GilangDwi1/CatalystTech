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

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  karyawan,
}) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="relative bg-white shadow-xl rounded-2xl w-[500px] max-w-full p-6 border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          type="button"
        >
          ×
        </button>

        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            {formData.id ? "Edit User" : "Tambah User"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid gap-4"
        >
          {/* Pilih Karyawan */}
          <div>
            <Label htmlFor="karyawan">Karyawan</Label>
            <select
              id="karyawan"
              value={formData.karyawan?.id || ""}
              onChange={(e) => {
                const selected = karyawan.find(
                  (k) => k.id === Number(e.target.value)
                );
                setFormData({
                  ...formData,
                  karyawan: selected ? selected : {},
                  NIP: selected?.NIP || "",
                  userId: selected?.id || null,
                });
              }}
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">Pilih Karyawan</option>
              {karyawan.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.NIP})
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role || ""}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">Pilih Role</option>
              <option value="admin">Admin</option>
              <option value="HRD">HRD</option>
              <option value="Kadiv">Kadiv</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
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
