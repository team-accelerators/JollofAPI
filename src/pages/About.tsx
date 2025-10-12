import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-emerald-100/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container-max px-4 py-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About JollofAI
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We're revolutionizing the way people discover, create, and share
                authentic African cuisine through the power of artificial
                intelligence.
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <span className="px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  🤖 AI-Powered
                </span>
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                  🌍 Authentic
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                  ⚡ Instant
                </span>
              </div>
            </div>

            {/* Right Content - Rice Image */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden h-80">
                <img
                  src="/rice-image.jpg"
                  alt="Traditional African Rice Dishes - JollofAI"
                  className="w-full h-full object-cover"
                />
                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">
                      Authentic African Cuisine
                    </h3>
                    <p className="text-sm opacity-90">
                      Traditional recipes powered by modern AI technology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add floating animation */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container-max px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-4">
                JollofAI was born from a passion to preserve and celebrate
                African culinary traditions while making them accessible to home
                cooks worldwide. We believe that great food brings people
                together and tells the story of our heritage.
              </p>
              <p className="text-gray-600 mb-6">
                Our AI-powered platform learns from traditional recipes, cooking
                techniques, and ingredient combinations to help you create
                authentic, delicious meals tailored to your preferences and
                available ingredients.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">10,000+</div>
                  <div className="text-sm text-gray-600">Recipes Generated</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">
                    Ingredients Supported
                  </div>
                </div>
              </div>
            </div>
            {/* Professional About Image */}
            <div className="relative bg-gradient-to-br from-primary/10 via-white to-emerald-50 rounded-2xl h-80 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-8 h-8 bg-primary/30 rounded-full"></div>
                <div className="absolute top-12 right-8 w-6 h-6 bg-emerald-400/40 rounded-full"></div>
                <div className="absolute bottom-16 left-8 w-4 h-4 bg-yellow-400/50 rounded-full"></div>
                <div className="absolute bottom-8 right-4 w-10 h-10 bg-orange-400/30 rounded-full"></div>
              </div>

              {/* Main Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                {/* Food Icons */}
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🍛</span>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-2xl">�</span>
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Bridging Tradition & Technology
                </h3>
                <p className="text-gray-600 text-sm max-w-xs">
                  Combining centuries of African culinary wisdom with
                  cutting-edge AI to create authentic, personalized recipes.
                </p>

                {/* Decorative Elements */}
                <div className="mt-6 flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container-max px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Cultural Authenticity
              </h3>
              <p className="text-gray-600">
                We respect and preserve traditional cooking methods while
                embracing innovation to make them accessible to everyone.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community First
              </h3>
              <p className="text-gray-600">
                Our platform is built by and for food lovers who want to share
                knowledge and create meaningful connections through cooking.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Innovation
              </h3>
              <p className="text-gray-600">
                We leverage cutting-edge AI technology to personalize your
                cooking experience and help you discover new flavors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container-max px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="/lucy-chioma.jpg"
                  alt="Lucy Chioma Ifitezue - Managing Director"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lucy Chioma Ifitezue
              </h3>
              <p className="text-primary font-medium mb-2">Managing Director</p>
              <p className="text-gray-600 text-sm">
                Visionary leader with extensive experience in business
                development and strategic planning, driving JollofAI's mission
                to revolutionize African cuisine.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="/jiddah-abidemi.jpg"
                  alt="Jiddah Abidemi Elegbede - Executive Assistant/Project Manager"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Jiddah Abidemi Elegbede
              </h3>
              <p className="text-primary font-medium mb-2">
                Executive Assistant/Project Manager
              </p>
              <p className="text-gray-600 text-sm">
                Skilled project coordinator ensuring seamless operations and
                executive support, managing strategic initiatives and team
                coordination.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="/martins-babatunde.jpg"
                  alt="Martins Babatunde - Team Lead Engineers"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Martins Babatunde
              </h3>
              <p className="text-primary font-medium mb-2">
                Team Lead - Engineers
              </p>
              <p className="text-gray-600 text-sm">
                Experienced software engineering leader overseeing technical
                architecture and development teams for JollofAI's platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="/khalid-yekini.jpg"
                  alt="Khalid Yekini - Team Lead AI Prompt Engineer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Khalid Yekini
              </h3>
              <p className="text-primary font-medium mb-2">
                Team Lead AI Prompt Engineer
              </p>
              <p className="text-gray-600 text-sm">
                Expert in AI prompt engineering and natural language processing,
                leading the development of intelligent recipe generation
                algorithms.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="/oluchi-joy.jpg"
                  alt="Oluchi Joy Okoro - Assistant EA/Project Manager"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Oluchi Joy Okoro
              </h3>
              <p className="text-primary font-medium mb-2">
                Assistant EA/Project Manager
              </p>
              <p className="text-gray-600 text-sm">
                Supporting executive operations and project coordination,
                assisting in administrative tasks and strategic project
                management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container-max px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Get In Touch
            </h2>
            <p className="text-gray-600 mb-8">
              Have questions, suggestions, or want to collaborate? We'd love to
              hear from you.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  General Inquiries
                </h3>
                <p className="text-gray-600">hello@jollofai.com</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Partnership
                </h3>
                <p className="text-gray-600">partners@jollofai.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
