'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Footer from '@/components/footer';
import {
  Users,
  Briefcase,
  Wind,
  ShieldCheck,
  TrendingUp,
  X,
  Phone,
  MessageCircle,
  Car,
  Headphones,
  MapPin,
  CheckCircle2,
  FileText,
  ClipboardCheck,
  Bike,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, TextField, Box, Typography, IconButton } from '@mui/material';
import { PolicyDialog } from '@/components/PolicyDialog';
import { API_ENDPOINTS } from '@/config/api';

interface PromotionDetail {
  id: string;
  name: string;
  title: string;
  image: string;
  discount: string;
  description: string;
  promoCode: string;
  passengers: number;
  bags: number;
  ac: boolean;
  conditions: string[];
  specs: { label: string; value: string }[];
}

interface WagonRPromotionClientProps {
  promo: PromotionDetail;
}

export default function WagonRPromotionClient({ promo }: WagonRPromotionClientProps) {
  // Booking Dialog State
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const clean = value.replace(/\D/g, '');
    const limited = clean.slice(0, 10);
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setBookingPhone(formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean === '' || clean.length === 10) {
      setPhoneError(null);
    }
  };

  const handleOpenBookingDialog = () => {
    setBookingName('');
    setBookingPhone('');
    setBookingSubmitted(false);
    setNameError(null);
    setPhoneError(null);
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!bookingName.trim()) {
      setNameError('Name is required');
      hasError = true;
    }

    const phoneTrimmed = bookingPhone.trim();
    const cleanPhone = phoneTrimmed.replace(/\D/g, '');
    if (!phoneTrimmed) {
      setPhoneError('Phone number is required');
      hasError = true;
    } else if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits (e.g. 077 192 0470)');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    let customerEmail = 'promotion@senutours.lk';
    if (typeof window !== 'undefined') {
      const customerStr = localStorage.getItem('customerUser');
      if (customerStr) {
        try {
          const customer = JSON.parse(customerStr);
          if (customer && customer.email) {
            customerEmail = customer.email;
          }
        } catch (err) {
          console.error('Error parsing customer user:', err);
        }
      }
    }

    const payload = {
      vehicleType: 'Car',
      vehicleName: 'Wagon R',
      tripType: 'Return',
      pickupLocation: 'Western Province',
      dropoffLocation: 'Colombo',
      destinations: [],
      dateTime: new Date().toISOString(),
      numberOfDays: 1,
      maxPersons: 3,
      maxBags: 2,
      name: bookingName.trim(),
      telephone: cleanPhone,
      additionalPhones: [],
      email: customerEmail,
      remark: 'Wagon R 15% Promotion Request',
      promoCode: 'SENUWAGON',
      discount: 0,
      totalPrice: 0,
      discountPercentage: 15
    };

    try {
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setBookingSubmitted(true);
      } else {
        const errData = await response.json();
        setPhoneError(errData.message || 'Failed to submit booking request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      setPhoneError('Connection error. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <div className="w-full">
        {/* ======================================================== */}
        {/* SECTION 1: PROMOTIONAL HERO BANNER IMAGE */}
        {/* ======================================================== */}
        <section className="w-full pt-24 sm:pt-28 px-4 sm:px-6 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="relative w-full aspect-[1024/746] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src="/offers/wagonr-hero-banner.jpg"
                alt="Wagon R Promotion"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
          {/* ======================================================== */}
          {/* SECTION 2: WHY CHOOSE SENU CABS? */}
          {/* ======================================================== */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] text-center mb-8 sm:mb-10 tracking-tight">
              Senu Cabs තෝරාගත යුත්තේ ඇයි?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
              {/* Item 1 */}
              <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900 text-base sm:text-lg">
                  පළපුරුදු රියදුරන්
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                    <circle cx="7.5" cy="14.5" r="1.5" />
                    <circle cx="16.5" cy="14.5" r="1.5" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900 text-base sm:text-lg">
                  හොඳින් නඩත්තු කළ වාහන
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900 text-base sm:text-lg">
                  බස්නාහිර පළාත පුරා සේවාව
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <Headphones className="w-8 h-8 stroke-current" />
                </div>
                <span className="font-bold text-gray-900 text-base sm:text-lg">
                  24/7 සේවාව
                </span>
              </div>

              {/* Item 5 */}
              <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <TrendingUp className="w-8 h-8 stroke-current" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg block leading-snug">
                    වසර 8ක විශ්වසනීය පළපුරුද්ද සමඟින් සේවාව.
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500 block mt-0.5">
                    (Serving you with 8 years of trusted experience.)
                  </span>
                </div>
              </div>

              {/* Item 6 */}
              <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <MapPin className="w-8 h-8 stroke-current" />
                </div>
                <span className="font-bold text-gray-900 text-base sm:text-lg leading-snug">
                  රියදුරු සිටින ස්ථානය සජීවීව නිරීක්ෂණය කිරීමේ (Live tracking & monitoring) පහසුකම.
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 3: SUZUKI WAGONR DETAILS + 3 PROCESS STEPS */}
          {/* ======================================================== */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] text-center mb-8 sm:mb-10 tracking-tight">
              Suzuki WagonR විස්තර
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column: Description */}
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Suzuki WagonR
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
                  පූර්ණ වායුසමීකරණය කරන ලද (A/C) ඉතා සුවපහසු Suzuki WagonR රථය ඔබේ නගර සංචාර, ගුවන් තොටුපළ ප්‍රවාහන කටයුතු මෙන්ම දෛනික ගමන් බිමන් සඳහා වඩාත් සුදුසුයි. පළපුරුදු රියැදුරෙකු සමඟ ආරක්ෂිතව සහ පහසුවෙන් ඔබේ ගමනාන්තය වෙත ළඟා වන්න.
                </p>
              </div>

              {/* Right Column: 3 Process Steps */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-2 shadow-xs">
                    <FileText className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                    1. වෙන්කරවා ගන්න
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-2 shadow-xs">
                    <ClipboardCheck className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                    2. තහවුරු කරගන්න
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-2 shadow-xs">
                    <Car className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                    3. ගමන භුක්ති විඳින්න
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 3.5: SPECIAL OFFER & BENEFITS */}
          {/* ======================================================== */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] text-center mb-8 sm:mb-10 tracking-tight">
              විශේෂ දීමනා සහ කොන්දේසි
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
              {/* Item 1 */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed">
                  ඔබගේ ගමන කිලෝමීටර් 250 කට වඩා වැඩි විය යුතුය.
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <Car className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed">
                  ස්වයං ධාවනය සඳහා ලබා නොදේ (Self-drive නැත) – පළපුරුදු රියදුරෙකු සමඟ පමණක් ලබා දෙනු ලැබේ.
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed">
                  සුවිශේෂී දීමනාව: නොමිලේ පැය 12ක කාලයක්!
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed">
                  විශ්වාසවන්ත සේවාව: කිසිදු සැඟවුණු ගාස්තුවක් නොමැත (No Hidden Charges)
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed">
                  ආරක්ෂාව සහ පහසුව: රියදුරුගේ සියලු විස්තර ගමනට දිනකට පෙර ඔබට ලැබෙනු ඇත.
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 4: CTA BANNER (BLUE BANNER + ORANGE BUTTON) */}
          {/* ======================================================== */}
          <section className="relative w-full bg-gradient-to-r from-[#005fb8] via-[#0074d9] to-[#0284c7] rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-white overflow-hidden">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                දැන්ම වෙන්කරවා ගන්න
              </h3>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  දැන්ම වෙන්කරවා ගැනීමට Book Now බොත්තම මත Click කරන්න
                </p>
            </div>

            <button
              onClick={handleOpenBookingDialog}
              className="bg-[#ff6a00] hover:bg-[#e85d00] active:scale-95 text-white font-extrabold text-base sm:text-lg px-8 py-3.5 rounded-2xl shadow-lg shadow-black/20 hover:shadow-black/30 transition-all duration-200 cursor-pointer flex-shrink-0"
            >
              Book Now
            </button>
          </section>

          {/* ======================================================== */}
          {/* SECTION 5: OUR SERVICES (3 CARDS) */}
          {/* ======================================================== */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] text-center mb-8 sm:mb-10 tracking-tight">
              අපගේ සේවාවන්
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {/* Service 1: Airport Transfers */}
              <div className="relative rounded-2xl overflow-hidden shadow-md group aspect-[4/3] bg-slate-900">
                <Image
                  src="/service/airport.webp"
                  alt="ගුවන්තොටුපළ ප්‍රවාහනය"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-center p-4">
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-wide text-center drop-shadow-md">
                    ගුවන්තොටුපළ ප්‍රවාහනය
                  </span>
                </div>
              </div>

              {/* Service 2: City Tours */}
              <div className="relative rounded-2xl overflow-hidden shadow-md group aspect-[4/3] bg-slate-900">
                <Image
                  src="/service/city.webp"
                  alt="නගර සංචාර"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-center p-4">
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-wide text-center drop-shadow-md">
                    නගර සංචාර
                  </span>
                </div>
              </div>

              {/* Service 3: Special Tours */}
              <div className="relative rounded-2xl overflow-hidden shadow-md group aspect-[4/3] bg-slate-900">
                <Image
                  src="/service/coparate.webp"
                  alt="විශේෂ සංචාර"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-center p-4">
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-wide text-center drop-shadow-md">
                    විශේෂ සංචාර
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Terms & Policies Link */}
          <div className="text-center pt-2 pb-6">
            <button
              onClick={() => setPolicyOpen(true)}
              className="text-xs sm:text-sm text-slate-500 hover:text-sky-600 underline transition-colors cursor-pointer"
            >
              Privacy Policies & Terms and Conditions
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* ======================================================== */}
      {/* CUSTOM BOOKING REQUEST DIALOG MODAL */}
      {/* ======================================================== */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ height: '8px', background: 'linear-gradient(90deg, #ff6a00 0%, #0284c7 100%)' }} />

        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={() => setBookingDialogOpen(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#94a3b8',
            '&:hover': { color: '#475569' }
          }}
        >
          <X size={20} />
        </IconButton>

        {!bookingSubmitted ? (
          <DialogContent sx={{ p: 4, pt: 5 }}>
            <Typography sx={{
              fontWeight: 800,
              fontSize: '1.65rem',
              color: '#0f172a',
              mb: 1,
              textAlign: 'center'
            }}>
              Wagon R වෙන්කරවා ගැනීම
            </Typography>

            <Typography sx={{
              fontSize: '0.875rem',
              color: '#64748b',
              mb: 3.5,
              lineHeight: 1.6,
              textAlign: 'center'
            }}>
              ඔබගේ නම සහ දුරකථන අංකය ඇතුළත් කරන්න. අපගේ කණ්ඩායම ඉතා ඉක්මනින් ඔබව සම්බන්ධ කරගනු ඇත.
            </Typography>

            <Box component="form" onSubmit={handleBookingSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="ඔබගේ නම (Your Name)"
                value={bookingName}
                onChange={(e) => {
                  setBookingName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                error={!!nameError}
                helperText={nameError}
                variant="outlined"
                size="small"
                required
              />

              <TextField
                fullWidth
                label="දුරකථන අංකය (Phone Number)"
                value={bookingPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                error={!!phoneError}
                helperText={phoneError || "උදා: 077 123 4567"}
                variant="outlined"
                size="small"
                placeholder="07X XXX XXXX"
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#ff6a00] hover:bg-[#e85d00] active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200 mt-2 disabled:opacity-50 cursor-pointer text-base"
              >
                {isSubmitting ? 'යොමු කරමින් පවතී...' : 'ඉදිරියට යන්න (Submit Request)'}
              </button>
            </Box>
          </DialogContent>
        ) : (
          <DialogContent sx={{ p: 5, textAlign: 'center' }}>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', mb: 1.5 }}>
              ස්තූතියි!
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#475569', mb: 4, lineHeight: 1.6 }}>
              ඔබගේ වෙන්කරවා ගැනීමේ ඉල්ලීම සාර්ථකව ලැබුණි. අපගේ කණ්ඩායම සුළු වේලාවකින් ඔබව අමතනු ඇත.
            </Typography>
            <button
              onClick={() => setBookingDialogOpen(false)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-all cursor-pointer text-sm"
            >
              හරි (Done)
            </button>
          </DialogContent>
        )}
      </Dialog>

      <PolicyDialog open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </div>
  );
}

