"use client";

import { useState } from "react";

// You can move this to a separate file later (e.g. types.ts)
type FilterState = {
  category: string;
  location: string;
  duration: string;
  persons: string;
  priceMin: string;
  priceMax: string;
};

export default function TourFilters({
  onFilterChange,
}: {
  onFilterChange: (filters: FilterState) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    location: "",
    duration: "",
    persons: "",
    priceMin: "",
    priceMax: "",
  });

  // Update filters and notify parent component
  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      category: "",
      location: "",
      duration: "",
      persons: "",
      priceMin: "",
      priceMax: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-5 mb-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              Find Your Perfect Tour
            </h2>
            <button
              onClick={resetFilters}
              className="text-white/80 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {/* Category */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="">All Categories</option>
              <option value="Passion">Passion</option>
              <option value="Serendipity">Serendipity</option>
              <option value="Luxe">Luxe</option>
              <option value="Heritage">Heritage</option>
              <option value="Wild">Wild</option>
              <option value="Coastal">Coastal</option>
              <option value="Highland">Highland</option>
              <option value="Wellness">Wellness</option>
              <option value="Adventure">Adventure</option>
              <option value="Signature">Signature</option>
              <option value="Quick">Quick</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="">All Locations</option>
              <option value="Colombo">Colombo</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="Sigiriya">Sigiriya</option>
              <option value="Yala">Yala</option>
              <option value="Ella">Ella</option>
              <option value="Nuwara Eliya">Nuwara Eliya</option>
              <option value="Trincomalee">Trincomalee</option>
              <option value="Bentota">Bentota</option>
              <option value="Mirissa">Mirissa</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <select
              value={filters.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="">Any Duration</option>
              <option value="1-5">1 - 5 Days</option>
              <option value="6-8">6 - 8 Days</option>
              <option value="9-12">9 - 12 Days</option>
              <option value="13+">13+ Days</option>
            </select>
          </div>

          {/* Persons */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Travelers
            </label>
            <select
              value={filters.persons}
              onChange={(e) => handleChange("persons", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="">Any Group Size</option>
              <option value="1">1 Person</option>
              <option value="2">2 Persons</option>
              <option value="3-4">3 - 4 Persons</option>
              <option value="5-8">5 - 8 Persons</option>
              <option value="9+">9+ Persons</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Price Range (USD)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => handleChange("priceMin", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => handleChange("priceMax", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Optional: Show active filters */}
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {key === "priceMin" || key === "priceMax"
                  ? `${key === "priceMin" ? "From" : "To"} $${value}`
                  : value}
                <button
                  onClick={() => handleChange(key as keyof FilterState, "")}
                  className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}