'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePWA } from '@/context/PWAContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

export default function PWAInstallBanner() {
    const { installPrompt, isInstalled, showInstallPrompt } = usePWA();
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const isStaff = pathname?.startsWith('/staff');

    useEffect(() => {
        if (installPrompt && !isInstalled) {
            setIsVisible(true);
        }
    }, [installPrompt, isInstalled]);

    if (isInstalled || !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ 
                        type: 'spring', 
                        damping: 25, 
                        stiffness: 120,
                        delay: 1.5 // Small delay after page load for premium feel
                    }}
                    className="fixed top-2 left-0 w-full z-[100] px-4"
                >
                    <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md border border-green-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-full flex items-center justify-between p-1.5 pl-4 overflow-hidden relative group">
                        {/* Subtle glow effect */}
                        <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-transparent via-green-500/5 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                        
                        <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md shadow-green-200 shrink-0">
                                <Download className="text-white w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[13px] font-bold text-gray-800 leading-none flex items-center gap-1">
                                    {isStaff ? 'Senu Staff Portal' : 'Senu Tours App'}
                                </h3>
                                <p className="text-[10px] text-green-600 font-semibold tracking-tight uppercase">
                                    {isStaff ? 'Admin Workspace' : 'Instant Install'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 relative z-10">
                            <button
                                onClick={showInstallPrompt}
                                className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-5 py-2 rounded-full text-[11px] font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                Install
                            </button>
                            
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
