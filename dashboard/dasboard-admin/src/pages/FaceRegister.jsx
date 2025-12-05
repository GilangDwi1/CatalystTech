// src/pages/FaceRegister.jsx
import React, { useEffect, useState } from "react";
import WebcamCapture from "../components/WebcamCapture";
import { faceApi } from "../api/axiosInstance";

export default function FaceRegister({ karyawanId }) {
  const [status, setStatus] = useState({ count: 0 });
  const [loading, setLoading] = useState(false);
  const [embeddingGenerated, setEmbeddingGenerated] = useState(false);

  const loadStatus = async () => {
    const res = await faceApi.getFaceStatus(karyawanId);
    setStatus(res.data);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCapture = async (base64) => {
    if (status.count >= 5) return alert("Jumlah foto sudah 5!");

    const blob = await fetch(base64).then((r) => r.blob());
    await faceApi.uploadFace(karyawanId, blob);
    await loadStatus();
  };

  const handleReset = async () => {
    await faceApi.resetFaces(karyawanId);
    setEmbeddingGenerated(false);
    await loadStatus();
  };

  const handleGenerateEmbedding = async () => {
    setLoading(true);
    try {
      await faceApi.generateEmbedding(karyawanId);
      setEmbeddingGenerated(true);
      alert("Embedding berhasil dibuat!");
    } catch (err) {
      console.error(err);
      alert("Gagal generate embedding");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Registrasi Wajah Karyawan</h2>

      <p className="mb-2">
        Foto tersimpan: <b>{status.count}/5</b>
      </p>

      {status.count < 5 && <WebcamCapture onCapture={handleCapture} />}

      {status.count > 0 && (
        <button
          onClick={handleReset}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Reset Foto
        </button>
      )}

      {status.count === 5 && !embeddingGenerated && (
        <button
          onClick={handleGenerateEmbedding}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading ? "Memproses..." : "Generate Embedding"}
        </button>
      )}

      {embeddingGenerated && (
        <p className="mt-4 text-green-700 font-semibold">
          ✔ Embedding sudah dibuat!
        </p>
      )}
    </div>
  );
}
