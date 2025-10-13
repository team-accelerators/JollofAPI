import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "🏠 Home" },
    { to: "/about", label: "ℹ️ About" },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-soft sticky top-0 z-40 border-b border-neutral-200">
      <div className="container-max px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-display font-bold text-primary hover:text-primary/80 transition-colors duration-300"
          >
            🍛 JollofAI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-display font-medium transition-all duration-300 px-3 py-2 rounded-xl hover:bg-primary/10 ${
                  isActiveLink(link.to)
                    ? "text-primary bg-primary/10"
                    : "text-neutral-600 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Section */}
            <div className="flex items-center space-x-4 ml-8">
              {user ? (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard"
                    className={`text-sm font-display font-medium transition-all duration-300 px-3 py-2 rounded-xl hover:bg-primary/10 ${
                      isActiveLink("/dashboard")
                        ? "text-primary bg-primary/10"
                        : "text-neutral-600 hover:text-primary"
                    }`}
                  >
                    📊 Dashboard
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-sm font-display font-medium text-neutral-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-xl hover:bg-primary/10"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center neumorphic">
                        <span className="text-primary font-bold">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden lg:block">
                        {user.fullName?.split(" ")[0]}
                      </span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-large py-2 z-50 border border-neutral-200 neumorphic">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-display text-neutral-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 mx-2 rounded-xl"
                        >
                          📊 Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-display text-neutral-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 mx-2 rounded-xl"
                        >
                          👤 Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 text-sm font-display text-accent hover:bg-accent/10 transition-all duration-200 mx-2 rounded-xl"
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/signin">
                    <Button variant="ghost" size="sm">
                      🔐 Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">🆕 Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink(link.to)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="pt-2 border-t">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActiveLink("/dashboard")
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-gray-100"
                    >
                      Sign out ({user.fullName?.split(" ")[0]})
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      🔐 Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium bg-primary text-white hover:opacity-90"
                    >
                      🆕 Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
