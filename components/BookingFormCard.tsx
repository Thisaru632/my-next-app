"use client";

import React from 'react';
import Image from 'next/image';
import { CalendarMonth, Redeem as GiftIcon, TrendingFlat, Loop } from '@mui/icons-material';
import { LocationInput } from './LocationInput';
import { useHeroBooking } from './useHeroBooking';

const vehicleTypes = [
  { name: 'Car', icon: '/car.png' },
  { name: 'Van', icon: '/van.png' },
  { name: 'Bus', icon: '/school-bus (1).png' },
  { name: 'SUV', icon: '/suv.png' },
];

interface BookingFormCardProps {
  booking: ReturnType<typeof useHeroBooking>;
}

export function BookingFormCard({ booking: h }: BookingFormCardProps) {
  return (
    <div className="booking-form-card w-full max-w-md rounded-xl px-4 sm:px-5 py-3 sm:py-5 text-left" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 8px 40px 0 rgba(31, 38, 135, 0.14)", flexShrink: 0 }}>
      <div className="text-center mb-2 sm:mb-3">
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "1.15rem", color: "#000000" }}>Get a fare estimate</h3>
        <p className="hidden sm:block" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.72rem", lineHeight: 1.4, color: "#000000", opacity: 0.85 }}>Choose vehicle & plan your trip</p>
      </div>

      {/* Promo Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0px", marginBottom: "6px" }}>
        <button type="button"
          onClick={() => h.setOpenPromoDialog(true)}
          style={{ background: "transparent", border: "none", color: "#0d9488", fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", padding: "4px 12px", display: "flex", alignItems: "center", gap: "6px", borderRadius: "20px" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(13,148,136,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <GiftIcon style={{ fontSize: '18px' }} /> Add promo code
        </button>
      </div>

      {/* Trip Type Selection */}
      <div className="mb-4">
        <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <button 
            type="button"
            onClick={() => h.handleTripTypeSelect('Drop')}
            style={{ 
              flex: 1, 
              padding: "0.6rem 0.5rem", 
              borderRadius: "10px", 
              border: "none",
              background: h.formData.tripType === 'Drop' ? "rgba(13,148,136,1)" : "transparent",
              boxShadow: h.formData.tripType === 'Drop' ? "0 4px 12px rgba(13,148,136,0.3)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem", fontWeight: 700,
              color: h.formData.tripType === 'Drop' ? "#ffffff" : "#000000",
              transition: "all 0.3s ease"
            }}
          >
            <TrendingFlat style={{ fontSize: '1.1rem' }} /> Single Drop
          </button>
          <button 
            type="button"
            onClick={() => h.handleTripTypeSelect('Return')}
            style={{ 
              flex: 1, 
              padding: "0.6rem 0.5rem", 
              borderRadius: "10px", 
              border: "none",
              background: h.formData.tripType === 'Return' ? "rgba(13,148,136,1)" : "transparent",
              boxShadow: h.formData.tripType === 'Return' ? "0 4px 12px rgba(13,148,136,0.3)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem", fontWeight: 700,
              color: h.formData.tripType === 'Return' ? "#ffffff" : "#000000",
              transition: "all 0.3s ease"
            }}
          >
            <Loop style={{ fontSize: '1.1rem' }} /> Return Trip
          </button>
        </div>
      </div>



      {/* Route Timeline */}
      <div className="mb-3">
        <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: "#000000", display: "block", marginBottom: "0.4rem", letterSpacing: "0.04em", opacity: 0.8 }}>ROUTE</label>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ position: "absolute", left: "10px", top: "16px", bottom: "16px", width: "2px", background: "linear-gradient(to bottom, #0d9488, #3b82f6, #0d9488)", borderRadius: "2px", zIndex: 0 }} />
          {/* Pickup */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem", position: "relative", zIndex: 50 }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#22c55e", border: "2px solid rgba(255,255,255,0.8)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              <LocationInput
                value={h.formData.pickupLocation} onChange={(val) => h.handleChange('pickupLocation', val)}
                onSelect={(lat, lon) => { const coords = { lat, lon }; h.setPickupCoords(coords); if (h.formData.tripType === 'Return') h.setDropoffCoords(coords); }}
                onManualType={() => { h.setPickupCoords(null); if (h.formData.tripType === 'Return') h.setDropoffCoords(null); }}
                placeholder="From"
                inputStyle={{ flex: 1, padding: "0.5rem 0.75rem", background: "rgba(34,197,94,0.1)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(34,197,94,0.4)", borderRadius: "8px", color: "#000000", fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem", outline: "none" }}
                onFocusStyle={{ background: "rgba(34,197,94,0.18)", border: "1.5px solid #22c55e" }}
                onBlurStyle={{ background: "rgba(34,197,94,0.1)", border: "1.5px solid rgba(34,197,94,0.4)" }}
                showMyLocation={true}
                showMapIcon={false}
              />
              <button onClick={h.addDestination} title="Add Stop" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(13,148,136,1)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, zIndex: 10, transition: 'all 0.2s ease', padding: 0, lineHeight: 1 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0f766e'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0d9488'; }}>+</button>
            </div>
          </div>
          {/* Stops */}
          {h.destinations.map((dest, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem", position: "relative", zIndex: 40 - index }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0d9488", border: "2px solid rgba(255,255,255,0.8)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "white", fontWeight: 700 }}>{index + 1}</div>
              <LocationInput value={dest} onChange={(val) => h.updateDestination(index, val)} onSelect={(lat, lon) => h.setStopCoords((prev) => prev.map((c, i) => i === index ? { lat, lon } : c))} placeholder={`Stop ${index + 1}`}
                inputStyle={{ flex: 1, padding: "0.5rem 0.75rem", background: "rgba(13,148,136,0.08)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(13,148,136,0.3)", borderRadius: "8px", color: "#000000", fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem", outline: "none" }}
                onFocusStyle={{ background: "rgba(13,148,136,0.15)", border: "1.5px solid #0d9488" }} onBlurStyle={{ background: "rgba(13,148,136,0.08)", border: "1.5px solid rgba(13,148,136,0.3)" }} showMyLocation={true} />
              <button onClick={() => h.removeDestination(index)} style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", border: "1.5px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>✕</button>
            </div>
          ))}
          {/* Dropoff */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", position: "relative", zIndex: 1 }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#ef4444", border: "2px solid rgba(255,255,255,0.8)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />
            </div>
            <LocationInput
              value={h.formData.tripType === 'Return' ? 'Same as From Location' : h.formData.dropoffLocation}
              onChange={(val) => h.handleChange('dropoffLocation', val)}
              onSelect={(lat, lon) => h.setDropoffCoords({ lat, lon })}
              onManualType={() => { h.setDropoffCoords(null); }}
              placeholder="To" disabled={h.formData.tripType === 'Return'}
              inputStyle={{ flex: 1, padding: "0.5rem 0.75rem", background: h.formData.tripType === 'Return' ? "rgba(224,224,224,0.15)" : "rgba(239,68,68,0.08)", backdropFilter: "blur(12px)", border: h.formData.tripType === 'Return' ? "1.5px solid rgba(0,0,0,0.1)" : "1.5px solid rgba(239,68,68,0.35)", borderRadius: "8px", color: h.formData.tripType === 'Return' ? "#666666" : "#000000", fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem", outline: "none", fontWeight: h.formData.tripType === 'Return' ? 600 : 400 }}
              onFocusStyle={{ background: "rgba(239,68,68,0.15)", border: "1.5px solid #ef4444" }}
              onBlurStyle={{ background: h.formData.tripType === 'Return' ? "rgba(224,224,224,0.15)" : "rgba(239,68,68,0.08)", border: h.formData.tripType === 'Return' ? "1.5px solid rgba(0,0,0,0.1)" : "1.5px solid rgba(239,68,68,0.35)" }}
              showMyLocation={h.formData.tripType !== 'Return'}
            />
          </div>
        </div>
      </div>

      {/* Date + Days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem", fontWeight: 500, color: "#000000", display: "block", letterSpacing: "0.04em", opacity: 0.8 }}>PICKUP DATE & TIME</label>
          <div style={{ position: 'relative' }}>
            <CalendarMonth style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#0d9488', pointerEvents: 'none', zIndex: 1 }} />
            <div onClick={() => { if (h.formData.dateTime) { const parts = h.formData.dateTime.split('T'); h.setTempDate(parts[0]); h.setTempTime(parts[1] || ""); } else { h.setTempDate(""); h.setTempTime(""); } h.setPickerStep(0); h.setOpenDateTimePicker(true); }}
              style={{ width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.2rem", background: "rgba(255,255,255,0.16)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: "10px", color: h.formData.dateTime ? "#000000" : "rgba(0,0,0,0.45)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: '38px' }}>
              {h.formData.dateTime ? (() => { const hasTime = h.formData.dateTime.includes('T'); const dt = new Date(h.formData.dateTime); const datePart = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); return hasTime ? datePart + ' - ' + dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : datePart; })() : 'Select Date & Time'}
            </div>
          </div>
        </div>
        <div>
          <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem", fontWeight: 500, color: "#000000", display: "block", marginBottom: "0.2rem", letterSpacing: "0.04em", opacity: 0.8 }}>DAYS</label>
          <div onClick={() => { if (h.formData.tripType !== 'Drop') { h.setTempDays(h.formData.numberOfDays || 1); h.setOpenDayPicker(true); } }}
            style={{ width: "100%", padding: "0.6rem 0.75rem", background: h.formData.tripType === 'Drop' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.16)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: "10px", color: h.formData.tripType === 'Drop' ? "rgba(0,0,0,0.4)" : "#000000", fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", cursor: h.formData.tripType === 'Drop' ? "not-allowed" : "pointer", opacity: h.formData.tripType === 'Drop' ? 0.6 : 1, display: 'flex', alignItems: 'center', minHeight: '38px' }}>
            {h.formData.tripType === 'Drop' ? '0 Days' : (h.formData.numberOfDays ? `${h.formData.numberOfDays} ${h.formData.numberOfDays === 1 ? 'Day' : 'Days'}` : 'Select Days')}
          </div>
        </div>
      </div>


      {/* Vehicle Type Selection */}
      <div className="mb-3">
        <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: "#000000", display: "block", marginBottom: "0.4rem", letterSpacing: "0.04em", opacity: 0.8 }}>SELECT VEHICLE</label>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {vehicleTypes.map((vehicle) => (
            <button key={vehicle.name} onClick={() => h.handleVehicleCardClick(vehicle.name)}
              style={{ background: h.formData.vehicleType === vehicle.name ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.14)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: h.formData.vehicleType === vehicle.name ? "2px solid #0d9488" : "1.5px solid rgba(255,255,255,0.42)", borderRadius: "10px", padding: "0.5rem 0.3rem", cursor: "pointer", transition: "all 0.3s ease", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.34)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = h.formData.vehicleType === vehicle.name ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: "32px", height: "32px", marginBottom: "0.2rem", position: "relative" }}>
                <Image src={vehicle.icon} alt={vehicle.name} fill style={{ objectFit: "contain" }} sizes="32px" />
              </div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: "#000000" }}>{vehicle.name}</div>
              {h.formData.vehicleType === vehicle.name && <div style={{ position: "absolute", top: "4px", right: "4px", color: "#0d9488", fontSize: "0.8rem" }}>✓</div>}
            </button>
          ))}
        </div>
      </div>


      {/* Mobile View Summary Button */}
      <div className="lg:hidden mt-4" style={{ textAlign: "center" }}>
        <button 
          onClick={() => document.getElementById('trip-summary-section')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ 
            width: "100%", padding: "0.75rem", borderRadius: "10px", 
            border: "1.5px solid #0d9488", background: "rgba(13,148,136,0.08)", 
            color: "#0d9488", fontFamily: "'Montserrat', sans-serif", 
            fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", 
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(13,148,136,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(13,148,136,0.08)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
          View Trip Summary
        </button>
      </div>

    </div>
  );
}
