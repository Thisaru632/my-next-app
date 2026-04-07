"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import AuthModal from "./AuthModal";
import ProfileModal from "./ProfileModal";
import { AccountCircle, Logout, Call } from "@mui/icons-material";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about_us" },
  { label: "Contact Us", href: "/contact" },
];

interface NavbarProps {
  isHeroPage?: boolean;
}

export default function Navbar({ isHeroPage = true }: NavbarProps) {
  const { user, logout } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [primarySim, setPrimarySim] = useState<string>("0702787787");

  useEffect(() => {
    // Hotline is now fixed to 0702787787 as requested
    setPrimarySim("0702787787");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Header should be light (white background, dark text) if not on hero page OR if scrolled down
  const isLightHeader = !isHeroPage || isScrolled;

  const textColor = isLightHeader ? "text-gray-800" : "text-white/90";
  const hoverBg = isLightHeader ? "hover:bg-green-50" : "hover:bg-green-500/10";
  const hoverText = isLightHeader ? "hover:text-green-600" : "hover:text-green-400";
  const activeBg = "bg-green-600";
  const activeText = "text-white";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isLightHeader
        ? "bg-white shadow-md"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-20" : "h-24"}`}>

          <Link href="/" className="flex items-center -ml-2 sm:-ml-4">
            <div className={`transition-all duration-300 ${isScrolled ? "w-[125px] sm:w-[140px]" : "w-[135px] sm:w-[155px]"}`}>
              <Image
                src="/logo.png"
                alt="Senu Tours Logo"
                width={180}
                height={70}
                priority
                className={`object-contain transition-all duration-300 w-full h-auto ${
                  !isLightHeader ? "filter drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]" : ""
                }`}
              />
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${pathname === link.href
                    ? `${activeBg} ${activeText}`
                    : `${textColor} ${hoverBg} ${hoverText}`
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Auth Button */}
            <li className="ml-2">
              {user ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    <AccountCircle className="text-green-600 w-5 h-5" />
                    <span className="text-sm font-semibold text-gray-700">{user.name.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-1 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <Logout style={{ fontSize: '18px' }} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${isLightHeader
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm"
                    }`}
                >
                  Login
                </button>
              )}
            </li>

            {/* Hotline Highlight Button */}
            <li className="ml-4 -mr-4">
               <a 
                href={`tel:0702787787`} 
                className={`group flex items-center gap-2.5 px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-md transform hover:scale-105 active:scale-95 ${
                  isLightHeader 
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200" 
                    : "bg-white/20 text-white backdrop-blur-md border border-white/20 hover:bg-white/30"
                }`}
              >
                <div className="relative flex items-center justify-center">
                   <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                   <div className="relative w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <Call style={{ fontSize: '18px' }} />
                <span className="text-sm font-black tracking-tight">0702787787</span>
              </a>
            </li>
          </ul>

          {/* Mobile Auth & Hotline & Hamburger */}
          <div className="flex items-center gap-1.5 md:hidden">
            <a 
              href={`tel:0702787787`} 
              className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md transition-all active:scale-90 ${
                isLightHeader ? "bg-green-600 text-white" : "bg-green-600 text-white"
              }`}
            >
              <Call style={{ fontSize: '18px' }} />
            </a>
            
            {user ? (
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full cursor-pointer ${isLightHeader ? "bg-green-50" : "bg-white/20 shadow-md"}`}
                onClick={() => setProfileModalOpen(true)}
              >
                <AccountCircle className="text-green-600" style={{ fontSize: '28px' }} />
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all active:scale-95 ${
                  isLightHeader 
                    ? "bg-green-600 text-white" 
                    : "bg-green-600 text-white" /* Force green on mobile for better visibility */
                }`}
              >
                Login
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 rounded-md focus:outline-none ${isLightHeader ? "text-gray-800" : "text-white"}`}
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
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden ${isLightHeader ? "bg-white border-t border-gray-100" : "bg-black/80 backdrop-blur-md border-t border-white/10"} px-4 py-2`}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                setIsOpen(false);
              }}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${pathname === link.href
                ? `${activeBg} ${activeText}`
                : `${isLightHeader ? "text-gray-700 hover:text-green-600 hover:bg-green-50" : "text-white/80 hover:text-green-400 hover:bg-green-500/10"}`
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Auth Button */}
          <div className={`mt-4 pt-4 border-t ${isLightHeader ? "border-gray-100" : "border-white/10"}`}>
            {user ? (
              <div className="flex flex-col gap-2">
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer ${isLightHeader ? "hover:bg-green-50" : "hover:bg-green-500/10"}`}
                  onClick={() => {
                    setProfileModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <AccountCircle className="text-green-600 w-5 h-5" />
                  <span className={`text-sm font-semibold ${isLightHeader ? "text-gray-700" : "text-white"}`}>{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-red-500 ${isLightHeader ? "hover:bg-red-50" : "hover:bg-red-500/10"} transition-colors`}
                >
                  <Logout style={{ fontSize: '20px' }} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2">
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-md transition-all active:scale-95"
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </nav>
  );
}
