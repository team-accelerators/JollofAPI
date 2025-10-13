import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import heroImage from "../images/image.png";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50/80 via-white to-primary/5 overflow-hidden min-h-screen flex items-center">
        {/* Simplified Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/4 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              {/* Logo */}
              <div>
                <img
                  src="/logo.png"
                  alt="JollofAI Logo"
                  className="h-12 md:h-16 w-auto"
                />
              </div>

              {/* Clean Badge */}
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  🍛 AI-Powered African Cuisine
                </span>
              </div>

              {/* Simplified Main Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Authentic African recipes
                  <span className="block text-primary mt-2">
                    designed for you
                  </span>
                </h1>
              </div>

              {/* Clean Description */}
              <div className="space-y-6">
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                  Transform your ingredients into delicious African meals with
                  our intelligent recipe generator. Discover traditional flavors
                  made simple.
                </p>
              </div>

              {/* Clean Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate("/recipe-generator")}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Get Started Free
                </Button>
                <Button
                  onClick={() => navigate("/signin")}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-medium border-2 border-gray-300 hover:border-primary hover:text-primary rounded-xl transition-all duration-200"
                >
                  Sign In
                </Button>
              </div>

              {/* Simplified Trust Indicators */}
              <div className="pt-8 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      10,000+
                    </div>
                    <div className="text-sm text-gray-600">
                      Recipes Generated
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-sm text-gray-600">
                      African Ingredients
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-gray-600">
                      Countries Served
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Clean Hero Image */}
            <div className="relative w-full flex justify-center">
              {/* Clean Image Container */}
              <div className="relative w-full max-w-lg">
                {/* Simple Background Card */}
                <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform rotate-1"></div>

                {/* Main Image Card */}
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Hero Image */}
                  <div className="p-3">
                    <img
                      src={heroImage}
                      alt="JollofAI - Traditional African cuisine made simple"
                      className="w-full h-auto object-contain rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-max px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose JollofAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of tradition and technology in your
              kitchen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered
              </h3>
              <p className="text-gray-600">
                Advanced machine learning analyzes your ingredients and
                preferences to create perfect recipes
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Authentic
              </h3>
              <p className="text-gray-600">
                Preserve traditional African cooking methods while adapting to
                modern kitchens
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Instant
              </h3>
              <p className="text-gray-600">
                Get personalized recipes in seconds, complete with nutritional
                information and cooking tips
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container-max px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Amazing Recipes?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are discovering new flavors with
            JollofAI
          </p>
          <Button
            onClick={() => navigate("/recipe-generator")}
            variant="secondary"
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
}
