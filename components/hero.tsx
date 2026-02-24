"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import {
  DirectionsBus,
  Close as CloseIcon,
  DriveEta,
  CheckCircle,
  AirportShuttle,
  LocalTaxi,
  Person,
  Work,
  Phone,
  Email,
  AccountCircle,
  Group,
  DirectionsCar,
  TrendingFlat,
  Loop,
} from '@mui/icons-material';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/config/api';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const SLIDES = [
  { src: "/hero/beautiful-woman-dress-by-waterfall.jpg", alt: "Woman by waterfall" },
  { src: "/hero/don-kaveen-93IYznJPkOA-unsplash.jpg", alt: "Tropical scenery" },
  { src: "/hero/promodhya-abeysekara-gjd-7_3Ek_w-unsplash.jpg", alt: "Beach view" },
];

const INTERVAL_MS = 6000;

const vehicleTypes = [
  {
    name: 'Car',
    icon: '/car.png',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  {
    name: 'Van',
    icon: '/van.png',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  {
    name: 'Bus',
    icon: '/school-bus (1).png',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  {
    name: 'SUV',
    icon: '/suv.png',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
];

const tripTypes = [
  {
    name: 'Drop',
    description: 'Single destination trip',
    icon: <TrendingFlat />
  },
  {
    name: 'Return',
    description: 'Return to starting point',
    icon: <Loop />
  },
];

const sampleVehicles = {
  Car: {
    models: [
      { name: 'Alto', description: 'Compact & Efficient', maxPersons: 3, maxBags: 2 },
      { name: 'Wagon R', description: 'Spacious Interior', maxPersons: 4, maxBags: 3 },
      { name: 'Aqua', description: 'Hybrid Technology', maxPersons: 4, maxBags: 3 },
      { name: 'Axio', description: 'Premium Comfort', maxPersons: 4, maxBags: 3 },
    ]
  },
  Van: {
    models: [
      { name: 'KDH High Roof', description: 'Extra headroom', maxPersons: 12, maxBags: 10 },
      { name: 'KDH Flat Roof', description: 'Classic style', maxPersons: 10, maxBags: 8 },
      { name: 'Dual AC Van', description: 'Dual climate control', maxPersons: 10, maxBags: 8 },
      { name: 'Non-AC Van', description: 'Budget friendly', maxPersons: 10, maxBags: 8 },
    ]
  },
  Bus: {
    models: [
      { name: 'AC 29 Seater', description: 'Air conditioned comfort', maxPersons: 29, maxBags: 25 },
      { name: 'Non-AC 29 Seater', description: 'Economical choice', maxPersons: 29, maxBags: 25 },
    ]
  },
  SUV: {
    models: [
      { name: 'Prado', description: 'Luxury 4x4', maxPersons: 7, maxBags: 6 },
      { name: 'Fortuner', description: 'Premium SUV', maxPersons: 7, maxBags: 6 },
    ]
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [kenKey, setKenKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleName: '',
    tripType: '',
    pickupLocation: '',
    dropoffLocation: '',
    dateTime: '',
    numberOfDays: 1,
    name: '',
    telephone: '',
    email: '',
    maxPersons: 0,
    maxBags: 0,
  });

  // Intermediate destinations state
  const [destinations, setDestinations] = useState<string[]>([]);

  const addDestination = () => {
    setDestinations((prev) => [...prev, '']);
  };

  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDestination = (index: number, value: string) => {
    setDestinations((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openTripTypeDialog, setOpenTripTypeDialog] = useState(false);
  const [openPersonalDialog, setOpenPersonalDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // -----------------------------------------------------------------------
  // Preload images
  // -----------------------------------------------------------------------
  useEffect(() => {
    const imagePromises = SLIDES.map((slide) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = slide.src;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch((err) => {
        console.error('Error loading images:', err);
        setImagesLoaded(true);
      });
  }, []);

  // -----------------------------------------------------------------------
  // Auto-advance
  // -----------------------------------------------------------------------
  const next = useCallback(() => {
    setCurrent((prev) => {
      const n = (prev + 1) % SLIDES.length;
      setKenKey((k) => k + 1);
      return n;
    });
  }, []);

  useEffect(() => {
    if (paused || !imagesLoaded) return;
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, next, imagesLoaded]);

  const goTo = (i: number) => {
    setCurrent(i);
    setKenKey((k) => k + 1);
  };

  // -----------------------------------------------------------------------
  // Form handlers
  // -----------------------------------------------------------------------
  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleCardClick = (type: string) => {
    setSelectedCategory(type);
    setOpenVehicleDialog(true);
  };

  const handleVehicleSelect = (modelName: string) => {
    // Find the selected vehicle model to get maxPersons and maxBags
    const categoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles];
    const selectedModel = categoryVehicles.models.find(model => model.name === modelName);

    setFormData((prev) => ({
      ...prev,
      vehicleType: selectedCategory,
      vehicleName: modelName,
      maxPersons: selectedModel?.maxPersons || 0,
      maxBags: selectedModel?.maxBags || 0,
    }));
    setOpenVehicleDialog(false);
    setOpenTripTypeDialog(true);
  };

  const handleTripTypeSelect = (tripTypeName: string) => {
    setFormData((prev) => ({
      ...prev,
      tripType: tripTypeName,
    }));
    setOpenTripTypeDialog(false);
  };

  const handleRequestBooking = () => {
    if (!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime) {
      alert('Please fill all required fields');
      return;
    }
    setOpenPersonalDialog(true);
  };

  const handleSendRequest = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          destinations: destinations.filter((d) => d.trim() !== ''),
        }),
      });

      if (response.ok) {
        setSnackbarMessage('Booking request sent successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setOpenPersonalDialog(false);
        setFormData({
          vehicleType: '',
          vehicleName: '',
          tripType: '',
          pickupLocation: '',
          dropoffLocation: '',
          dateTime: '',
          numberOfDays: 1,
          name: '',
          telephone: '',
          email: '',
          maxPersons: 0,
          maxBags: 0,
        });
        setDestinations([]);
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.message || 'Failed to send booking request.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSnackbarMessage('An error occurred. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const currentCategoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles] || { models: [] };

  const basePricePerDay =
    formData.vehicleType === 'Car' ? 15000 :
      formData.vehicleType === 'Van' ? 18000 :
        formData.vehicleType === 'Bus' ? 35000 :
          formData.vehicleType === 'SUV' ? 25000 : 0;

  const totalPrice = basePricePerDay * formData.numberOfDays;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <section
      className="relative w-full overflow-hidden transition-all duration-500 ease-in-out"
      style={{
        minHeight: "850px",
        height: "auto",
        display: "flex",
        flexDirection: "column"
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* SLIDE STACK */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            zIndex: i === current ? 1 : 0,
            opacity: imagesLoaded && i === current ? 1 : 0
          }}
          aria-hidden={i !== current}
        >
          <div
            key={`${kenKey}-${i}`}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${slide.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              animation: i === current && imagesLoaded ? "kenBurns 8s ease-out forwards" : "none",
              willChange: "transform",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(45,35,25,0.5) 50%, rgba(45,35,25,0.75) 100%)",
            }}
          />
        </div>
      ))}

      {/* Fallback background */}
      {!imagesLoaded && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            zIndex: 0,
          }}
        />
      )}

      {/* HERO CONTENT */}
      <div
        className="relative flex-grow flex flex-col items-center justify-center px-4 pt-40 pb-40 text-center"
        style={{ zIndex: 10 }}
      >
        <div className="w-full max-w-4xl">

          {/* Headline */}
          <div className="mb-2 sm:mb-4 px-2" style={{ animation: "fadeInUp 1s ease-out" }}>
            <h1
              className="text-white font-semibold tracking-tight mb-1 sm:mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 6vw, 5rem)",
                lineHeight: 1,
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              SENU TOURS
            </h1>

            <p
              className="text-white uppercase leading-relaxed"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                letterSpacing: "0.05em",
                fontSize: "clamp(0.65rem, 2vw, 1rem)",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                opacity: 0.95,
              }}
            >
              Your Home, Your Journey, Your Hospitality Haven
            </p>
          </div>

          {/* Booking Form Card */}
          <div
            className="flex justify-center mt-1 sm:mt-2 mb-2 sm:mb-4"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            <div
              className="booking-form-card w-full max-w-lg rounded-xl px-4 sm:px-5 py-4 sm:py-8 text-left"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.45)",
                boxShadow: "0 8px 40px 0 rgba(31, 38, 135, 0.14)",
              }}
            >
              {/* Header */}
              <div className="text-center mb-3 sm:mb-4">
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "1.25rem",
                    color: "#000000",
                  }}
                >
                  Book Your Journey
                </h3>
                <p
                  className="hidden sm:block"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: "0.75rem",
                    lineHeight: 1.4,
                    color: "#000000",
                  }}
                >
                  Choose vehicle & plan your Sri Lankan trip
                </p>
              </div>

              {/* Vehicle Selection */}
              <div className="mb-4">
                <label
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#000000",
                    display: "block",
                    marginBottom: "0.6rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  SELECT VEHICLE
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {vehicleTypes.map((vehicle) => (
                    <button
                      key={vehicle.name}
                      onClick={() => handleVehicleCardClick(vehicle.name)}
                      style={{
                        background: formData.vehicleType === vehicle.name
                          ? "rgba(255,255,255,0.28)"
                          : "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: formData.vehicleType === vehicle.name
                          ? "2px solid #0d9488"
                          : "1.5px solid rgba(255,255,255,0.42)",
                        borderRadius: "10px",
                        padding: "0.7rem 0.4rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.background = "rgba(255,255,255,0.34)";
                        el.style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.background = formData.vehicleType === vehicle.name
                          ? "rgba(255,255,255,0.28)"
                          : "rgba(255,255,255,0.14)";
                        el.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: "40px",
                        height: "40px",
                        marginBottom: "0.3rem",
                        position: "relative",
                        filter: "brightness(0) invert(0)", // black icons
                      }}>
                        <Image
                          src={vehicle.icon}
                          alt={vehicle.name}
                          fill
                          style={{ objectFit: "contain" }}
                          sizes="40px"
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "#000000",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {vehicle.name}
                      </div>
                      {formData.vehicleType === vehicle.name && (
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            color: "#0d9488",
                            fontSize: "0.9rem",
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {formData.vehicleName && (
                  <div style={{ marginTop: "0.6rem" }}>
                    <div
                      style={{
                        padding: "0.5rem 0.8rem",
                        background: "rgba(13,148,136,0.12)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid rgba(13,148,136,0.45)",
                        borderRadius: "16px",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.72rem",
                          color: "#000000",
                          fontWeight: 500,
                        }}
                      >
                        {formData.vehicleType} - {formData.vehicleName}
                        {formData.tripType && ` • ${formData.tripType}`}
                      </span>
                    </div>

                    {/* Max Persons and Max Bags Display */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div
                        style={{
                          flex: 1,
                          padding: "0.4rem 0.7rem",
                          background: "rgba(255,255,255,0.18)",
                          backdropFilter: "blur(12px)",
                          border: "1.5px solid rgba(255,255,255,0.45)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>👥</span>
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "0.7rem",
                            color: "#000000",
                            fontWeight: 600,
                          }}
                        >
                          Max {formData.maxPersons} {formData.maxPersons === 1 ? 'Person' : 'Persons'}
                        </span>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          padding: "0.4rem 0.7rem",
                          background: "rgba(255,255,255,0.18)",
                          backdropFilter: "blur(12px)",
                          border: "1.5px solid rgba(255,255,255,0.45)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>🧳</span>
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "0.7rem",
                            color: "#000000",
                            fontWeight: 600,
                          }}
                        >
                          Max {formData.maxBags} {formData.maxBags === 1 ? 'Bag' : 'Bags'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup + Destinations + Dropoff Timeline */}
              <div className="mb-4">
                <label
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#000000",
                    display: "block",
                    marginBottom: "0.6rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  ROUTE
                </label>

                {/* Timeline container */}
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0 }}>

                  {/* Vertical line */}
                  <div style={{
                    position: "absolute",
                    left: "11px",
                    top: "18px",
                    bottom: "18px",
                    width: "2px",
                    background: "linear-gradient(to bottom, #0d9488, #3b82f6, #0d9488)",
                    borderRadius: "2px",
                    zIndex: 0,
                  }} />

                  {/* PICKUP */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2.5px solid rgba(255,255,255,0.8)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "white" }} />
                    </div>
                    <input
                      type="text"
                      value={formData.pickupLocation}
                      onChange={(e) => handleChange('pickupLocation', e.target.value)}
                      placeholder="Pickup location"
                      style={{
                        flex: 1,
                        padding: "0.6rem 0.85rem",
                        background: "rgba(34,197,94,0.1)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid rgba(34,197,94,0.4)",
                        borderRadius: "8px",
                        color: "#000000",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.82rem",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = "rgba(34,197,94,0.18)";
                        e.currentTarget.style.borderColor = "#22c55e";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                        e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)";
                      }}
                    />
                  </div>

                  {/* INTERMEDIATE DESTINATIONS */}
                  {destinations.map((dest, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", position: "relative", zIndex: 1 }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#0d9488",
                        border: "2.5px solid rgba(255,255,255,0.8)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        color: "white",
                        fontWeight: 700,
                        fontFamily: "'Montserrat', sans-serif",
                      }}>
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={dest}
                        onChange={(e) => updateDestination(index, e.target.value)}
                        placeholder={`Stop ${index + 1}`}
                        style={{
                          flex: 1,
                          padding: "0.6rem 0.85rem",
                          background: "rgba(13,148,136,0.08)",
                          backdropFilter: "blur(12px)",
                          border: "1.5px solid rgba(13,148,136,0.3)",
                          borderRadius: "8px",
                          color: "#000000",
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.82rem",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.background = "rgba(13,148,136,0.15)";
                          e.currentTarget.style.borderColor = "#0d9488";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = "rgba(13,148,136,0.08)";
                          e.currentTarget.style.borderColor = "rgba(13,148,136,0.3)";
                        }}
                      />
                      <button
                        onClick={() => removeDestination(index)}
                        style={{
                          flexShrink: 0,
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          border: "1.5px solid rgba(239,68,68,0.4)",
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          transition: "all 0.2s ease",
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                          e.currentTarget.style.borderColor = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* ADD DESTINATION button */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "24px", flexShrink: 0 }} />
                    <button
                      onClick={addDestination}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.85rem",
                        background: "rgba(13,148,136,0.08)",
                        border: "1.5px dashed rgba(13,148,136,0.5)",
                        borderRadius: "8px",
                        color: "#0f766e",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.73rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "0.03em",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(13,148,136,0.18)";
                        e.currentTarget.style.borderColor = "rgba(13,148,136,0.9)";
                        e.currentTarget.style.color = "#0d9488";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(13,148,136,0.08)";
                        e.currentTarget.style.borderColor = "rgba(13,148,136,0.5)";
                        e.currentTarget.style.color = "#0f766e";
                      }}
                    >
                      <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
                      ADD DESTINATION
                    </button>
                  </div>

                  {/* DROPOFF */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "2.5px solid rgba(255,255,255,0.8)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "white" }} />
                    </div>
                    <input
                      type="text"
                      value={formData.dropoffLocation}
                      onChange={(e) => handleChange('dropoffLocation', e.target.value)}
                      placeholder="Drop-off location"
                      style={{
                        flex: 1,
                        padding: "0.6rem 0.85rem",
                        background: "rgba(239,68,68,0.08)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid rgba(239,68,68,0.35)",
                        borderRadius: "8px",
                        color: "#000000",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.82rem",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                        e.currentTarget.style.borderColor = "#ef4444";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* Date and Days */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "#000000",
                      display: "block",
                      marginBottom: "0.4rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    DATE & TIME
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => handleChange('dateTime', e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      background: "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "7px",
                      color: "#000000",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                      colorScheme: "light",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(13,148,136,0.1)";
                      e.currentTarget.style.borderColor = "#0d9488";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "#000000",
                      display: "block",
                      marginBottom: "0.4rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    DAYS
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfDays}
                    onChange={(e) => handleChange('numberOfDays', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      background: "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "7px",
                      color: "#000000",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(13,148,136,0.1)";
                      e.currentTarget.style.borderColor = "#0d9488";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                    }}
                  />
                </div>
              </div>

              {totalPrice > 0 && (
                <div
                  style={{
                    background: "rgba(13,148,136,0.12)",
                    backdropFilter: "blur(12px)",
                    border: "1.5px solid rgba(13,148,136,0.40)",
                    borderRadius: "7px",
                    padding: "0.35rem 0.9rem",
                    marginBottom: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.72rem",
                      color: "#000000",
                      display: "block",
                      marginBottom: "0.15rem",
                    }}
                  >
                    Est. Price
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#000000",
                    }}
                  >
                    LKR {totalPrice.toLocaleString()}
                  </span>
                </div>
              )}

              {/* CTA button */}
              <div style={{ marginBottom: "1rem" }}>
                <button
                  onClick={handleRequestBooking}
                  disabled={!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime}
                  className="inline-flex items-center justify-center text-white uppercase w-full"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.82rem",
                    letterSpacing: "0.04em",
                    border: "1.8px solid #0d9488",
                    borderRadius: "9999px",
                    padding: "0.72rem 1.6rem",
                    marginTop: "0.5rem",
                    background: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                      ? "linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)"
                      : "rgba(13,148,136,0.35)",
                    backdropFilter: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                      ? "none"
                      : "blur(10px)",
                    color: "#ffffff",
                    transition: "all 0.3s ease",
                    cursor: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                      ? "pointer"
                      : "not-allowed",
                  }}
                  onMouseEnter={(e) => {
                    if (formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime) {
                      const el = e.currentTarget;
                      el.style.background = "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)";
                      el.style.transform = "translateY(-2px)";
                      el.style.boxShadow = "0 10px 30px rgba(13,148,136,0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime) {
                      const el = e.currentTarget;
                      el.style.background = "linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)";
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = "none";
                    }
                  }}
                >
                  Request Booking
                  <span className="ml-2 inline-block" style={{ transition: "transform 0.3s ease" }}>
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE INDICATOR DOTS */}
      <div
        className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex items-center justify-center gap-3"
        style={{ zIndex: 15 }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 ease-in-out"
            style={{
              width: i === current ? "30px" : "10px",
              height: "10px",
              borderRadius: i === current ? "5px" : "50%",
              background: i === current ? "#C9A961" : "rgba(255,255,255,0.4)",
              border: `1px solid ${i === current ? "#C9A961" : "rgba(255,255,255,0.6)"}`,
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* SCROLL INDICATOR */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 hidden sm:block"
        style={{ zIndex: 10, animation: "fadeIn 1s ease-out 1s both" }}
      >
        <div className="flex flex-col items-center">
          <span
            className="text-white block mb-2"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Scroll
          </span>
          <div
            className="mx-auto"
            style={{
              width: "1px",
              height: "50px",
              background: "linear-gradient(to bottom, #C9A961, transparent)",
              animation: "scrollLineMove 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ─── VEHICLE MODEL DIALOG ─── */}
      <Dialog
        open={openVehicleDialog}
        onClose={() => setOpenVehicleDialog(false)}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 480,
            m: 2,
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(201,169,110,0.2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(201,169,110,0.1)',
            overflow: 'hidden',
          }
        }}
        BackdropProps={{ sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          background: 'linear-gradient(135deg, #fffdf7 0%, #fef9ec 100%)',
          borderBottom: '1px solid rgba(201,169,110,0.18)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem', fontWeight: 700,
              color: '#2D231B',
              letterSpacing: '-0.01em',
            }}>
              Select Model
            </Typography>
            <Typography sx={{
              fontSize: '0.72rem',
              color: '#c9a96e',
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mt: 0.25,
              fontWeight: 600,
            }}>
              {formData.vehicleType} Collection
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenVehicleDialog(false)}
            sx={{
              color: '#9ca3af',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              width: 36, height: 36,
              '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Model Cards Grid */}
        <DialogContent sx={{ p: 2.5, background: '#f8f9fa' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {currentCategoryVehicles.models.map((model) => {
              const isSelected = formData.vehicleName === model.name;
              return (
                <Box
                  key={model.name}
                  onClick={() => handleVehicleSelect(model.name)}
                  sx={{
                    position: 'relative',
                    p: 2,
                    borderRadius: '16px',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#c9a96e' : '#e9ecef',
                    background: isSelected
                      ? 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)'
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(201,169,110,0.2)'
                      : '0 1px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: '#c9a96e',
                      background: 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(201,169,110,0.18)',
                    },
                  }}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <Box sx={{
                      position: 'absolute', top: 10, right: 10,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c9a96e, #d4b176)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                  )}

                  {/* Vehicle icon */}
                  <Box sx={{ mb: 1.5, color: isSelected ? '#c9a96e' : '#b8935a' }}>
                    <DirectionsCar sx={{ fontSize: 28 }} />
                  </Box>

                  {/* Model name */}
                  <Typography sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: isSelected ? '#b8935a' : '#1e293b',
                    mb: 0.4,
                  }}>
                    {model.name}
                  </Typography>

                  {/* Description */}
                  <Typography sx={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    fontFamily: "'Montserrat', sans-serif",
                    mb: 1.5,
                  }}>
                    {model.description}
                  </Typography>

                  {/* Stats badges */}
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.4,
                      px: 0.75, py: 0.25,
                      borderRadius: '8px',
                      background: 'rgba(201,169,110,0.1)',
                      border: '1px solid rgba(201,169,110,0.25)',
                    }}>
                      <Group sx={{ fontSize: 11, color: '#c9a96e' }} />
                      <Typography sx={{ fontSize: '0.65rem', color: '#b8935a', fontWeight: 600 }}>{model.maxPersons}</Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.4,
                      px: 0.75, py: 0.25,
                      borderRadius: '8px',
                      background: 'rgba(201,169,110,0.1)',
                      border: '1px solid rgba(201,169,110,0.25)',
                    }}>
                      <Work sx={{ fontSize: 11, color: '#c9a96e' }} />
                      <Typography sx={{ fontSize: '0.65rem', color: '#b8935a', fontWeight: 600 }}>{model.maxBags}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ─── TRIP TYPE DIALOG ─── */}
      <Dialog
        open={openTripTypeDialog}
        onClose={() => setOpenTripTypeDialog(false)}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 380,
            m: 2,
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(201,169,110,0.2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(201,169,110,0.1)',
            overflow: 'hidden',
          }
        }}
        BackdropProps={{ sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          background: 'linear-gradient(135deg, #fffdf7 0%, #fef9ec 100%)',
          borderBottom: '1px solid rgba(201,169,110,0.18)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem', fontWeight: 700,
              color: '#2D231B',
              letterSpacing: '-0.01em',
            }}>
              Trip Type
            </Typography>
            <Typography sx={{
              fontSize: '0.72rem',
              color: '#c9a96e',
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mt: 0.25,
              fontWeight: 600,
            }}>
              Choose your journey style
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenTripTypeDialog(false)}
            sx={{
              color: '#9ca3af',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              width: 36, height: 36,
              '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Trip Type Cards */}
        <DialogContent sx={{ p: 2.5, background: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {tripTypes.map((type) => {
              const isSelected = formData.tripType === type.name;
              return (
                <Box
                  key={type.name}
                  onClick={() => handleTripTypeSelect(type.name)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2.5,
                    borderRadius: '16px',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#c9a96e' : '#e9ecef',
                    background: isSelected
                      ? 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)'
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    overflow: 'hidden',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(201,169,110,0.2)'
                      : '0 1px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: '#c9a96e',
                      background: 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 6px 20px rgba(201,169,110,0.18)',
                    },
                  }}
                >
                  {/* Left accent bar */}
                  {isSelected && (
                    <Box sx={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: '3px',
                      background: 'linear-gradient(to bottom, #b8935a, #c9a96e, #d4b176)',
                      borderRadius: '0 2px 2px 0',
                    }} />
                  )}

                  {/* Icon */}
                  <Box sx={{
                    width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.08) 100%)'
                      : 'rgba(201,169,110,0.07)',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(201,169,110,0.45)' : '#e9ecef',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? '#c9a96e' : '#b8935a',
                    fontSize: 26,
                    transition: 'all 0.22s ease',
                  }}>
                    {type.icon}
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.98rem',
                      color: isSelected ? '#b8935a' : '#1e293b',
                      mb: 0.3,
                      transition: 'color 0.22s ease',
                    }}>
                      {type.name}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontFamily: "'Montserrat', sans-serif",
                    }}>
                      {type.description}
                    </Typography>
                  </Box>

                  {/* Selected indicator */}
                  {isSelected && (
                    <Box sx={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #c9a96e, #d4b176)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#fff' }} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openPersonalDialog}
        onClose={() => setOpenPersonalDialog(false)}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 400,
            m: 2,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.65rem',
          fontWeight: 700,
          color: '#2D231B',
          pb: 1,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Almost There
          <IconButton
            onClick={() => setOpenPersonalDialog(false)}
            sx={{ color: 'rgba(0,0,0,0.4)', '&:hover': { color: '#ef4444' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <AccountCircle style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#C9A961', zIndex: 1 }} />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: 'rgba(0,0,0,0.02)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C9A961';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(201, 169, 97, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.background = 'rgba(0,0,0,0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#C9A961', zIndex: 1, fontSize: '1.2rem' }} />
              <input
                type="tel"
                placeholder="Telephone"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: 'rgba(0,0,0,0.02)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C9A961';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(201, 169, 97, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.background = 'rgba(0,0,0,0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Email style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#C9A961', zIndex: 1, fontSize: '1.2rem' }} />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: 'rgba(0,0,0,0.02)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C9A961';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(201, 169, 97, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.background = 'rgba(0,0,0,0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                background: 'rgba(0,0,0,0.02)',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C9A961';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 4px rgba(201, 169, 97, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                e.target.style.background = 'rgba(0,0,0,0.02)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSendRequest}
              style={{
                padding: '1.1rem',
                background: 'linear-gradient(135deg, #C9A961 0%, #B3924D 100%)',
                color: '#2D231B',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: "'Montserrat', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 20px rgba(201, 169, 97, 0.2)',
                marginTop: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(201, 169, 97, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(201, 169, 97, 0.2)';
              }}
            >
              Confirm Booking
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* KEYFRAMES + GOOGLE FONTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

        @keyframes kenBurns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes scrollLineMove {
          0%, 100% { height: 30px; opacity: 0.5; }
          50%      { height: 50px; opacity: 1; }
        }

        input::placeholder {
          color: rgba(0, 0, 0, 0.45);
        }

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0);
          cursor: pointer;
        }

        .booking-form-card {
          position: relative;
          isolation: isolate;
        }
        
        .booking-form-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </section >
  );
}