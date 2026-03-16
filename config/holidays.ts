export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'poya' | 'public' | 'weekend' | 'special';
}

export const SRI_LANKAN_HOLIDAYS: Record<string, string> = {
  // 2025
  '2025-01-13': 'Duruthu Full Moon Poya Day',
  '2025-01-14': 'Tamil Thai Pongal Day',
  '2025-02-04': 'National Day',
  '2025-02-12': 'Navam Full Moon Poya Day',
  '2025-02-26': 'Mahasivarathri Day',
  '2025-03-13': 'Madin Full Moon Poya Day',
  '2025-03-31': 'Id-Ul-Fitr (Ramazan Festival Day)',
  '2025-04-12': 'Bak Full Moon Poya Day',
  '2025-04-13': 'Day Prior to Sinhala and Tamil New Year',
  '2025-04-14': 'Sinhala and Tamil New Year Day',
  '2025-04-15': 'Special Bank Holiday',
  '2025-05-01': 'May Day',
  '2025-05-12': 'Vesak Full Moon Poya Day',
  '2025-05-13': 'Day after Vesak Full Moon Poya Day',
  '2025-05-28': 'Eid al-Adha',
  '2025-06-10': 'Poson Full Moon Poya Day',
  '2025-07-09': 'Esala Full Moon Poya Day',
  '2025-08-07': 'Nikini Full Moon Poya Day',
  '2025-09-04': 'Binara Full Moon Poya Day',
  '2025-10-01': 'Vap Full Moon Poya Day',
  '2025-10-05': 'Deepavali',
  '2025-10-19': 'Il Full Moon Poya Day',
  '2025-11-04': 'Unduvap Full Moon Poya Day',
  '2025-12-25': 'Christmas Day',

  // 2026
  '2026-01-03': 'Duruthu Full Moon Poya Day',
  '2026-01-15': 'Tamil Thai Pongal Day',
  '2026-02-01': 'Navam Full Moon Poya Day',
  '2026-02-04': 'National Day',
  '2026-02-15': 'Mahasivarathri Day',
  '2026-03-02': 'Medin Full Moon Poya Day',
  '2026-03-21': 'Eid-ul-Fitr (Ramazan Festival Day)',
  '2026-04-01': 'Bak Full Moon Poya Day',
  '2026-04-03': 'Good Friday',
  '2026-04-13': 'Day before Sinhala and Tamil New Year',
  '2026-04-14': 'Sinhala and Tamil New Year Day',
  '2026-05-01': 'International Labour Day / Vesak Full Moon Poya Day',
  '2026-05-02': 'Day after Vesak Full Moon Poya Day',
  '2026-05-28': 'Eid al-Adha (Hajj Festival Day)',
  '2026-05-30': 'Adhi Poson Full Moon Poya Day',
  '2026-06-29': 'Poson Full Moon Poya Day',
  '2026-07-29': 'Esala Full Moon Poya Day',
  '2026-08-26': 'Milad-un-Nabi (Prophet\'s Birthday)',
  '2026-08-27': 'Nikini Full Moon Poya Day',
  '2026-09-26': 'Binara Full Moon Poya Day',
  '2026-10-25': 'Vap Full Moon Poya Day',
  '2026-11-08': 'Deepavali',
  '2026-11-24': 'Il Full Moon Poya Day',
  '2026-12-23': 'Unduwap Full Moon Poya Day',
  '2026-12-25': 'Christmas Day',
};

export const isPoyaDay = (dateStr: string): boolean => {
  return SRI_LANKAN_HOLIDAYS[dateStr]?.toLowerCase().includes('poya') || false;
};

export const getHolidayName = (dateStr: string): string | null => {
  return SRI_LANKAN_HOLIDAYS[dateStr] || null;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};
