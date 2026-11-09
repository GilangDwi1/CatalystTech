// src/pages/FaceRegister.jsx
import React, { useState, navigate } from "react";
import WebcamCapture from "../components/WebcamCapture";
import { useParams, useNavigate } from "react-router-dom";
import { faceApi } from "../api/axiosInstance";
import { Button } from "@/components/ui/button";

export default function FaceRegister({ karyawanId: nip, onCancel, onBack }) {
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const navigate = useNavigate();

  /* ================== CAPTURE ================== */
  const handleCapture = (base64) => {
    setPhotoBase64(base64);
    setHasSubmitted(false);
  };

  /* ================== SUBMIT ================== */
  const handleSubmit = async () => {
    if (!photoBase64) {
      alert("Ambil foto wajah terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const blob = await fetch(photoBase64).then((r) => r.blob());
      const form = new FormData();
      form.append("file", blob, "face.jpg");

      await faceApi.post(`/update/${nip}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setHasSubmitted(true);
      alert("Foto wajah berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan foto wajah");
    } finally {
      setLoading(false);
    }
  };

  /* ================== RESET ================== */
  const handleReset = () => {
    if (!window.confirm("Ambil ulang foto wajah?")) return;
    setPhotoBase64(null);
    setHasSubmitted(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Registrasi Wajah</h2>

      {/* ================= CONTENT ================= */}
      <div className="flex gap-6 items-start">
        {/* Webcam (SELALU AKTIF) */}
        <div>
          <WebcamCapture onCapture={handleCapture} disabled={loading} />
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 self-stretch" />

        {/* Preview */}
        <div className="flex flex-col gap-3 min-w-[220px]">
          <p className="text-sm text-gray-600">Foto ini digunakan untuk:</p>
          <ul className="text-sm text-gray-600 list-disc ml-4">
            <li>Avatar karyawan</li>
            <li>Face Recognition</li>
          </ul>

          {photoBase64 ? (
            <div>
              <p className="text-sm font-medium mb-2">Preview Foto</p>
              <img
                src={photoBase64}
                alt="Preview"
                className="w-32 h-32 rounded-lg border object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Silakan ambil foto wajah
            </p>
          )}

          {hasSubmitted && (
            <p className="text-sm text-green-700 font-medium">
              ✔ Foto wajah sudah tersimpan
            </p>
          )}
        </div>
      </div>

      {/* ================= ACTION ================= */}
      <div className="flex justify-between items-center mt-6">
        {/* KIRI */}
        <Button
          variant="outline"
          onClick={() => navigate("/karyawan")}
          className="border text-white bg-gray-700 py-2 rounded-lg hover:bg-gray-800"
        >
          Batal
        </Button>

        {/* KANAN */}
        <div className="flex gap-3"> 
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!photoBase64 || loading}
            className=" bg-red-700 hover:bg-red-800 text-white"
          >
            Ulangi Foto
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || !photoBase64}
            className="bg-teal-700 hover:bg-teal-800"
          >
            {loading ? "Menyimpan..." : "Simpan Foto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
