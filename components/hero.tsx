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
} from '@mui/material';
import {
  DirectionsBus,
  Close as CloseIcon,
  DriveEta,
  CheckCircle,
  AirportShuttle,
  LocalTaxi,
} from '@mui/icons-material';
import Image from 'next/image';

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
    icon: '/car.png',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  { 
    name: 'Bus', 
    icon: '/car.png',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  { 
    name: 'SUV', 
    icon: '/car.png',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
];

const tripTypes = [
  { 
    name: 'Drop', 
    description: 'Single destination trip',
    icon: '🎯'
  },
  { 
    name: 'Return', 
    description: 'Return to starting point',
    icon: '🔄'
  },
];

const sampleVehicles = {
  Car: {
    models: [
      { name: 'Alto', description: 'Compact & Efficient' },
      { name: 'Wagon R', description: 'Spacious Interior' },
      { name: 'Aqua', description: 'Hybrid Technology' },
      { name: 'Axio', description: 'Premium Comfort' },
    ]
  },
  Van: {
    models: [
      { name: 'KDH High Roof', description: 'Extra headroom' },
      { name: 'KDH Flat Roof', description: 'Classic style' },
      { name: 'Dual AC Van', description: 'Dual climate control' },
      { name: 'Non-AC Van', description: 'Budget friendly' },
    ]
  },
  Bus: {
    models: [
      { name: 'AC 29 Seater', description: 'Air conditioned comfort' },
      { name: 'Non-AC 29 Seater', description: 'Economical choice' }, 
    ]
  },
  SUV: {
    models: [
      { name: 'Prado', description: 'Luxury 4x4' },
      { name: 'Fortuner', description: 'Premium SUV' }, 
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
  });

  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openTripTypeDialog, setOpenTripTypeDialog] = useState(false);
  const [openPersonalDialog, setOpenPersonalDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

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
    setFormData((prev) => ({
      ...prev,
      vehicleType: selectedCategory,
      vehicleName: modelName,
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

  const handleSendRequest = () => {
    console.log('Booking request submitted:', formData);
    alert('Booking request sent successfully!');
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
    });
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
      style={{ height: "100vh", minHeight: "700px" }}
      className="relative w-full overflow-hidden"
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
        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{ zIndex: 10 }}
      >
        <div className="w-full max-w-4xl">

          {/* Headline */}
          <div className="mb-4" style={{ animation: "fadeInUp 1s ease-out" }}>
            <h1
              className="text-white font-semibold tracking-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                lineHeight: 1.1,
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                marginBottom: "1.5rem",
              }}
            >
              SENU TOURS
            </h1>

            <p
              className="text-white uppercase"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                letterSpacing: "0.05em",
                fontSize: "clamp(0.75rem, 2vw, 1.125rem)",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                opacity: 0.95,
              }}
            >
              Your Home, Your Journey, Your Hospitality Haven
            </p>
          </div>

          {/* Booking Form Card */}
          <div
            className="flex justify-center mt-4 mb-4"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            <div
              className="booking-form-card w-full max-w-lg rounded-xl px-5 py-10 text-left"
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.35)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h3
                  className="text-white mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "1.45rem",
                  }}
                >
                  Book Your Journey
                </h3>
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.85)",
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
                    color: "rgba(255,255,255,0.92)",
                    display: "block",
                    marginBottom: "0.6rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  SELECT VEHICLE
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.6rem" }}>
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
                          ? "2px solid #C9A961" 
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
                          color: "white",
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
                            color: "#C9A961",
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
                  <div
                    style={{
                      marginTop: "0.6rem",
                      padding: "0.35rem 0.8rem",
                      background: "rgba(201,169,97,0.24)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(201,169,97,0.55)",
                      borderRadius: "16px",
                      display: "inline-block",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.72rem",
                        color: "#C9A961",
                        fontWeight: 500,
                      }}
                    >
                      {formData.vehicleType} - {formData.vehicleName}
                      {formData.tripType && ` • ${formData.tripType}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Pickup + Dropoff */}
              <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.1rem" }}>
                <div style={{ flex: 1, maxWidth: "48%" }}>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.92)",
                      display: "block",
                      marginBottom: "0.4rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    PICKUP
                  </label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => handleChange('pickupLocation', e.target.value)}
                    placeholder="Starting point"
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      background: "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "7px",
                      color: "white",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.24)";
                      e.currentTarget.style.borderColor = "#C9A961";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                    }}
                  />
                </div>

                <div style={{ flex: 1, maxWidth: "48%" }}>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.92)",
                      display: "block",
                      marginBottom: "0.4rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    DROPOFF
                  </label>
                  <input
                    type="text"
                    value={formData.dropoffLocation}
                    onChange={(e) => handleChange('dropoffLocation', e.target.value)}
                    placeholder="Destination"
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      background: "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "7px",
                      color: "white",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.24)";
                      e.currentTarget.style.borderColor = "#C9A961";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                    }}
                  />
                </div>
              </div>

              {/* Date and Days */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1.1rem" }}>
                <div>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.92)",
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
                      color: "white",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                      colorScheme: "dark",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.24)";
                      e.currentTarget.style.borderColor = "#C9A961";
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
                      color: "rgba(255,255,255,0.92)",
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
                      color: "white",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.24)";
                      e.currentTarget.style.borderColor = "#C9A961";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                    }}
                  />
                </div>
              </div>

              {/* Price Display */}
              {totalPrice > 0 && (
                <div
                  style={{
                    background: "rgba(201,169,97,0.18)",
                    backdropFilter: "blur(12px)",
                    border: "1.5px solid rgba(201,169,97,0.50)",
                    borderRadius: "7px",
                    padding: "0.5rem 0.9rem",
                    marginBottom: "1.1rem",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.85)",
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
                      color: "#C9A961",
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
                    border: "1.8px solid #C9A961",
                    borderRadius: "9999px",
                    padding: "0.72rem 1.6rem",
                    marginTop: "0.5rem",
                    background: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime 
                      ? "#C9A961" 
                      : "rgba(201,169,97,0.35)",
                    backdropFilter: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime 
                      ? "none" 
                      : "blur(10px)",
                    color: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime 
                      ? "#2D231B" 
                      : "rgba(255,255,255,0.7)",
                    transition: "all 0.3s ease",
                    cursor: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime 
                      ? "pointer" 
                      : "not-allowed",
                  }}
                  onMouseEnter={(e) => {
                    if (formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime) {
                      const el = e.currentTarget;
                      el.style.background = "rgba(201,169,97,0.9)";
                      el.style.transform = "translateY(-2px)";
                      el.style.boxShadow = "0 10px 30px rgba(201,169,97,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime) {
                      const el = e.currentTarget;
                      el.style.background = "#C9A961";
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
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-3"
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

      {/* DIALOGS */}
      <Dialog open={openVehicleDialog} onClose={() => setOpenVehicleDialog(false)}>
        <DialogTitle>Select Vehicle Model</DialogTitle>
        <DialogContent>
          <List>
            {currentCategoryVehicles.models.map((model) => (
              <ListItemButton
                key={model.name}
                onClick={() => handleVehicleSelect(model.name)}
              >
                <ListItemText primary={model.name} secondary={model.description} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={openTripTypeDialog} onClose={() => setOpenTripTypeDialog(false)}>
        <DialogTitle>Select Trip Type</DialogTitle>
        <DialogContent>
          <List>
            {tripTypes.map((type) => (
              <ListItemButton
                key={type.name}
                onClick={() => handleTripTypeSelect(type.name)}
              >
                <ListItemText primary={`${type.icon} ${type.name}`} secondary={type.description} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={openPersonalDialog} onClose={() => setOpenPersonalDialog(false)}>
        <DialogTitle>Personal Information</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="tel"
              placeholder="Telephone"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleSendRequest}
              style={{
                padding: '0.9rem',
                background: '#C9A961',
                color: '#2D231B',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Send Booking Request
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
          color: rgba(255, 255, 255, 0.55);
        }

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
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
    </section>
  );
}