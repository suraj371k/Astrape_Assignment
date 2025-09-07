import React, { useEffect, useMemo, useState } from "react";
import { useProductStore } from "../store/productStore";

const Filters = () => {
  const { categories, filters, setFilters, fetchProducts, pagination } = useProductStore();

  const [local, setLocal] = useState({
    category: filters.category || "",
    minPrice: filters.priceRange?.min ?? "",
    maxPrice: filters.priceRange?.max ?? "",
    search: filters.search || "",
    isFeatured: filters.isFeatured ?? "",
    inStock: filters.inStock ?? "",
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
  });

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      category: filters.category || "",
      minPrice: filters.priceRange?.min ?? "",
      maxPrice: filters.priceRange?.max ?? "",
      search: filters.search || "",
      isFeatured: filters.isFeatured ?? "",
      inStock: filters.inStock ?? "",
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    }));
  }, [filters]);

  const handleApply = () => {
    const newFilters = {
      category: local.category || null,
      priceRange: {
        min: local.minPrice !== "" ? local.minPrice : null,
        max: local.maxPrice !== "" ? local.maxPrice : null,
      },
      search: local.search || null,
      isFeatured: local.isFeatured !== "" ? local.isFeatured === "true" : null,
      inStock: local.inStock !== "" ? local.inStock === "true" : null,
      sortBy: local.sortBy,
      sortOrder: local.sortOrder,
    };
    setFilters(newFilters);

    // Build query params expected by backend
    const query = {
      page: 1,
      category: newFilters.category || undefined,
      minPrice: newFilters.priceRange.min ?? undefined,
      maxPrice: newFilters.priceRange.max ?? undefined,
      search: newFilters.search || undefined,
      isFeatured: newFilters.isFeatured !== null ? String(newFilters.isFeatured) : undefined,
      inStock: newFilters.inStock !== null ? String(newFilters.inStock) : undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
    };
    fetchProducts(query);
  };

  const handleClear = () => {
    setLocal({
      category: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      isFeatured: "",
      inStock: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setFilters({
      category: null,
      priceRange: { min: null, max: null },
      search: null,
      isFeatured: null,
      inStock: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    fetchProducts({ page: 1 });
  };

  return (
    <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-sm h-fit sticky top-4 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          Filters
        </h2>
      </div>

      <div className="px-6 py-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Search */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Search Products</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={local.search}
              onChange={(e) => setLocal({ ...local, search: e.target.value })}
              placeholder="Search title or description"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={local.category}
            onChange={(e) => setLocal({ ...local, category: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors capitalize bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Price Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={local.minPrice}
                  onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={local.maxPrice}
                  onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
                  placeholder="∞"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured & Stock Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Featured</label>
            <select
              value={local.isFeatured}
              onChange={(e) => setLocal({ ...local, isFeatured: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Any</option>
              <option value="true">Featured</option>
              <option value="false">Regular</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <select
              value={local.inStock}
              onChange={(e) => setLocal({ ...local, inStock: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Any</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Sorting */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Sort Options</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs text-gray-500">Sort By</label>
              <select
                value={local.sortBy}
                onChange={(e) => setLocal({ ...local, sortBy: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="ratings">Ratings</option>
                <option value="stock">Stock Level</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-500">Order</label>
              <select
                value={local.sortOrder}
                onChange={(e) => setLocal({ ...local, sortOrder: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button
          onClick={handleApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClear}
          className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default Filters;