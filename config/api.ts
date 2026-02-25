export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://senu-backend-xu6s.vercel.app';

export const API_ENDPOINTS = {
    BOOKINGS: `${API_BASE_URL}/api/bookings`,
    CONTACTS: `${API_BASE_URL}/api/contacts`,
    AUTH: `${API_BASE_URL}/api/auth`,
    RATE_CARDS: `${API_BASE_URL}/api/rate-cards`,
};
