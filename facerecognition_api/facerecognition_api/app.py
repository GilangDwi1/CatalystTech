# app.py
from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
import os
from datetime import datetime
import time

from model.recognize import recognize_face
from model.embeddings import save_encoding
from model.face_model import get_face_embedding
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# ✅ Izinkan akses dari semua origin (untuk testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def bytes_to_cv2(bytes_data):
    arr = np.frombuffer(bytes_data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


@app.get("/")
def root():
    return {"status": "OK", "msg": "Face API Running"}


@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    total_start = time.time()

    # Read file
    read_start = time.time()
    img_bytes = await file.read()
    read_end = time.time()

    # Convert to cv2
    cv_start = time.time()
    img = bytes_to_cv2(img_bytes)
    cv_end = time.time()

    # Run recognition
    recog_start = time.time()
    name, sim = recognize_face(img)
    recog_end = time.time()

    total_end = time.time()

    return {
        "name": name,
        "similarity": sim,
        "duration_total": round(total_end - total_start, 4),
        "duration_read": round(read_end - read_start, 4),
        "duration_cv2": round(cv_end - cv_start, 4),
        "duration_recognize": round(recog_end - recog_start, 4)
    }


# ================
# REGISTER / ENCODE NEW PERSON
# ================
@app.post("/register/{name}")
async def register(name: str, file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = bytes_to_cv2(img_bytes)

    # Simpan foto mentah ke folder face_images
    save_dir = os.path.join("face_images", name)
    os.makedirs(save_dir, exist_ok=True)
    filename = datetime.now().strftime("%Y%m%d_%H%M%S") + ".jpg"
    cv2.imwrite(os.path.join(save_dir, filename), img)

    # Proses encoding wajah
    emb = get_face_embedding(img)
    if emb is None:
        return {"success": False, "error": "No face detected"}

    save_encoding(name, emb)
    return {"success": True, "name": name, "file": filename}