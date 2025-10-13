import React, { useState } from "react";

interface FilterOptions {
  cuisine: string[];
  difficulty: string[];
  time: string;
  servings: string;
  dietary: string[];
}

interface RecipeFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
}

const cuisineOptions = [
  "Nigerian",
  "Ghanaian",
  "Kenyan",
  "Ethiopian",
  "Moroccan",
  "South African",
  "Senegalese",
  "Ivorian",
  "Cameroonian",
];

const difficultyOptions = ["Easy", "Medium", "Hard"];

const timeOptions = [
  { label: "Under 15 min", value: "15" },
  { label: "15-30 min", value: "30" },
  { label: "30-60 min", value: "60" },
  { label: "1+ hours", value: "60+" },
];

const servingOptions = [
  { label: "1-2 people", value: "2" },
  { label: "3-4 people", value: "4" },
  { label: "5+ people", value: "5+" },
];

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Low-Carb",
  "Keto",
];

export default function RecipeFilters({
  onFiltersChange,
  isOpen,
  onClose,
}: RecipeFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    cuisine: [],
    difficulty: [],
    time: "",
    servings: "",
    dietary: [],
  });

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (
    key: "cuisine" | "difficulty" | "dietary",
    value: string
  ) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      cuisine: [],
      difficulty: [],
      time: "",
      servings: "",
      dietary: [],
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters =
    filters.cuisine.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.time !== "" ||
    filters.servings !== "" ||
    filters.dietary.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Filter Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full mb-6 px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Clear All Filters
            </button>
          )}

          {/* Cuisine Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cuisine
            </h3>
            <div className="space-y-2">
              {cuisineOptions.map((cuisine) => (
                <label key={cuisine} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.cuisine.includes(cuisine)}
                    onChange={() => toggleArrayFilter("cuisine", cuisine)}
                    className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Difficulty
            </h3>
            <div className="space-y-2">
              {difficultyOptions.map((difficulty) => (
                <label key={difficulty} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.difficulty.includes(difficulty)}
                    onChange={() => toggleArrayFilter("difficulty", difficulty)}
                    className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{difficulty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cooking Time Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cooking Time
            </h3>
            <div className="space-y-2">
              {timeOptions.map((time) => (
                <label key={time.value} className="flex items-center">
                  <input
                    type="radio"
                    name="time"
                    value={time.value}
                    checked={filters.time === time.value}
                    onChange={(e) => updateFilter("time", e.target.value)}
                    className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-gray-700">{time.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Servings Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Servings
            </h3>
            <div className="space-y-2">
              {servingOptions.map((serving) => (
                <label key={serving.value} className="flex items-center">
                  <input
                    type="radio"
                    name="servings"
                    value={serving.value}
                    checked={filters.servings === serving.value}
                    onChange={(e) => updateFilter("servings", e.target.value)}
                    className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-gray-700">{serving.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dietary
            </h3>
            <div className="space-y-2">
              {dietaryOptions.map((dietary) => (
                <label key={dietary} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.dietary.includes(dietary)}
                    onChange={() => toggleArrayFilter("dietary", dietary)}
                    className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{dietary}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
