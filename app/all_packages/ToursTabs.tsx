"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Search, MapPin, Gauge, Clock, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

/* ─── DATA ─────────────────────────────────────────────────────── */
const FREEDOM_PACKAGES = [
    { id: 1, title: "100KM Freedom", km: 100, hrs: 5, description: "Perfect for a quick city tour or a short getaway to nearby attractions.", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop", gradient: "linear-gradient(to top, rgba(13, 148, 136, 0.9), transparent)" },
    { id: 2, title: "250KM Adventure", km: 250, hrs: 12, description: "Ideal for a full day of exploration with multiple stops across the region.", image: "https://images.unsplash.com/photo-1506012733027-04d66ee13075?q=80&w=2072&auto=format&fit=crop", gradient: "linear-gradient(to top, rgba(59, 130, 246, 0.9), transparent)" },
    { id: 3, title: "500KM Discovery", km: 500, hrs: 15, description: "The ultimate choice for long-distance travel and deep province exploration.", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", gradient: "linear-gradient(to top, rgba(236, 72, 153, 0.9), transparent)" },
    { id: 4, title: "750KM Expedition", km: 750, hrs: 24, description: "For the serious wanderers who want to cover cross-country distances in comfort.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop", gradient: "linear-gradient(to top, rgba(245, 158, 11, 0.9), transparent)" },
    { id: 5, title: "1000KM Odyssey", km: 1000, hrs: 48, description: "A grand tour across multiple cities with overnight stays and unlimited possibilities.", image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=2070&auto=format&fit=crop", gradient: "linear-gradient(to top, rgba(99, 102, 241, 0.9), transparent)" },
    { id: 6, title: "1500KM Grand Master", km: 1500, hrs: 72, description: "Our most extensive package for those who want to see every corner of paradise.", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop", gradient: "linear-gradient(to top, rgba(16, 185, 129, 0.9), transparent)" }
];

const DESTINATION_PACKAGES = [
    { id: 1, name: "Sigiriya", location: "Central Province", label: "Heritage", description: "Ancient rock fortress & UNESCO world heritage site", bg: "https://images.unsplash.com/photo-1588332099090-f82e1ec5ea97?w=800&q=80" },
    { id: 2, name: "Ella", location: "Uva Province", label: "Mountains", description: "Misty mountains & iconic Nine Arch Bridge", bg: "https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&q=80" },
    { id: 3, name: "Galle", location: "Southern Province", label: "Coastal", description: "Colonial fort city by the sea", bg: "https://images.unsplash.com/photo-1580130718646-9f694209b207?w=800&q=80" },
    { id: 4, name: "Yala", location: "Southern Province", label: "Wildlife", description: "Sri Lanka's premier wildlife sanctuary", bg: "https://images.unsplash.com/photo-1564760054108-694b5fb36362?w=800&q=80" },
    { id: 5, name: "Kandy", location: "Central Province", label: "Cultural", description: "Temple of the Tooth & cultural capital", bg: "https://images.unsplash.com/photo-1593511655855-d069183787a1?w=800&q=80" },
    { id: 6, name: "Mirissa", location: "Southern Province", label: "Beaches", description: "Whale watching & golden beaches", bg: "https://images.unsplash.com/photo-1506929562872-bb421503ef7e?w=800&q=80" },
    { id: 7, name: "Polonnaruwa", location: "North Central", label: "Ancient", description: "Ancient kingdoms & sacred ruins", bg: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80" },
    { id: 8, name: "Nuwara Eliya", location: "Central Province", label: "Tea", description: "Tea trails & colonial hill station", bg: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80" }
];

export default function ToursTabs() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading packages...</p></div>}>
            <ToursTabsContent />
        </Suspense>
    );
}

function ToursTabsContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") === "destination" ? "destination" : "distance";

    const [activeTab, setActiveTab] = useState(initialTab);
    const [distFilter, setDistFilter] = useState("all");
    const [hourFilter, setHourFilter] = useState("all");
    const [locFilter, setLocFilter] = useState("");

    const getFullImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = API_ENDPOINTS.AUTH.replace('/api/auth', '');
        return `${baseUrl}${path}`;
    };

    const [dynamicFreedom, setDynamicFreedom] = useState<any[]>([]);
    const [dynamicDests, setDynamicDests] = useState<any[]>([]);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(`${API_ENDPOINTS.TOUR_PACKAGES}`);
                if (response.ok) {
                    const data = await response.json();

                    const freedom = data.filter((p: any) => p.type === 'freedom').map((p: any) => ({
                        id: p._id,
                        title: p.title,
                        km: parseInt(p.limit?.split(' ')[0] || '0'),
                        hrs: parseInt(p.limit?.split(' / ')[1]?.split(' ')[0] || '0'),
                        description: p.description,
                        image: p.image,
                        gradient: p.gradient
                    }));

                    const dests = data.filter((p: any) => p.type === 'destination').map((p: any) => ({
                        id: p._id,
                        name: p.title,
                        location: p.label || 'Destinations',
                        label: p.label || 'Destinations',
                        description: p.description,
                        bg: p.image
                    }));

                    if (freedom.length > 0) setDynamicFreedom(freedom);
                    if (dests.length > 0) setDynamicDests(dests);
                }
            } catch (error) {
                console.error('Error fetching dynamic packages:', error);
            }
        };
        fetchPackages();
    }, []);

    const freedomList = dynamicFreedom.length > 0 ? dynamicFreedom : FREEDOM_PACKAGES;
    const destList = dynamicDests.length > 0 ? dynamicDests : DESTINATION_PACKAGES;

    // Update active tab if URL changes
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "distance" || tab === "destination") {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Filtering logic
    const filteredDistancePacks = freedomList.filter(pkg => {
        const dMatch = distFilter === "all" || pkg.km >= parseInt(distFilter);
        const hMatch = hourFilter === "all" || pkg.hrs >= parseInt(hourFilter);
        return dMatch && hMatch;
    });

    const filteredDestPacks = destList.filter(pkg => {
        return pkg.name.toLowerCase().includes(locFilter.toLowerCase()) ||
            pkg.location.toLowerCase().includes(locFilter.toLowerCase());
    });

    return (
        <section className="min-h-screen bg-[#fafafa] py-12 md:py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6">
                        Explore Our <span className="text-teal-600 italic">Packages</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        Whether you prefer distance-based freedom or curated destination tours,
                        we have the perfect journey waiting for you.
                    </p>
                </div>

                {/* Tabs Toggle */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab("distance")}
                        className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-md ${activeTab === "distance"
                            ? "bg-teal-600 text-white"
                            : "bg-white text-gray-500 hover:text-teal-600"
                            }`}
                    >
                        Distance Base Packages
                    </button>
                    <button
                        onClick={() => setActiveTab("destination")}
                        className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-md ${activeTab === "destination"
                            ? "bg-teal-600 text-white"
                            : "bg-white text-gray-500 hover:text-teal-600"
                            }`}
                    >
                        Destination Base Packages
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-12">
                    {activeTab === "distance" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Gauge size={14} className="text-teal-500" /> Min Distance (KM)
                                </label>
                                <select
                                    className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                                    value={distFilter}
                                    onChange={(e) => setDistFilter(e.target.value)}
                                >
                                    <option value="all">Any Distance</option>
                                    <option value="250">250 KM +</option>
                                    <option value="500">500 KM +</option>
                                    <option value="1000">1000 KM +</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={14} className="text-teal-500" /> Min Duration (Hours)
                                </label>
                                <select
                                    className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                                    value={hourFilter}
                                    onChange={(e) => setHourFilter(e.target.value)}
                                >
                                    <option value="all">Any Duration</option>
                                    <option value="12">12 Hours +</option>
                                    <option value="24">24 Hours +</option>
                                    <option value="48">48 Hours +</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} className="text-teal-500" /> Filter by Location
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search Sigiriya, Galle, Kandy..."
                                    className="w-full p-3 pl-12 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                                    value={locFilter}
                                    onChange={(e) => setLocFilter(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {activeTab === "distance" ? (
                        filteredDistancePacks.map(pkg => (
                            <div key={pkg.id} className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:shadow-teal-500/10">
                                <Image src={getFullImageUrl(pkg.image)} alt={pkg.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 z-10" style={{ background: pkg.gradient }} />
                                <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-white/70 text-xs font-bold tracking-widest uppercase mb-2">{pkg.km} KM / {pkg.hrs} Hours</span>
                                    <h3 className="text-white text-2xl font-serif font-bold mb-4">{pkg.title}</h3>
                                    <p className="text-white/80 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                                        {pkg.description}
                                    </p>
                                    <button className="flex items-center gap-2 px-6 py-2 bg-white text-gray-900 rounded-lg font-bold text-xs tracking-wider uppercase hover:bg-teal-600 hover:text-white transition-all duration-300">
                                        Explore <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredDestPacks.map(pkg => (
                            <div key={pkg.id} className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-500">
                                <Image src={getFullImageUrl(pkg.bg)} alt={pkg.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-95" />
                                <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin size={12} className="text-teal-400" />
                                        <span className="text-teal-400 text-xs font-bold tracking-widest uppercase">{pkg.location}</span>
                                    </div>
                                    <h3 className="text-white text-3xl font-serif font-bold mb-2">{pkg.name}</h3>
                                    <p className="text-white/70 text-sm italic mb-4">{pkg.label}</p>
                                    <p className="text-white/80 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        {pkg.description}
                                    </p>
                                    <button className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-teal-600 transition-all duration-300">
                                        View Tour <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {((activeTab === "distance" && filteredDistancePacks.length === 0) ||
                    (activeTab === "destination" && filteredDestPacks.length === 0)) && (
                        <div className="text-center py-20">
                            <Search className="mx-auto text-gray-200 mb-4" size={60} />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No packages found</h3>
                            <p className="text-gray-500">Try adjusting your filters to find your perfect tour.</p>
                            <button
                                onClick={() => { setDistFilter("all"); setHourFilter("all"); setLocFilter(""); }}
                                className="mt-6 text-teal-600 font-bold hover:underline"
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}
            </div>
        </section>
    );
}
