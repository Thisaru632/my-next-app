"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tours", href: "/all_packages" },
  { label: "Our Vehicles", href: "/our-vehicles" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about_us" },
  { label: "Contact Us", href: "/contact" },
];

interface NavbarProps {
  isHeroPage?: boolean;
}

export default function Navbar({ isHeroPage = true }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  const textColor = isHeroPage ? "text-white/90" : "text-gray-800";
  const hoverBg = isHeroPage ? "hover:bg-green-500/10" : "hover:bg-green-50";
  const hoverText = isHeroPage ? "hover:text-green-400" : "hover:text-green-600";
  const activeBg = "bg-green-600";
  const activeText = "text-white";

  return (
    <nav className={`${isHeroPage ? "absolute bg-transparent" : "relative bg-white shadow-sm"} top-0 left-0 w-full z-50 transition-all duration-300`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo - if isHeroPage is false, we might want a different logo or just the same one if it looks good */}
          <Link href="/" className="flex items-center -ml-4">
            <Image
              src="/senu tours 3d.png"
              alt="Senu Tours Logo"
              width={60}
              height={20}
              priority
              className="object-contain"
            />
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeLink === link.href
                    ? `${activeBg} ${activeText}`
                    : `${textColor} ${hoverBg} ${hoverText}`
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden focus:outline-none ${isHeroPage ? "text-white" : "text-gray-800"}`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden ${isHeroPage ? "bg-black/80 backdrop-blur-md border-t border-white/10" : "bg-white border-t border-gray-100"} px-4 py-2`}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                setActiveLink(link.href);
                setIsOpen(false);
              }}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeLink === link.href
                ? `${activeBg} ${activeText}`
                : `${isHeroPage ? "text-white/80 hover:text-green-400 hover:bg-green-500/10" : "text-gray-700 hover:text-green-600 hover:bg-green-50"}`
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
