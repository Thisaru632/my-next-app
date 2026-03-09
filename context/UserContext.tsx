"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    login: (userData: any) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('customerToken');
            if (token) {
                try {
                    const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    } else {
                        localStorage.removeItem('customerToken');
                    }
                } catch (error) {
                    console.error('Error checking user auth:', error);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = (userData: any) => {
        setUser(userData);
        if (userData.token) {
            localStorage.setItem('customerToken', userData.token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('customerToken');
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
