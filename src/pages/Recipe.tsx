import React, { useState } from "react";
import axios from "axios";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/Toast";

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
}

export default function Recipe() {
  const [ingredients, setIngredients] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { showToast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) {
      showToast("Please enter some ingredients", "warning");
      return;
    }

    setLoading(true);
    setRecipes([]);

    try {
      const formData = new FormData();
      formData.append("ingredients", ingredients);
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await axios.post(
        "/recipes/match-ingredients",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setRecipes(response.data.recipes || []);
      showToast("Recipes generated successfully!", "success");
    } catch (err) {
      showToast("Failed to generate recipes. Please try again.", "error");
      console.error("Recipe generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Recipe Generator
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Enter your ingredients and let AI create delicious Jollof recipes for
          you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ingredients Input */}
          <div>
            <label
              htmlFor="ingredients"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ingredients
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas (e.g., rice, tomatoes, chicken, onions)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="images"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Images (Optional)
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {images.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !ingredients.trim()}
            loading={loading}
            className="w-full"
            size="lg"
          >
            Generate Recipes
          </Button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <LoadingSpinner size="lg" message="Creating your recipes..." />
          </div>
        )}

        {/* Recipe Cards */}
        {recipes.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Your Generated Recipes
            </h2>
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {recipe.imageUrl && (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">{recipe.title}</h3>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Ingredients:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-gray-700">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Instructions:
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-700">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
