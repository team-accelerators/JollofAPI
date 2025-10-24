# flask_service.py
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.route("/embed", methods=["POST"])
def embed():
    data = request.get_json()
    text = data.get("text", "")
    embedding = model.encode(text).tolist()
    return jsonify({"embedding": embedding})

@app.route("/similarity", methods=["POST"])
def similarity():
    data = request.get_json()
    user_embedding = data.get("userEmbedding")
    recipe_embeddings = data.get("recipeEmbeddings", [])

    similarities = cosine_similarity(
        [user_embedding],
        recipe_embeddings
    )[0].tolist()

    return jsonify({"similarities": similarities})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
