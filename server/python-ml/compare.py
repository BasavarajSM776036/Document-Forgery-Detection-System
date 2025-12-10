from flask import Flask, request, jsonify
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

app = Flask(__name__)

def load_image(path):
    img = cv2.imread(path)
    if img is None:
        return None
    img = cv2.resize(img, (800, 800))  # normalize size
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return gray

@app.route("/compare", methods=["POST"])
def compare():
    try:
        original_path = request.json["original"]
        verify_path = request.json["verify"]

        img1 = load_image(original_path)
        img2 = load_image(verify_path)

        if img1 is None or img2 is None:
            return jsonify({"error": "Unable to load images"}), 400

        # compute SSIM score
        score, diff = ssim(img1, img2, full=True)
        score = float(score)

        result = "Genuine" if score > 0.90 else "Forged"

        return jsonify({
            "similarity": round(score * 100, 2),
            "result": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=6000)
