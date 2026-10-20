const benefits = [
  { title: 'Open Trips', text: 'Driver App එකෙන් Trips සඳහා Request කරන්න' },
  { title: 'Priority Hire Access', text: 'Super Team සඳහා වෙන්වන hires සඳහා අවස්ථාව' },
  {
    title: '85%+ Hire Allocation',
    text: 'Senu Cabs hires වලින් 85%කට වැඩි ප්‍රමාණයක් Super Team සාමාජිකයින් වෙත ලබාදීම සමාගමේ ප්‍රතිපත්තියයි',
  },
  { title: 'WhatsApp Hires', text: 'එදිනම ක්‍රියාත්මක වන ඇතැම් hires ලබාගැනීමට අවස්ථාව' },
  {
    title: 'Carry Forward',
    text: 'අදාළ කොන්දේසි යටතේ භාවිතා නොවූ Hire Value එක ඉදිරි මාසයට ගෙනයාමේ හැකියාව',
  },
  { title: 'Top-Up', text: 'Package Limit අවසන් වූ විට අවශ්‍ය නම් Top-Up කළ හැක' },
];

const packages = [
  { fee: 'Rs. 1,000', limit: 'Rs. 25,000', recommended: true },
  { fee: 'Rs. 2,000', limit: 'Rs. 50,000' },
  { fee: 'Rs. 3,000', limit: 'Rs. 100,000' },
  { fee: 'Rs. 4,000', limit: 'Rs. 150,000' },
  { fee: 'Rs. 5,000', limit: 'Rs. 200,000' },
];

export default function SuperTeamTermsRoutePage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-6 sm:pt-10 pb-16 sm:pb-20 text-gray-800 font-sans overflow-x-hidden">
      {/* Hero Header Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#071d24] via-[#0d313d] to-[#0a2540] text-white p-6 sm:p-10 md:p-12 shadow-xl shadow-gray-900/10 border border-emerald-900/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold uppercase tracking-wider mb-4">
              Senu Cabs &amp; Tours – මාලබේ
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
              SUPER <span className="text-green-400">TEAM</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
              වැඩි Hire අවස්ථා. වැඩි ආදායම් අවස්ථා.
            </p>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              Senu Cabs Super Team එකට එකතු වී ඔබේ Driver App එකෙන් වැඩි Hire අවස්ථා ලබාගන්න.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-5">
            ඔබට ලැබෙන <span className="text-green-600">ප්‍රධාන ප්‍රතිලාභ</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-3 bg-gray-50/80 rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed min-w-0 break-words">
                  <span className="font-bold text-gray-900">{b.title}</span> – {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-5">
            Choose Your <span className="text-green-600">Package</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {packages.map((p) => (
              <div
                key={p.fee}
                className={`relative rounded-2xl p-5 border-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  p.recommended
                    ? 'border-green-500 bg-gradient-to-br from-emerald-50 to-green-50'
                    : 'border-gray-200 bg-gray-50/80'
                }`}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ Starter
                  </span>
                )}
                <div className="text-xs font-semibold text-gray-500 mb-1">මාසික ගාස්තුව</div>
                <div className="text-2xl font-black text-gray-900 mb-3">{p.fee}</div>
                <div className="h-px bg-gray-200 mb-3" />
                <div className="text-xs font-semibold text-gray-500 mb-1">Hire Value Limit</div>
                <div className="text-lg font-bold text-green-700">{p.limit}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="bg-emerald-50 border border-green-200 rounded-xl p-4 text-sm font-semibold text-emerald-900 leading-relaxed">
              ⭐ නව සාමාජිකයින් Rs. 1,000 Package එකෙන් ආරම්භ කරන්න.
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
              Package Limit යනු සහතික කළ Hire Value එකක් නොවේ. Hire allocation එක availability,
              location, vehicle type, customer requirements සහ driver performance මත තීරණය වේ.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
