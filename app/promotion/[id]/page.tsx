import React from 'react';
import { redirect } from 'next/navigation';
import PromotionDetailClient from './PromotionDetailClient';

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

const PROMOTION_DETAILS: Record<string, PromotionDetail> = {
  wagonr: {
    id: 'wagonr',
    name: 'Wagon R',
    title: 'දිගු ගමන් සඳහා විශ්වාසවන්ත සේවාව',
    image: '/wagonr-promo.jpg',
    discount: '15% OFF',
    description: '',
    promoCode: 'SENUWAGON',
    passengers: 3,
    bags: 2,
    ac: true,
    conditions: [
      'මෙම මිල කි.මී. 250 ට වැඩි ගොස්-එන චාරිකා (return trip) සඳහා පමණක් වලංගු වේ.',
      'දින කිහිපයක ගමනක් නම් ගාස්තුවේ සුළු වෙනසක් සිදුවිය හැක.',
      'ගමන ආරම්භය බස්නාහිර පළාතෙන් විය යුතුය.'
    ],
    specs: [
      { label: 'Transmission', value: 'Automatic' },
      { label: 'Fuel Type', value: 'Petrol' },
      { label: 'Engine Capacity', value: '1000 cc' },
      { label: 'Luggage Capacity', value: '2 Bags' }
    ]
  },
  alto: {
    id: 'alto',
    name: 'Alto',
    title: 'Alto Economy Saver',
    image: '/Vehicle images/Alto/front.png',
    discount: '10% OFF',
    description: 'Redefine budget travel with Sri Lanka\'s most popular compact car. Extremely light, fuel-efficient, and easy to park anywhere.',
    promoCode: 'SENUALTO',
    passengers: 3,
    bags: 1,
    ac: true,
    conditions: [
      'මෙම මිල කි.මී. 250 ට වැඩි ගොස්-එන චාරිකා (return trip) සඳහා පමණක් වලංගු වේ.',
      'දින කිහිපයක ගමනක් නම් ගාස්තුවේ සුළු වෙනසක් සිදුවිය හැක.',
      'ගමන ආරම්භය බස්නාහිර පළාතෙන් විය යුතුය.'
    ],
    specs: [
      { label: 'Transmission', value: 'Manual' },
      { label: 'Fuel Type', value: 'Petrol' },
      { label: 'Engine Capacity', value: '800 cc' },
      { label: 'Luggage Capacity', value: '1 Bag' }
    ]
  },
  kdh: {
    id: 'kdh',
    name: 'KDH',
    title: 'KDH Group Getaway',
    image: '/Vehicle images/KDH High Roof/front.png',
    discount: '15% OFF',
    description: 'Travel in luxury with your whole group. Standard high-roof Toyota KDH Vans offering dual A/C climate control and ultimate passenger comfort.',
    promoCode: 'SENUKDH',
    passengers: 14,
    bags: 5,
    ac: true,
    conditions: [
      'මෙම මිල කි.මී. 250 ට වැඩි ගොස්-එන චාරිකා (return trip) සඳහා පමණක් වලංගු වේ.',
      'දින කිහිපයක ගමනක් නම් ගාස්තුවේ සුළු වෙනසක් සිදුවිය හැක.',
      'ගමන ආරම්භය බස්නාහිර පළාතෙන් විය යුතුය.'
    ],
    specs: [
      { label: 'Transmission', value: 'Manual / Auto' },
      { label: 'Fuel Type', value: 'Diesel' },
      { label: 'Engine Capacity', value: '2500 cc' },
      { label: 'A/C', value: 'Dual AC Climate Control' }
    ]
  },
  bus: {
    id: 'bus',
    name: 'Bus',
    title: 'Bus Tour Mega Deal',
    image: '/Vehicle images/AC 29 Seater Bus/front.png',
    discount: '20% OFF',
    description: 'Planning a large corporate excursion, family get-together, or wedding event? Get massive discounts on our premium fully air-conditioned coaches.',
    promoCode: 'SENUBUS',
    passengers: 32,
    bags: 10,
    ac: true,
    conditions: [
      'මෙම මිල කි.මී. 250 ට වැඩි ගොස්-එන චාරිකා (return trip) සඳහා පමණක් වලංගු වේ.',
      'දින කිහිපයක ගමනක් නම් ගාස්තුවේ සුළු වෙනසක් සිදුවිය හැක.',
      'ගමන ආරම්භය බස්නාහිර පළාතෙන් විය යුතුය.'
    ],
    specs: [
      { label: 'Transmission', value: 'Manual' },
      { label: 'Fuel Type', value: 'Diesel' },
      { label: 'Engine Capacity', value: '4000 cc' },
      { label: 'Seating Layout', value: '2x2 Luxury Layout' }
    ]
  }
};

export async function generateStaticParams() {
  return [
    { id: 'wagonr' },
    { id: 'alto' },
    { id: 'kdh' },
    { id: 'bus' }
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromotionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const promo = PROMOTION_DETAILS[id];

  // If promotion doesn't exist, redirect back to promotions list page
  if (!promo) {
    redirect('/promotion');
  }

  return <PromotionDetailClient promo={promo} />;
}
