'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/footer';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col justify-between pt-28 sm:pt-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center max-w-2xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Special Promotional Deals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Exclusive Offers
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Enjoy premium rides and tours across Sri Lanka with our limited-time rates and special discounts.
          </p>
        </div>

        {/* Offer Card Container */}
        <div className="flex flex-col items-center w-full max-w-lg">
          {/* Card with image */}
          <div className="w-full bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            <Link href="/promotion/wagonr" className="block relative aspect-square w-full overflow-hidden bg-black/5">
              <Image
                src="/offers/wagonr-offer.jpg"
                alt="Wagon R Special Promotional Offer"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 500px, 512px"
                className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Explore Button under the card */}
          <div className="mt-6 sm:mt-8 flex justify-center w-full">
            <Link
              href="/promotion/wagonr"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all duration-200"
            >
              <span>Explore</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

