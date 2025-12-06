'use client';

import { useState, useRef, useEffect } from 'react';
import { companies } from '../lib/timeline-data';

interface CompanyFilterProps {
  selectedCompanies: string[];
  onFilterChange: (companies: string[]) => void;
}

export function CompanyFilter({ selectedCompanies, onFilterChange }: CompanyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCompany = (companyKey: string) => {
    if (selectedCompanies.includes(companyKey)) {
      onFilterChange(selectedCompanies.filter(c => c !== companyKey));
    } else {
      onFilterChange([...selectedCompanies, companyKey]);
    }
  };

  const companyList = Object.entries(companies).sort((a, b) => a[1].order - b[1].order);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#0f0f0f] text-white hover:text-gray-300 rounded-full border border-white/10 transition-colors"
      >
        <span>Companies</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="py-2">
          {companyList.map(([key, company]) => {
            const isSelected = selectedCompanies.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleCompany(key)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${company.dotColor}`} />
                  <span>{company.name}</span>
                </div>
                <div className="flex items-center justify-center w-4 h-4 border border-white/40 rounded">
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
