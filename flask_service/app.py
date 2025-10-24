from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np

app = Flask(__name__)

# Load a small, fast model
model = SentenceTransformer("all-MiniLM-L6-v2")

# ✅ Root health check
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Flask embedding service running"}), 200

# ✅ Generate embeddings
@app.route("/embed", methods=["POST"])
def generate_embedding():
    try:
        data = request.get_json()
        text = data.get("text", "")
        if not text:
            return jsonify({"error": "Missing text"}), 400

        embedding = model.encode(text).tolist()
        return jsonify({"embedding": embedding}), 200
    except Exception as e:
        print("❌ /embed error:", e)
        return jsonify({"error": str(e)}), 500

# ✅ Compute cosine similarities
@app.route("/similarity", methods=["POST"])
def compute_similarity():
    try:
        data = request.get_json()
        user_embedding = np.array(data.get("userEmbedding", []))
        recipe_embeddings = np.array(data.get("recipeEmbeddings", []))

        if user_embedding.size == 0 or recipe_embeddings.size == 0:
            return jsonify({"error": "Missing embeddings"}), 400

        user_norm = user_embedding / np.linalg.norm(user_embedding)
        recipe_norms = recipe_embeddings / np.linalg.norm(recipe_embeddings, axis=1, keepdims=True)
        similarities = np.dot(recipe_norms, user_norm)

        return jsonify({"similarities": similarities.tolist()}), 200
    except Exception as e:
        print("❌ /similarity error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
