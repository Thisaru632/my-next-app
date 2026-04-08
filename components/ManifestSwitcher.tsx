'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ManifestSwitcher() {
    const pathname = usePathname();
    const isStaff = pathname?.startsWith('/staff');

    useEffect(() => {
        // Find existing manifest link or create one
        let manifestLink = document.querySelector('link[rel="manifest"]');
        
        if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.setAttribute('rel', 'manifest');
            document.head.appendChild(manifestLink);
        }

        const manifestHref = isStaff ? '/manifest-staff.json' : '/manifest.json';
        
        // Only update if it's different to avoid redundant refetches
        if (manifestLink.getAttribute('href') !== manifestHref) {
            manifestLink.setAttribute('href', manifestHref);
            console.log(`Manifest switched to: ${manifestHref}`);
        }
    }, [isStaff]);

    return null;
}
