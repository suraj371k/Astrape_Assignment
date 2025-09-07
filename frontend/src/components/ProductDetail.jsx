import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail = ({ product, onAddToCart }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const images = Array.isArray(product?.images) ? product.images : [];
  const activeImage = images[activeIndex]?.url || "";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 },
    },
  };

  const thumbnailVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock ?? 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(quantity);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square">
            <AnimatePresence mode="wait">
              {activeImage ? (
                <motion.img
                  key={activeIndex}
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  src={activeImage}
                  alt={product?.title}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">No image available</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-5 gap-3"
            >
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  variants={thumbnailVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    idx === activeIndex
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <img
                    src={img.url}
                    alt={img.alt || product?.title}
                    className="w-full h-full object-cover"
                  />
                  {idx === activeIndex && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-10" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Product Info Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product?.title}
              </h1>
              {product?.isFeatured && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 whitespace-nowrap"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Featured
                </motion.span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                {product?.category}
              </span>
              {product?.ratings && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.ratings)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.ratings})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-b border-gray-100 py-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                ${product?.price}
              </span>
              <span className="text-lg text-gray-500">USD</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product?.description}
            </p>
          </div>

          {/* Stock Status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="font-medium text-gray-700">Stock Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    (product?.stock ?? 0) > 5
                      ? "bg-green-500"
                      : (product?.stock ?? 0) > 0
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    (product?.stock ?? 0) > 5
                      ? "text-green-600"
                      : (product?.stock ?? 0) > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {(product?.stock ?? 0) > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4 pt-4">
            {(product?.stock ?? 0) > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        d="M20 12H4"
                      />
                    </svg>
                  </motion.button>
                  <span className="px-4 py-2 font-medium bg-gray-50 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product?.stock ?? 0)}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </motion.button>
                </div>
        </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!product || (product?.stock ?? 0) <= 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                  />
                </svg>
                {(product?.stock ?? 0) > 0 ? "Add to Cart" : "Out of Stock"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center"
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </motion.button>
        </div>
    </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Product Information</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1 ml-7">
              <li>• Free shipping on orders over $50</li>
              <li>• 30-day return policy</li>
              <li>• Secure payment processing</li>
              <li>• Customer support available 24/7</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
