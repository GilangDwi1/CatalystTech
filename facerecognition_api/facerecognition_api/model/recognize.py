import numpy as np
import time

# In-memory storage
names = []
matrix = None

def set_encodings(_names, _matrix):
    global names, matrix
    names = _names
    matrix = _matrix

def recognize_face(img, get_embedding_fn):
    total_start = time.time()

    embedding = get_embedding_fn(img)
    if embedding is None or matrix is None or len(names) == 0:
        return None, 0.0

    norm_emb = np.linalg.norm(embedding)
    norm_matrix = np.linalg.norm(matrix, axis=1)

    sims = matrix @ embedding / (norm_matrix * norm_emb)

    idx = int(np.argmax(sims))
    best_sim = float(sims[idx])
    best_name = names[idx]

    if best_sim < 0.70:
        return "unknown", best_sim

    return best_name, best_sim
