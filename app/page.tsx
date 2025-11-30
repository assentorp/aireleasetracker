'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Logo from '../assets/Logo';
import moment from 'moment';

// Configure moment to use floor rounding for more accurate relative time
moment.relativeTimeRounding(Math.floor);

// Configure moment to show "1 year ago" instead of "a year ago"
moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '1 second',
    ss: '%d seconds',
    m: '1 minute',
    mm: '%d minutes',
    h: '1 hour',
    hh: '%d hours',
    d: '1 day',
    dd: '%d days',
    w: '1 week',
    ww: '%d weeks',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years'
  }
});

export default function Timeline() {
  const router = useRouter();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [clickedCompany, setClickedCompany] = useState<string | null>(null);
  const [hoveredRelease, setHoveredRelease] = useState<string | null>(null);
  const [clickedRelease, setClickedRelease] = useState<string | null>(null);
  const [releaseTooltipPosition, setReleaseTooltipPosition] = useState<{ [key: string]: 'above' | 'below' }>({});
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [mousePosition, setMousePosition] = useState<{ x: number; viewportX: number; month: string } | null>(null);
  const [displayMode, setDisplayMode] = useState<'timeline' | 'list'>('timeline');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthHeaderRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnLoadRef = useRef(false);
  const statsPanelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [statsPanelPosition, setStatsPanelPosition] = useState<{ [key: string]: 'above' | 'below' }>({});
  const [statsPanelCoords, setStatsPanelCoords] = useState<{ [key: string]: { top: number; left: number } }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close clicked company stats when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (clickedCompany) {
        setClickedCompany(null);
      }
      if (clickedRelease) {
        setClickedRelease(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [clickedCompany, clickedRelease]);

  // Scroll to end of timeline smoothly on initial page load
  useEffect(() => {
    if (mounted && scrollContainerRef.current && monthHeaderRef.current && !hasScrolledOnLoadRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current && monthHeaderRef.current) {
          const scrollWidth = scrollContainerRef.current.scrollWidth;
          scrollContainerRef.current.scrollTo({
            left: scrollWidth,
            behavior: 'smooth'
          });
          monthHeaderRef.current.scrollTo({
            left: scrollWidth,
            behavior: 'smooth'
          });
          hasScrolledOnLoadRef.current = true;
        }
      }, 100);
    }
  }, [mounted]);

  // Sync scroll position between timeline and month header
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const monthHeader = monthHeaderRef.current;

    if (!scrollContainer || !monthHeader) return;

    const handleScroll = () => {
      monthHeader.scrollLeft = scrollContainer.scrollLeft;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Drag/pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    // Calculate mouse position and month
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft;

    // Calculate which month based on position (Nov 2022 to Dec 2025 = 38 months)
    const startDate = new Date('2022-11-01');
    const endDate = new Date('2025-12-01');
    const totalMonthsCount = ((endDate.getFullYear() - startDate.getFullYear()) * 12 +
                               endDate.getMonth() - startDate.getMonth() + 1);
    const timelineWidth = totalMonthsCount * 120;
    const monthIndex = Math.floor((x / timelineWidth) * totalMonthsCount);

    if (monthIndex >= 0 && monthIndex < totalMonthsCount) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(currentMonth.getMonth() + monthIndex);
      const monthLabel = currentMonth.toLocaleString('default', { month: 'short' });
      const year = currentMonth.getFullYear();
      const isJanuary = currentMonth.getMonth() === 0;

      setMousePosition({
        x: x, // Use the full timeline position for the line
        viewportX: e.clientX, // Viewport position for the label
        month: `${monthLabel} ${year}`
      });
    }

    // Handle dragging
    if (isDragging) {
      e.preventDefault();
      const pageX = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (pageX - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setMousePosition(null);
  };

  // Company configurations with subtle colors
  // Change the 'order' property to reorder companies in the timeline
  const companies = {
    anthropic: {
      name: 'Anthropic',
      dotColor: 'bg-orange-500',
      initial: 'A',
      order: 2,
    },
    openai: {
      name: 'OpenAI',
      dotColor: 'bg-emerald-500',
      initial: 'O',
      order: 1,
    },
    google: {
      name: 'Google',
      dotColor: 'bg-blue-500',
      initial: 'G',
      order: 3,
    },
    meta: {
      name: 'Meta',
      dotColor: 'bg-sky-500',
      initial: 'M',
      order: 4,
    },
    xai: {
      name: 'xAI',
      dotColor: 'bg-purple-500',
      initial: 'X',
      order: 5,
    },
    deepseek: {
      name: 'DeepSeek',
      dotColor: 'bg-pink-500',
      initial: 'D',
      order: 6,
    },
    mistral: {
      name: 'Mistral',
      dotColor: 'bg-amber-500',
      initial: 'Mi',
      order: 7,
    },
  };

  // Helper function to calculate months from start date (Nov 2022)
  const getMonthPosition = (dateStr: string) => {
    const startDate = new Date('2022-11-01');
    const parts = dateStr.split(' ');

    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    let month = 0;
    let year = 2024;

    if (dateStr === 'Nov 30 2022') {
      return 0; // ChatGPT launch
    } else if (parts.length === 3) {
      // "Mar 14 2023" format (month day year)
      month = monthMap[parts[0]] || 0;
      year = parseInt(parts[2]);
    } else if (parts.length === 2) {
      // "May 2024" or "Sep 2025" format (month year)
      month = monthMap[parts[0]] || 0;
      year = parseInt(parts[1]);
    }

    const targetDate = new Date(year, month, 1);
    const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
                       (targetDate.getMonth() - startDate.getMonth());

    return monthsDiff;
  };

  // Timeline data organized by company (comprehensive release data)
  const timelineData = [
    {
      company: 'xai',
      releases: [
        { date: 'Nov 3 2023', name: 'Grok‑1', position: getMonthPosition('Nov 3 2023') },
        { date: 'Mar 29 2024', name: 'Grok‑1.5', position: getMonthPosition('Mar 29 2024') },
        { date: 'Aug 14 2024', name: 'Grok‑2', position: getMonthPosition('Aug 14 2024') },
        { date: 'Feb 17 2025', name: 'Grok 3', position: getMonthPosition('Feb 17 2025') },
        { date: 'Aug 2025', name: 'Grok 2.5', position: getMonthPosition('Aug 2025') },
        { date: 'Jul 9 2025', name: 'Grok 4', position: getMonthPosition('Jul 9 2025') },
        { date: 'Sep 2025', name: 'Grok 4 Fast', position: getMonthPosition('Sep 2025') },
        { date: 'Aug 28 2025', name: 'Grok Code Fast 1', position: getMonthPosition('Aug 28 2025') },
        { date: 'Nov 17 2025', name: 'Grok 4.1', position: getMonthPosition('Nov 17 2025') }
      ]
    },
    {
      company: 'anthropic',
      releases: [
        { date: 'Mar 14 2023', name: 'Claude 1', position: getMonthPosition('Mar 14 2023') },
        { date: 'Jul 11 2023', name: 'Claude 2', position: getMonthPosition('Jul 11 2023') },
        { date: 'Mar 4 2024', name: 'Claude 3 Haiku', position: getMonthPosition('Mar 4 2024') },
        { date: 'Mar 4 2024', name: 'Claude 3 Sonnet', position: getMonthPosition('Mar 4 2024') + 0.1 },
        { date: 'Mar 4 2024', name: 'Claude 3 Opus', position: getMonthPosition('Mar 4 2024') + 0.2 },
        { date: 'Jun 21 2024', name: 'Claude 3.5 Sonnet', position: getMonthPosition('Jun 21 2024') },
        { date: 'Oct 2024', name: 'Claude 3.5 Haiku', position: getMonthPosition('Oct 2024') },
        { date: 'Feb 2025', name: 'Claude 3.7 Sonnet', position: getMonthPosition('Feb 2025') + 0.1 },
        { date: 'May 23 2025', name: 'Claude Sonnet 4', position: getMonthPosition('May 23 2025') },
        { date: 'May 23 2025', name: 'Claude Opus 4', position: getMonthPosition('May 23 2025') + 0.1 },
        { date: 'Sep 30 2025', name: 'Claude Sonnet 4.5', position: getMonthPosition('Sep 30 2025') },
        { date: 'Oct 16 2025', name: 'Claude Haiku 4.5', position: getMonthPosition('Oct 16 2025') },
        { date: 'Nov 24 2025', name: 'Claude Opus 4.5', position: getMonthPosition('Nov 24 2025') }
      ]
    },
    {
      company: 'meta',
      releases: [
        { date: 'Feb 24 2023', name: 'LLaMA 1', position: getMonthPosition('Feb 24 2023') },
        { date: 'Jul 18 2023', name: 'LLaMA 2', position: getMonthPosition('Jul 18 2023') },
        { date: 'Aug 24 2023', name: 'Code Llama', position: getMonthPosition('Aug 24 2023') },
        { date: 'Jan 29 2024', name: 'Code Llama 70B', position: getMonthPosition('Jan 29 2024') },
        { date: 'Apr 18 2024', name: 'LLaMA 3 (8B/70B)', position: getMonthPosition('Apr 18 2024') },
        { date: 'Jul 23 2024', name: 'LLaMA 3.1', position: getMonthPosition('Jul 23 2024') },
        { date: 'Apr 5 2025', name: 'LLaMA 4 Scout', position: getMonthPosition('Apr 5 2025') },
        { date: 'Apr 5 2025', name: 'LLaMA 4 Maverick', position: getMonthPosition('Apr 5 2025') + 0.1 }
      ]
    },
    {
      company: 'google',
      releases: [
        { date: 'Mar 21 2023', name: 'Bard (pre-Gemini)', position: getMonthPosition('Mar 21 2023') },
        { date: 'Dec 6 2023', name: 'Gemini 1.0 Nano', position: getMonthPosition('Dec 6 2023') },
        { date: 'Dec 13 2023', name: 'Gemini 1.0 Pro', position: getMonthPosition('Dec 13 2023') },
        { date: 'Feb 8 2024', name: 'Gemini 1.0 Ultra', position: getMonthPosition('Feb 8 2024') },
        { date: 'Feb 15 2024', name: 'Gemini 1.5 Pro', position: getMonthPosition('Feb 15 2024') },
        { date: 'May 14 2024', name: 'Gemini 1.5 Flash', position: getMonthPosition('May 14 2024') },
        { date: 'Jan 30 2025', name: 'Gemini 2.0 Flash', position: getMonthPosition('Jan 30 2025') },
        { date: 'Feb 1 2025', name: 'Gemini 2.0 Flash-Lite', position: getMonthPosition('Feb 1 2025') },
        { date: 'Mar 25 2025', name: 'Gemini 2.5 Pro', position: getMonthPosition('Mar 25 2025') },
        { date: 'Apr 17 2025', name: 'Gemini 2.5 Flash', position: getMonthPosition('Apr 17 2025') },
        { date: 'Jun 17 2025', name: 'Gemini 2.5 Flash-Lite', position: getMonthPosition('Jun 17 2025') },
        { date: 'Aug 26 2025', name: 'Gemini 2.5 Flash Image', position: getMonthPosition('Aug 26 2025') },
        { date: 'Nov 18 2025', name: 'Gemini 3.0 Pro', position: getMonthPosition('Nov 18 2025') },
        { date: 'Nov 20 2025', name: 'Gemini 3.0 Pro Image', position: getMonthPosition('Nov 20 2025') }
      ]
    },
    {
      company: 'openai',
      releases: [
        { date: 'Nov 30 2022', name: 'ChatGPT (GPT-3.5)', position: getMonthPosition('Nov 30 2022') },
        { date: 'Mar 2023', name: 'GPT-4', position: getMonthPosition('Mar 2023') },
        { date: 'May 2024', name: 'GPT-4o', position: getMonthPosition('May 2024') },
        { date: 'Jul 2024', name: 'GPT-4o mini', position: getMonthPosition('Jul 2024') },
        { date: 'Sep 2024', name: 'o1-preview', position: getMonthPosition('Sep 2024') },
        { date: 'Sep 2024', name: 'o1-mini', position: getMonthPosition('Sep 2024') + 0.1 },
        { date: 'Dec 2024', name: 'o1', position: getMonthPosition('Dec 2024') },
        { date: 'Dec 2024', name: 'o1-pro', position: getMonthPosition('Dec 2024') + 0.1 },
        { date: 'Jan 2025', name: 'o3-mini', position: getMonthPosition('Jan 2025') },
        { date: 'Jan 2025', name: 'o3-mini-high', position: getMonthPosition('Jan 2025') + 0.1 },
        { date: 'Feb 2025', name: 'GPT-4.5', position: getMonthPosition('Feb 2025') },
        { date: 'Apr 2025', name: 'GPT-4.1', position: getMonthPosition('Apr 2025') },
        { date: 'Apr 2025', name: 'GPT-4.1 mini', position: getMonthPosition('Apr 2025') + 0.1 },
        { date: 'Apr 2025', name: 'o3', position: getMonthPosition('Apr 2025') + 0.2 },
        { date: 'Apr 2025', name: 'o4-mini', position: getMonthPosition('Apr 2025') + 0.3 },
        { date: 'Apr 2025', name: 'o4-mini-high', position: getMonthPosition('Apr 2025') + 0.4 },
        { date: 'Jun 2025', name: 'o3-pro', position: getMonthPosition('Jun 2025') },
        { date: 'Aug 7 2025', name: 'GPT-5', position: getMonthPosition('Aug 7 2025') },
        { date: 'Aug 7 2025', name: 'GPT-5 mini', position: getMonthPosition('Aug 7 2025') + 0.1 },
        { date: 'Nov 12 2025', name: 'GPT-5.1', position: getMonthPosition('Nov 12 2025') }
      ]
    },
    {
      company: 'deepseek',
      releases: [
        { date: 'Nov 2 2023', name: 'DeepSeek Coder', position: getMonthPosition('Nov 2 2023') },
        { date: 'Nov 29 2023', name: 'DeepSeek-LLM', position: getMonthPosition('Nov 29 2023') },
        { date: 'Jan 9 2024', name: 'DeepSeek-MoE', position: getMonthPosition('Jan 9 2024') },
        { date: 'Apr 3 2024', name: 'DeepSeek-Math', position: getMonthPosition('Apr 3 2024') },
        { date: 'May 2024', name: 'DeepSeek V2', position: getMonthPosition('May 2024') },
        { date: 'Jun 2024', name: 'DeepSeek Coder V2', position: getMonthPosition('Jun 2024') },
        { date: 'Sep 2024', name: 'DeepSeek V2.5', position: getMonthPosition('Sep 2024') },
        { date: 'Dec 2024', name: 'DeepSeek V2.5 (Revised)', position: getMonthPosition('Dec 2024') + 0.1 },
        { date: 'Nov 20 2024', name: 'DeepSeek-R1-Lite Preview', position: getMonthPosition('Nov 20 2024') },
        { date: 'Dec 2024', name: 'DeepSeek V3 Base', position: getMonthPosition('Dec 2024') },
        { date: 'Dec 2024', name: 'DeepSeek V3 Chat', position: getMonthPosition('Dec 2024') + 0.2 },
        { date: 'Jan 20 2025', name: 'DeepSeek Chat (R1-based)', position: getMonthPosition('Jan 20 2025') },
        { date: 'Mar 24 2025', name: 'DeepSeek V3-0324', position: getMonthPosition('Mar 24 2025') },
        { date: 'May 28 2025', name: 'DeepSeek R1-0528', position: getMonthPosition('May 28 2025') },
        { date: 'Aug 21 2025', name: 'DeepSeek V3.1', position: getMonthPosition('Aug 21 2025') },
        { date: 'Sep 22 2025', name: 'DeepSeek V3.1 Terminus', position: getMonthPosition('Sep 22 2025') },
        { date: 'Sep 29 2025', name: 'DeepSeek V3.2 Exp', position: getMonthPosition('Sep 29 2025') }
      ]
    },
    {
      company: 'mistral',
      releases: [
        { date: 'Sep 27 2023', name: 'Mistral 7B', position: getMonthPosition('Sep 27 2023') },
        { date: 'Dec 9 2023', name: 'Mixtral 8×7B', position: getMonthPosition('Dec 9 2023') },
        { date: 'Dec 2023', name: 'Mistral Medium', position: getMonthPosition('Dec 2023') + 0.1 },
        { date: 'Feb 26 2024', name: 'Mistral Large', position: getMonthPosition('Feb 26 2024') },
        { date: 'Feb 26 2024', name: 'Mistral Small', position: getMonthPosition('Feb 26 2024') + 0.1 },
        { date: 'Apr 10 2024', name: 'Mixtral 8×22B', position: getMonthPosition('Apr 10 2024') },
        { date: 'May 29 2024', name: 'Codestral 22B', position: getMonthPosition('May 29 2024') },
        { date: 'Jul 16 2024', name: 'Codestral Mamba 7B', position: getMonthPosition('Jul 16 2024') },
        { date: 'Jul 16 2024', name: 'Mathstral 7B', position: getMonthPosition('Jul 16 2024') + 0.1 },
        { date: 'Jul 24 2024', name: 'Mistral Large 2', position: getMonthPosition('Jul 24 2024') },
        { date: 'Sep 2024', name: 'Pixtral 24.09', position: getMonthPosition('Sep 2024') },
        { date: 'Oct 2024', name: 'Ministral 8B', position: getMonthPosition('Oct 2024') },
        { date: 'Oct 2024', name: 'Ministral 3B', position: getMonthPosition('Oct 2024') + 0.1 },
        { date: 'Nov 19 2024', name: 'Mistral Large 2 24.11', position: getMonthPosition('Nov 19 2024') },
        { date: 'Nov 19 2024', name: 'Pixtral Large 24.11', position: getMonthPosition('Nov 19 2024') + 0.1 },
        { date: 'Jan 2025', name: 'Mistral Small 3', position: getMonthPosition('Jan 2025') },
        { date: 'Mar 17 2025', name: 'Mistral Small 3.1', position: getMonthPosition('Mar 17 2025') },
        { date: 'May 7 2025', name: 'Mistral Medium 3', position: getMonthPosition('May 7 2025') },
        { date: 'Jun 10 2025', name: 'Magistral Small', position: getMonthPosition('Jun 10 2025') },
        { date: 'Jun 10 2025', name: 'Magistral Medium', position: getMonthPosition('Jun 10 2025') + 0.1 }
      ]
    }
  ];

  // Generate month markers from Nov 2022 to Dec 2025
  const generateMonthMarkers = () => {
    const markers = [];
    const startDate = new Date('2022-11-01');
    const endDate = new Date('2025-12-01');

    let current = new Date(startDate);
    let position = 0;

    while (current <= endDate) {
      const month = current.toLocaleString('default', { month: 'short' });
      const year = current.getFullYear();
      const isJanuary = current.getMonth() === 0;

      markers.push({
        label: isJanuary ? `${month} ${year}` : month,
        position: position,
        isJanuary,
      });

      current.setMonth(current.getMonth() + 1);
      position++;
    }

    return markers;
  };

  const monthMarkers = generateMonthMarkers();
  const totalMonths = monthMarkers.length;

  // Use all timeline data (already starts from ChatGPT)
  // Sort companies by their order property
  const filteredData = [...timelineData].sort((a, b) => {
    const orderA = companies[a.company as keyof typeof companies]?.order || 999;
    const orderB = companies[b.company as keyof typeof companies]?.order || 999;
    return orderA - orderB;
  });

  // Calculate statistics for a company
  const getCompanyStats = (companyKey: string) => {
    const company = timelineData.find(c => c.company === companyKey);
    if (!company || company.releases.length === 0) return null;

    const releases = company.releases;
    const now = new Date();

    // Find the actual latest release by date (don't assume array is sorted)
    const sortedReleases = [...releases].sort((a, b) => {
      const dateA = parseReleaseDate(a.date);
      const dateB = parseReleaseDate(b.date);
      return dateB.getTime() - dateA.getTime(); // Sort newest first
    });
    const lastRelease = sortedReleases[0];
    const lastReleaseDate = parseReleaseDate(lastRelease.date);
    const daysSinceLastRelease = Math.floor((now.getTime() - lastReleaseDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average days between releases
    const intervals: number[] = [];
    for (let i = 1; i < releases.length; i++) {
      const date1 = parseReleaseDate(releases[i - 1].date);
      const date2 = parseReleaseDate(releases[i].date);
      const days = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(days);
    }
    const avgDaysBetweenReleases = intervals.length > 0
      ? Math.floor(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : 0;

    // Get recent releases (last 5 unique dates) - combine releases on same day
    // Group releases by date
    const dateGroups: { [dateStr: string]: typeof releases } = {};
    releases.forEach(release => {
      if (!dateGroups[release.date]) {
        dateGroups[release.date] = [];
      }
      dateGroups[release.date].push(release);
    });

    // Sort date groups by position (using the first release's position for each date)
    const sortedDateGroups = Object.entries(dateGroups).sort((a, b) => {
      const posA = Math.min(...a[1].map(r => r.position));
      const posB = Math.min(...b[1].map(r => r.position));
      return posA - posB;
    });

    // Get last 5 date groups and reverse to show newest first
    const recentDateGroups = sortedDateGroups.slice(-5).reverse();

    const recentReleases = recentDateGroups.map(([dateStr, sameDateReleases], index) => {
      const releaseDate = parseReleaseDate(dateStr);
      let daysSincePrior: number | null = null;

      // If there's a previous date group, calculate days between them
      if (index < recentDateGroups.length - 1) {
        const priorDateStr = recentDateGroups[index + 1][0];
        const priorReleaseDate = parseReleaseDate(priorDateStr);
        daysSincePrior = Math.floor((releaseDate.getTime() - priorReleaseDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Combine multiple releases on same day into one entry
      const combinedNames = sameDateReleases.map(r => r.name).join(', ');

      return {
        name: combinedNames,
        date: dateStr,
        daysSince: daysSincePrior
      };
    });

    // Calculate expected next release date
    // Start from last release date + average interval
    let expectedNextReleaseDate = new Date(lastReleaseDate);
    expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);

    // If we're overdue (past the first expected date), that date should have already happened
    // So we keep it as the first expected date (which is in the past) to show when it was expected
    // If not overdue, keep adding intervals until we get a date in the future
    if (daysSinceLastRelease <= avgDaysBetweenReleases) {
      // Not overdue yet - keep adding intervals until we get a date in the future
      while (expectedNextReleaseDate <= now && avgDaysBetweenReleases > 0) {
        expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);
      }
    }
    // If overdue, expectedNextReleaseDate stays as the first expected date (which is in the past)

    // Format expected date
    const formatExpectedDate = (date: Date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    // Normalize dates to midnight for accurate day calculation
    const normalizedExpected = new Date(expectedNextReleaseDate);
    normalizedExpected.setHours(0, 0, 0, 0);
    const normalizedNow = new Date(now);
    normalizedNow.setHours(0, 0, 0, 0);
    const daysUntilExpected = Math.floor((normalizedExpected.getTime() - normalizedNow.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysSinceLastRelease,
      avgDaysBetweenReleases,
      totalReleases: releases.length,
      lastRelease: lastRelease.name,
      recentReleases,
      expectedNextReleaseDate: formatExpectedDate(expectedNextReleaseDate),
      daysUntilExpected,
    };
  };

  const parseReleaseDate = (dateStr: string): Date => {
    const parts = dateStr.split(' ');
    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    if (parts.length === 3) {
      // "Mar 14 2023"
      const month = monthMap[parts[0]] || 0;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    } else if (parts.length === 2) {
      // "May 2024" - use first day of month
      const month = monthMap[parts[0]] || 0;
      const year = parseInt(parts[1]);
      return new Date(year, month, 1);
    }
    return new Date();
  };

  // Calculate model-specific stats
  const getModelStats = (companyKey: string, releaseIndex: number) => {
    const company = timelineData.find(c => c.company === companyKey);
    if (!company || !company.releases[releaseIndex]) return null;

    const release = company.releases[releaseIndex];
    const releaseDate = parseReleaseDate(release.date);
    const now = new Date();

    // 1. Release position
    const releasePosition = releaseIndex + 1;
    const totalReleases = company.releases.length;
    const companyName = companies[companyKey as keyof typeof companies]?.name || companyKey;

    // 2. Days since/until release
    const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const isFuture = daysSinceRelease < 0;
    const daysAbs = Math.abs(daysSinceRelease);

    // 3. Time since previous model (if not first release)
    let daysSincePrevious: number | null = null;
    let previousModelName: string | null = null;
    if (releaseIndex > 0) {
      const previousRelease = company.releases[releaseIndex - 1];
      const previousDate = parseReleaseDate(previousRelease.date);
      daysSincePrevious = Math.floor((releaseDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      previousModelName = previousRelease.name;
    }

    // 4. Comparison to company average
    const companyStats = getCompanyStats(companyKey);
    let comparisonToAverage: number | null = null;
    if (companyStats && daysSincePrevious !== null) {
      comparisonToAverage = daysSincePrevious - companyStats.avgDaysBetweenReleases;
    }

    // 5. Release density - count releases within 30 days window
    const windowDays = 30;
    const windowStart = new Date(releaseDate);
    windowStart.setDate(windowStart.getDate() - windowDays);
    const windowEnd = new Date(releaseDate);
    windowEnd.setDate(windowEnd.getDate() + windowDays);

    const nearbyReleases = company.releases.filter(r => {
      const rDate = parseReleaseDate(r.date);
      return rDate >= windowStart && rDate <= windowEnd && r.name !== release.name;
    });
    const clusterSize = nearbyReleases.length + 1; // +1 for current release

    return {
      releasePosition,
      totalReleases,
      companyName,
      daysSinceRelease: daysAbs,
      isFuture,
      daysSincePrevious,
      previousModelName,
      comparisonToAverage,
      avgDaysBetweenReleases: companyStats?.avgDaysBetweenReleases || 0,
      clusterSize,
      isInCluster: clusterSize >= 3,
    };
  };

  // Type for release items
  type ReleaseItem = { date: string; name: string; position: number };
  type ReleaseWithRow = ReleaseItem & { row: number; alignedPosition: number };

  // Assign releases to rows to prevent horizontal overlap
  // Releases on the same date are grouped together and stacked vertically
  const assignReleasesToRows = (releases: ReleaseItem[], totalMonths: number): ReleaseWithRow[] => {
    const sorted = [...releases].sort((a, b) => a.position - b.position);
    const itemWidthInMonths = 250 / 120; // Approximately 2.08 months

    // First, group releases by the same date string (not position)
    const dateGroups: { [dateStr: string]: ReleaseItem[] } = {};
    sorted.forEach(release => {
      const dateKey = release.date; // Use the actual date string as the key
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = [];
      }
      dateGroups[dateKey].push(release);
    });

    // Process date groups: same-date releases stack vertically, different dates check for overlap
    const rows: ReleaseWithRow[] = [];
    const rowOccupancies: Array<{ start: number; end: number }[]> = [];

    // Sort date groups by the minimum position in each group
    const sortedDateGroups = Object.entries(dateGroups).sort((a, b) => {
      const minPosA = Math.min(...a[1].map(r => r.position));
      const minPosB = Math.min(...b[1].map(r => r.position));
      return minPosA - minPosB;
    });

    for (const [dateStr, sameDateReleases] of sortedDateGroups) {
      // Use the minimum position from all same-date releases as the aligned position
      const leftPosition = Math.min(...sameDateReleases.map(r => r.position));
      const rightPosition = leftPosition + itemWidthInMonths;

      // For same-date releases, find the first row where they can all fit
      let assignedRow = -1;
      for (let rowIdx = 0; rowIdx < rowOccupancies.length; rowIdx++) {
        const row = rowOccupancies[rowIdx];
        const overlaps = row.some(occupied => {
          // Check if there's any overlap: items overlap if one doesn't end before the other starts
          return !(rightPosition <= occupied.start || leftPosition >= occupied.end);
        });

        if (!overlaps) {
          assignedRow = rowIdx;
          break;
        }
      }

      // If no row found, create a new one
      if (assignedRow === -1) {
        assignedRow = rowOccupancies.length;
        rowOccupancies.push([]);
      }

      // Add all same-date releases to consecutive rows starting from assignedRow
      // Use the same aligned position for all same-date releases
      sameDateReleases.forEach((release, idx) => {
        const rowForRelease = assignedRow + idx;

        // Extend rowOccupancies if needed
        while (rowOccupancies.length <= rowForRelease) {
          rowOccupancies.push([]);
        }

        // Add occupancy for this release
        rowOccupancies[rowForRelease].push({ start: leftPosition, end: rightPosition });
        rows.push({ ...release, row: rowForRelease, alignedPosition: leftPosition });
      });
    }

    return rows;
  };

  // Type definitions
  type NextExpectedRelease = { company: string; companyName: string; date: string; daysUntil: number };
  type LatestRelease = { company: string; companyName: string; model: string; date: string; releaseDate: Date; daysSince: number };

  // Calculate next expected release across all companies
  const getNextExpectedRelease = (): NextExpectedRelease | null => {
    const now = new Date();
    let nextRelease: { company: string; companyName: string; date: string; daysUntil: number } | null = null;

    timelineData.forEach((item) => {
      const company = timelineData.find(c => c.company === item.company);
      if (!company || company.releases.length === 0) return;

      // Find the actual latest release by date (don't assume array is sorted)
      const sortedReleases = [...company.releases].sort((a, b) => {
        const dateA = parseReleaseDate(a.date);
        const dateB = parseReleaseDate(b.date);
        return dateB.getTime() - dateA.getTime(); // Sort newest first
      });
      const lastRelease = sortedReleases[0];
      const lastReleaseDate = parseReleaseDate(lastRelease.date);
      const daysSinceLastRelease = Math.floor((now.getTime() - lastReleaseDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate average days between releases
      const intervals: number[] = [];
      for (let i = 1; i < sortedReleases.length; i++) {
        const date1 = parseReleaseDate(sortedReleases[i].date);
        const date2 = parseReleaseDate(sortedReleases[i - 1].date);
        const days = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
        intervals.push(days);
      }
      const avgDaysBetweenReleases = intervals.length > 0
        ? Math.floor(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : 0;

      if (avgDaysBetweenReleases > 0) {
        // Calculate expected next release date - use same logic as stats panel
        let expectedNextReleaseDate = new Date(lastReleaseDate);
        expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);

        // If we're overdue (past the first expected date), that date should have already happened
        // So we keep it as the first expected date (which is in the past) to show when it was expected
        // If not overdue, keep adding intervals until we get a date in the future
        if (daysSinceLastRelease <= avgDaysBetweenReleases) {
          // Not overdue yet - keep adding intervals until we get a date in the future
          while (expectedNextReleaseDate <= now && avgDaysBetweenReleases > 0) {
            expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);
          }
        }
        // If overdue, expectedNextReleaseDate stays as the first expected date (which is in the past)

        // Normalize dates to midnight for accurate day calculation
        const normalizedExpected = new Date(expectedNextReleaseDate);
        normalizedExpected.setHours(0, 0, 0, 0);
        const normalizedNow = new Date(now);
        normalizedNow.setHours(0, 0, 0, 0);
        const daysUntil = Math.floor((normalizedExpected.getTime() - normalizedNow.getTime()) / (1000 * 60 * 60 * 24));

        // Format expected date
        const formatExpectedDate = (date: Date) => {
          const month = date.toLocaleString('default', { month: 'short' });
          const day = date.getDate();
          const year = date.getFullYear();
          return `${month} ${day}, ${year}`;
        };

        if (!nextRelease || daysUntil < nextRelease.daysUntil) {
          const companyInfo = companies[item.company as keyof typeof companies];
          nextRelease = {
            company: item.company,
            companyName: companyInfo.name,
            date: formatExpectedDate(expectedNextReleaseDate),
            daysUntil,
          };
        }
      }
    });

    return nextRelease;
  };

  // Get latest release across all companies
  const getLatestRelease = (): LatestRelease | null => {
    let latestRelease: { company: string; companyName: string; model: string; date: string; releaseDate: Date; daysSince: number } | null = null;
    const now = new Date();

    timelineData.forEach((item) => {
      const releases = item.releases;
      if (releases.length > 0) {
        const lastRelease = releases[releases.length - 1];
        const releaseDate = parseReleaseDate(lastRelease.date);
        const daysSince = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

        if (!latestRelease || releaseDate > latestRelease.releaseDate) {
          const companyInfo = companies[item.company as keyof typeof companies];
          latestRelease = {
            company: item.company,
            companyName: companyInfo.name,
            model: lastRelease.name,
            date: lastRelease.date,
            releaseDate,
            daysSince,
          };
        }
      }
    });

    return latestRelease;
  };

  const nextExpected = getNextExpectedRelease();
  const latestRelease = getLatestRelease();

  // Get all releases sorted by date (newest first) for list view
  const getAllReleasesSorted = () => {
    const allReleases: Array<{
      company: string;
      companyName: string;
      dotColor: string;
      modelName: string;
      date: string;
      dateObj: Date;
    }> = [];

    timelineData.forEach((item) => {
      const companyInfo = companies[item.company as keyof typeof companies];
      item.releases.forEach((release) => {
        allReleases.push({
          company: item.company,
          companyName: companyInfo.name,
          dotColor: companyInfo.dotColor,
          modelName: release.name,
          date: release.date,
          dateObj: parseReleaseDate(release.date),
        });
      });
    });

    // Sort by date (newest first)
    return allReleases.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  };

  const sortedReleases = getAllReleasesSorted();

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-[#0A0A0A] z-50 py-3 md:py-8 px-4 md:px-8 border-b border-white/5">
        <h1 className="sr-only">AI Model Release Tracker - Timeline of Major AI Models from 2022-2025</h1>
          <div className="flex items-center justify-between gap-2 md:gap-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              {/* Left: Logo and description */}
              <div className="flex-shrink-0 flex flex-col justify-center gap-2 md:gap-3">
                <Link href="/" className="inline-block hover-transition hover:opacity-80">
                  <Logo className="cursor-pointer w-36 md:w-[217px] h-auto" />
                </Link>
                <p className="hidden md:block text-xs md:text-sm text-gray-500">
                  Major AI model releases since ChatGPT (November 30, 2022)
                </p>
              </div>

              {/* Middle-left: Release info - Hidden on mobile */}
              <div className="hidden lg:flex gap-1 ml-8">
                {latestRelease !== null ? (
                  <div className="min-w-[180px]">
                    <div className="text-xs text-gray-500 mb-2">Latest Release</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${companies[latestRelease.company as keyof typeof companies]?.dotColor || 'bg-gray-500'}`} />
                      <div className="text-sm font-medium text-gray-200">{latestRelease.model}</div>
                      <div className="text-xs text-gray-500">{latestRelease.date}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right: Display toggle + Auth buttons */}
            <div className="flex-shrink-0 flex items-center gap-2 md:gap-3">
              {/* Display Mode Toggle */}
              <button
                onClick={() => setDisplayMode(displayMode === 'timeline' ? 'list' : 'timeline')}
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-[#151515] border border-white/10 rounded-lg text-gray-300 hover-transition hover:text-white hover:border-white/20"
              >
                {displayMode === 'timeline' ? (
                  // List icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                ) : (
                  // Grab/cursor icon for horizontal scroll
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
                  </svg>
                )}
                <span className="hidden sm:inline text-xs md:text-sm font-medium">{displayMode === 'timeline' ? 'List view' : 'Timeline'}</span>
              </button>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover-transition hover:text-white">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-white text-black hover-transition hover:bg-gray-200 rounded-lg flex items-center gap-1.5 md:gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="hidden sm:inline">Sign up to receive updates</span>
                    <span className="sm:hidden">Sign up</span>
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
            </div>
          </div>
      </header>

      {/* Conditional rendering based on display mode */}
      {displayMode === 'timeline' ? (
        <>
      {/* Sticky month header - outside scroll container */}
      <div className="flex sticky top-[52px] md:top-[116px] z-40 bg-[#0A0A0A] border-b border-white/5">
          {/* Left spacer to align with company labels */}
          <div className="flex-shrink-0 w-[120px] md:w-[180px]" />

          {/* Month header - scrollable */}
          <div
            ref={monthHeaderRef}
            className="flex-1 overflow-x-auto scrollbar-hide relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="relative h-8 py-2" style={{ paddingRight: '200px', minWidth: `${totalMonths * 120}px` }}>
              {/* Timeline line */}

              {/* Month markers */}
              {monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-2"
                  style={{ left: `${(marker.position / totalMonths) * 100}%` }}
                >
                  {/* Month label */}
                  <div className={`text-[10px] md:text-xs font-medium ${marker.isJanuary ? 'text-white' : 'text-gray-400'}`}>
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Fixed month label - follows mouse */}
      {mousePosition && (
        <div
          className="fixed pointer-events-none z-[10000]"
          style={{
            left: `${mousePosition.viewportX + 8}px`, // Viewport position + small margin
            top: '50vh',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
            {mousePosition.month}
          </div>
        </div>
      )}

      {/* Timeline container - fixed left column + scrollable right */}
      <section className="flex" aria-label="AI Model Release Timeline">
          {/* Fixed left column for company labels */}
          <div className="flex-shrink-0 w-[120px] md:w-[180px] border-r border-white/5 bg-[#0A0A0A] z-30 overflow-visible">

            {/* Company labels */}
            <div className={`space-y-8 overflow-visible ${hoveredCompany || clickedCompany ? 'z-[1000] relative' : ''}`}>
              {filteredData.map((item, companyIndex) => {
                const companyInfo = companies[item.company as keyof typeof companies];
                const stats = getCompanyStats(item.company);
                const isCompanyHovered = hoveredCompany === item.company;
                const isCompanyClicked = clickedCompany === item.company;
                const isCompanyActive = isCompanyHovered || isCompanyClicked;
                const isEvenRow = companyIndex % 2 === 0;

                // Calculate the same row height as the timeline row
                const releasesWithRows = assignReleasesToRows(item.releases, totalMonths);
                const maxRow = Math.max(...releasesWithRows.map(r => r.row), 0);

                // Calculate height using same logic as timeline rows
                const rowHeights: number[] = [0];
                for (let row = 1; row <= maxRow; row++) {
                  const rowRelease = releasesWithRows.find(r => r.row === row);
                  const prevRowRelease = releasesWithRows.find(r => r.row === row - 1);

                  if (rowRelease && prevRowRelease) {
                    // Check if they're on the same date by comparing date strings
                    const isConsecutiveSameDate = rowRelease.date === prevRowRelease.date;
                    if (isConsecutiveSameDate) {
                      rowHeights[row] = rowHeights[row - 1] + 40 + 4;
                    } else {
                      rowHeights[row] = rowHeights[row - 1] + 48;
                    }
                  } else {
                    rowHeights[row] = rowHeights[row - 1] + 48;
                  }
                }
                // Match the same height calculation as timeline rows
                const baseHeight = maxRow >= 0 ? (rowHeights[maxRow] || 0) + 48 : 0;
                // Ensure consistent minimum height - higher for single-row companies to match multi-row spacing
                const minHeight = maxRow === 0 ? 128 : 112;
                // Add py-8 padding (64px) for even rows
                const rowHeight = Math.max(baseHeight + 16, minHeight) + (isEvenRow ? 64 : 0);

                return (
                  <div
                    key={item.company}
                    className={`relative flex items-start ${isEvenRow ? 'bg-white/[0.015] py-8' : ''} ${isCompanyActive ? 'z-[500]' : 'z-auto'}`}
                    style={{ height: `${rowHeight}px`, width: '100%' }}
                  >
                    <div
                      className="pr-2 md:pr-4 w-full relative z-[100]"
                      onMouseEnter={() => setHoveredCompany(item.company)}
                      onMouseLeave={() => setHoveredCompany(null)}
                    >
                      <div className="relative z-[100] h-full flex items-center justify-start px-2 md:px-4">
                        <div
                          className="flex items-center gap-1 md:gap-2 cursor-pointer px-2 md:px-3 py-1.5 md:py-2 border border-white/10 rounded-full hover-transition hover:border-white/20 hover:bg-white/[0.02]"
                            onClick={(e) => {
                            e.stopPropagation();
                            // Check if panel would overflow below viewport and calculate position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const panelHeight = 500; // max-h-[500px]
                            const headerHeight = window.innerWidth >= 768 ? 116 : 52; // md:top-[116px] or top-[52px]
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top - headerHeight; // Account for header

                            if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
                              setStatsPanelPosition(prev => ({ ...prev, [item.company]: 'above' }));
                              setStatsPanelCoords(prev => ({
                                ...prev,
                                [item.company]: {
                                  top: Math.max(headerHeight + 8, rect.top - panelHeight - 8), // Ensure it's below header
                                  left: rect.left + (window.innerWidth >= 768 ? 32 : 8)
                                }
                              }));
                            } else {
                              setStatsPanelPosition(prev => ({ ...prev, [item.company]: 'below' }));
                              setStatsPanelCoords(prev => ({
                                ...prev,
                                [item.company]: {
                                  top: rect.bottom + 8,
                                  left: rect.left + (window.innerWidth >= 768 ? 32 : 8)
                                }
                              }));
                            }

                            setClickedCompany(isCompanyClicked ? null : item.company);
                          }}
                          onMouseEnter={(e) => {
                            // Check if panel would overflow below viewport and calculate position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const panelHeight = 500; // max-h-[500px]
                            const headerHeight = window.innerWidth >= 768 ? 116 : 52; // md:top-[116px] or top-[52px]
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top - headerHeight; // Account for header

                            if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
                              setStatsPanelPosition(prev => ({ ...prev, [item.company]: 'above' }));
                              setStatsPanelCoords(prev => ({
                                ...prev,
                                [item.company]: {
                                  top: Math.max(headerHeight + 8, rect.top - panelHeight - 8), // Ensure it's below header
                                  left: rect.left + (window.innerWidth >= 768 ? 32 : 8)
                                }
                              }));
                            } else {
                              setStatsPanelPosition(prev => ({ ...prev, [item.company]: 'below' }));
                              setStatsPanelCoords(prev => ({
                                ...prev,
                                [item.company]: {
                                  top: rect.bottom + 8,
                                  left: rect.left + (window.innerWidth >= 768 ? 32 : 8)
                                }
                              }));
                            }
                          }}
                        >
                          <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${companyInfo.dotColor}`} />
                          <span className="text-white text-[10px] md:text-base font-medium hover-transition hover:text-gray-200">
                            {companyInfo.name}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`text-gray-400 hover:text-gray-300 md:w-[14px] md:h-[14px] transition-all duration-200 ease-in-out ${isCompanyClicked ? 'rotate-180' : ''}`}
                            style={{ transformOrigin: 'center' }}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>

                        {/* Stats panel - shows on hover (desktop) or click (mobile) */}
                        {isCompanyActive && stats && statsPanelCoords[item.company] && (
                          <div
                            ref={(el) => {
                              if (el) statsPanelRefs.current[item.company] = el;
                            }}
                            className="fixed bg-[#151515] border border-white/10 rounded-lg p-3 md:p-4 shadow-xl w-[280px] md:min-w-[320px] max-h-[500px] overflow-y-auto animate-fade-in-slide-up"
                            style={{
                              zIndex: 10000,
                              top: `${statsPanelCoords[item.company].top}px`,
                              left: `${statsPanelCoords[item.company].left}px`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-xs text-gray-500">Days since last release</div>
                                  {stats.daysSinceLastRelease > stats.avgDaysBetweenReleases && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-400 font-medium">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 9v4"></path>
                                        <path d="M12 17h.01"></path>
                                        <circle cx="12" cy="12" r="10"></circle>
                                      </svg>
                                      Over average
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <div className={`text-xl font-semibold ${stats.daysSinceLastRelease > stats.avgDaysBetweenReleases ? 'text-orange-400' : 'text-white'}`}>
                                    {stats.daysSinceLastRelease}
                                  </div>
                                </div>
                                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                  {/* Average marker line - shows where average is */}
                                  {stats.daysSinceLastRelease > stats.avgDaysBetweenReleases && (
                                    <div
                                      className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                                      style={{
                                        left: `${(stats.avgDaysBetweenReleases / stats.daysSinceLastRelease) * 100}%`
                                      }}
                                      title={`Average: ${stats.avgDaysBetweenReleases} days`}
                                    />
                                  )}
                                  {/* Progress bar - shows full width when over average, colored orange */}
                                  <div
                                    className={`h-full rounded-full progress-bar ${
                                      stats.daysSinceLastRelease > stats.avgDaysBetweenReleases
                                        ? 'bg-orange-500'
                                        : 'bg-white'
                                    }`}
                                    style={{
                                      width: stats.daysSinceLastRelease > stats.avgDaysBetweenReleases
                                        ? '100%'
                                        : `${(stats.daysSinceLastRelease / stats.avgDaysBetweenReleases) * 100}%`
                                    }}
                                  />
                                </div>
                                <div className="mt-1.5 text-xs text-right text-gray-400">
                                  Average: {stats.avgDaysBetweenReleases} days
                                </div>
                              </div>

                              <div className="pt-3 border-t border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-xs text-gray-500">Expected next release</div>
                                  {stats.daysSinceLastRelease > stats.avgDaysBetweenReleases && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-400 font-medium">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 9v4"></path>
                                        <path d="M12 17h.01"></path>
                                        <circle cx="12" cy="12" r="10"></circle>
                                      </svg>
                                      Outdated
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <div className={`text-lg font-semibold ${stats.daysSinceLastRelease > stats.avgDaysBetweenReleases ? 'text-white/60 line-through' : 'text-white'}`}>
                                    {stats.expectedNextReleaseDate}
                                  </div>
                                  {(() => {
                                    // Recalculate days from the formatted date to ensure accuracy
                                    const dateParts = stats.expectedNextReleaseDate.match(/(\w+) (\d+), (\d+)/);
                                    if (dateParts) {
                                      const monthMap: { [key: string]: number } = {
                                        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                                        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
                                      };
                                      const expectedDate = new Date(
                                        parseInt(dateParts[3]),
                                        monthMap[dateParts[1]],
                                        parseInt(dateParts[2])
                                      );
                                      expectedDate.setHours(0, 0, 0, 0);
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const daysDiff = Math.floor((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                      return (
                                        <div className={`text-xs font-medium ${stats.daysSinceLastRelease > stats.avgDaysBetweenReleases ? 'text-orange-400/60' : daysDiff < 0 ? 'text-gray-500' : daysDiff < 30 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                          {daysDiff < 0
                                            ? `${Math.abs(daysDiff)} days ago`
                                            : `in ${daysDiff} days`
                                          }
                                        </div>
                                      );
                                    }
                                    // Fallback to original calculation
                                    return (
                                      <div className={`text-xs font-medium ${stats.daysSinceLastRelease > stats.avgDaysBetweenReleases ? 'text-orange-400/60' : stats.daysUntilExpected < 0 ? 'text-gray-500' : stats.daysUntilExpected < 30 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                        {stats.daysUntilExpected < 0
                                          ? `${Math.abs(stats.daysUntilExpected)} days ago`
                                          : `in ${stats.daysUntilExpected} days`
                                        }
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-white/5">
                                <div className="text-xs text-gray-500 mb-2">Recent releases</div>
                                <div className="space-y-2">
                                  {stats.recentReleases.map((release, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-400 truncate">{release.name}</div>
                                        <div className="text-xs text-gray-600">{release.date}</div>
                                      </div>
                                      <div className="text-xs font-normal text-gray-400 whitespace-nowrap">
                                        {release.daysSince !== null ? `${release.daysSince} days` : '-'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable timeline section */}
          <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-x-auto overflow-y-clip relative ${isDragging ? 'cursor-grabbing' : 'md:cursor-grab'}`}
            style={{ isolation: 'isolate' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <div className="relative" style={{ paddingRight: '200px' }}>
              {/* Calculate total height of all company rows for dotted lines */}
              {(() => {
                const companyHeights: number[] = [];
                filteredData.forEach((item, companyIndex) => {
                  const isEvenRow = companyIndex % 2 === 0;
                  const releasesWithRows = assignReleasesToRows(item.releases, totalMonths);
                  const maxRow = Math.max(...releasesWithRows.map(r => r.row), 0);
                  const rowHeights: number[] = [0];
                  for (let row = 1; row <= maxRow; row++) {
                    const rowRelease = releasesWithRows.find(r => r.row === row);
                    const prevRowRelease = releasesWithRows.find(r => r.row === row - 1);
                    if (rowRelease && prevRowRelease) {
                      const isConsecutiveSameDate = rowRelease.date === prevRowRelease.date;
                      if (isConsecutiveSameDate) {
                        rowHeights[row] = rowHeights[row - 1] + 40 + 4;
                      } else {
                        rowHeights[row] = rowHeights[row - 1] + 48;
                      }
                    } else {
                      rowHeights[row] = rowHeights[row - 1] + 48;
                    }
                  }
                  // Match the same height calculation as timeline rows
                  const baseHeight = maxRow >= 0 ? (rowHeights[maxRow] || 0) + 48 : 0;
                  // Ensure consistent minimum height - higher for single-row companies to match multi-row spacing
                  const minHeight = maxRow === 0 ? 128 : 112;
                  // Add py-8 padding (64px) for even rows
                  const totalHeight = Math.max(baseHeight + 16, minHeight) + (isEvenRow ? 64 : 0);
                  companyHeights.push(totalHeight);
                });
                // Sum all company heights + spacing between them (space-y-8 = 32px between each)
                const totalCompanyHeight = companyHeights.reduce((sum, h) => sum + h, 0) + (filteredData.length - 1) * 32;
                const totalTimelineHeight = totalCompanyHeight + 64; // 64px for mt-16 spacing

                return (
                  <>
                    {/* Dotted vertical lines spanning full height */}
                    <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: `${totalTimelineHeight}px`, minWidth: `${totalMonths * 120}px` }}>
                      {monthMarkers.map((marker, idx) => (
                        <div
                          key={idx}
                          className="absolute top-0 bottom-0 w-[1px] border-l border-dotted border-white/5"
                          style={{ left: `${(marker.position / totalMonths) * 100}%` }}
                        />
                      ))}
                    </div>

                    {/* Mouse tracker line */}
                    {mousePosition && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${mousePosition.x}px`,
                          top: 0,
                          height: `${totalTimelineHeight}px`,
                          zIndex: 10
                        }}
                      >
                        {/* Vertical line */}
                        <div className="absolute top-0 w-[2px] bg-white opacity-30" style={{ height: `${totalTimelineHeight}px` }} />
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Company rows */}
              <div className="space-y-8 relative">
                {filteredData.map((item, companyIndex) => {
                  const companyInfo = companies[item.company as keyof typeof companies];
                  const stats = getCompanyStats(item.company);
                  const isCompanyHovered = hoveredCompany === item.company;
                  const isEvenRow = companyIndex % 2 === 0;

                  // Assign releases to rows to prevent horizontal overlap
                  const releasesWithRows = assignReleasesToRows(item.releases, totalMonths);

                  // Calculate top offsets for each row, accounting for same-date stacking
                  const maxRow = Math.max(...releasesWithRows.map(r => r.row), 0);
                  const rowHeights: number[] = [0]; // Track cumulative height for each row

                  // Calculate height for each row sequentially
                  for (let row = 1; row <= maxRow; row++) {
                    const rowRelease = releasesWithRows.find(r => r.row === row);
                    const prevRowRelease = releasesWithRows.find(r => r.row === row - 1);

                    if (rowRelease && prevRowRelease) {
                      // Check if they're on the same date by comparing date strings
                      const isConsecutiveSameDate = rowRelease.date === prevRowRelease.date;

                      if (isConsecutiveSameDate) {
                        // Stack directly underneath with minimal gap (4px) - item height is ~40px
                        rowHeights[row] = rowHeights[row - 1] + 40 + 4;
                      } else {
                        // Normal spacing between different dates (48px = 40px item + 8px gap)
                        rowHeights[row] = rowHeights[row - 1] + 48;
                      }
                    } else {
                      // Fallback to normal spacing
                      rowHeights[row] = rowHeights[row - 1] + 48;
                    }
                  }

                  // Calculate total height needed (last row height + item height + padding)
                  // Add extra padding at bottom for better spacing
                  const baseHeight = maxRow >= 0 ? (rowHeights[maxRow] || 0) + 48 : 0;
                  // Ensure consistent minimum height - higher for single-row companies to match multi-row spacing
                  const minHeight = maxRow === 0 ? 128 : 112;
                  // Add py-8 padding (64px) for even rows
                  const totalHeight = Math.max(baseHeight + 16, minHeight) + (isEvenRow ? 64 : 0);

                  return (
                    <div
                      key={item.company}
                      className={`relative ${isEvenRow ? 'bg-white/[0.015] py-8' : ''}`}
                      style={{ height: `${totalHeight}px`, minWidth: `${totalMonths * 120}px` }}
                    >
                      {/* Timeline releases */}
                      <div className="relative z-10" style={{ minWidth: `${totalMonths * 120}px`, height: `${totalHeight}px` }}>
                      {releasesWithRows.map((release, idx) => {
                        const topOffset = rowHeights[release.row] || 0;

                        const releaseKey = `${item.company}-${idx}`;
                        const isReleaseHovered = hoveredRelease === releaseKey;
                        const isReleaseClicked = clickedRelease === releaseKey;
                        const isReleaseActive = isReleaseHovered || isReleaseClicked;
                        const modelStats = getModelStats(item.company, idx);

                        return (
                          <div
                            key={idx}
                            className={`absolute border border-white/10 rounded-md px-1.5 md:px-3 py-1 md:py-2 bg-[#151515] hover-transition hover:bg-[#1a1a1a] hover:border-white/20 cursor-pointer whitespace-nowrap ${
                              isReleaseActive ? 'z-[10001]' : 'z-10'
                            }`}
                            style={{
                              left: `${(release.alignedPosition / totalMonths) * 100}%`,
                              top: `${topOffset}px`,
                            }}
                            onMouseEnter={(e) => {
                              setHoveredRelease(releaseKey);
                              // Calculate tooltip position - prefer above to avoid covering items below
                              const rect = e.currentTarget.getBoundingClientRect();
                              const headerHeight = window.innerWidth >= 768 ? 116 : 52;
                              const tooltipHeight = 320; // Approximate tooltip height with padding
                              const minClearance = 20; // Minimum space from header
                              const spaceAbove = rect.top - headerHeight;

                              // Only position below if tooltip would overlap header (very close to top)
                              // This prevents covering timeline items below in most cases
                              if (spaceAbove < (tooltipHeight + minClearance)) {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'below' }));
                              } else {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'above' }));
                              }
                            }}
                            onMouseLeave={() => setHoveredRelease(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Calculate tooltip position on click - prefer above to avoid covering items below
                              const rect = e.currentTarget.getBoundingClientRect();
                              const headerHeight = window.innerWidth >= 768 ? 116 : 52;
                              const tooltipHeight = 320;
                              const minClearance = 20;
                              const spaceAbove = rect.top - headerHeight;

                              // Only position below if tooltip would overlap header
                              if (spaceAbove < (tooltipHeight + minClearance)) {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'below' }));
                              } else {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'above' }));
                              }

                              setClickedRelease(isReleaseClicked ? null : releaseKey);
                            }}
                          >
                            <div className="flex items-center gap-1 md:gap-2">
                              <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${companyInfo.dotColor}`} />
                              <div className="text-[10px] md:text-sm font-medium text-gray-200">
                                {release.name}
                              </div>
                            </div>

                            {/* Enhanced stats tooltip */}
                            {false && isReleaseActive && modelStats && (
                              <div className={`absolute left-1/2 -translate-x-1/2 bg-[#151515] border border-white/10 rounded-lg p-3 shadow-xl min-w-[280px] z-[10002] animate-fade-in-slide-up ${
                                releaseTooltipPosition[releaseKey] === 'below'
                                  ? 'top-full mt-2'
                                  : 'bottom-full mb-2'
                              }`}>
                                {/* Model name and date */}
                                <div className="mb-3 pb-3 border-b border-white/10">
                                  <div className="text-sm font-semibold text-white mb-1">{release.name}</div>
                                  <div className="text-xs text-gray-500">{release.date}</div>
                                </div>

                                <div className="space-y-2.5 text-xs">
                                  {/* Days since/until release */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">
                                      {modelStats.isFuture ? 'Releasing' : 'Released'}
                                    </span>
                                    <span className={`font-medium ${modelStats.isFuture ? 'text-blue-400' : 'text-white'}`}>
                                      {moment(parseReleaseDate(release.date)).fromNow()}
                                    </span>
                                  </div>
                                </div>

                                {/* Tooltip arrow - flips based on position */}
                                {releaseTooltipPosition[releaseKey] === 'below' ? (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#151515]"></div>
                                ) : (
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#151515]"></div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
        </>
      ) : (
        /* List View */
        <section className="flex justify-center px-4 md:px-8 py-8 min-h-screen" aria-label="AI Model Release List">
          <div className="w-full max-w-3xl">
            <div className="space-y-0">
              {sortedReleases.map((release, idx) => {
                const prevRelease = idx > 0 ? sortedReleases[idx - 1] : null;

                // Get month and year from dateObj
                const currentMonth = release.dateObj.toLocaleString('default', { month: 'short' });
                const currentYear = release.dateObj.getFullYear();
                const isJanuary = release.dateObj.getMonth() === 0;

                const prevMonth = prevRelease ? prevRelease.dateObj.toLocaleString('default', { month: 'short' }) : null;
                const prevYear = prevRelease ? prevRelease.dateObj.getFullYear() : null;

                // Show month header when month changes
                const showMonthHeader = !prevRelease || currentMonth !== prevMonth || currentYear !== prevYear;

                // Format the month header
                const monthHeader = isJanuary ? `${currentMonth} ${currentYear}` : currentMonth;

                return (
                  <div key={`${release.company}-${release.modelName}-${idx}`}>
                    {/* Month header */}
                    {showMonthHeader && (
                      <div className="sticky top-[52px] md:top-[116px] bg-[#0A0A0A] py-4 border-b border-white/10 mt-8 first:mt-0 z-30">
                        <h2 className="text-sm md:text-base font-semibold text-white">
                          {monthHeader}
                        </h2>
                      </div>
                    )}

                    {/* Release item */}
                     {(() => {
                       const listReleaseKey = `list-${release.company}-${release.modelName}`;
                       const isListReleaseActive = hoveredRelease === listReleaseKey || clickedRelease === listReleaseKey;

                       return (
                     <div
                      className={`relative flex items-center gap-3 md:gap-4 py-3 md:py-4 px-3 md:px-4 border-b border-white/5 hover-transition hover:bg-white/[0.02] cursor-pointer ${
                        isListReleaseActive ? 'z-[10001]' : ''
                      }`}
                      onMouseEnter={(e) => {
                        const listReleaseKey = `list-${release.company}-${release.modelName}`;
                        setHoveredRelease(listReleaseKey);
                        // Calculate tooltip position - prefer centered to avoid covering items below
                        const rect = e.currentTarget.getBoundingClientRect();
                        const headerHeight = window.innerWidth >= 768 ? 116 : 52;
                        const tooltipHeight = 320;
                        const minClearance = 20;
                        const spaceAbove = rect.top - headerHeight;

                        // Only position at top if very close to header
                        // Otherwise center vertically to avoid covering other items
                        if (spaceAbove < (tooltipHeight / 2 + minClearance)) {
                          setReleaseTooltipPosition(prev => ({ ...prev, [listReleaseKey]: 'below' }));
                        } else {
                          setReleaseTooltipPosition(prev => ({ ...prev, [listReleaseKey]: 'above' }));
                        }
                      }}
                      onMouseLeave={() => setHoveredRelease(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        const listReleaseKey = `list-${release.company}-${release.modelName}`;
                        // Calculate tooltip position on click - prefer centered to avoid covering items
                        const rect = e.currentTarget.getBoundingClientRect();
                        const headerHeight = window.innerWidth >= 768 ? 116 : 52;
                        const tooltipHeight = 320;
                        const minClearance = 20;
                        const spaceAbove = rect.top - headerHeight;

                        // Only position at top if very close to header
                        if (spaceAbove < (tooltipHeight / 2 + minClearance)) {
                          setReleaseTooltipPosition(prev => ({ ...prev, [listReleaseKey]: 'below' }));
                        } else {
                          setReleaseTooltipPosition(prev => ({ ...prev, [listReleaseKey]: 'above' }));
                        }
                        setClickedRelease(clickedRelease === listReleaseKey ? null : listReleaseKey);
                      }}
                    >
                      {/* Company indicator */}
                      <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 ${release.dotColor}`} />

                      {/* Company name */}
                      <div className="min-w-[90px] md:min-w-[140px]">
                        <span className="text-xs md:text-sm text-gray-500">{release.companyName}</span>
                      </div>

                      {/* Model name */}
                      <div className="flex-1">
                        <span className="text-sm md:text-base font-medium text-gray-200">{release.modelName}</span>
                      </div>

                      {/* Date */}
                      <div className="text-xs md:text-sm text-gray-500">
                        {release.date}
                      </div>

                      {/* Enhanced stats tooltip for list view */}
                      {(() => {
                        const listReleaseKey = `list-${release.company}-${release.modelName}`;
                        const isListReleaseHovered = hoveredRelease === listReleaseKey;
                        const isListReleaseClicked = clickedRelease === listReleaseKey;
                        const isListReleaseActive = isListReleaseHovered || isListReleaseClicked;

                        // Find the release index in the company's releases array
                        const companyData = timelineData.find(c => c.company === release.company);
                        const releaseIndex = companyData?.releases.findIndex(r => r.name === release.modelName) ?? -1;
                        const modelStats = releaseIndex >= 0 ? getModelStats(release.company, releaseIndex) : null;

                        return isListReleaseActive && modelStats ? (
                          <div className={`absolute left-full ml-4 bg-[#151515] border border-white/10 rounded-lg p-3 shadow-xl min-w-[280px] z-[10002] animate-fade-in-slide-up ${
                            releaseTooltipPosition[listReleaseKey] === 'below'
                              ? 'top-0'
                              : 'top-1/2 -translate-y-1/2'
                          }`}>
                            {/* Model name and date */}
                            <div className="mb-3 pb-3 border-b border-white/10">
                              <div className="text-sm font-semibold text-white mb-1">{release.modelName}</div>
                              <div className="text-xs text-gray-500">{release.date}</div>
                            </div>

                            <div className="space-y-2.5 text-xs">
                              {/* Days since/until release */}
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">
                                  {modelStats.isFuture ? 'Releasing' : 'Released'}
                                </span>
                                <span className={`font-medium ${modelStats.isFuture ? 'text-blue-400' : 'text-white'}`}>
                                  {moment(parseReleaseDate(release.date)).fromNow()}
                                </span>
                              </div>
                            </div>

                            {/* Tooltip arrow */}
                            <div className={`absolute right-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-[#151515] ${
                              releaseTooltipPosition[listReleaseKey] === 'below'
                                ? 'top-4'
                                : 'top-1/2 -translate-y-1/2'
                            }`}></div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                       );
                     })()}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
