import numpy as np
import time
from model.embeddings import load_encodings
from model.face_model import get_face_embedding

# Load sekali saat startup
names, matrix = load_encodings()

def recognize_face(img):
    total_start = time.time()

    # --- 1. Hitung waktu embedding ---
    embed_start = time.time()
    embedding = get_face_embedding(img)
    embed_end = time.time()

    if embedding is None:
        total_end = time.time()
        print("[INFO] No face detected.")
        print(f"[TIME] Embedding: {embed_end - embed_start:.4f} s")
        print(f"[TIME] Total recognize_face: {total_end - total_start:.4f} s")
        return None, 0

    # --- 2. Hitung cosine similarity ---
    sim_start = time.time()

    norm_emb = np.linalg.norm(embedding)
    norm_matrix = np.linalg.norm(matrix, axis=1)
    sims = matrix @ embedding / (norm_matrix * norm_emb)

    idx = np.argmax(sims)
    best_name = names[idx]
    best_sim = float(sims[idx])

    sim_end = time.time()

    # --- 3. Total waktu ---
    total_end = time.time()

    # LOG
    print("Input embedding shape:", embedding.shape)
    print("Best similarity:", best_sim)
    print("\n===== RECOGNIZE TIMING =====")
    print(f"Embedding time      : {embed_end - embed_start:.4f} sec")
    print(f"Similarity time     : {sim_end - sim_start:.4f} sec")
    print(f"Total time          : {total_end - total_start:.4f} sec")
    print("=============================\n")

    if best_sim < 0.70:
        return "unknown", best_sim

    return best_name, best_sim
