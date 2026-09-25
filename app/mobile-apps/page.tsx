'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePWA } from '@/context/PWAContext';
import Footer from '@/components/footer';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Car,
  Zap,
  Phone,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  HelpCircle,
  Users
} from 'lucide-react';

export default function MobileAppsPage() {
  const { installPrompt, isInstalled, showInstallPrompt } = usePWA();
  const [showIosGuide, setShowIosGuide] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 font-sans">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071d24] via-[#0d313d] to-[#0a2540] text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs sm:text-sm font-bold uppercase tracking-wider mb-5">
            <Sparkles size={16} />
            Official Senu Tours Digital Apps
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
            Travel Smarter with <span className="text-green-400">Senu Tours Apps</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Experience fast, reliable booking on your smartphone. Available instantly for passengers
            and driver partners with no heavy app downloads required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#passenger-app"
              className="bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold px-6 py-3.5 rounded-full text-sm sm:text-base transition-all duration-200 shadow-lg shadow-green-600/30 flex items-center gap-2"
            >
              <Smartphone size={18} />
              Passenger App
            </a>
            <a
              href="#driver-app"
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 font-bold px-6 py-3.5 rounded-full text-sm sm:text-base backdrop-blur-md transition-all duration-200 flex items-center gap-2"
            >
              <Car size={18} />
              Driver Partner App
            </a>
          </div>
        </div>
      </section>

      {/* Main Apps Grid Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Passenger App Card */}
          <div
            id="passenger-app"
            className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-md shadow-gray-200/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-md shadow-green-200">
                  <Smartphone size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                    For Travelers & Commuters
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                    Senu Tours App
                  </h2>
                </div>
              </div>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                Book cars, vans, safari jeeps, and wedding vehicles in just a few taps. Get live vehicle rates,
                direct driver contact, and round-the-clock dispatch across Sri Lanka.
              </p>

              {/* Feature Points */}
              <div className="space-y-3.5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Instant Ride Booking</h4>
                    <p className="text-xs text-gray-500">Book any category vehicle with instant confirmation and real-time pickup updates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">GPS Route & Live Navigation</h4>
                    <p className="text-xs text-gray-500">Real-time route visibility, driver location tracking, and transparent journey distance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Transparent & Fixed Rates</h4>
                    <p className="text-xs text-gray-500">Upfront cost calculations without hidden fees or surprise surcharges.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Zero Storage Installation (PWA)</h4>
                    <p className="text-xs text-gray-500">Installs in seconds directly from the browser without draining your phone memory.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Install Action Area */}
            <div className="pt-6 border-t border-gray-100">
              {isInstalled ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-bold justify-center">
                  <CheckCircle2 size={18} className="text-green-600" />
                  App Installed on this Device
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      if (installPrompt) {
                        showInstallPrompt();
                      } else {
                        setShowIosGuide(!showIosGuide);
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl text-sm sm:text-base transition-all duration-200 shadow-md shadow-green-600/20 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {installPrompt ? 'Install App Instantly' : 'Install / Add to Home Screen'}
                  </button>

                  <button
                    onClick={() => setShowIosGuide(!showIosGuide)}
                    className="w-full text-center text-xs font-semibold text-gray-500 hover:text-green-700 transition-colors py-1 flex items-center justify-center gap-1"
                  >
                    <HelpCircle size={14} />
                    {showIosGuide ? 'Hide installation guide' : 'How to install on iPhone & Android?'}
                  </button>
                </div>
              )}

              {/* iOS / Browser Guide Dropdown */}
              {showIosGuide && (
                <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-2">
                  <p className="font-bold text-gray-800">📱 Installation Instructions:</p>
                  <p>
                    <span className="font-semibold text-gray-800">iPhone / iPad (Safari):</span> Tap the <span className="font-bold text-blue-600">Share icon (⎋)</span> at the bottom of the screen, scroll down, and select <span className="font-bold text-gray-900">&quot;Add to Home Screen&quot;</span>.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Android (Chrome):</span> Tap the <span className="font-bold text-gray-900">3 dots (⋮)</span> at the top right and tap <span className="font-bold text-gray-900">&quot;Install App&quot;</span> or <span className="font-bold text-gray-900">&quot;Add to Home Screen&quot;</span>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Driver Partner App Card */}
          <div
            id="driver-app"
            className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-md shadow-gray-200/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <Car size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    For Drivers &amp; Vehicle Owners
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                    Driver Partner App
                  </h2>
                </div>
              </div>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                Partner with Senu Cabs &amp; Tours. Receive verified customer trips, airport drop hires,
                and round-tour packages directly on your phone with industry-best commission rates.
              </p>

              {/* Feature Points */}
              <div className="space-y-3.5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Open Trips &amp; Super Team</h4>
                    <p className="text-xs text-gray-500">Access exclusive airport drops, one-way hires, and multi-day island tours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Verified Driver Community</h4>
                    <p className="text-xs text-gray-500">Professional support, transparent agreements, and prompt payout transfers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Seamless Trip Management</h4>
                    <p className="text-xs text-gray-500">Manage trip status, pickup alerts, and customer contact directly inside the app.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">24/7 Operations Support</h4>
                    <p className="text-xs text-gray-500">Dedicated dispatch hotline assistance for on-road support anytime.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Actions */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <Link
                href="/vehicle-registration"
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl text-sm sm:text-base transition-all duration-200 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Car size={18} />
                Register Vehicle &amp; Join as Driver
              </Link>

              <Link
                href="/privacy-and-policies/driver-terms"
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={16} className="text-blue-600" />
                Read Official Driver Terms &amp; Policies
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Steps Guide */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              How to Get Senu Tours on Your Phone
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Follow these three quick steps to install our app on any smartphone in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Open Website</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Visit <span className="font-semibold text-green-700">senutours.com</span> on your smartphone browser (Safari or Chrome).
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Add to Home Screen</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tap the <span className="font-semibold text-gray-800">&quot;Install&quot;</span> prompt banner or your browser&apos;s share menu and select <span className="font-semibold text-gray-800">&quot;Add to Home Screen&quot;</span>.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Launch &amp; Travel</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Open the app icon directly from your home screen for full-screen, ultra-fast bookings anytime!
              </p>
            </div>
          </div>
        </div>

        {/* 24/7 Helpline Banner */}
        <div className="mt-12 bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-green-900/10">
          <div>
            <h4 className="text-xl sm:text-2xl font-black mb-1">Need Help Installing or Booking?</h4>
            <p className="text-green-100 text-xs sm:text-sm">
              Our 24/7 Customer Care team is ready to guide you or take manual phone bookings.
            </p>
          </div>
          <a
            href="tel:0702787787"
            className="shrink-0 bg-white text-green-800 hover:bg-green-50 active:scale-95 font-black px-6 py-3.5 rounded-full text-sm sm:text-base transition-all shadow-md flex items-center gap-2"
          >
            <Phone size={18} />
            Call Hotline: 0702787787
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
