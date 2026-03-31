export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Default to local for dev, use env for prod

export const API_ENDPOINTS = {
    BOOKINGS: `${API_BASE_URL}/api/bookings`,
    CONTACTS: `${API_BASE_URL}/api/contacts`,
    AUTH: `${API_BASE_URL}/api/auth`,
    RATE_CARDS: `${API_BASE_URL}/api/rate-cards`,
    RATE_CARD_CATEGORIES: `${API_BASE_URL}/api/rate-cards/categories`,
    TOUR_PACKAGES: `${API_BASE_URL}/api/tour-packages`,
    PROMO_CODES: `${API_BASE_URL}/api/promo-codes`,
    CUSTOMERS: `${API_BASE_URL}/api/customers`,
    STAFF_GUIDES: `${API_BASE_URL}/api/staff-guides`,
    CAB_SERVICES: `${API_BASE_URL}/api/cab-service`,
    CAB_RATES: `${API_BASE_URL}/api/cab-rates`,
};
