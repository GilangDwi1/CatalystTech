# model/embeddings.py
import os
import pickle
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ENCODINGS_DIR = os.path.join(BASE_DIR, "encodings")

def load_encodings():
    names = []
    vectors = []

    print("Looking for encodings in:", ENCODINGS_DIR)

    if not os.path.exists(ENCODINGS_DIR):
        print("ENCODINGS_DIR NOT FOUND!")
        return names, np.array([])

    files = os.listdir(ENCODINGS_DIR)
    print("Files found:", files)

    for fname in files:
        if not fname.endswith(".pkl"):
            continue

        full = os.path.join(ENCODINGS_DIR, fname)

        try:
            with open(full, "rb") as f:
                emb = pickle.load(f)

            # emb harus numpy array
            if not isinstance(emb, np.ndarray):
                print(f"WARNING: {fname} bukan numpy array, type:", type(emb))
                continue

            name = fname.replace(".pkl", "")

            print(f"Loaded {name}: shape={emb.shape}")

            names.append(name)
            vectors.append(emb)

        except Exception as e:
            print("Error loading", fname, e)

    if len(vectors) == 0:
        print("NO VALID ENCODINGS FOUND!")
        return names, np.array([])

    matrix = np.vstack(vectors)
    print("Total encodings loaded:", len(names))

    return names, matrix




def save_encoding(name, embedding):
    os.makedirs(ENCODINGS_DIR, exist_ok=True)
    with open(os.path.join(ENCODINGS_DIR, f"{name}.pkl"), "wb") as f:
        pickle.dump(embedding, f)
