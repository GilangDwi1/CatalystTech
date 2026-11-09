// src/components/WebcamCapture.jsx
import React, { useRef } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

export default function WebcamCapture({ onCapture }) {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc); // kirim base64 ke parent
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="border rounded"
      />
      <button
        onClick={capture}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Ambil Foto
      </button>
    </div>
  );
}
