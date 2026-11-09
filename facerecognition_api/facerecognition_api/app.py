from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import cv2 , os, time , shutil
import numpy as np
from datetime import datetime

from model.embeddings import save_encoding, load_encodings
from model.face_model import get_face_embedding
from model.recognize import recognize_face, set_encodings
import model.recognize as recognize_module

# ==========================
# UTILS
# ==========================
def bytes_to_cv2(bytes_data):
    arr = np.frombuffer(bytes_data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

# ==========================
# LIFESPAN
# ==========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    names, matrix = load_encodings()
    set_encodings(names, matrix)
    print(f"[STARTUP] Loaded {len(names)} face encodings")
    yield
    print("[SHUTDOWN] Face API stopped")

app = FastAPI(lifespan=lifespan)

# ==========================
# MIDDLEWARE
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# ROUTES
# ==========================
@app.get("/")
def root():
    return {"status": "OK", "msg": "Face API Running"}

@app.post("/ping")
async def ping():
    return {"ok": True}

# ==========================
# RECOGNIZE
# ==========================
@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    start = time.time()

    img_bytes = await file.read()
    img = bytes_to_cv2(img_bytes)

    name, sim = recognize_face(img, get_face_embedding)

    return {
        "name": name,
        "similarity": sim,
        "duration": round(time.time() - start, 4)
    }

# ==========================
# REGISTER
# ==========================
@app.post("/register/{nip}")
async def register(nip: str, file: UploadFile = File(...)):
    img = bytes_to_cv2(await file.read())

    save_dir = os.path.join("face_images", nip)
    os.makedirs(save_dir, exist_ok=True)

    filename = datetime.now().strftime("%Y%m%d_%H%M%S.jpg")
    cv2.imwrite(os.path.join(save_dir, filename), img)

    emb = get_face_embedding(img)
    if emb is None:
        return {"success": False, "error": "No face detected"}

    save_encoding(nip, emb)

    names, matrix = load_encodings()
    set_encodings(names, matrix)

    return {"success": True, "nip": nip, "file": filename}

# ==========================
# UPDATE
# ==========================
@app.put("/update/{nip}")
async def update_face(nip: str, file: UploadFile = File(...)):
    img = bytes_to_cv2(await file.read())

    save_dir = os.path.join("face_images", nip)
    os.makedirs(save_dir, exist_ok=True)

    filename = datetime.now().strftime("%Y%m%d_%H%M%S.jpg")
    cv2.imwrite(os.path.join(save_dir, filename), img)

    emb = get_face_embedding(img)
    if emb is None:
        return {"success": False, "error": "No face detected"}

    save_encoding(nip, emb)

    names, matrix = load_encodings()
    set_encodings(names, matrix)

    return {
        "success": True,
        "nip": nip,
        "file": filename,
        "message": "Face updated"
    }

# ==========================
# DELETE
# ==========================
@app.delete("/delete/{NIP}")
async def delete_face(NIP: str):
    deleted = False

    # =========================
    # 1️⃣ Hapus encoding (.pkl)
    # =========================
    encoding_path = os.path.join("encodings", f"{NIP}.pkl")
    if os.path.exists(encoding_path):
        os.remove(encoding_path)
        deleted = True

    # =========================
    # 2️⃣ Hapus folder foto mentah
    # =========================
    image_dir = os.path.join("face_images", NIP)
    if os.path.exists(image_dir):
        shutil.rmtree(image_dir)
        deleted = True

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Data wajah untuk NIP {NIP} tidak ditemukan"
        )

    # =========================
    # 3️⃣ Reload encoding ke memory
    # =========================
    names, matrix = load_encodings()
    recognize_module.names = names
    recognize_module.matrix = matrix

    return {
        "success": True,
        "message": f"Wajah {NIP} berhasil dihapus",
        "total_encodings": len(names)
    }