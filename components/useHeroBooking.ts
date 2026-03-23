"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from '@/context/UserContext';
import { useJsApiLoader } from '@react-google-maps/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_ENDPOINTS } from '@/config/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc";
const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

interface PromoCode {
  _id: string; code: string; discountType: 'Percentage' | 'Fixed Amount';
  discountValue: number; applicableVehicle: string; status: string;
  validFrom: string | null; validTo: string | null;
}

export interface LatLon { lat: string; lon: string; }

export interface RateCard {
  _id: string; type: string; vehicle: string; days: number; km: number;
  hrs: number; ratePercent: string; rateAmount: number; extraKMRate: number;
  extraHrRate1: number; extraHrRate2: number; status: string;
}

export interface RateAdjustment {
  _id: string; vehicle: string; type: string; percentage: number;
  validFrom: string | null; validTo: string | null;
}

const sampleVehicles = {
  Car: {
    models: [
      { name: 'Alto', description: 'Compact & Efficient', maxPersons: 3, maxBags: 2 },
      { name: 'Wagon R', description: 'Spacious Interior', maxPersons: 3, maxBags: 2 },
      { name: 'Aqua', description: 'Hybrid Technology', maxPersons: 4, maxBags: 2 },
      { name: 'Axio', description: 'Premium Comfort', maxPersons: 4, maxBags: 2 },
    ]
  },
  Van: {
    models: [
      { name: 'KDH High Roof', description: 'Extra headroom', maxPersons: 14, maxBags: 5 },
      { name: 'KDH Flat Roof', description: 'Classic style', maxPersons: 9, maxBags: 4 },
      { name: 'Mini Van', description: 'Compact & comfortable', maxPersons: 6, maxBags: 3 },
      { name: 'Dual AC Van', description: 'Dual climate control', maxPersons: 9, maxBags: 4 },
      { name: 'NON AC VAN', description: 'Budget friendly', maxPersons: 14, maxBags: 4 },
    ]
  },
  Bus: {
    models: [
      { name: 'AC 29 Seater', description: 'Air conditioned comfort', maxPersons: 29, maxBags: 8 },
      { name: 'Non AC 29 Seater', description: 'Economical choice', maxPersons: 29, maxBags: 8 },
    ]
  },
  SUV: {
    models: [
      { name: 'Vezel', description: 'Modern Crossover', maxPersons: 4, maxBags: 3 },
    ]
  },
};

export function useHeroBooking() {
  const { user } = useUser();
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^(?:\+94|0)?[0-9]{9,10}$/;

  const [formData, setFormData] = useState({
    vehicleType: '', vehicleName: '', tripType: 'Drop', pickupLocation: '',
    dropoffLocation: '', dateTime: '', numberOfDays: '' as any,
    name: '', telephone: '', additionalPhones: [] as string[], email: '',
    remark: '', maxPersons: 0, maxBags: 0, additionalHours: 0,
  });

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });
  const [routeResponse, setRouteResponse] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name, telephone: user.phone || '', email: user.email }));
  }, [user]);

  const [minDateTime, setMinDateTime] = useState("");
  useEffect(() => {
    const minDate = new Date(new Date().getTime() + (2 * 60 * 60 * 1000) - (new Date().getTimezoneOffset() * 60000));
    setMinDateTime(minDate.toISOString().slice(0, 16));
  }, []);

  const [openPromoDialog, setOpenPromoDialog] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [hasPromoOption, setHasPromoOption] = useState<boolean | null>(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [additionalPhoneErrors, setAdditionalPhoneErrors] = useState<string[]>([]);

  const [requestSent, setRequestSent] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [openRouteViewer, setOpenRouteViewer] = useState(false);
  const [openNearbyViewer, setOpenNearbyViewer] = useState(false);
  const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
  const [submittedBookingData, setSubmittedBookingData] = useState<any>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [openDateTimePicker, setOpenDateTimePicker] = useState(false);
  const [pickerStep, setPickerStep] = useState(0);
  const [tempDate, setTempDate] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempHour, setTempHour] = useState("12");
  const [tempMin, setTempMin] = useState("00");
  const [tempAmPm, setTempAmPm] = useState("AM");
  const [openDayPicker, setOpenDayPicker] = useState(false);
  const [tempDays, setTempDays] = useState(1);
  const [pickupCoords, setPickupCoords] = useState<LatLon | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<LatLon | null>(null);
  const [stopCoords, setStopCoords] = useState<(LatLon | null)[]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showDropHireSuggestion, setShowDropHireSuggestion] = useState(false);
  const [acknowledgedDropHireSuggestion, setAcknowledgedDropHireSuggestion] = useState(false);
  const [bookingRefNo, setBookingRefNo] = useState('');
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [adjustments, setAdjustments] = useState<RateAdjustment[]>([]);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openTripTypeDialog, setOpenTripTypeDialog] = useState(false);
  const [openPersonalDialog, setOpenPersonalDialog] = useState(false);
  const [showExtraPrices, setShowExtraPrices] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [openPhotosDialog, setOpenPhotosDialog] = useState(false);
  const [photosVehicle, setPhotosVehicle] = useState('');
  const [nightSurchargeEnabled, setNightSurchargeEnabled] = useState(true);
  const [blockedProvinces, setBlockedProvinces] = useState<string[]>([]);
  const [provinceAdjustments, setProvinceAdjustments] = useState<Record<string, number>>({});
  const [pickupProvince, setPickupProvince] = useState<string>('');
  const [showProvinceBlockDialog, setShowProvinceBlockDialog] = useState(false);
  const [blockedProvinceName, setBlockedProvinceName] = useState('');
  const [summaryDownloaded, setSummaryDownloaded] = useState(false);
  const [nsRules, setNsRules] = useState<any[]>([]);

  useEffect(() => {
    const fetchRateData = async () => {
      try {
        const [rcRes, adjRes, setRes, nsRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.RATE_CARDS}?status=Approved`),
          fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust`),
          fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`),
          fetch(`${API_ENDPOINTS.RATE_CARDS}/night-surcharge`)
        ]);
        if (rcRes.ok) setRateCards(await rcRes.json());
        if (adjRes.ok) setAdjustments(await adjRes.json());
        if (nsRes.ok) {
          const rules = await nsRes.json();
          console.log('[DEBUG-NS] Fetched rules:', rules);
          setNsRules(rules);
        } else {
          console.error('[DEBUG-NS] Failed to fetch rules:', nsRes.status);
        }
        if (setRes.ok) {
          const settings = await setRes.json();
          if (settings.nightSurchargeEnabled !== undefined) {
            setNightSurchargeEnabled(settings.nightSurchargeEnabled);
          }
          if (settings.blockedProvinces !== undefined) {
            setBlockedProvinces(settings.blockedProvinces);
          }
          if (settings.provinceAdjustments !== undefined) {
            setProvinceAdjustments(settings.provinceAdjustments);
          }
        }
      } catch (error) { console.error('Error fetching rate data:', error); }
    };
    fetchRateData();
  }, []);

  const addDestination = () => { setDestinations(p => [...p, '']); setStopCoords(p => [...p, null]); };
  const removeDestination = (i: number) => { setDestinations(p => p.filter((_, idx) => idx !== i)); setStopCoords(p => p.filter((_, idx) => idx !== i)); };
  const updateDestination = (i: number, v: string) => { setDestinations(p => p.map((d, idx) => idx === i ? v : d)); setStopCoords(p => p.map((c, idx) => idx === i ? null : c)); };

  /* Route calculation */
  useEffect(() => {
    const allStopsHaveCoords = destinations.every((d, i) => d.trim() === "" || stopCoords[i] !== null);
    if (!isLoaded || !pickupCoords || !dropoffCoords || !allStopsHaveCoords) {
      if (routeDistance !== null) { setRouteDistance(null); setRouteDuration(null); setRouteResponse(null); }
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    const timer = setTimeout(() => {
      const calculateRoute = async () => {
        const directionsService = new google.maps.DirectionsService();
        const origin = pickupCoords ? { lat: parseFloat(pickupCoords.lat), lng: parseFloat(pickupCoords.lon) } : formData.pickupLocation;
        const destination = dropoffCoords ? { lat: parseFloat(dropoffCoords.lat), lng: parseFloat(dropoffCoords.lon) } : formData.dropoffLocation;
        const validWaypoints = destinations.map((d, i) => {
          if (stopCoords[i]) return { location: { lat: parseFloat(stopCoords[i]!.lat), lng: parseFloat(stopCoords[i]!.lon) }, stopover: true };
          return d.trim() !== "" ? { location: d, stopover: true } : null;
        }).filter(wp => wp !== null) as google.maps.DirectionsWaypoint[];
        try {
          const result = await directionsService.route({ origin, destination, waypoints: validWaypoints, travelMode: google.maps.TravelMode.DRIVING });
          if (cancelled) return;
          if (result.routes && result.routes[0]) {
            const route = result.routes[0];
            setRouteDistance(route.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0));
            setRouteDuration(route.legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0));
            setRouteResponse(result);
          }
        } catch (err: any) {
          if (!cancelled) {
            setRouteDistance(null); setRouteDuration(null); setRouteResponse(null);
            const isExpected = err.code === 'NOT_FOUND' || err.code === 'ZERO_RESULTS' || (err.message && (err.message.includes('NOT_FOUND') || err.message.includes('ZERO_RESULTS')));
            if (!isExpected && err.code !== 'OVER_QUERY_LIMIT') console.error('[Route] Directions error:', err);
          }
        } finally { if (!cancelled) setRouteLoading(false); }
      };
      calculateRoute();
    }, 1000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [formData.pickupLocation, formData.dropoffLocation, destinations, pickupCoords, dropoffCoords, stopCoords, isLoaded]);

  const getVehicleFolderName = (modelName: string) => {
    const mapping: { [key: string]: string } = { 'Aqua': 'Toyota Aqua', 'Axio': 'Toyota Axio', 'KDH Flat Roof': 'KDH Flat Roof  9 Seats', 'Dual AC Van': 'Dual Ac 9 Seater', 'NON AC VAN': 'NON AC Van', 'AC 29 Seater': 'AC 29 Seater Bus', 'Non AC 29 Seater': 'Non AC 29 seater bus' };
    return mapping[modelName] || modelName;
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleChange = (field: string, value: string | any) => {
    if (field === 'dateTime' && value) {
      const selectedTime = new Date(value).getTime();
      const minLeadTime = new Date().getTime() + (2 * 60 * 60 * 1000);
      if (selectedTime < minLeadTime) {
        setSnackbarMessage('Bookings must be made at least 2 hours in advance.'); setSnackbarSeverity('warning'); setSnackbarOpen(true);
        const minDate = new Date(minLeadTime - (new Date().getTimezoneOffset() * 60000));
        value = minDate.toISOString().slice(0, 16);
      }
    }
    if (field === 'email') setEmailError(value && !EMAIL_REGEX.test(value) ? 'Invalid email format' : '');
    if (field === 'telephone') setPhoneError(value && !PHONE_REGEX.test(value) ? 'Invalid phone format (e.g. 07XXXXXXXX)' : '');
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'pickupLocation' && prev.tripType === 'Return') updated.dropoffLocation = value;
      return updated;
    });
  };

  const handlePromoSubmit = async () => {
    if (!promoCodeInput.trim()) return;
    setIsPromoLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.PROMO_CODES);
      if (!res.ok) throw new Error('Failed to fetch promo codes');
      const codes: PromoCode[] = await res.json();
      const code = codes.find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
      if (!code) { setSnackbarMessage('Invalid promo code.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
      if (code.status !== 'Active') { setSnackbarMessage('This promo code is no longer active.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
      const now = new Date();
      const pFrom = code.validFrom ? new Date(code.validFrom) : null; if (pFrom) pFrom.setHours(0, 0, 0, 0);
      const pTo = code.validTo ? new Date(code.validTo) : null; if (pTo) pTo.setHours(23, 59, 59, 999);
      if (pFrom && pFrom > now) { setSnackbarMessage('This promo code is not yet valid.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
      if (pTo && pTo < now) { setSnackbarMessage('This promo code has expired.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
      const isApplicable = code.applicableVehicle === 'All' || code.applicableVehicle === formData.vehicleName || code.applicableVehicle === formData.vehicleType;
      if (!isApplicable && formData.vehicleName && formData.vehicleType) { setSnackbarMessage(`This code is only valid for ${code.applicableVehicle}.`); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
      setAppliedPromo(code); setOpenPromoDialog(false);
      const discText = code.discountType === 'Percentage' ? `${code.discountValue}%` : `LKR ${code.discountValue.toLocaleString()}`;
      const successMsg = (!isApplicable && (!formData.vehicleName || !formData.vehicleType)) ? `Promo code for ${code.applicableVehicle} applied! Note: Discount will only count when you select this vehicle.` : `Promo code applied! ${discText} discount added.`;
      setSnackbarMessage(successMsg); setSnackbarSeverity('success'); setSnackbarOpen(true);
    } catch { setSnackbarMessage('Error validating promo code.'); setSnackbarSeverity('error'); setSnackbarOpen(true); }
    finally { setIsPromoLoading(false); }
  };

  const handleViewDirections = () => { if (!pickupCoords || !dropoffCoords || !routeDistance) return; setOpenRouteViewer(true); };
  const handleAddPhone = () => { if (formData.additionalPhones.length >= 1) return; setFormData(prev => ({ ...prev, additionalPhones: [...prev.additionalPhones, ''] })); };
  const handleRemovePhone = (i: number) => { setFormData(prev => ({ ...prev, additionalPhones: prev.additionalPhones.filter((_, idx) => idx !== i) })); setAdditionalPhoneErrors(prev => prev.filter((_, idx) => idx !== i)); };
  const updateAdditionalPhone = (i: number, value: string) => {
    setAdditionalPhoneErrors(prev => { const newErrors = [...prev]; newErrors[i] = value && !PHONE_REGEX.test(value) ? 'Invalid phone format' : ''; return newErrors; });
    setFormData(prev => { const newPhones = [...prev.additionalPhones]; newPhones[i] = value; return { ...prev, additionalPhones: newPhones }; });
  };

  const handleVehicleCardClick = (type: string) => { setSelectedCategory(type); setOpenVehicleDialog(true); };
  const handleVehicleSelect = (modelName: string) => {
    const categoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles];
    const selectedModel = categoryVehicles.models.find(m => m.name === modelName);
    setFormData(prev => ({ ...prev, vehicleType: selectedCategory, vehicleName: modelName, maxPersons: selectedModel?.maxPersons || 0, maxBags: selectedModel?.maxBags || 0 }));
    if (appliedPromo && appliedPromo.applicableVehicle !== 'All' && appliedPromo.applicableVehicle !== modelName && appliedPromo.applicableVehicle !== selectedCategory) {
      setAppliedPromo(null); setSnackbarMessage(`Promo code removed: only valid for ${appliedPromo.applicableVehicle}.`); setSnackbarSeverity('info'); setSnackbarOpen(true);
    }
    setOpenVehicleDialog(false);
  };

  const handleTripTypeSelect = (tripTypeName: string) => {
    if (tripTypeName === 'Return') {
      const currentPickup = formData.pickupLocation;
      const currentDropoff = formData.dropoffLocation;
      const currentDropoffCoords = dropoffCoords;
      setFormData(prev => ({ ...prev, tripType: tripTypeName, dropoffLocation: currentPickup || prev.dropoffLocation, numberOfDays: prev.numberOfDays || '' }));
      if (currentPickup) setDropoffCoords(pickupCoords);
      setDestinations(prev => {
        if (currentDropoff && currentDropoff.trim() !== "" && currentDropoff !== currentPickup) {
          if (prev[0] !== currentDropoff) { setStopCoords(old => [currentDropoffCoords, ...old]); return [currentDropoff, ...prev]; }
          return prev;
        }
        if (prev.length === 0) { setStopCoords([null]); return ['']; }
        return prev;
      });
    } else {
      if (formData.tripType === 'Return') {
        setFormData(prev => ({ ...prev, tripType: tripTypeName, dropoffLocation: '', numberOfDays: tripTypeName === 'Drop' ? 0 : (prev.numberOfDays || '') }));
        setDropoffCoords(null); setDestinations([]); setStopCoords([]);
      } else {
        setFormData(prev => ({ ...prev, tripType: tripTypeName, numberOfDays: tripTypeName === 'Drop' ? 0 : (prev.numberOfDays || '') }));
      }
    }
    setOpenTripTypeDialog(false);
  };

  const handleRequestBooking = () => {
    if (!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime) {
      setSnackbarMessage('Please fill all required fields before proceeding.'); setSnackbarSeverity('warning'); setSnackbarOpen(true); return;
    }
    if (formData.tripType !== 'Drop' && !formData.numberOfDays) {
      setSnackbarMessage('Please select the number of days for your trip.'); setSnackbarSeverity('warning'); setSnackbarOpen(true); return;
    }
    if (routeLoading) { setSnackbarMessage('Please wait while we calculate the route distance...'); setSnackbarSeverity('info'); setSnackbarOpen(true); return; }
    const selectedTime = new Date(formData.dateTime).getTime();
    const minLeadTime = new Date().getTime() + (2 * 60 * 60 * 1000);
    if (selectedTime < minLeadTime) { setSnackbarMessage('Sorry, your selected time is too soon. Please select a time at least 2 hours from now.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
    const distanceInKm = routeDistance ? (routeDistance / 1000) : 0;
    if (blockedProvinceName) {
      setShowProvinceBlockDialog(true);
      return;
    }
    const days = Number(formData.numberOfDays);
    if (days > 1 && distanceInKm > 0 && distanceInKm < 100 && !acknowledgedDropHireSuggestion) { setShowDropHireSuggestion(true); return; }
    setOpenPersonalDialog(true);
  };

  const handleClosePersonalDialog = () => {
    if (requestSent) { 
      if (summaryDownloaded) {
        handleConfirmClose();
        return;
      }
      setShowCloseConfirm(true); 
      return; 
    }
    const hasEnteredInfo = formData.name?.trim() || formData.telephone?.trim() || formData.email?.trim() || formData.remark?.trim() || formData.additionalPhones.some(p => p.trim());
    if (hasEnteredInfo) setShowCloseConfirm(true); else setOpenPersonalDialog(false);
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false); 
    setOpenPersonalDialog(false);
    if (requestSent) {
      setTimeout(() => {
        setRequestSent(false);
        setSubmittedBookingData(null);
        setBookingRefNo('');
        setSummaryDownloaded(false);
      }, 300);
    }
  };

  // Pricing calculations
  const distanceInKm = routeDistance ? (routeDistance / 1000) : 0;

  const matchedPackage = (() => {
    if (!formData.vehicleType || !formData.tripType) return null;
    const targetDays = Number(formData.numberOfDays) === 0 ? 1 : Number(formData.numberOfDays);
    const cleanFormVehName = formData.vehicleName.toLowerCase().replace(/\s+/g, '').trim();
    const cleanFormVehType = formData.vehicleType.toLowerCase().replace(/\s+/g, '').trim();
    const potentialCards = rateCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehicleMatch = cleanCardVeh === cleanFormVehName || cleanCardVeh === cleanFormVehType || cleanFormVehName.includes(cleanCardVeh) || cleanCardVeh.includes(cleanFormVehName);
      const cleanCardType = card.type.toLowerCase().trim();
      const cleanFormType = formData.tripType.toLowerCase().trim();
      const typeMatch = cleanCardType === cleanFormType || (cleanFormType === 'drop' && (cleanCardType === 'oneway' || cleanCardType === 'one way')) || (cleanFormType === 'return' && (cleanCardType === 'roundtrip' || cleanCardType === 'round trip' || cleanCardType === 'bothway'));
      return vehicleMatch && typeMatch && Number(card.days) === targetDays && card.status === 'Approved';
    });
    if (potentialCards.length === 0) return null;
    const specificMatches = potentialCards.filter(card => { const c = card.vehicle.toLowerCase().replace(/\s+/g, '').trim(); return c === cleanFormVehName || c.includes(cleanFormVehName) || cleanFormVehName.includes(c); });
    const finalPotential = specificMatches.length > 0 ? specificMatches : potentialCards;
    const sortedCards = finalPotential.sort((a, b) => a.km !== b.km ? a.km - b.km : a.hrs - b.hrs);
    if (routeDistance !== null) {
      const possibleKms = sortedCards.filter(c => c.km <= distanceInKm).map(c => c.km);
      const maxKMBelow = possibleKms.length > 0 ? Math.max(...possibleKms) : null;
      const bestMatch = maxKMBelow !== null ? sortedCards.find(c => c.km === maxKMBelow) : sortedCards[0];
      return bestMatch || sortedCards[0];
    }
    return sortedCards[0];
  })();

  const minKmRequired = (() => {
    if (!formData.vehicleType || !formData.tripType || rateCards.length === 0) return 0;
    const targetDays = Number(formData.numberOfDays) === 0 ? 1 : Number(formData.numberOfDays);
    const cleanFormVehName = formData.vehicleName.toLowerCase().replace(/\s+/g, '').trim();
    const cleanFormVehType = formData.vehicleType.toLowerCase().replace(/\s+/g, '').trim();
    const potentialCards = rateCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehicleMatch = cleanCardVeh === cleanFormVehName || cleanCardVeh === cleanFormVehType || cleanFormVehName.includes(cleanCardVeh) || cleanCardVeh.includes(cleanFormVehName);
      const cleanCardType = card.type.toLowerCase().trim();
      const cleanFormType = formData.tripType.toLowerCase().trim();
      const typeMatch = cleanCardType === cleanFormType || (cleanFormType === 'drop' && (cleanCardType === 'oneway' || cleanCardType === 'one way')) || (cleanFormType === 'return' && (cleanCardType === 'roundtrip' || cleanCardType === 'round trip' || cleanCardType === 'bothway'));
      return vehicleMatch && typeMatch && Number(card.days) === targetDays && card.status === 'Approved';
    });
    if (potentialCards.length === 0) return 0;
    const specificMatches = potentialCards.filter(card => { const c = card.vehicle.toLowerCase().replace(/\s+/g, '').trim(); return c === cleanFormVehName || c.includes(cleanFormVehName) || cleanFormVehName.includes(c); });
    const finalPotential = specificMatches.length > 0 ? specificMatches : potentialCards;
    return Math.min(...finalPotential.map(c => c.km));
  })();

  useEffect(() => {
    if (!pickupCoords || typeof google === 'undefined') return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: parseFloat(pickupCoords.lat), lng: parseFloat(pickupCoords.lon) } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const provinceComp = results[0].address_components.find(c =>
          c.types.includes('administrative_area_level_1')
        );
        if (provinceComp) {
          const provinceName = provinceComp.long_name.replace(' Province', '').trim();
          setPickupProvince(provinceName);
          if (blockedProvinces.includes(provinceName)) {
            setBlockedProvinceName(provinceName);
            setShowProvinceBlockDialog(true);
            setFormData(prev => ({ ...prev, pickupLocation: '' }));
            setPickupCoords(null);
          } else {
            setBlockedProvinceName('');
            setShowProvinceBlockDialog(false);
          }
        }
      }
    });
  }, [pickupCoords, blockedProvinces, isLoaded]);

  const calculateNightSurchargeAmount = useCallback((dateTime: string, vType: string, vName: string, distance: number, tripType: string) => {
    if (!dateTime || !vType || nsRules.length === 0) return 0;
    
    const date = new Date(dateTime);
    const hour = date.getHours();
    const min = date.getMinutes();
    const currentTimeInMin = (hour * 60) + min;

    const parseTimeToMin = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return (h * 60) + (m || 0);
    };

    const cleanVType = vType.toLowerCase().trim();
    const cleanVName = vName ? vName.toLowerCase().replace(/\s+/g, '').trim() : '';
    const cleanTripType = tripType.toLowerCase().trim();

    // Filter rules that match vehicle and trip type
    const applicableRules = nsRules.filter(rule => {
      if (rule.status === 'Inactive') return false;
      const ruleVeh = rule.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehMatch = ruleVeh === 'all' || 
                       ruleVeh === cleanVType || 
                       ruleVeh === cleanVName || 
                       ruleVeh.includes(cleanVName) || 
                       cleanVName.includes(ruleVeh);
      
      const ruleType = rule.type.toLowerCase().trim();
      const typeMatch = ruleType === 'all' || ruleType === cleanTripType;
      
      const kmMatch = distance >= rule.minKm && distance <= rule.maxKm;

      // Time match (handling overnight windows like 22:00 to 04:00)
      const startMin = parseTimeToMin(rule.startTime);
      const endMin = parseTimeToMin(rule.endTime);
      let timeMatch = false;

      if (startMin <= endMin) {
        timeMatch = currentTimeInMin >= startMin && currentTimeInMin <= endMin;
      } else {
        // Overnight window (e.g., 22:00 to 02:00)
        timeMatch = currentTimeInMin >= startMin || currentTimeInMin <= endMin;
      }

      return vehMatch && typeMatch && kmMatch && timeMatch;
    });

    console.log('[DEBUG-NS] Rules evaluation:', {
      vType, vName, distance, tripType, currentTime: `${hour}:${min}`,
      matchedRulesCount: applicableRules.length,
      rules: applicableRules
    });

    if (applicableRules.length === 0) return 0;

    // Pick the most specific or highest amount
    // Specificity: Name > Type > All
    const sorted = applicableRules.sort((a, b) => {
      const aVeh = a.vehicle.toLowerCase().trim();
      const bVeh = b.vehicle.toLowerCase().trim();
      const aScore = aVeh === cleanVName ? 100 : aVeh === cleanVType ? 50 : 0;
      const bScore = bVeh === cleanVName ? 100 : bVeh === cleanVType ? 50 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return b.amount - a.amount; // Tie-break with higher amount
    });

    return sorted[0].amount;
  }, [nightSurchargeEnabled, nsRules]);

  const activeAdjustment = (() => {
    if (!formData.vehicleType || adjustments.length === 0) return null;
    const cleanFormVehName = formData.vehicleName.toLowerCase().replace(/\s+/g, '').trim();
    const cleanFormVehType = formData.vehicleType.toLowerCase().trim();
    const cleanFormType = formData.tripType.toLowerCase().trim();
    const matches = adjustments.filter(adj => {
      const cleanAdjVeh = adj.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehicleMatch = cleanAdjVeh === 'all' || cleanAdjVeh === cleanFormVehName || cleanAdjVeh === cleanFormVehType || cleanFormVehName.includes(cleanAdjVeh) || cleanAdjVeh.includes(cleanFormVehName);
      const cleanAdjType = adj.type.toLowerCase().trim();
      const typeMatch = cleanAdjType === 'all' || cleanAdjType === cleanFormType;
      const tripDate = formData.dateTime ? new Date(formData.dateTime) : new Date();
      const vFrom = adj.validFrom ? new Date(adj.validFrom) : null; if (vFrom) vFrom.setHours(0, 0, 0, 0);
      const vTo = adj.validTo ? new Date(adj.validTo) : null; if (vTo) vTo.setHours(23, 59, 59, 999);
      return vehicleMatch && typeMatch && (!vFrom || tripDate >= vFrom) && (!vTo || tripDate <= vTo);
    });
    if (matches.length === 0) return null;
    return matches.sort((a, b) => {
      const aClean = a.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const bClean = b.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const aScore = aClean === cleanFormVehName ? 200 : aClean === cleanFormVehType ? 100 : aClean === 'all' ? 0 : 50;
      const bScore = bClean === cleanFormVehName ? 200 : bClean === cleanFormVehType ? 100 : bClean === 'all' ? 0 : 50;
      if (aScore !== bScore) return bScore - aScore;
      return a.type.toLowerCase() === 'all' ? 1 : -1;
    })[0];
  })();

  const provinceMultiplier = 1 + ((provinceAdjustments[pickupProvince] || 0) / 100);
  const adjustmentMultiplier = (1 + ((activeAdjustment?.percentage ?? 0) / 100)) * provinceMultiplier;

  const basePriceBeforeAdjustment = (() => {
    const ratePerKm = formData.vehicleType === 'Car' ? 110 : formData.vehicleType === 'Van' ? 160 : formData.vehicleType === 'Bus' ? 450 : formData.vehicleType === 'SUV' ? 250 : 0;
    const basePricePerDay = formData.vehicleType === 'Car' ? 15000 : formData.vehicleType === 'Van' ? 18000 : formData.vehicleType === 'Bus' ? 35000 : formData.vehicleType === 'SUV' ? 25000 : 0;
    if (!matchedPackage) return routeDistance !== null ? distanceInKm * ratePerKm : basePricePerDay * formData.numberOfDays;
    let price = matchedPackage.rateAmount;
    if (distanceInKm > matchedPackage.km) price += Math.ceil(distanceInKm - matchedPackage.km) * matchedPackage.extraKMRate;
    if (formData.additionalHours > 0) price += formData.additionalHours * (matchedPackage.extraHrRate1 || 0);
    return price;
  })();

  const extraKmDetail = (() => {
    if (!matchedPackage || distanceInKm <= matchedPackage.km) return null;
    const extraKm = Math.ceil(distanceInKm - matchedPackage.km);
    return { km: extraKm, cost: extraKm * matchedPackage.extraKMRate };
  })();

  const provinceAdjustmentAmount = Math.round(basePriceBeforeAdjustment * (provinceMultiplier - 1));
  const rawTotalPrice = Math.round(basePriceBeforeAdjustment * adjustmentMultiplier);

  const discountAmount = (() => {
    if (!appliedPromo) return 0;
    const cleanApp = appliedPromo.applicableVehicle.toLowerCase().trim();
    const isApplicable = cleanApp === 'all' || cleanApp === formData.vehicleName.toLowerCase().trim() || cleanApp === formData.vehicleType.toLowerCase().trim();
    if (!isApplicable) return 0;
    return appliedPromo.discountType === 'Percentage' ? Math.round(rawTotalPrice * (appliedPromo.discountValue / 100)) : appliedPromo.discountValue;
  })();

  const nightSurcharge = calculateNightSurchargeAmount(formData.dateTime, formData.vehicleType, formData.vehicleName, distanceInKm, formData.tripType);

  const totalPrice = Math.max(0, rawTotalPrice - discountAmount) + nightSurcharge;

  const getPriceForVehicle = useCallback((vName: string, vType: string) => {
    if (!vType) return 0;
    const cleanVName = vName ? vName.toLowerCase().replace(/\s+/g, '').trim() : '';
    const cleanVType = vType.toLowerCase().trim();
    const cleanFormType = formData.tripType.toLowerCase().trim();
    const targetDays = Number(formData.numberOfDays) === 0 ? 1 : Number(formData.numberOfDays);

    // 1. Find Matched Package (Mirroring main logic)
    const potentialCards = rateCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehicleMatch = cleanCardVeh === cleanVName || cleanCardVeh === cleanVType || cleanVName.includes(cleanCardVeh) || cleanCardVeh.includes(cleanVName);
      const cleanCardType = card.type.toLowerCase().trim();
      const typeMatch = cleanCardType === cleanFormType || (cleanFormType === 'drop' && (cleanCardType === 'oneway' || cleanCardType === 'one way')) || (cleanFormType === 'return' && (cleanCardType === 'roundtrip' || cleanCardType === 'round trip' || cleanCardType === 'bothway'));
      return vehicleMatch && typeMatch && Number(card.days) === targetDays && card.status === 'Approved';
    });

    let matchedPkg = null;
    if (potentialCards.length > 0) {
      const specificMatches = potentialCards.filter(card => { const c = card.vehicle.toLowerCase().replace(/\s+/g, '').trim(); return c === cleanVName || c.includes(cleanVName) || cleanVName.includes(c); });
      const finalPotential = specificMatches.length > 0 ? specificMatches : potentialCards;
      const sortedCards = finalPotential.sort((a, b) => a.km !== b.km ? a.km - b.km : a.hrs - b.hrs);
      if (routeDistance !== null) {
        const possibleKms = sortedCards.filter(c => c.km <= distanceInKm).map(c => c.km);
        const maxKMBelow = possibleKms.length > 0 ? Math.max(...possibleKms) : null;
        matchedPkg = maxKMBelow !== null ? sortedCards.find(c => c.km === maxKMBelow) : sortedCards[0];
      } else {
        matchedPkg = sortedCards[0];
      }
    }

    // 2. Base Price before adjustments
    const ratePerKm = vType === 'Car' ? 110 : vType === 'Van' ? 160 : vType === 'Bus' ? 450 : vType === 'SUV' ? 250 : 0;
    const basePricePerDay = vType === 'Car' ? 15000 : vType === 'Van' ? 18000 : vType === 'Bus' ? 35000 : vType === 'SUV' ? 25000 : 0;

    let basePrice = 0;
    if (!matchedPkg) {
      basePrice = routeDistance !== null ? distanceInKm * ratePerKm : basePricePerDay * targetDays;
    } else {
      basePrice = matchedPkg.rateAmount;
      if (distanceInKm > matchedPkg.km) basePrice += Math.ceil(distanceInKm - matchedPkg.km) * matchedPkg.extraKMRate;
      if (formData.additionalHours > 0) basePrice += formData.additionalHours * (matchedPkg.extraHrRate1 || 0);
    }

    // 3. Seasonal Adjustment Multiplier
    const adj = adjustments.filter(a => {
      const cleanAdjVeh = a.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehicleMatch = cleanAdjVeh === 'all' || cleanAdjVeh === cleanVName || cleanAdjVeh === cleanVType || cleanVName.includes(cleanAdjVeh) || cleanAdjVeh.includes(cleanVName);
      const cleanAdjType = a.type.toLowerCase().trim();
      const typeMatch = cleanAdjType === 'all' || cleanAdjType === cleanFormType;
      const tripDate = formData.dateTime ? new Date(formData.dateTime) : new Date();
      const vFrom = a.validFrom ? new Date(a.validFrom) : null; if (vFrom) vFrom.setHours(0, 0, 0, 0);
      const vTo = a.validTo ? new Date(a.validTo) : null; if (vTo) vTo.setHours(23, 59, 59, 999);
      return vehicleMatch && typeMatch && (!vFrom || tripDate >= vFrom) && (!vTo || tripDate <= vTo);
    }).sort((a, b) => {
      const aClean = a.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const bClean = b.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const aScore = aClean === cleanVName ? 200 : aClean === cleanVType ? 100 : aClean === 'all' ? 0 : 50;
      const bScore = bClean === cleanVName ? 200 : bClean === cleanVType ? 100 : bClean === 'all' ? 0 : 50;
      if (aScore !== bScore) return bScore - aScore;
      return a.type.toLowerCase() === 'all' ? 1 : -1;
    })[0];

    const provMultiplier = 1 + ((provinceAdjustments[pickupProvince] || 0) / 100);
    const adjMultiplier = (1 + ((adj?.percentage ?? 0) / 100)) * provMultiplier;

    const rawTotal = Math.round(basePrice * adjMultiplier);

    // 4. Promo Discount
    let discAmount = 0;
    if (appliedPromo) {
      const cleanApplicable = appliedPromo.applicableVehicle.toLowerCase().trim();
      const isApplicable = cleanApplicable === 'all' || cleanApplicable === vName.toLowerCase().trim() || cleanApplicable === vType.toLowerCase().trim();
      if (isApplicable) {
        discAmount = appliedPromo.discountType === 'Percentage' ? Math.round(rawTotal * (appliedPromo.discountValue / 100)) : appliedPromo.discountValue;
      }
    }

    const nightSur = calculateNightSurchargeAmount(formData.dateTime, vType, vName, distanceInKm, formData.tripType);

    return Math.max(0, rawTotal - discAmount) + nightSur;
  }, [formData.tripType, formData.dateTime, formData.numberOfDays, formData.additionalHours, rateCards, adjustments, provinceAdjustments, pickupProvince, distanceInKm, routeDistance, nightSurchargeEnabled, appliedPromo]);

  const vehiclePricesMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!rateCards.length) return map;
    Object.entries(sampleVehicles).forEach(([catName, cat]) => {
      cat.models.forEach(m => {
        map[m.name] = getPriceForVehicle(m.name, catName);
      });
    });
    return map;
  }, [getPriceForVehicle, rateCards.length]);

  const getMinPriceForCategory = (catName: string) => {
    const prices = sampleVehicles[catName as keyof typeof sampleVehicles]?.models.map(m => vehiclePricesMap[m.name]).filter(p => p > 0) || [];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const vehicleDiscountsMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    if (!appliedPromo) return map;
    const cleanApp = appliedPromo.applicableVehicle.toLowerCase().trim();
    Object.entries(sampleVehicles).forEach(([catName, cat]) => {
      cat.models.forEach(m => {
        const isApp = cleanApp === 'all' || cleanApp === m.name.toLowerCase().trim() || cleanApp === catName.toLowerCase().trim();
        if (isApp) {
          map[m.name] = appliedPromo.discountType === 'Percentage' ? `-${appliedPromo.discountValue}%` : `-LKR ${appliedPromo.discountValue.toLocaleString()}`;
        } else {
          map[m.name] = null;
        }
      });
    });
    return map;
  }, [appliedPromo]);

  const downloadTripSummary = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [13, 148, 136];
    const data = submittedBookingData || { formData, destinations, totalPrice, rawTotalPrice, appliedPromo, matchedPackage, nightSurcharge, bookingRefNo };
    const matchedPkg = data.matchedPackage || matchedPackage;

    const darkGreen: [number, number, number] = [6, 78, 59];
    const headerOutline: [number, number, number] = [16, 185, 129];

    // Header (White background with green outline)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 60, 'F');
    doc.setDrawColor(headerOutline[0], headerOutline[1], headerOutline[2]);
    doc.setLineWidth(0.5);
    doc.line(0, 60, 210, 60);

    // Add Logo
    try {
      // Use URL-encoded path for spaces
      doc.addImage("/senu%20tours%203d.png", "PNG", 85, 2, 40, 28);
    } catch (e) {
      console.error("Logo failed to load:", e);
      // Fallback text if logo fails
      doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SENU TOURS", 105, 18, { align: 'center' });
    }

    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Your Home, Your Journey, Your Hospitality Haven", 105, 38, { align: 'center' });

    // Business Details (Centered under tagline)
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text("No. 167/2C Hokandara North, Hokandara.", 105, 46, { align: 'center' });
    doc.text("Tel: +94 112 787 787 | Mob: +94 070 278 7787", 105, 52, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    let currentY = 70;

    const addSectionHeader = (title: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.text(title, 14, currentY);
      currentY += 8;
    };

    const addRow = (label: string, value: string, isBold = false) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(label, 14, currentY);
      doc.text(`: ${value}`, 60, currentY);
      currentY += 7;
    };

    const formatDate = (dateStr: string, showSeconds = false) => {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const timePart = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}${showSeconds ? ':00' : ''}`;
      return `${year}-${month}-${day} @ ${timePart}`;
    };

    // TRIP DETAILS
    addSectionHeader("TRIP DETAILS");
    addRow("Start Date & Time", formatDate(data.formData.dateTime));
    addRow("From", data.formData.pickupLocation);
    if (data.destinations && data.destinations.length > 0) {
      data.destinations
        .filter((d: string) => d.trim() !== "")
        .forEach((stop: string, i: number) => {
          addRow(`Stop ${i + 1}`, stop);
        });
    }
    addRow("To", data.formData.dropoffLocation);
    addRow("End Date & Time", formatDate(data.formData.dateTime, true));
    addRow("Journey Type", data.formData.tripType || "Drop");
    addRow("Payment", "Cash");
    addRow("Vehicle Type", `${data.formData.vehicleName || "Not Selected"} | ${data.formData.maxPersons || 0} Seater`);
    addRow("Passengers", (data.formData.maxPersons || 0).toString());
    currentY += 5;

    // INCLUSIONS
    addSectionHeader("INCLUSIONS");
    addRow("Package Rate", data.formData.vehicleType === 'SUV' ? "Price on Request" : `Rs. ${data.rawTotalPrice?.toLocaleString() || 0}`);
    const currentRouteDistance = data.routeDistance !== undefined ? data.routeDistance : routeDistance;
    const currentDistanceInKm = currentRouteDistance ? (currentRouteDistance / 1000) : 0;
    const extraKm = Math.max(0, Math.ceil(currentDistanceInKm - (matchedPkg?.km || 0)));
    const totalKm = (matchedPkg?.km || 0) + extraKm;
    const totalHrs = (matchedPkg?.hrs || 0) + (data.formData.additionalHours || 0);
    addRow("Package Inclusions", `${totalKm} KMs and ${totalHrs} Hrs`);
    addRow("Miscellaneous Items", "");
    addRow("Miscellaneous Rate", "");
    addRow("TOTAL", data.formData.vehicleType === 'SUV' ? "Price on Request" : `Rs. ${data.totalPrice?.toLocaleString() || 0}`, true);
    currentY += 5;

    // EXTRAS
    addSectionHeader("EXTRAS");
    addRow("Per Extra KM", (matchedPkg?.extraKMRate || 0).toString());
    addRow("Per Extra Hour", (matchedPkg?.extraHrRate1 || 0).toString());
    if (data.nightSurcharge > 0) {
      addRow("Night Surcharge", `Rs. ${data.nightSurcharge.toLocaleString()}`);
    }
    currentY += 15;

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const now = new Date();
    const preparedOn = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${now.toLocaleTimeString()}`;
    doc.text(`Prepared on ${preparedOn} by Website Form | Valid for 14 Days`, 14, currentY);
    currentY += 10;

    // Interactive Buttons
    const btnW = 45;
    const btnH = 8;
    const btnGap = 10;
    const startX = 14;

    const addPdfButton = (x: number, y: number, w: number, h: number, text: string, url: string, color: [number, number, number]) => {
      doc.setFillColor(color[0], color[1], color[2]);
      (doc as any).roundedRect(x, y, w, h, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(text, x + w/2, y + h/2 + 1, { align: 'center' });
      doc.link(x, y, w, h, { url });
    };

    addPdfButton(startX, currentY, btnW, btnH, "WhatsApp Us", "https://wa.me/94702787787", [37, 211, 102]);
    addPdfButton(startX + btnW + btnGap, currentY, btnW, btnH, "Call Support", "tel:+94702787787", [13, 148, 136]);
    addPdfButton(startX + (btnW + btnGap) * 2, currentY, btnW, btnH, "Rate Us", "https://senutours.com/contact", [255, 193, 7]);
    
    currentY += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const refNo = data.bookingRefNo || "N/A";
    const contactText = `Contact us and mention the reference number `;
    doc.text(contactText, 14, currentY);
    
    // Colored and Underlined Reference Number
    const textWidth = doc.getTextWidth(contactText);
    doc.setTextColor(13, 148, 136);
    doc.text(refNo, 14 + textWidth, currentY);
    const refWidth = doc.getTextWidth(refNo);
    doc.setDrawColor(13, 148, 136);
    doc.line(14 + textWidth, currentY + 1, 14 + textWidth + refWidth, currentY + 1);
    
    doc.setTextColor(0, 0, 0);
    doc.text(" to confirm the booking.", 14 + textWidth + refWidth, currentY);

    doc.save(`Senu_Tours_Trip_Summary_${new Date().getTime()}.pdf`);
    setSummaryDownloaded(true);
  };

  const handleSendRequest = async () => {
    const isEmailValid = !formData.email || EMAIL_REGEX.test(formData.email);
    const isPhoneValid = !formData.telephone || PHONE_REGEX.test(formData.telephone);
    if (!isEmailValid || !isPhoneValid || additionalPhoneErrors.some(e => e !== '')) { setSnackbarMessage('Please fix the errors in the form before submitting.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
    if (!formData.name || !formData.telephone || !formData.email) { setSnackbarMessage('Please fill in all required fields (Name, Telephone, Email).'); setSnackbarSeverity('warning'); setSnackbarOpen(true); return; }
    try {
      const payload = { 
        ...formData, 
        destinations: destinations.filter(d => d.trim() !== ''), 
        matchedPackage, 
        promoCode: appliedPromo?.code || '', 
        discount: discountAmount,
        nightSurcharge: nightSurcharge
      };
      const response = await fetch(API_ENDPOINTS.BOOKINGS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        const result = await response.json();
        setBookingRefNo(result.customId || result._id);
        setSubmittedBookingData({ formData: { ...formData }, destinations: [...destinations], totalPrice, rawTotalPrice, appliedPromo, bookingRefNo: result.customId || result._id, nightSurcharge, matchedPackage, routeDistance });
        setRequestSent(true);
        setFormData({ vehicleType: '', vehicleName: '', tripType: '', pickupLocation: '', dropoffLocation: '', dateTime: '', numberOfDays: '' as any, name: '', telephone: '', additionalPhones: [], email: '', remark: '', maxPersons: 0, maxBags: 0, additionalHours: 0 });
        setAppliedPromo(null); setPromoCodeInput(''); setHasPromoOption(null); setShowRemark(false);
        setDestinations([]); setPickupCoords(null); setDropoffCoords(null); setStopCoords([]);
        setRouteDistance(null); setRouteDuration(null);
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.message || 'Failed to send booking request.'); setSnackbarSeverity('error'); setSnackbarOpen(true);
      }
    } catch { setSnackbarMessage('An error occurred. Please try again later.'); setSnackbarSeverity('error'); setSnackbarOpen(true); }
  };

  const currentCategoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles] || { models: [] };

  return {
    // State
    formData, setFormData, routeResponse, minDateTime, openPromoDialog, setOpenPromoDialog,
    promoCodeInput, setPromoCodeInput, appliedPromo, hasPromoOption, setHasPromoOption,
    isPromoLoading, emailError, phoneError, additionalPhoneErrors, requestSent, showRemark,
    setShowRemark, openAuthModal, setOpenAuthModal, showLoginAlert, setShowLoginAlert,
    openRouteViewer, setOpenRouteViewer, openNearbyViewer, setOpenNearbyViewer,
    openPolicyDialog, setOpenPolicyDialog, submittedBookingData, showCloseConfirm,
    setShowCloseConfirm, destinations, openDateTimePicker, setOpenDateTimePicker,
    pickerStep, setPickerStep, tempDate, setTempDate, tempTime, setTempTime,
    tempHour, setTempHour, tempMin, setTempMin, tempAmPm, setTempAmPm,
    openDayPicker, setOpenDayPicker, tempDays, setTempDays, pickupCoords,
    setPickupCoords, dropoffCoords, setDropoffCoords, stopCoords, setStopCoords,
    routeDistance, routeDuration, routeLoading, showDropHireSuggestion,
    setShowDropHireSuggestion, acknowledgedDropHireSuggestion,
    setAcknowledgedDropHireSuggestion, bookingRefNo, showCallPopup, setShowCallPopup,
    openVehicleDialog, setOpenVehicleDialog, selectedCategory, openTripTypeDialog, setOpenTripTypeDialog,
    openPersonalDialog, setOpenPersonalDialog, showExtraPrices,
    setSnackbarOpen, setSnackbarMessage, setSnackbarSeverity,
    snackbarOpen, snackbarMessage, snackbarSeverity,
    openPhotosDialog, setOpenPhotosDialog, photosVehicle, setPhotosVehicle,
    showProvinceBlockDialog, setShowProvinceBlockDialog, blockedProvinceName,
    provinceAdjustments, pickupProvince,
    // Computed
    distanceInKm, matchedPackage, minKmRequired, activeAdjustment, extraKmDetail,
    provinceAdjustmentAmount, basePriceBeforeAdjustment, getPriceForVehicle, vehiclePricesMap, getMinPriceForCategory,
    vehicleDiscountsMap,
    rawTotalPrice, discountAmount, nightSurcharge, totalPrice, currentCategoryVehicles,
    handleChange, handlePromoSubmit, handleViewDirections, handleAddPhone,
    handleRemovePhone, updateAdditionalPhone, handleVehicleCardClick,
    handleVehicleSelect, handleTripTypeSelect, handleRequestBooking,
    handleClosePersonalDialog, downloadTripSummary, handleSendRequest,
    handleSnackbarClose, addDestination, removeDestination, updateDestination,
    getVehicleFolderName,
  };
}
