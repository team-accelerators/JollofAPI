import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/Toast";

interface Vendor {
  id: string;
  name: string;
  description: string;
  logo?: string;
  rating: number;
  reviews: number;
  location: string;
  category: "ingredients" | "spices" | "equipment" | "groceries";
  verified: boolean;
  deliveryTime: string;
  minOrder?: number;
  deliveryFee?: number;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  description: string;
  category: string;
  inStock: boolean;
  unit: string;
  discount?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  vendorId: string;
}

export default function VendorMarketplace() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { showToast } = useToast();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "ingredients", label: "Fresh Ingredients" },
    { value: "spices", label: "Spices & Seasonings" },
    { value: "equipment", label: "Cooking Equipment" },
    { value: "groceries", label: "Groceries" },
  ];

  useEffect(() => {
    fetchVendors();
    loadCart();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockVendors: Vendor[] = [
        {
          id: "1",
          name: "Lagos Fresh Market",
          description: "Premium African ingredients and fresh produce",
          rating: 4.8,
          reviews: 120,
          location: "Lagos, Nigeria",
          category: "ingredients",
          verified: true,
          deliveryTime: "30-45 min",
          minOrder: 25,
          deliveryFee: 5,
          products: [
            {
              id: "p1",
              name: "Fresh Jollof Rice",
              price: 8.99,
              originalPrice: 10.99,
              imageUrl: "/recipes/picai.jpeg",
              description: "Premium quality long grain rice perfect for Jollof",
              category: "Rice & Grains",
              inStock: true,
              unit: "2kg bag",
              discount: 18,
            },
            {
              id: "p2",
              name: "Fresh Tomatoes",
              price: 4.5,
              imageUrl: "/recipes/picai4.jpeg",
              description: "Fresh Nigerian tomatoes",
              category: "Vegetables",
              inStock: true,
              unit: "1kg",
            },
            {
              id: "p3",
              name: "Plantain Bundle",
              price: 6.99,
              imageUrl: "/recipes/picai15.jpeg",
              description: "Fresh green plantains for cooking",
              category: "Vegetables",
              inStock: true,
              unit: "6 pieces",
            },
            {
              id: "p4",
              name: "African Yam",
              price: 12.99,
              imageUrl: "/recipes/picai22.jpeg",
              description: "Premium white yam for pounding",
              category: "Vegetables",
              inStock: true,
              unit: "2kg",
            },
          ],
        },
        {
          id: "2",
          name: "Spice Kingdom",
          description: "Authentic African spices and seasonings",
          rating: 4.6,
          reviews: 89,
          location: "Accra, Ghana",
          category: "spices",
          verified: true,
          deliveryTime: "45-60 min",
          minOrder: 15,
          deliveryFee: 3,
          products: [
            {
              id: "p5",
              name: "Curry Powder Blend",
              price: 12.99,
              imageUrl: "/recipes/picai30.jpeg",
              description: "Authentic West African curry blend",
              category: "Spices",
              inStock: true,
              unit: "200g",
            },
            {
              id: "p6",
              name: "Palm Oil",
              price: 15.99,
              imageUrl: "/recipes/picai8.jpeg",
              description: "Pure red palm oil from Nigeria",
              category: "Oils",
              inStock: true,
              unit: "500ml",
            },
            {
              id: "p7",
              name: "Dried Fish",
              price: 18.99,
              imageUrl: "/recipes/picai28.jpeg",
              description: "Smoked dried fish for authentic flavor",
              category: "Protein",
              inStock: true,
              unit: "250g",
            },
            {
              id: "p8",
              name: "Scotch Bonnet Peppers",
              price: 7.99,
              imageUrl: "/recipes/picai11.jpeg",
              description: "Fresh hot peppers for authentic heat",
              category: "Spices",
              inStock: true,
              unit: "100g",
            },
          ],
        },
      ];
      setVendors(mockVendors);
    } catch (error) {
      showToast("Failed to load vendors", "error");
      console.error("Vendors fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = JSON.parse(
      localStorage.getItem("marketplace_cart") || "[]"
    );
    setCart(savedCart);
  };

  const saveCart = (updatedCart: CartItem[]) => {
    localStorage.setItem("marketplace_cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const addToCart = (product: Product, vendorId: string) => {
    const existingItem = cart.find(
      (item) => item.product.id === product.id && item.vendorId === vendorId
    );

    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.product.id === product.id && item.vendorId === vendorId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity: 1, vendorId }];
    }

    saveCart(updatedCart);
    showToast("Added to cart", "success");
  };

  const removeFromCart = (productId: string, vendorId: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.vendorId === vendorId)
    );
    saveCart(updatedCart);
    showToast("Removed from cart", "success");
  };

  const updateQuantity = (
    productId: string,
    vendorId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, vendorId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.product.id === productId && item.vendorId === vendorId
        ? { ...item, quantity }
        : item
    );
    saveCart(updatedCart);
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesCategory =
      selectedCategory === "all" || vendor.category === selectedCategory;
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      case "delivery":
        return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading vendors..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              African Food Marketplace
            </h1>
            <p className="text-gray-600">
              Shop authentic ingredients from local vendors
            </p>
          </div>

          {/* Cart Button */}
          <Button onClick={() => setShowCart(true)} className="relative">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m5 8v6a2 2 0 002 2h6a2 2 0 002-2v-6m-6 0l2-2m-2 2l-2-2"
              />
            </svg>
            Cart ({getCartItemCount()})
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vendors, products..."
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

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="delivery">Fastest Delivery</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* JollofAI Promotional Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8 mb-8 shadow-soft neumorphic">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Promotional Image */}
            <div className="lg:w-1/2">
              <img
                src="/showcase/jollofai-promo.jpg"
                alt="JollofAI - Savor the Ancestry, Taste the Future"
                className="w-full h-auto rounded-2xl shadow-medium"
                onError={(e) => {
                  // Fallback to a placeholder if image doesn't load
                  e.currentTarget.src = "/recipes/picai.jpeg";
                }}
              />
            </div>

            {/* Promotional Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-4">
                🍛 Savor the Ancestry, Taste the Future
              </h2>
              <p className="text-lg text-neutral-600 mb-6 font-display">
                Journey through the rich tapestry of African cuisine like never
                before. JollofAI brings the wisdom of generations and the power
                of AI to your plate, making every discovery a celebration of
                heritage and innovation.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                <span className="bg-primary/20 text-primary px-4 py-2 rounded-xl font-display font-medium">
                  #JollofAI
                </span>
                <span className="bg-secondary/20 text-secondary px-4 py-2 rounded-xl font-display font-medium">
                  #AfricanFood
                </span>
                <span className="bg-primary/20 text-primary px-4 py-2 rounded-xl font-display font-medium">
                  #FlavorUniverse
                </span>
                <span className="bg-secondary/20 text-secondary px-4 py-2 rounded-xl font-display font-medium">
                  #TasteTheFuture
                </span>
              </div>
              <div className="flex gap-4 justify-center lg:justify-start">
                <Button
                  variant="primary"
                  onClick={() => navigate("/recipe-discovery")}
                  className="font-display"
                >
                  🔍 Discover Recipes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    })
                  }
                  className="font-display"
                >
                  🛒 Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sortedVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Vendor Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                      {vendor.logo ? (
                        <img
                          src={vendor.logo}
                          alt={vendor.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vendor.name}
                        </h3>
                        {vendor.verified && (
                          <svg
                            className="w-5 h-5 text-green-500 ml-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {vendor.description}
                      </p>
                      <div className="flex items-center mt-1">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium">
                          {vendor.rating}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({vendor.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {vendor.location}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {vendor.deliveryTime}
                  </span>
                  {vendor.minOrder && (
                    <span>Min order: ${vendor.minOrder}</span>
                  )}
                  {vendor.deliveryFee && (
                    <span>Delivery: ${vendor.deliveryFee}</span>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Featured Products
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vendor.products.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {product.name}
                        </h5>
                        {product.discount && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-primary">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-gray-500 text-sm line-through ml-1">
                              ${product.originalPrice}
                            </span>
                          )}
                          <span className="text-gray-500 text-xs block">
                            {product.unit}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product, vendor.id)}
                          disabled={!product.inStock}
                        >
                          {product.inStock ? "Add" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {vendor.products.length > 4 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      View All Products ({vendor.products.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedVendors.length === 0 && (
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
              No vendors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
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

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.vendorId}`}
                        className="flex items-center space-x-3 border-b pb-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {item.product.name}
                          </h4>
                          <p className="text-gray-600 text-xs">
                            {item.product.unit}
                          </p>
                          <p className="text-primary font-semibold">
                            ${item.product.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.vendorId,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.vendorId,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.vendorId)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m5 8v6a2 2 0 002 2h6a2 2 0 002-2v-6m-6 0l2-2m-2 2l-2-2"
                      />
                    </svg>
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">
                      Total: ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
