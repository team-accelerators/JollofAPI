import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/Toast";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  rating?: number;
  reviews?: number;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ingredients" | "instructions" | "nutrition"
  >("ingredients");
  const { showToast } = useToast();

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);

      // Check if recipe is saved
      const savedRecipes = JSON.parse(
        localStorage.getItem("savedRecipes") || "[]"
      );
      setIsSaved(savedRecipes.includes(id));
    } catch (error) {
      showToast("Failed to load recipe", "error");
      console.error("Recipe fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveRecipe = () => {
    const savedRecipes = JSON.parse(
      localStorage.getItem("savedRecipes") || "[]"
    );

    if (isSaved) {
      const updatedSaved = savedRecipes.filter(
        (savedId: string) => savedId !== id
      );
      localStorage.setItem("savedRecipes", JSON.stringify(updatedSaved));
      setIsSaved(false);
      showToast("Recipe removed from saved", "success");
    } else {
      savedRecipes.push(id);
      localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
      setIsSaved(true);
      showToast("Recipe saved successfully", "success");
    }
  };

  const startCooking = () => {
    navigate(`/cooking/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading recipe..." />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recipe not found
          </h2>
          <Button onClick={() => navigate("/recipes")}>Browse Recipes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Recipe Title & Info */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span>{recipe.servings} servings</span>
            </div>
            {recipe.rating && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>
                  {recipe.rating} ({recipe.reviews} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto max-w-4xl px-6 py-6">
        <div className="flex gap-4 mb-8">
          <Button
            onClick={startCooking}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3"
          >
            Start Cooking
          </Button>
          <Button
            onClick={toggleSaveRecipe}
            variant={isSaved ? "solid" : "outline"}
            className={`px-6 py-3 ${
              isSaved
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "border-primary text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {isSaved ? (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Save Recipe
              </>
            )}
          </Button>
        </div>

        {/* Description */}
        {recipe.description && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <p className="text-gray-700 leading-relaxed">
              {recipe.description}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {["ingredients", "instructions", "nutrition"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Ingredients Tab */}
            {activeTab === "ingredients" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === "instructions" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Nutrition Tab */}
            {activeTab === "nutrition" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Nutrition Information
                </h3>
                {recipe.nutrition ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {recipe.nutrition.calories}
                      </div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {recipe.nutrition.protein}g
                      </div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {recipe.nutrition.carbs}g
                      </div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {recipe.nutrition.fat}g
                      </div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Nutrition information not available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
