"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Snackbar, Alert } from '@mui/material';
import { TrendingFlat, Loop } from '@mui/icons-material';
import Image from 'next/image';
import AuthModal from './AuthModal';
import RouteViewer from './RouteViewer';
import NearbyViewer from './NearbyViewer';
import { PolicyDialog } from './PolicyDialog';
import { CloseConfirmDialog } from './CloseConfirmDialog';
import { LoginRequiredDialog } from './LoginRequiredDialog';
import { CallPopupDialog } from './CallPopupDialog';
import { DropHireSuggestionDialog } from './DropHireSuggestionDialog';
import { PersonalDialog } from './PersonalDialog';
import { VehiclePhotosDialog } from './VehiclePhotosDialog';
import { DateTimePickerDialog } from './DateTimePickerDialog';
import { DayPickerDialog } from './DayPickerDialog';
import { VehicleModelDialog, TripTypeDialog, PromoDialog, ProvinceBlockDialog } from './BookingDialogs';
import { CustomCalendar } from './CustomCalendar';
import { useHeroBooking } from './useHeroBooking';
import { BookingFormCard } from './BookingFormCard';
import { TripSummaryCard } from './TripSummaryCard';

const SLIDES = [
  { src: "/hero/beautiful-woman-dress-by-waterfall.webp", alt: "Woman by waterfall" },
  { src: "/hero/female-tourists.webp", alt: "Tourists exploring" },
  { src: "/hero/island.webp", alt: "Tropical Island" },
  { src: "/hero/promodhya-abeysekara-gjd-7_3Ek_w-unsplash.webp", alt: "Beach view" },
  { src: "/hero/two-individuals-carrying-backpacks-standing-hill-gazing-lake.webp", alt: "Gazing at lake" },
  { src: "/hero/young-woman-traveling-beach-against-backdrop-old-ship.webp", alt: "Woman by beach" },
];
const INTERVAL_MS = 6000;

const tripTypes = [
  { name: 'Drop', description: 'Single destination trip', icon: <TrendingFlat /> },
  { name: 'Return', description: 'Return to starting point', icon: <Loop /> },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [kenKey, setKenKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);

  const h = useHeroBooking();

  useEffect(() => { setImagesLoaded(true); }, []);

  const next = useCallback(() => {
    setCurrent((prev) => { const n = (prev + 1) % SLIDES.length; setKenKey((k) => k + 1); return n; });
  }, []);

  useEffect(() => {
    if (paused || !imagesLoaded) return;
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, next, imagesLoaded]);

  const lastDirtyRef = useRef(false);

  // Prevent accidental navigation if form is dirty
  useEffect(() => {
      if (!h.isFormDirty) {
          lastDirtyRef.current = false;
          return;
      }

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          e.preventDefault();
          e.returnValue = "You have unsaved changes in your booking. Are you sure you want to leave?";
          return e.returnValue;
      };

      const handlePopState = (e: PopStateEvent) => {
          if (h.isFormDirty) {
              h.setShowBackConfirm(true);
              // Re-push current state to stay on page
              window.history.pushState(null, "", window.location.pathname);
          }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      
      // Push initial state to let us catch the NEXT back button press ONLY ONCE
      if (!lastDirtyRef.current) {
          window.history.pushState(null, "", window.location.pathname);
          lastDirtyRef.current = true;
      }
      
      window.addEventListener("popstate", handlePopState);

      return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
          window.removeEventListener("popstate", handlePopState);
      };
  }, [h.isFormDirty, h.setShowBackConfirm]);

  const goTo = (i: number) => { setCurrent(i); setKenKey((k) => k + 1); };

  return (
    <section
      className="relative w-full overflow-hidden transition-all duration-500 ease-in-out hero-container"
      style={{ height: "auto", display: "flex", flexDirection: "column", background: "#071d24" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* SLIDE STACK */}
      {SLIDES.map((slide, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ zIndex: i === current ? 1 : 0, opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }} aria-hidden={i !== current}>
          <Image src={slide.src} alt={slide.alt} fill priority={i === 0} className="object-cover" style={{ animation: i === current ? "kenBurns 8s ease-out forwards" : "none" }} onLoadingComplete={() => { if (i === 0) setFirstImageLoaded(true); }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(45,35,25,0.5) 50%, rgba(45,35,25,0.75) 100%)" }} />
        </div>
      ))}

      {/* HERO CONTENT */}
      <div className="relative flex-grow flex flex-col items-center justify-center px-3 sm:px-4 pt-20 sm:pt-40 pb-20 text-center transition-opacity duration-500" style={{ zIndex: 10, opacity: firstImageLoaded ? 1 : 0 }}>
        <div className="w-full max-w-4xl">
          {/* Headline */}
          <div className="mb-4 sm:mb-6 px-2" style={{ animation: "fadeInUp 1s ease-out" }}>
            <h1 className="text-white font-semibold tracking-tight mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 8vw, 4.5rem)", lineHeight: 1.1, textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>SENU TOURS</h1>
            <p className="text-white uppercase leading-relaxed mx-auto max-w-lg" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, letterSpacing: "0.08em", fontSize: "clamp(0.65rem, 2.5vw, 0.95rem)", textShadow: "0 2px 10px rgba(0,0,0,0.5)", opacity: 0.95 }}>
              Your Home, Your Journey, Your Hospitality Haven
            </p>
          </div>
 
          {/* Form and Summary */}
          <div className="flex flex-col lg:flex-row justify-center items-start gap-6 sm:gap-4 mt-2 mb-4 w-full" style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}>
            <BookingFormCard booking={h} />
            <div id="trip-summary-section" className="w-full lg:w-auto">
              <TripSummaryCard booking={h} />
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE INDICATOR DOTS */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex items-center justify-center gap-3" style={{ zIndex: 15 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} className="transition-all duration-300 ease-in-out"
            style={{ width: i === current ? "30px" : "10px", height: "10px", borderRadius: i === current ? "5px" : "50%", background: i === current ? "#C9A961" : "rgba(255,255,255,0.4)", border: `1px solid ${i === current ? "#C9A961" : "rgba(255,255,255,0.6)"}`, padding: 0, cursor: "pointer" }} />
        ))}
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 hidden sm:block" style={{ zIndex: 10, animation: "fadeIn 1s ease-out 1s both" }}>
        <div className="flex flex-col items-center">
          <span className="text-white block mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.8 }}>Scroll</span>
          <div className="mx-auto" style={{ width: "1px", height: "50px", background: "linear-gradient(to bottom, #C9A961, transparent)", animation: "scrollLineMove 2s ease-in-out infinite" }} />
        </div>
      </div>

      {/* DIALOGS */}
      <VehicleModelDialog 
        open={h.openVehicleDialog} 
        onClose={() => h.setOpenVehicleDialog(false)} 
        vehicleType={h.selectedCategory} 
        vehicleName={h.formData.vehicleName} 
        models={h.currentCategoryVehicles.models} 
        onSelect={h.handleVehicleSelect} 
        vehiclePricesMap={h.vehiclePricesMap} 
        vehicleDiscountsMap={h.vehicleDiscountsMap}
        showPrices={h.selectedCategory !== 'SUV' && (h.formData.tripType === 'Drop' 
          ? !!(h.formData.pickupLocation && h.formData.dropoffLocation) 
          : !!(h.formData.pickupLocation && h.formData.destinations[0]?.address.trim())
        )}
      />
      <TripTypeDialog open={h.openTripTypeDialog} onClose={() => h.setOpenTripTypeDialog(false)} tripType={h.formData.tripType} tripTypes={tripTypes} onSelect={h.handleTripTypeSelect} onWarn={() => { }} />
      <PromoDialog open={h.openPromoDialog} onClose={() => h.setOpenPromoDialog(false)} hasPromoOption={h.hasPromoOption} setHasPromoOption={h.setHasPromoOption} promoCodeInput={h.promoCodeInput} setPromoCodeInput={h.setPromoCodeInput} isPromoLoading={h.isPromoLoading} onSubmit={h.handlePromoSubmit} />
      <ProvinceBlockDialog open={h.showProvinceBlockDialog} onClose={() => h.setShowProvinceBlockDialog(false)} onCall={() => h.setShowCallPopup(true)} provinceName={h.blockedProvinceName} />
      <DropHireSuggestionDialog open={h.showDropHireSuggestion} onClose={() => h.setShowDropHireSuggestion(false)} onReconsider={() => { h.setShowDropHireSuggestion(false); h.setOpenTripTypeDialog(true); }} onConfirm={() => { h.setAcknowledgedDropHireSuggestion(true); h.setShowDropHireSuggestion(false); h.setOpenPersonalDialog(true); }} />
      <PersonalDialog open={h.openPersonalDialog} onClose={h.handleClosePersonalDialog} formData={h.formData} emailError={h.emailError} phoneError={h.phoneError} additionalPhoneErrors={h.additionalPhoneErrors} handleChange={h.handleChange} handleAddPhone={h.handleAddPhone} handleRemovePhone={h.handleRemovePhone} updateAdditionalPhone={h.updateAdditionalPhone} showRemark={h.showRemark} setShowRemark={h.setShowRemark} requestSent={h.requestSent} bookingRefNo={h.bookingRefNo} downloadTripSummary={h.downloadTripSummary} handleSendRequest={h.handleSendRequest} setShowCallPopup={h.setShowCallPopup} setOpenPolicyDialog={h.setOpenPolicyDialog} />
      <CallPopupDialog open={h.showCallPopup} onClose={() => h.setShowCallPopup(false)} onCopySuccess={() => { }} />
      <VehiclePhotosDialog open={h.openPhotosDialog} onClose={() => h.setOpenPhotosDialog(false)} photosVehicle={h.photosVehicle} getVehicleFolderName={h.getVehicleFolderName} />
      <DateTimePickerDialog open={h.openDateTimePicker} onClose={() => h.setOpenDateTimePicker(false)} pickerStep={h.pickerStep} setPickerStep={h.setPickerStep} tempDate={h.tempDate} setTempDate={h.setTempDate} tempHour={h.tempHour} setTempHour={h.setTempHour} tempMin={h.tempMin} setTempMin={h.setTempMin} tempAmPm={h.tempAmPm} setTempAmPm={h.setTempAmPm} minDateTime={h.minDateTime} handleChange={h.handleChange} CalendarComponent={CustomCalendar} />
      <DayPickerDialog open={h.openDayPicker} onClose={() => h.setOpenDayPicker(false)} tempDays={h.tempDays} setTempDays={h.setTempDays} handleChange={h.handleChange} routeDistance={h.routeDistance} acknowledgedDropHireSuggestion={h.acknowledgedDropHireSuggestion} setShowDropHireSuggestion={h.setShowDropHireSuggestion} />
      <PolicyDialog open={h.openPolicyDialog} onClose={() => h.setOpenPolicyDialog(false)} />
      <CloseConfirmDialog 
        open={h.showCloseConfirm} 
        onClose={() => h.setShowCloseConfirm(false)} 
        onConfirm={h.handleConfirmClose}
        title={h.requestSent ? "Wait! Close Summary?" : "Are you sure?"}
        message={h.requestSent ? "Have you downloaded your summary? You will lose this message if you leave." : "Your entered contact information will be kept, but you will leave this step."}
      />
      <CloseConfirmDialog 
        open={h.showBackConfirm} 
        onClose={() => h.setShowBackConfirm(false)} 
        onConfirm={h.handleConfirmBack}
        title="Leaving so soon?"
        message="You have entered booking details. Are you sure you want to go back? Your progress will be lost."
      />
      <LoginRequiredDialog open={h.showLoginAlert} onClose={() => h.setShowLoginAlert(false)} onConfirm={() => { h.setShowLoginAlert(false); h.setOpenAuthModal(true); }} />
      {h.openRouteViewer && <RouteViewer open={h.openRouteViewer} onClose={() => h.setOpenRouteViewer(false)} origin={h.formData.pickupLocation} destination={h.formData.dropoffLocation} waypoints={h.formData.destinations.map(d => d.address)} pickupCoords={h.pickupCoords} dropoffCoords={h.dropoffCoords} stopCoords={h.formData.destinations.map(d => h.stopCoords[d.id] || null)} apiKey="AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc" initialResponse={h.routeResponse} />}
      {h.openNearbyViewer && <NearbyViewer open={h.openNearbyViewer} onClose={() => h.setOpenNearbyViewer(false)} origin={h.formData.pickupLocation} destination={h.formData.dropoffLocation} waypoints={h.formData.destinations.map(d => d.address)} pickupCoords={h.pickupCoords} dropoffCoords={h.dropoffCoords} stopCoords={h.formData.destinations.map(d => h.stopCoords[d.id] || null)} apiKey="AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc" initialResponse={h.routeResponse} />}
      {h.openAuthModal && <AuthModal open={h.openAuthModal} onClose={() => h.setOpenAuthModal(false)} />}

      <Snackbar open={h.snackbarOpen} autoHideDuration={6000} onClose={h.handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={h.handleSnackbarClose} severity={h.snackbarSeverity} sx={{ width: '100%' }}>{h.snackbarMessage}</Alert>
      </Snackbar>

      {/* KEYFRAMES */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scrollLineMove { 0%, 100% { opacity: 0.6; transform: scaleY(0.8); } 50% { opacity: 1; transform: scaleY(1); } }
        @keyframes loc-spin { to { transform: translateY(-50%) rotate(360deg); } }
        
        @media (min-width: 1024px) {
          .hero-container { min-height: 850px; }
        }
        @media (max-width: 1023px) {
          .hero-container { min-height: 100vh; }
        }
        @media (max-width: 640px) {
          .hero-container { padding-top: 10px; }
        }
      `}</style>
    </section>
  );
}