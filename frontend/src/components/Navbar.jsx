import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  UserPlus,
  LogOut,
  Menu,
  X,
  createLucideIcon,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const { user, logoutUser } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: "/products", label: "Products", icon: null, role: "user" },
    { to: "/cart", label: "Cart", icon: ShoppingCart, role: "user" },
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      role: "admin",
    },
    {
      to: "/create-product",
      label: "Create Product",
      icon: null,
      role: "admin",
    },
  ];

  // Filter navigation links based on user role
  const getFilteredNavLinks = () => {
    if (!user) {
      // Show basic navigation for non-authenticated users
      return [
        { to: "/", label: "Home", icon: null, role: "guest" },
        { to: "/products", label: "Products", icon: null, role: "guest" },
      ];
    }

    // Check if user is admin
    const isAdmin = user.role === "admin" || user.isAdmin;

    if (isAdmin) {
      // Admin users only see Dashboard and Create Product
      return navLinks.filter((link) => link.role === "admin");
    } else {
      // Regular users see Home, Products, and Cart
      return navLinks.filter((link) => link.role === "user");
    }
  };

  const filteredNavLinks = getFilteredNavLinks();

  const authLinks = user
    ? [
        { action: handleLogout, label: "Logout", icon: LogOut },
      ]
    : [
        { to: "/login", label: "Login", icon: User },
        { to: "/register", label: "Register", icon: UserPlus },
      ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
            : "bg-white shadow-md"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MS</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  MyStore
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {filteredNavLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 group ${
                      location.pathname === link.to
                        ? link.role === "admin"
                          ? "text-purple-600 bg-purple-50"
                          : "text-blue-600 bg-blue-50"
                        : link.role === "admin"
                        ? "text-purple-700 hover:text-purple-600 hover:bg-purple-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.icon && (
                      <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    )}
                    <span className="font-medium">{link.label}</span>
                    {link.role === "admin" && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </motion.div>
                </Link>
              ))}

              {/* User Section */}
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Hi, {user.name}
                    </span>
                  </motion.div>
                )}

                {authLinks.map((link, index) =>
                  link.to ? (
                    <Link key={link.to} to={link.to}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                          index === authLinks.length - 1 && !user
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.button
                      key={link.label}
                      onClick={link.action}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-4"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Hi, {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </motion.div>
                )}

                {[...filteredNavLinks, ...authLinks].map((link, index) =>
                  link.to ? (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                          location.pathname === link.to
                            ? link.role === "admin"
                              ? "text-purple-600 bg-purple-50"
                              : "text-blue-600 bg-blue-50"
                            : link.role === "admin"
                            ? "text-purple-700 hover:bg-purple-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {link.icon && <link.icon className="w-5 h-5" />}
                          <span className="font-medium">{link.label}</span>
                        </div>
                        {link.role === "admin" && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                            Admin
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.button
                      key={link.label}
                      onClick={link.action}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50"
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </motion.button>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
