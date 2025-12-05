# model/face_model.py
import cv2
from insightface.app import FaceAnalysis

# Gunakan model ringan & lebih cepat
app = FaceAnalysis(name='buffalo_s')

# det_size lebih kecil → jauh lebih cepat
app.prepare(ctx_id=0, det_size=(160, 160))

def resize_for_face(img, max_size=400):
    h, w = img.shape[:2]
    scale = max_size / max(h, w)
    if scale < 1:
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    return img


def get_face_embedding(img):
    img = resize_for_face(img)
    faces = app.get(img)

    if not faces:
        return None

    return faces[0].embedding
