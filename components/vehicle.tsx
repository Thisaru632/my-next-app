// components/VehicleSection.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface VehicleModel {
  main: string;
  thumb1: string;
  thumb2: string;
  thumb3: string;
}

const vehicleImages: Record<string, VehicleModel> = {
  // Budget Cars
  "budget-wagonr": {
    main: "/Vehicle images/Wagon R/front.png",
    thumb1: "/Vehicle images/Wagon R/back.png",
    thumb2: "/Vehicle images/Wagon R/inside.png",
    thumb3: "/Vehicle images/Wagon R/side.png",
  },
  "budget-alto": {
    main: "/Vehicle images/Alto/front.png",
    thumb1: "/Vehicle images/Alto/back.png",
    thumb2: "/Vehicle images/Alto/inside.png",
    thumb3: "/Vehicle images/Alto/side.png",
  },
  "budget-vitz": {
    main: "/images/vehicle/3.jpg",
    thumb1: "/images/Interior/3.jpg",
    thumb2: "/images/Interior/4.jpg",
    thumb3: "/images/Interior/1.jpg",
  },

  // Luxury
  "luxury-benz": {
    main: "/images/vehicle/2.jpg",
    thumb1: "/images/Interior/2.jpg",
    thumb2: "/images/Interior/3.jpg",
    thumb3: "/images/Interior/4.jpg",
  },
  "luxury-bmw": {
    main: "/images/vehicle/1.jpg",
    thumb1: "/images/Interior/1.jpg",
    thumb2: "/images/Interior/2.jpg",
    thumb3: "/images/Interior/3.jpg",
  },
  "luxury-audi": {
    main: "/images/vehicle/3.jpg",
    thumb1: "/images/Interior/4.jpg",
    thumb2: "/images/Interior/1.jpg",
    thumb3: "/images/Interior/2.jpg",
  },

  // SUV/JEEP
  "suv-montero": {
    main: "/images/vehicle/3.jpg",
    thumb1: "/images/Interior/3.jpg",
    thumb2: "/images/Interior/4.jpg",
    thumb3: "/images/Interior/1.jpg",
  },
  "suv-prado": {
    main: "/images/vehicle/1.jpg",
    thumb1: "/images/Interior/1.jpg",
    thumb2: "/images/Interior/2.jpg",
    thumb3: "/images/Interior/3.jpg",
  },
  "suv-fortuner": {
    main: "/images/vehicle/2.jpg",
    thumb1: "/images/Interior/2.jpg",
    thumb2: "/images/Interior/3.jpg",
    thumb3: "/images/Interior/4.jpg",
  },

  // Vans & Buses
  "vans-kdh": {
    main: "/images/vehicle/1.jpg",
    thumb1: "/images/Interior/4.jpg",
    thumb2: "/images/Interior/1.jpg",
    thumb3: "/images/Interior/2.jpg",
  },
  "vans-hiace": {
    main: "/images/vehicle/2.jpg",
    thumb1: "/images/Interior/3.jpg",
    thumb2: "/images/Interior/4.jpg",
    thumb3: "/images/Interior/1.jpg",
  },
  "vans-caravan": {
    main: "/images/vehicle/3.jpg",
    thumb1: "/images/Interior/2.jpg",
    thumb2: "/images/Interior/3.jpg",
    thumb3: "/images/Interior/4.jpg",
  },

  // Wedding Cars
  "wedding-rolls": {
    main: "/images/vehicle/2.jpg",
    thumb1: "/images/Interior/1.jpg",
    thumb2: "/images/Interior/2.jpg",
    thumb3: "/images/Interior/3.jpg",
  },
  "wedding-bentley": {
    main: "/images/vehicle/1.jpg",
    thumb1: "/images/Interior/2.jpg",
    thumb2: "/images/Interior/3.jpg",
    thumb3: "/images/Interior/4.jpg",
  },
  "wedding-vintage": {
    main: "/images/vehicle/3.jpg",
    thumb1: "/images/Interior/4.jpg",
    thumb2: "/images/Interior/1.jpg",
    thumb3: "/images/Interior/2.jpg",
  },
};

type Category = "budget" | "luxury" | "suv" | "vans" | "wedding";

interface CategoryData {
  title: string;
  features: string[];
  driverAge: string;
  defaultModel: string;
  models: { value: string; label: string }[];
}

const categories: Record<Category, CategoryData> = {
  budget: {
    title: "Budget",
    features: ["Air Conditioning", "4 Passengers", "Audio Input", "Bluetooth"],
    driverAge: "21+",
    defaultModel: "budget-wagonr",
    models: [
      { value: "budget-wagonr", label: "Wagon R" },
      { value: "budget-alto", label: "Suzuki Alto" },
      { value: "budget-vitz", label: "Toyota Vitz" },
    ],
  },
  luxury: {
    title: "Luxury",
    features: ["Premium Air Conditioning", "5 Passengers", "Premium Audio System", "Leather Seats"],
    driverAge: "25+",
    defaultModel: "luxury-benz",
    models: [
      { value: "luxury-benz", label: "Mercedes Benz" },
      { value: "luxury-bmw", label: "BMW 5 Series" },
      { value: "luxury-audi", label: "Audi A6" },
    ],
  },
  suv: {
    title: "SUV / JEEP",
    features: ["Air Conditioning", "7 Passengers", "4WD Capability", "Large Cargo Space"],
    driverAge: "23+",
    defaultModel: "suv-montero",
    models: [
      { value: "suv-montero", label: "Montero Sport" },
      { value: "suv-prado", label: "Toyota Prado" },
      { value: "suv-fortuner", label: "Toyota Fortuner" },
    ],
  },
  vans: {
    title: "Vans & Buses",
    features: ["Air Conditioning", "12-15 Passengers", "Extra Luggage Space", "Comfortable Seating"],
    driverAge: "25+",
    defaultModel: "vans-kdh",
    models: [
      { value: "vans-kdh", label: "Toyota KDH Van" },
      { value: "vans-hiace", label: "Toyota Hiace" },
      { value: "vans-caravan", label: "Nissan Caravan" },
    ],
  },
  wedding: {
    title: "Wedding Cars",
    features: ["Luxury Interior", "Decorated Options", "Professional Chauffeur", "Special Packages"],
    driverAge: "N/A (Chauffeur Included)",
    defaultModel: "wedding-rolls",
    models: [
      { value: "wedding-rolls", label: "Rolls Royce" },
      { value: "wedding-bentley", label: "Bentley" },
      { value: "wedding-vintage", label: "Vintage Car" },
    ],
  },
};

export default function VehicleSection() {
  const [activeTab, setActiveTab] = useState<Category>("budget");

  const [selectedModels, setSelectedModels] = useState<Record<Category, string>>({
    budget: categories.budget.defaultModel,
    luxury: categories.luxury.defaultModel,
    suv: categories.suv.defaultModel,
    vans: categories.vans.defaultModel,
    wedding: categories.wedding.defaultModel,
  });

  const handleModelChange = (category: Category, value: string) => {
    setSelectedModels((prev) => ({ ...prev, [category]: value }));
  };

  const currentModel = selectedModels[activeTab];
  const currentImages = vehicleImages[currentModel] || vehicleImages[categories[activeTab].defaultModel];

  return (
    <div className="vehicle-section mb-5 rounded-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Our Vehicles
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 md:gap-6 border-b border-gray-300/60 pb-3">
          {(["budget", "luxury", "suv", "vans", "wedding"] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`
                px-5 py-2.5 text-lg font-medium transition-all duration-300
                border-b-4 border-transparent text-gray-600 hover:text-gray-900 hover:border-[#3eb489]/60
                ${activeTab === cat ? "text-gray-900 border-[#3eb489] font-semibold" : ""}
              `}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {cat === "suv"
                ? "SUV / JEEP"
                : cat === "vans"
                ? "Vans & Buses"
                : cat === "wedding"
                ? "Wedding Cars"
                : `${cat.charAt(0).toUpperCase() + cat.slice(1)} Cars`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left - Info Card – also using #faf8f5 */}
        <div className="lg:col-span-5">
          <div className="vehicle-card rounded-xl shadow-2xl p-6 md:p-8 h-full bg-[#faf8f5] border border-gray-200/70">
            <h4
              className="text-3xl font-bold text-gray-900 mb-7"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {categories[activeTab].title}
            </h4>

            <ul className="space-y-4 mb-9">
              {categories[activeTab].features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-800 text-[15px] md:text-base">
                  <i className="bi bi-check-circle-fill me-3 text-[#3eb489] text-xl"></i>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mb-9">
              <p className="text-gray-600 text-sm uppercase tracking-wider mb-1.5">Driver Age</p>
              <p className="text-gray-900 font-semibold text-lg">{categories[activeTab].driverAge}</p>
            </div>

            <div className="pt-7 border-t border-gray-300/50">
              <p className="text-gray-600 text-sm uppercase tracking-wider mb-3">Vehicle Models</p>

              <select
                value={selectedModels[activeTab]}
                onChange={(e) => handleModelChange(activeTab, e.target.value)}
                className="vehicle-model-dropdown w-full"
              >
                {categories[activeTab].models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <div className="mt-7">
                <a
                  href="/booking"
                  className="btn-book-now block w-full text-center py-4 rounded-lg font-semibold text-base tracking-wide shadow-lg transition-all duration-300"
                >
                  BOOK NOW
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Images */}
        <div className="lg:col-span-7">
          <div className="space-y-5">
            {/* Main Image */}
            <div className="overflow-hidden rounded-xl border-4 border-gray-300/70 shadow-2xl bg-[#faf8f5] p-1">
              <div className="relative aspect-[4/3] md:aspect-[5/3] lg:aspect-[16/10]">
                <Image
                  src={currentImages.main}
                  alt={`${categories[activeTab].title} vehicle`}
                  fill
                  className="object-cover rounded-lg transition-opacity duration-500"
                  priority={activeTab === "budget"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 58vw, 700px"
                />
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="overflow-hidden rounded-xl border-4 border-gray-300/70 shadow-xl bg-[#faf8f5] p-1 hover:border-[#3eb489] transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={currentImages[`thumb${num}` as keyof VehicleModel]}
                      alt={`Interior view ${num}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="33vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .vehicle-section {
          background: #faf8f5;
          padding: 60px 8%;
          border-radius: 0;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
        }

        .vehicle-card {
          background: #faf8f5;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }

        .vehicle-model-dropdown {
          background: #faf8f5;
          border: 2px solid rgba(62, 180, 137, 0.3);
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 500;
          color: #222;
          border-radius: 10px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.2rem center;
          background-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .vehicle-model-dropdown:hover {
          border-color: #3eb489;
          box-shadow: 0 0 0 4px rgba(62, 180, 137, 0.12);
        }

        .vehicle-model-dropdown:focus {
          border-color: #3eb489;
          box-shadow: 0 0 0 0.3rem rgba(62, 180, 137, 0.2);
          outline: none;
        }

        .btn-book-now {
          background: linear-gradient(135deg, #3eb489 0%, #2a9d6f 100%);
          color: white;
          transition: all 0.35s ease;
          box-shadow: 0 6px 20px rgba(62, 180, 137, 0.3);
        }

        .btn-book-now:hover {
          background: linear-gradient(135deg, #2a9d6f 0%, #3eb489 100%);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(62, 180, 137, 0.4);
        }
      `}</style>
    </div>
  );
}