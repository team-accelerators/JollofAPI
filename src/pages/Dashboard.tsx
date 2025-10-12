import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/Toast";
import axios from "axios";

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  createdAt: Date;
  imageUrl?: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/recipes");

        // Transform the response data to match our interface
        const transformedRecipes = response.data.map((recipe: any) => ({
          ...recipe,
          createdAt: new Date(recipe.createdAt),
        }));

        setRecipes(transformedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        showToast("Failed to load recipes", "error");
        // Set empty array on error to avoid showing loading forever
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [showToast]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const stats = {
    totalRecipes: recipes.length,
    thisWeek: recipes.filter((r) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return r.createdAt >= weekAgo;
    }).length,
    favoriteIngredient: "Rice",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container-max px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.fullName?.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to create some delicious recipes?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/recipe-generator")}
                className="bg-primary text-white"
              >
                Generate Recipe
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max px-4 py-8">
        <div className="grid gap-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <span className="text-2xl">🍛</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Recipes
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {stats.totalRecipes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    This Week
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.thisWeek}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Favorite
                  </h3>
                  <p className="text-xl font-bold text-yellow-600">
                    {stats.favoriteIngredient}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Profile
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto">
                    <span className="text-2xl font-bold text-primary">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">
                      {user?.fullName}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Member since</span>
                      <span className="font-medium">Oct 2024</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Status</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe History */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Recipes
                  </h2>
                  <Button
                    onClick={() => navigate("/recipe-generator")}
                    size="sm"
                    variant="outline"
                  >
                    Create New
                  </Button>
                </div>

                {recipes.length > 0 ? (
                  <div className="space-y-4">
                    {recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {recipe.title}
                            </h3>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {recipe.ingredients
                                .slice(0, 4)
                                .map((ingredient, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                              {recipe.ingredients.length > 4 && (
                                <span className="text-xs text-gray-500">
                                  +{recipe.ingredients.length - 4} more
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Created {recipe.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-gray-400 hover:text-primary transition-colors">
                              <span className="text-lg">🔗</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                              <span className="text-lg">❤️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🍳</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No recipes yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start creating your first recipe!
                    </p>
                    <Button onClick={() => navigate("/recipe-generator")}>
                      Generate Your First Recipe
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate("/recipe-generator")}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">🍛</span>
                <span>Generate Recipe</span>
              </Button>

              <Button
                onClick={() => navigate("/ingredients")}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">🥬</span>
                <span>Browse Ingredients</span>
              </Button>

              <Button
                onClick={() => navigate("/about")}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">📖</span>
                <span>Learn More</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="text-2xl mb-2">⚙️</span>
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
