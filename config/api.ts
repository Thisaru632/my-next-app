export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export const API_ENDPOINTS = {
    BOOKINGS: `${API_BASE_URL}/api/bookings`,
    CONTACTS: `${API_BASE_URL}/api/contacts`,
};
