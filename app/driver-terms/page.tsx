'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/footer';
import {
  FileText,
  ChevronRight,
  CheckCircle2,
  CheckSquare,
  Square
} from 'lucide-react';

interface AgreementSection {
  id: string;
  number: string;
  title: string;
  points: (string | { text: string; subPoints: string[]; footer?: string })[];
}

const agreementSections: AgreementSection[] = [
  {
    id: 'section-1',
    number: '01',
    title: '1. රියදුරු ලියාපදිංචිය',
    points: [
      'ලියාපදිංචි කිරීමේදී ඉදිරිපත් කරන සියලු තොරතුරු සහ ලේඛන සත්‍ය, නිවැරදි, සම්පූර්ණ සහ වලංගු බව මම තහවුරු කරමි.',
      'රියදුරු බලපත්‍රය, වාහන ලියාපදිංචි ලේඛන, රක්ෂණය සහ අවශ්‍ය අනෙකුත් ලේඛන වලංගුව සහ යාවත්කාලීනව තබා ගැනීමට මම එකඟ වෙමි.',
      'ව්‍යාජ, වෙනස් කරන ලද, කල් ඉකුත් වූ හෝ අසත්‍ය ලේඛන ඉදිරිපත් කිරීම හේතුවෙන් මගේ රියදුරු ගිණුම ප්‍රතික්ෂේප කිරීමට, තාවකාලිකව නවතා දැමීමට හෝ අවලංගු කිරීමට Senu Cabs & Tours හට හැකියාව ඇති බව මම තේරුම් ගනිමි.'
    ]
  },
  {
    id: 'section-2',
    number: '02',
    title: '2. රියදුරු සහ වාහන වගකීම',
    points: [
      'Senu Cabs & Tours වෙත ලියාපදිංචි කර ඇති වාහනය ධාවනය කිරීමට මා හට නීත්‍යානුකූල අයිතිය ඇති බව මම තහවුරු කරමි.',
      'ශ්‍රී ලංකාවේ අදාළ රථවාහන නීති, නියෝග සහ අනෙකුත් නීතිමය අවශ්‍යතා පිළිපැදීමට මම එකඟ වෙමි. එසේ නොවන තත්වයකදී උද්ගත වන ඕනෑම නීතිමය තත්වයක් හෝ දඩයක් සම්භන්ධ වගකීමෙන් Senu Cabs & Tours ආයතනය සම්පූර්ණයෙන්ම නිදහස් බවටත් ප්‍රකාශ කරමි.',
      'රියදුරු බලපත්‍රය, වාහන ලේඛන, රක්ෂණය සහ අවශ්‍ය අනෙකුත් අනුමැතීන් සෑම විටම වලංගුව තබා ගැනීම මාගේ වගකීම වේ.',
      'වාහනය ආරක්ෂිත, පිරිසිදු සහ ධාවනයට සුදුසු තත්ත්වයක තබා ගැනීමට මම එකඟ වෙමි.'
    ]
  },
  {
    id: 'section-3',
    number: '03',
    title: '3. Driver App භාවිතය',
    points: [
      'Senu Cabs & Tours Driver App එක මඟින් මට මගී ගමන් ඉල්ලීම් ලබා ගැනීමට, ගමන් කළමනාකරණය කිරීමට සහ Senu Cabs & Tours විසින් ලබා දෙන සේවාවන් භාවිතා කිරීමට හැකි බව මම තේරුම් ගනිමි.',
      'මගේ රියදුරු ගිණුම මට පමණක් අදාළ වේ.',
      'වෙනත් පුද්ගලයෙකුට මගේ ගිණුම, හැඳුනුම් තොරතුරු, ලේඛන හෝ රියදුරු Profile එක භාවිතා කර ගමන් සේවා ලබා දීමට ඉඩ නොදෙමි.',
      'Driver App එක, GPS/ස්ථාන තොරතුරු, ගමන් තොරතුරු හෝ ගාස්තු පද්ධතිය වංචාකාරී ලෙස වෙනස් කිරීමට හෝ අනිසි ලෙස භාවිතා කිරීමට මම කටයුතු නොකරමි.'
    ]
  },
  {
    id: 'section-4',
    number: '04',
    title: '4. මගී සේවාව සහ රියදුරු හැසිරීම',
    points: [
      'සෑම මගියෙකුටම ආරක්ෂිත, ගෞරවාන්විත සහ වෘත්තීයමය සේවාවක් ලබා දීමට මම එකඟ වෙමි.',
      'මගීන්ට හිරිහැර කිරීම, තර්ජනය කිරීම, ප්‍රචණ්ඩකාරී ලෙස හැසිරීම, ලිංගික අයුතු හැසිරීම්, අපහාස කිරීම, වෙනස්කම් කිරීම හෝ අනාරක්ෂිත ලෙස රිය පැදවීම මම සිදු නොකරමි.',
      'මත්පැන්, මත්ද්‍රව්‍ය හෝ රිය පැදවීමේ හැකියාවට බලපාන වෙනත් ද්‍රව්‍ය ගමන් වාර අතරතුර (රාත්‍රී නවාතැන් ගැනීමකදී වුවද) භාවිතා නොකරන බවටත්, ගමන් වාරයක් ආරම්භයට ප්‍රථමයෙන් භාවිතා කර සිටියදී රිය පැදවීම නොකරන බවටත් එකඟ වෙමි.',
      'එක් දින ගමන් වාර සඳහා රියදුරු වෙත කෑම බීම ලබා දීම සඳහා මගියෙකුට කිසිදු බැඳීමක් නොමැති අතර එවැනි ඉල්ලීමක් හෝ සිදු නොකළ යුතුය. දින දෙකක් හෝ ඊට වැඩි ගණනකදී Senu Cabs & Tours ආයතනය විසින් ඔබ වෙත දැනුවත් කරනු ලබන රියදුරු කෑම/නවාතැන් ලැබෙන ක්‍රමවේදයට වඩා වැඩි යමක් පාරිභෝගිකයාගෙන් ඉල්ලා නොසිටීමටද එකඟ වෙමි.',
      'මගියාගේ ආරක්ෂාව මගේ ප්‍රමුඛ වගකීම බව මම පිළිගනිමි.'
    ]
  },
  {
    id: 'section-5',
    number: '05',
    title: '5. මගී තොරතුරු සහ රහස්‍යභාවය',
    points: [
      'Driver App හරහා මට ලැබෙන මගී තොරතුරු රහස්‍ය තොරතුරු ලෙස සැලකිය යුතු බව මම තේරුම් ගනිමි.',
      'එම තොරතුරු අදාළ ගමන සම්පූර්ණ කිරීම සඳහා පමණක් භාවිතා කිරීමට මම එකඟ වෙමි.',
      {
        text: 'මගී තොරතුරු:',
        subPoints: [
          'වෙනත් පුද්ගලයන් සමඟ බෙදා ගැනීම,',
          'විකිණීම,',
          'අනවසරයෙන් සුරැකීම,',
          'පුද්ගලික කටයුතු සඳහා භාවිතා කිරීම,',
          'අනවසර සම්බන්ධතා සඳහා භාවිතා කිරීම'
        ],
        footer: 'මම සිදු නොකරමි.'
      }
    ]
  },
  {
    id: 'section-6',
    number: '06',
    title: '6. ගමන්, ගාස්තු සහ ගෙවීම්',
    points: [
      'Driver App හි පෙන්වන ගමන් තොරතුරු සහ අදාළ ගාස්තු අනුව ගමන් සේවා ලබා දීමට මම එකඟ වෙමි.',
      'මුදල් ගෙවන (Cash) ගමන් සඳහා, අදාළ ගාස්තුව මගියාගෙන් ලබා ගැනීම රියදුරුගේ වගකීම වේ.',
      'මගියාගෙන් App එකේ පෙන්වන හෝ Senu Cabs & Tours විසින් අනුමත නොකළ අමතර මුදලක් ඉල්ලා නොසිටිමි.',
      'අදාළ අවස්ථාවලදී ගාස්තුවට රැඳී සිටින කාල ගාස්තු, Toll ගාස්තු, Parking ගාස්තු හෝ App එක මඟින් දන්වන වෙනත් අදාළ ගාස්තු ඇතුළත් විය හැකිය.'
    ]
  },
  {
    id: 'section-7',
    number: '07',
    title: '7. රැඳී සිටින කාලය සහ ගමන් අවලංගු කිරීම',
    points: [
      'මගියා සඳහා ලබා දෙන නොමිලේ රැඳී සිටීමේ කාලය සහ ඉන් පසු අදාළ වන රැඳී සිටීමේ ගාස්තු Senu Cabs & Tours විසින් තීරණය කරනු ලබන අතර, ඒවා Driver App හි පෙන්විය හැක.',
      'මම හිතාමතා ගමන ප්‍රමාද නොකරමි සහ රැඳී සිටින කාලය පිළිබඳ අසත්‍ය තොරතුරු ලබා නොදෙමි.',
      'සාධාරණ හේතුවක් නොමැතිව නැවත නැවතත් ගමන් අවලංගු කිරීම හෝ cancellation ගාස්තු හෝ වෙනත් ප්‍රතිලාභ ලබා ගැනීම සඳහා App එකේ ගමන් තොරතුරු වංචාකාරී ලෙස වෙනස් කිරීම මම සිදු නොකරමි.'
    ]
  },
  {
    id: 'section-8',
    number: '08',
    title: '8. කොමිස් / සේවා ගාස්තුව',
    points: [
      'සම්පූර්ණ කරන ලද ගමන් සඳහා Senu Cabs & Tours විසින් කොමිස් මුදලක් හෝ සේවා ගාස්තුවක් අය කළ හැකි බව මම තේරුම් ගනිමි.',
      'අදාළ කොමිස් හෝ සේවා ගාස්තු ප්‍රතිශතය Driver App එක හෝ Senu Cabs & Tours විසින් ලබා දෙන නිල දැනුම්දීමක් මඟින් දන්වනු ලැබේ.',
      'අදාළ ගාස්තු නියමයන් යාවත්කාලීන කළහොත්, එම වෙනස්කම් Driver App එක හෝ නිල දැනුම්දීමක් මඟින් දැනුම් දිය හැක.'
    ]
  },
  {
    id: 'section-9',
    number: '09',
    title: '9. ආරක්ෂාව, වංචා සහ තහනම් ක්‍රියා',
    points: [
      'Senu Cabs & Tours සේවාව හෝ වාහනය වංචාකාරී, නීති විරෝධී හෝ අනවසර කටයුතු සඳහා භාවිතා නොකරන බව මම එකඟ වෙමි.',
      {
        text: 'පහත ක්‍රියා බරපතළ උල්ලංඝනයන් ලෙස සැලකිය හැකිය:',
        subPoints: [
          'ගිණුම වෙනත් පුද්ගලයෙකුට භාවිතා කිරීමට ලබා දීම;',
          'ව්‍යාජ ලේඛන භාවිතා කිරීම;',
          'ව්‍යාජ ගමන් නිර්මාණය කිරීම;',
          'GPS හෝ ස්ථාන තොරතුරු වෙනස් කිරීම;',
          'ගාස්තු වංචාකාරී ලෙස වෙනස් කිරීම;',
          'මගීන්ට අයුතු ලෙස හැසිරීම;',
          'අනාරක්ෂිත ලෙස රිය පැදවීම;',
          'වෙනත් වංචාකාරී හෝ නීති විරෝධී කටයුතු.'
        ]
      },
      'මෙවැනි බරපතළ උල්ලංඝනයන් සිදු වුවහොත් මගේ ගිණුම වහාම තාවකාලිකව නවතා දැමීමට හෝ අවලංගු කිරීමට Senu Cabs & Tours හට හැකියාව තිබේ.'
    ]
  },
  {
    id: 'section-10',
    number: '10',
    title: '10. ගිණුම තාවකාලිකව නවතා දැමීම හෝ අවලංගු කිරීම',
    points: [
      'මෙම නියමයන් බරපතළ ලෙස උල්ලංඝනය කිරීම, වංචාකාරී ක්‍රියා, ආරක්ෂාව පිළිබඳ ගැටලු, වලංගු නොවන ලේඛන, නීති විරෝධී ක්‍රියා හෝ මගීන්ට, රියදුරන්ට හෝ Senu Cabs & Tours සේවාවට බරපතළ බලපෑමක් ඇති කළ හැකි ක්‍රියා සිදු වුවහොත්, Senu Cabs & Tours විසින් මගේ Driver Account එක තාවකාලිකව නවතා දැමීමට, සීමා කිරීමට හෝ අවලංගු කිරීමට හැකියාව ඇති බව මම තේරුම් ගනිමි.'
    ]
  }
];

export default function DriverTermsPage() {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <main className="min-h-screen bg-[#faf8f5] pt-28 md:pt-32 pb-20 text-gray-800 font-sans">
      {/* Top Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-green-700 font-bold">රියදුරු ලියාපදිංචි වීමේ පරිශීලක ගිවිසුම</span>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071d24] via-[#0d313d] to-[#0a2540] text-white p-6 sm:p-10 md:p-12 shadow-xl shadow-gray-900/10 border border-emerald-900/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold uppercase tracking-wider mb-4">
              Senu Cabs &amp; Tours – මාලබේ
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug mb-3">
              රියදුරු ලියාපදිංචි වීමේ <span className="text-green-400">පරිශීලක ගිවිසුම</span>
            </h1>

            <div className="text-sm font-semibold text-green-300/90 mb-4">
              අවසන් පිළිගැනීම
            </div>

            <div className="bg-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm border border-white/15 text-sm md:text-base text-gray-200 leading-relaxed space-y-3">
              <p>
                Senu Cabs &amp; Tours – මාලබේ සමඟ රියදුරෙකු ලෙස ලියාපදිංචි වීමෙන් සහ මෙම ගිවිසුම පිළිගැනීමෙන්, මම පහත සඳහන් නියමයන් කියවා, තේරුම්ගෙන, ඒවාට එකඟ වන බව තහවුරු කරමි.
              </p>
              <p className="text-gray-300 text-xs md:text-sm">
                මෙම නියමයන් Senu Cabs &amp; Tours Driver App භාවිතා කිරීම සහ Senu Cabs &amp; Tours සේවාව හරහා රියදුරෙකු ලෙස ගමන් සේවා ලබා ගැනීම සම්බන්ධයෙන් අදාළ වේ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents Section (පටුන) - Displayed at the top after title card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 print:hidden">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
            <FileText size={20} className="text-green-600" />
            පටුන (Table of Contents)
          </h3>
          <nav className="space-y-1 sm:space-y-1.5">
            {agreementSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors group"
              >
                <span className="truncate pr-2">{s.title}</span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-green-600 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {agreementSections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow duration-200 scroll-mt-28"
            >
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 text-green-700 font-bold text-xs">
                  {section.number}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.points.map((point, pIdx) => {
                  if (typeof point === 'string') {
                    return (
                      <div key={pIdx} className="flex items-start gap-3 text-sm sm:text-[15px] text-gray-700 leading-relaxed">
                        <CheckCircle2 size={17} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={pIdx} className="bg-gray-50/80 rounded-xl p-4 sm:p-5 border border-gray-100">
                      <div className="flex items-start gap-3 text-sm sm:text-[15px] text-gray-900 font-semibold mb-2">
                        <CheckCircle2 size={17} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{point.text}</span>
                      </div>
                      <ul className="pl-8 space-y-2 mb-2">
                        {point.subPoints.map((sub, sIdx) => (
                          <li key={sIdx} className="list-disc text-sm text-gray-700 leading-relaxed">
                            {sub}
                          </li>
                        ))}
                      </ul>
                      {point.footer && (
                        <div className="pl-8 text-sm font-semibold text-gray-900 pt-1">
                          {point.footer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}

          {/* අවසන් අනුමැතිය (Final Approval) Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-green-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-black text-emerald-950 mb-1">
                  අවසන් අනුමැතිය
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 font-medium mb-4">
                  ලියාපදිංචිය Submit කිරීමට පෙර, කරුණාකර පහත කොටුව සලකුණු කරන්න.
                </p>

                <div
                  onClick={() => setIsAgreed(!isAgreed)}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-300/80 shadow-sm cursor-pointer hover:bg-green-50/50 transition-colors select-none mb-4"
                >
                  <div className="text-green-600 mt-0.5 flex-shrink-0">
                    {isAgreed ? (
                      <CheckSquare size={22} className="text-green-600" />
                    ) : (
                      <Square size={22} className="text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 leading-relaxed">
                    මම Senu Cabs &amp; Tours – මාලබේ Driver Registration User Agreement සහ අදාළ Driver Rules කියවා, තේරුම්ගෙන, ඒවාට එකඟ වෙමි.
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white/70 p-4 rounded-xl border border-green-100">
                  මෙම කොටුව සලකුණු කර “I Agree &amp; Submit” තෝරා ගැනීමෙන්, මම ලබා දී ඇති සියලු තොරතුරු හා ලේඛන සත්‍ය හා වලංගු බවත්, ශ්‍රී ලංකාවේ අදාළ නීති, Senu Cabs &amp; Tours නියමයන්, ආරක්ෂක නියමයන්, ගාස්තු නියමයන් සහ රියදුරු වගකීම් පිළිපැදීමට එකඟ වන බවත් තහවුරු කරමි.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-20 print:hidden">
        <Footer />
      </div>
    </main>
  );
}
