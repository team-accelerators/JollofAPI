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
      // Comprehensive African Dishes Collection
      const mockRecipes: Recipe[] = [
        {
          id: "1",
          title: "Classic Jollof Rice",
          description:
            "The crown jewel of West African cuisine, a one-pot rice dish cooked with tomatoes, onions, peppers, and aromatic spices. Each country has its own variation, creating friendly rivalries over the 'best' Jollof.",
          imageUrl: "/recipes/picai29.jpeg",
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
          title: "Fufu with Egusi Soup",
          description:
            "A staple starchy side made from boiled and pounded plantains, cassava, or yams served with rich, hearty soup made with ground melon seeds and leafy vegetables.",
          imageUrl: "/images/fufu and egusi soup.png",
          prepTime: 60,
          cookTime: 90,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Nigerian",
          rating: 4.9,
          reviews: 189,
          dietary: ["Gluten-Free", "High-Protein"],
        },
        {
          id: "3",
          title: "Ghanaian Kelewele",
          description:
            "Spicy fried plantain cubes seasoned with ginger, nutmeg, cloves, and cayenne pepper. A popular street food with a sweet and spicy flavor profile.",
          imageUrl: "/images/ghana kelewele.png",
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
          title: "Ethiopian Injera with Doro Wat",
          description:
            "Spongy, tangy sourdough flatbread made from teff flour served with spicy chicken stew simmered in berbere spice blend, onions, and hard-boiled eggs.",
          imageUrl: "/images/ethiopian injera.png",
          prepTime: 45,
          cookTime: 120,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Ethiopian",
          rating: 4.9,
          reviews: 203,
          dietary: ["Gluten-Free", "High-Protein", "Fermented"],
        },
        {
          id: "5",
          title: "Moroccan Chicken Tagine",
          description:
            "Slow-cooked stew named after the conical clay pot it's cooked in. Features chicken, vegetables, and dried fruits with aromatic spices like cinnamon and ginger.",
          imageUrl: "/images/moroccan chicken.png",
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
            "Spiced mince meat casserole topped with egg custard, featuring curry spices, almonds, and raisins. South Africa's beloved national dish with Cape Malay influences.",
          imageUrl: "/images/south africa bobotie.png",
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
            "Senegal's national dish featuring fish, rice, and vegetables cooked in a rich tomato-based sauce with tamarind and various West African spices.",
          imageUrl: "/images/senegalese thiebouudienne.png",
          prepTime: 45,
          cookTime: 60,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Senegalese",
          rating: 4.7,
          reviews: 85,
          dietary: ["High-Protein", "Dairy-Free"],
        },
        {
          id: "8",
          title: "Nigerian Suya",
          description:
            "Sweet fried plantain slices, golden and caramelized, enjoyed as a snack or side dish across Nigeria. Often paired with spicy meats or enjoyed on their own.",
          imageUrl: "/images/nigeria suya.png",
          prepTime: 20,
          cookTime: 15,
          servings: 4,
          difficulty: "Easy",
          cuisine: "Nigerian",
          rating: 4.8,
          reviews: 234,
          dietary: ["High-Protein", "Dairy-Free", "Keto-Friendly"],
        },
        {
          id: "9",
          title: "Nigerian Amala and Ewedu",
          description:
            "Traditional Yoruba meal featuring smooth yam flour dumplings (amala) served with nutritious jute leaf soup (ewedu) and gbegiri. A beloved comfort food.",
          imageUrl: "/images/Amla and ewedu.png",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.8,
          reviews: 245,
          dietary: ["Gluten-Free", "High-Fiber", "Traditional"],
        },
        {
          id: "10",
          title: "Cameroonian Ndolé",
          description:
            "National dish featuring bitter leaves, groundnuts (peanuts), and various proteins like fish or meat in a rich, creamy sauce. Cameroon's pride and joy.",
          imageUrl: "/images/ndole.png",
          prepTime: 60,
          cookTime: 90,
          servings: 10,
          difficulty: "Hard",
          cuisine: "Cameroonian",
          rating: 4.9,
          reviews: 43,
          dietary: ["High-Protein", "Traditional"],
        },
        {
          id: "11",
          title: "Tanzanian Pilau",
          description:
            "Fragrant spiced rice dish cooked with meat, featuring cardamom, cinnamon, cloves, and other aromatic spices influenced by Arabic and Indian cuisines.",
          imageUrl: "/images/tan.png",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Tanzanian",
          rating: 4.6,
          reviews: 112,
          dietary: ["High-Protein", "Dairy-Free"],
        },
        {
          id: "12",
          title: "Ethiopian Kitfo",
          description:
            "Ethiopian steak tartare - minced raw beef served with mitmita spice and sometimes cottage cheese. Considered a delicacy and often served at special occasions.",
          imageUrl: "/images/ethiopian kitfo.png",
          prepTime: 15,
          cookTime: 0,
          servings: 2,
          difficulty: "Medium",
          cuisine: "Ethiopian",
          rating: 4.7,
          reviews: 89,
          dietary: ["High-Protein", "Keto-Friendly"],
        },
        {
          id: "13",
          title: "Ghanaian Banku with Tilapia",
          description:
            "Fermented corn and cassava dough cooked into a smooth, slightly sour dumpling. Traditionally served with grilled tilapia and hot pepper sauce.",
          imageUrl: "/images/ghana banku.png",
          prepTime: 30,
          cookTime: 45,
          servings: 4,
          difficulty: "Medium",
          cuisine: "Ghanaian",
          rating: 4.6,
          reviews: 134,
          dietary: ["High-Protein", "Fermented"],
        },
        {
          id: "14",
          title: "Cape Verdean Cachupa",
          description:
            "Hearty stew with corn, beans, vegetables, and meat or fish. Considered the national dish of Cape Verde, often prepared for family gatherings.",
          imageUrl: "/images/capa verdean cachupa.png",
          prepTime: 40,
          cookTime: 120,
          servings: 8,
          difficulty: "Hard",
          cuisine: "Cape Verdean",
          rating: 4.5,
          reviews: 67,
          dietary: ["High-Protein", "High-Fiber"],
        },
        {
          id: "15",
          title: "Malian Tô with Sauce",
          description:
            "Thick millet or sorghum porridge served with various sauces and vegetables. A staple food in Sahel countries, providing essential nutrition.",
          imageUrl: "/images/maclian T6 with sauce.png",
          prepTime: 10,
          cookTime: 30,
          servings: 6,
          difficulty: "Easy",
          cuisine: "Malian",
          rating: 4.2,
          reviews: 45,
          dietary: ["Vegan", "Gluten-Free"],
        },
        {
          id: "16",
          title: "Kenyan Nyama Choma",
          description:
            "Grilled meat (usually goat or beef) marinated with spices and cooked over an open fire. Often served with ugali and vegetables at social gatherings.",
          imageUrl: "/images/kenya nyama chomo.png",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Kenyan",
          rating: 4.7,
          reviews: 156,
          dietary: ["High-Protein", "Dairy-Free"],
        },
        {
          id: "17",
          title: "Nigerian Fisherman Soup",
          description:
            "Rich seafood soup with fresh fish, prawns, periwinkles, and native vegetables cooked in palm oil. A coastal delicacy from the Niger Delta region.",
          imageUrl: "/images/fisherman soup.png",
          prepTime: 25,
          cookTime: 40,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.8,
          reviews: 167,
          dietary: ["High-Protein", "Dairy-Free", "Seafood"],
        },
        {
          id: "18",
          title: "Congolese Saka Saka",
          description:
            "Cassava leaves cooked with peanut sauce, palm oil, and various proteins. Also known as pondu, it's a staple across Central Africa.",
          imageUrl: "/images/congolese saka.png",
          prepTime: 45,
          cookTime: 75,
          servings: 8,
          difficulty: "Medium",
          cuisine: "Congolese",
          rating: 4.6,
          reviews: 92,
          dietary: ["High-Protein", "Traditional"],
        },
        {
          id: "19",
          title: "Nigerian Pounded Yam with Egusi",
          description:
            "Smooth, stretchy yam dough served with rich egusi soup made from ground melon seeds, leafy vegetables, and assorted meats or fish.",
          imageUrl: "/recipes/picai41.jpeg",
          prepTime: 30,
          cookTime: 90,
          servings: 6,
          difficulty: "Hard",
          cuisine: "Nigerian",
          rating: 4.9,
          reviews: 278,
          dietary: ["Gluten-Free", "High-Protein"],
        },
        {
          id: "20",
          title: "Nigerian Pepper Soup",
          description:
            "Spicy, aromatic broth made with various meats, fish, or goat meat, seasoned with African pepper, uziza seeds, and traditional herbs.",
          imageUrl: "/images/nigeria pepper soup.png",
          prepTime: 20,
          cookTime: 45,
          servings: 4,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.7,
          reviews: 189,
          dietary: ["High-Protein", "Dairy-Free", "Low-Carb"],
        },
        {
          id: "21",
          title: "Nigerian Akara (Bean Cakes)",
          description:
            "Deep-fried bean fritters made from black-eyed peas, onions, and peppers. A popular breakfast food and street snack across Nigeria.",
          imageUrl: "/images/nigeria akara.png",
          prepTime: 30,
          cookTime: 20,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.6,
          reviews: 234,
          dietary: ["Vegan", "High-Protein", "Gluten-Free"],
        },
        {
          id: "22",
          title: "Nigerian Moi Moi",
          description:
            "Steamed bean pudding made from black-eyed peas, spices, and vegetables. Often served with rice or eaten as a side dish.",
          imageUrl: "/images/nigeria moimoi.png",
          prepTime: 45,
          cookTime: 60,
          servings: 8,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.8,
          reviews: 312,
          dietary: ["Vegan", "High-Protein", "Gluten-Free"],
        },
        {
          id: "23",
          title: "Nigerian Bitterleaf Soup",
          description:
            "Traditional soup made with bitter leaves, assorted meats, stockfish, and palm nut extract. A delicacy from Eastern Nigeria.",
          imageUrl: "/images/bitterleaf soup.png",
          prepTime: 40,
          cookTime: 75,
          servings: 6,
          difficulty: "Hard",
          cuisine: "Nigerian",
          rating: 4.7,
          reviews: 156,
          dietary: ["High-Protein", "Traditional"],
        },
        {
          id: "24",
          title: "Nigerian Chin Chin",
          description:
            "Sweet, crunchy fried pastry cubes flavored with nutmeg and vanilla. A beloved snack for celebrations and everyday enjoyment.",
          imageUrl: "/images/nigeria chin chin.png",
          prepTime: 45,
          cookTime: 30,
          servings: 10,
          difficulty: "Easy",
          cuisine: "Nigerian",
          rating: 4.5,
          reviews: 198,
          dietary: ["Vegetarian", "Sweet"],
        },
        {
          id: "25",
          title: "Nigerian Okra Soup",
          description:
            "Viscous soup made with fresh okra, assorted meats, seafood, and traditional seasonings. Often eaten with pounded yam or fufu.",
          imageUrl: "/images/okro soup.png",
          prepTime: 25,
          cookTime: 50,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.6,
          reviews: 167,
          dietary: ["High-Protein", "Gluten-Free"],
        },
        {
          id: "26",
          title: "Nigerian Efo Riro",
          description:
            "Yoruba spinach stew with bell peppers, tomatoes, onions, and assorted meats or fish. Rich in vegetables and bursting with flavor.",
          imageUrl: "/images/nigeria efo riro.png",
          prepTime: 30,
          cookTime: 45,
          servings: 6,
          difficulty: "Medium",
          cuisine: "Nigerian",
          rating: 4.8,
          reviews: 223,
          dietary: ["High-Protein", "High-Fiber"],
        },
        {
          id: "27",
          title: "Nigerian Plantain Porridge",
          description:
            "Hearty one-pot meal with ripe plantains, vegetables, spices, and optional protein. Comfort food that's both nutritious and satisfying.",
          imageUrl: "/images/porridge plaintain.png",
          prepTime: 20,
          cookTime: 35,
          servings: 4,
          difficulty: "Easy",
          cuisine: "Nigerian",
          rating: 4.7,
          reviews: 189,
          dietary: ["Vegan Option", "Gluten-Free", "High-Fiber"],
        },
        {
          id: "28",
          title: "Nigerian Ofada Rice with Ayamase",
          description:
            "Local unpolished rice served with spicy green pepper sauce (ayamase) containing assorted meats and traditional seasonings.",
          imageUrl: "/images/nigeria ofada rice with ayamase.png",
          prepTime: 40,
          cookTime: 60,
          servings: 6,
          difficulty: "Hard",
          cuisine: "Nigerian",
          rating: 4.9,
          reviews: 145,
          dietary: ["High-Protein", "Spicy", "Traditional"],
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
                className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer flex flex-col h-full neumorphic"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                {/* Recipe Image */}
                <div className="relative h-48 bg-neutral-200 rounded-t-2xl overflow-hidden">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
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
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-semibold text-neutral-900 mb-2 text-lg leading-tight">
                    {recipe.title.length > 35
                      ? recipe.title.substring(0, 35) + "..."
                      : recipe.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 flex-1 leading-relaxed">
                    {recipe.description.length > 80
                      ? recipe.description.substring(0, 80) + "..."
                      : recipe.description}
                  </p>

                  {/* Recipe Meta */}
                  <div className="flex items-center justify-between text-sm text-neutral-500 mb-4 bg-neutral-50 rounded-xl p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-primary">⏱️</span>
                      <span>{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-secondary">👥</span>
                      <span>{recipe.servings}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-display font-medium ${
                        difficultyColors[recipe.difficulty]
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Rating and Cuisine */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-display font-medium text-primary bg-primary/10 px-3 py-1 rounded-xl">
                      {recipe.cuisine}
                    </span>
                    {recipe.rating && (
                      <div className="flex items-center bg-secondary/10 px-3 py-1 rounded-xl">
                        <svg
                          className="w-4 h-4 text-secondary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-display font-medium text-secondary">
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
