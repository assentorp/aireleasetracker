'use client';

import { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '../assets/Logo';
import { LatestRelease } from './LatestRelease';

interface HeaderProps {
  currentPage: 'home' | 'analytics' | 'contact' | 'settings';
  latestRelease: {
    company: string;
    model: string;
    date: string;
  } | null;
}

export function Header({ currentPage, latestRelease }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 bg-[#0A0A0A] z-50 h-[52px] md:h-[104px] px-4 md:px-8 border-b border-white/5">
        <h1 className="sr-only">
          AI Model Release Tracker - {currentPage === 'home' ? 'Timeline of Major AI Models from 2022-2025' : 'Analytics'}
        </h1>
        <div className="flex items-center justify-between gap-2 md:gap-8 h-full">
          <div className="flex items-center gap-3 md:flex-row md:items-center md:gap-8">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex flex-col justify-center gap-2 md:gap-3">
              <Link href="/" className="inline-block hover-transition hover:opacity-80" onClick={() => setIsMobileMenuOpen(false)}>
                <Logo className="cursor-pointer w-36 md:w-[220px] h-auto" />
              </Link>
            </div>

            {/* Navigation - Desktop only */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              {/* Home */}
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Home
              </Link>

              {/* Analytics */}
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'analytics'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Analytics
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'contact'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right: Latest Release + Auth buttons */}
          <div className="flex-shrink-0 flex items-center gap-4 md:gap-6">
            {/* Latest Release */}
            {latestRelease && <LatestRelease release={latestRelease} />}

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-white text-black hover-transition hover:bg-gray-200 rounded-lg flex items-center gap-1.5 md:gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>Sign up</span>
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonPopoverCard: 'bg-[#151515] border border-white/20',
                    userButtonPopoverActionButton: 'text-white hover:bg-white/10',
                    userButtonPopoverActionButton__manageAccount: 'text-white hover:text-white',
                    userButtonPopoverActionButton__signOut: 'text-white hover:text-white',
                    userButtonPopoverActionButtonText: 'text-white hover:text-white',
                    userButtonPopoverActionButtonIcon: 'text-gray-400',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Notifications"
                    onClick={() => router.push('/settings')}
                    labelIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                    }
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            {/* Mobile Burger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-6 h-6 gap-1.5 p-0.5 rounded-md hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`block w-4 h-[1px] bg-white transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''
                }`}
              />
              <span
                className={`block w-4 h-[1px] bg-white transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-[3px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Menu */}
          <nav
            className={`fixed top-0 left-0 h-full w-72 bg-[#0A0A0A] border-r border-white/10 z-[70] md:hidden transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col h-full">

              {/* Menu Items */}
              <div className="flex-1 px-4 py-4 space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentPage === 'home'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-medium">Home</span>
                </Link>

                <Link
                  href="/analytics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentPage === 'analytics'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-medium">Analytics</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentPage === 'contact'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-medium">Contact</span>
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
