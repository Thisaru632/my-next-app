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
  { label: "Contact Us", href: "/contact-us" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  return (
    <nav className="w-full bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
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
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeLink === link.href
                      ? "bg-yellow-500 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
            className="md:hidden text-gray-900 focus:outline-none"
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
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                setActiveLink(link.href);
                setIsOpen(false);
              }}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeLink === link.href
                  ? "bg-yellow-500 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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