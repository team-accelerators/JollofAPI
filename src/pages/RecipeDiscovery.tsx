import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import RecipeFilters from "../components/recipe/RecipeFilters";
import { useToast } from "../components/Toast";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string;
  rating?: number;
  reviews?: number;
  dietary: string[];
}

interface FilterOptions {
  cuisine: string[];
  difficulty: string[];
  time: string;
  servings: string;
  dietary: string[];
}

export default function RecipeDiscovery() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const { showToast } = useToast();

  const recipesPerPage = 12;

  useEffect(() => {
    fetchRecipes();
    loadSavedRecipes();
  }, []);

  useEffect(() => {
    filterAndSortRecipes();
  }, [recipes, searchQuery, sortBy]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call later
      const mockRecipes: Recipe[] = [
        {
          id: "1",
          title: "Classic Jollof Rice",
          description:
            "The crown jewel of West African cuisine with perfectly balanced spices",
          imageUrl: "/recipes/picai.jpeg",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.8,
          reviews: 124,
          dietary: ["Gluten-Free", "Dairy-Free"],
        },
        {
          id: "2",
          title: "Nigerian Egusi Soup",
          description:
            "Rich, hearty soup with ground melon seeds and leafy vegetables",
          imageUrl: "/recipes/picai10.jpeg",
          prepTime: 40,
          cookTime: 80,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Nigerian",
          rating: 4.9,
          reviews: 89,
          dietary: ["Gluten-Free", "High-Protein"],
        },
        {
          id: "3",
          title: "Ghanaian Kelewele",
          description:
            "Crispy fried plantain cubes with aromatic Ghanaian spices",
          imageUrl: "/recipes/picai15.jpeg",
          prepTime: 15,
          cookTime: 10,
          servings: 4,
          difficulty: "Easy",
          cuisine: "Ghanaian",
          rating: 4.7,
          reviews: 156,
          dietary: ["Vegan", "Gluten-Free"],
        },
        {
          id: "4",
          title: "Ethiopian Injera",
          description:
            "Traditional sourdough flatbread with unique tangy flavor",
          imageUrl: "/recipes/picai25.jpeg",
          prepTime: 30,
          cookTime: 30,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Ethiopian",
          rating: 4.6,
          reviews: 73,
          dietary: ["Vegan", "Fermented"],
        },
        {
          id: "5",
          title: "Moroccan Chicken Tagine",
          description:
            "Slow-cooked chicken with aromatic spices and preserved lemons",
          imageUrl: "/recipes/picai30.jpeg",
          prepTime: 45,
          cookTime: 75,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Moroccan",
          rating: 4.8,
          reviews: 98,
          dietary: ["High-Protein", "Dairy-Free"],
        },
        {
          id: "6",
          title: "South African Bobotie",
          description:
            "Spiced mince meat bake with egg topping and aromatic curry flavors",
          imageUrl: "/recipes/picai35.jpeg",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "South African",
          rating: 4.5,
          reviews: 67,
          dietary: ["High-Protein"],
        },
        {
          id: "7",
          title: "Senegalese Thieboudienne",
          description:
            "National dish of Senegal with fish, rice, and vegetables",
          imageUrl: "/recipes/picai20.jpeg",
          prepTime: 45,
          cookTime: 60,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Senegalese",
          rating: 4.7,
          reviews: 45,
          dietary: ["High-Protein", "Dairy-Free"],
        },
        {
          id: "8",
          title: "Kenyan Ugali",
          description: "Simple, hearty cornmeal staple served with stews",
          imageUrl: "/recipes/picai40.jpeg",
          prepTime: 5,
          cookTime: 15,
          servings: 4,
          difficulty: "Easy",
          cuisine: "Kenyan",
          rating: 4.3,
          reviews: 92,
          dietary: ["Vegan", "Gluten-Free"],
        },
        {
          id: "9",
          title: "Ivorian Attiéké",
          description:
            "Fermented cassava couscous with a light, fluffy texture",
          imageUrl: "/recipes/picai18.jpeg",
          prepTime: 20,
          cookTime: 25,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Ivorian",
          rating: 4.4,
          reviews: 38,
          dietary: ["Vegan", "Gluten-Free"],
        },
        {
          id: "10",
          title: "Cameroonian Ndolé",
          description: "National dish with bitter leaves, groundnuts, and fish",
          imageUrl: "/recipes/picai28.jpeg",
          prepTime: 60,
          cookTime: 90,
          servings: 10,
          difficulty: "Hard",
          cuisine: "Cameroonian",
          rating: 4.9,
          reviews: 23,
          dietary: ["High-Protein", "Traditional"],
        },
        {
          id: "11",
          title: "Tanzanian Pilau",
          description:
            "Aromatic spiced rice dish with meat and fragrant spices",
          imageUrl: "/recipes/picai12.jpeg",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Tanzanian",
          rating: 4.6,
          reviews: 54,
          dietary: ["High-Protein", "Dairy-Free"],
        },
        {
          id: "12",
          title: "Malian Tô",
          description:
            "Traditional millet or sorghum porridge served with sauces",
          imageUrl: "/recipes/picai33p.jpeg",
          prepTime: 10,
          cookTime: 30,
          servings: 6,
          difficulty: "Easy",
          cuisine: "Malian",
          rating: 4.2,
          reviews: 31,
          dietary: ["Vegan", "Gluten-Free"],
        },
      ];

      setRecipes(mockRecipes);
    } catch (error) {
      showToast("Failed to load recipes", "error");
      console.error("Recipe fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRecipes = () => {
    const saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    setSavedRecipes(saved);
  };

  const filterAndSortRecipes = () => {
    let filtered = [...recipes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        // Assuming recipes have a creation date, otherwise keep current order
        break;
      case "time-asc":
        filtered.sort(
          (a, b) => a.prepTime + a.cookTime - (b.prepTime + b.cookTime)
        );
        break;
      case "time-desc":
        filtered.sort(
          (a, b) => b.prepTime + b.cookTime - (a.prepTime + a.cookTime)
        );
        break;
      case "difficulty-easy":
        filtered.sort((a, b) => {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
        break;
    }

    setFilteredRecipes(filtered);
    setCurrentPage(1);
  };

  const applyFilters = (filters: FilterOptions) => {
    let filtered = [...recipes];

    // Apply search filter first
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply cuisine filter
    if (filters.cuisine.length > 0) {
      filtered = filtered.filter((recipe) =>
        filters.cuisine.includes(recipe.cuisine)
      );
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((recipe) =>
        filters.difficulty.includes(recipe.difficulty)
      );
    }

    // Apply time filter
    if (filters.time) {
      const totalTime = (recipe: Recipe) => recipe.prepTime + recipe.cookTime;

      switch (filters.time) {
        case "15":
          filtered = filtered.filter((recipe) => totalTime(recipe) <= 15);
          break;
        case "30":
          filtered = filtered.filter(
            (recipe) => totalTime(recipe) <= 30 && totalTime(recipe) > 15
          );
          break;
        case "60":
          filtered = filtered.filter(
            (recipe) => totalTime(recipe) <= 60 && totalTime(recipe) > 30
          );
          break;
        case "60+":
          filtered = filtered.filter((recipe) => totalTime(recipe) > 60);
          break;
      }
    }

    // Apply servings filter
    if (filters.servings) {
      switch (filters.servings) {
        case "2":
          filtered = filtered.filter((recipe) => recipe.servings <= 2);
          break;
        case "4":
          filtered = filtered.filter(
            (recipe) => recipe.servings <= 4 && recipe.servings > 2
          );
          break;
        case "5+":
          filtered = filtered.filter((recipe) => recipe.servings >= 5);
          break;
      }
    }

    // Apply dietary filter
    if (filters.dietary.length > 0) {
      filtered = filtered.filter((recipe) =>
        filters.dietary.some((diet) => recipe.dietary.includes(diet))
      );
    }

    setFilteredRecipes(filtered);
    setCurrentPage(1);
  };

  const toggleSaveRecipe = (recipeId: string) => {
    const newSavedRecipes = savedRecipes.includes(recipeId)
      ? savedRecipes.filter((id) => id !== recipeId)
      : [...savedRecipes, recipeId];

    setSavedRecipes(newSavedRecipes);
    localStorage.setItem("savedRecipes", JSON.stringify(newSavedRecipes));

    showToast(
      savedRecipes.includes(recipeId)
        ? "Recipe removed from saved"
        : "Recipe saved",
      "success"
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading recipes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Recipes
          </h1>
          <p className="text-gray-600">
            Find the perfect African recipe for any occasion
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search recipes, cuisine, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="time-asc">Quick First</option>
                <option value="time-desc">Longest First</option>
                <option value="difficulty-easy">Easy First</option>
              </select>
            </div>

            {/* Filter Button */}
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="md:w-32"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredRecipes.length)} of{" "}
            {filteredRecipes.length} recipes
          </p>
        </div>

        {/* Recipe Grid */}
        {currentRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                {/* Recipe Image */}
                <div className="relative h-48 bg-gray-200">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveRecipe(recipe.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full hover:bg-opacity-100 transition-all"
                  >
                    {savedRecipes.includes(recipe.id) ? (
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-600"
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
                    )}
                  </button>
                </div>

                {/* Recipe Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Recipe Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                    <span>{recipe.servings} servings</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        difficultyColors[recipe.difficulty]
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Rating and Cuisine */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {recipe.cuisine}
                    </span>
                    {recipe.rating && (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">
                          {recipe.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => window.location.reload()}>
              Reset Search
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    isCurrentPage
                      ? "bg-primary text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  } border`}
                >
                  {page}
                </button>
              );
            })}

            <Button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <RecipeFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onFiltersChange={applyFilters}
      />
    </div>
  );
}
