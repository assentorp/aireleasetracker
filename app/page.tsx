'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from '../assets/Logo';

export default function Timeline() {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthHeaderRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnLoadRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply for faster scrolling
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
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
      order: 4,
    },
    meta: {
      name: 'Meta',
      dotColor: 'bg-sky-500',
      initial: 'M',
      order: 3,
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
      name: 'Mistral AI',
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

    // Parse last release date
    const lastRelease = releases[releases.length - 1];
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

    // Calculate expected next release date - keep adding intervals until it's in the future
    let expectedNextReleaseDate = new Date(lastReleaseDate);
    expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);

    // Keep adding intervals until we get a date in the future
    while (expectedNextReleaseDate <= now && avgDaysBetweenReleases > 0) {
      expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);
    }

    const daysUntilExpected = Math.floor((expectedNextReleaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Format expected date
    const formatExpectedDate = (date: Date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

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

      const releases = company.releases;
      const lastRelease = releases[releases.length - 1];
      const lastReleaseDate = parseReleaseDate(lastRelease.date);

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

      if (avgDaysBetweenReleases > 0) {
        // Calculate expected next release date - keep adding intervals until it's in the future
        let expectedNextReleaseDate = new Date(lastReleaseDate);
        expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);

        // Keep adding intervals until we get a date in the future
        while (expectedNextReleaseDate <= now) {
          expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);
        }

        const daysUntil = Math.floor((expectedNextReleaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="sticky top-0 bg-[#0A0A0A] z-50 py-8 px-8 border-b border-white/5">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              {/* Left: Logo and description */}
              <div className="flex-shrink-0 flex flex-col justify-center gap-0">
                <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                  <Logo className="cursor-pointer" />
                </Link>
                <p className="text-sm text-gray-500">
                  Major AI model releases since ChatGPT (November 30, 2022)
                </p>
              </div>

              {/* Middle-left: Release info */}
              <div className="flex gap-1 ml-8">
                {nextExpected !== null ? (
                  <div className="min-w-[180px]">
                    <div className="text-xs text-gray-500 mb-2">Next Expected Release</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${companies[nextExpected.company as keyof typeof companies]?.dotColor || 'bg-gray-500'}`} />
                      <div className="text-sm font-medium text-gray-200">{nextExpected.companyName}</div>
                      <div className={`text-xs font-medium ${nextExpected.daysUntil < 0 ? 'text-gray-500' : nextExpected.daysUntil < 30 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {nextExpected.daysUntil < 0
                          ? `~${Math.abs(nextExpected.daysUntil)} days ago`
                          : `~${nextExpected.daysUntil} days`
                        }
                      </div>
                    </div>
                  </div>
                ) : null}

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

            {/* Right: Auth buttons */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Log in
              </button>
              <button className="px-3 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Get Updates
              </button>
            </div>
          </div>
      </div>

      {/* Sticky month header - outside scroll container */}
      <div className="flex sticky top-[116px] z-40 bg-[#0A0A0A] border-b border-white/5">
          {/* Left spacer to align with company labels */}
          <div className="flex-shrink-0 w-[180px]" />

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
                  <div className={`text-xs font-medium ${marker.isJanuary ? 'text-white' : 'text-gray-700'}`}>
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Timeline container - fixed left column + scrollable right */}
      <div className="flex">
          {/* Fixed left column for company labels */}
          <div className="flex-shrink-0 w-[180px] border-r border-white/5 bg-[#0A0A0A] z-30 overflow-visible">

            {/* Company labels */}
            <div className={`space-y-8 overflow-visible ${hoveredCompany ? 'z-[200] relative' : ''}`}>
              {filteredData.map((item, companyIndex) => {
                const companyInfo = companies[item.company as keyof typeof companies];
                const stats = getCompanyStats(item.company);
                const isCompanyHovered = hoveredCompany === item.company;
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
                    className={`relative flex items-start ${isEvenRow ? 'bg-white/[0.015] py-8' : ''} ${isCompanyHovered ? 'z-[100]' : 'z-auto'}`}
                    style={{ height: `${rowHeight}px`, width: '100%' }}
                  >
                    <div
                      className="pr-4 w-full relative z-50"
                      onMouseEnter={() => setHoveredCompany(item.company)}
                      onMouseLeave={() => setHoveredCompany(null)}
                    >
                      <div className="relative z-50 h-full flex items-center justify-start px-4">
                        <div className="flex items-center gap-2 cursor-pointer">
                          <div className={`w-2 h-2 rounded-full ${companyInfo.dotColor}`} />
                          <span className="text-gray-400 text-sm md:text-base font-medium hover:text-gray-300 transition-colors">
                            {companyInfo.name}
                          </span>
                        </div>

                        {/* Stats panel on hover */}
                        {isCompanyHovered && stats && (
                          <div
                            className="absolute top-full left-8 mt-2 bg-[#151515] border border-white/10 rounded-lg p-4 shadow-xl min-w-[320px] max-h-[500px] overflow-y-auto"
                            style={{
                              zIndex: 99999,
                              animation: 'fadeInSlideUp 0.2s ease-out forwards'
                            }}
                          >
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Days since last release</div>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-xl font-semibold text-white">
                                    {stats.daysSinceLastRelease}
                                  </div>
                                  <div className="text-xs text-gray-600 text-right truncate">
                                    {stats.lastRelease}
                                  </div>
                                </div>
                                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-white rounded-full transition-all"
                                    style={{
                                      width: `${Math.min((stats.daysSinceLastRelease / stats.avgDaysBetweenReleases) * 100, 100)}%`
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="pt-3 border-t border-white/5">
                                <div className="text-xs text-gray-500 mb-1">Average</div>
                                <div className="text-lg font-semibold text-gray-300">
                                  {stats.avgDaysBetweenReleases} days
                                </div>
                              </div>

                              <div className="pt-3 border-t border-white/5">
                                <div className="text-xs text-gray-500 mb-1">Expected next release</div>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-lg font-semibold text-gray-400">
                                    {stats.expectedNextReleaseDate}
                                  </div>
                                  <div className={`text-xs font-medium ${stats.daysUntilExpected < 0 ? 'text-gray-500' : stats.daysUntilExpected < 30 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    {stats.daysUntilExpected < 0
                                      ? `${Math.abs(stats.daysUntilExpected)} days ago`
                                      : `${stats.daysUntilExpected} days`
                                    }
                                  </div>
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
                                      <div className="text-sm font-semibold text-gray-400 whitespace-nowrap">
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
            className={`flex-1 overflow-x-auto overflow-y-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
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
                  /* Dotted vertical lines spanning full height */
                  <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: `${totalTimelineHeight}px`, minWidth: `${totalMonths * 120}px` }}>
                    {monthMarkers.map((marker, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 w-[1px] border-l border-dotted border-white/5"
                        style={{ left: `${(marker.position / totalMonths) * 100}%` }}
                      />
                    ))}
                  </div>
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

                        return (
                          <div
                            key={idx}
                            className="absolute border border-white/10 rounded-md px-3 py-2 bg-[#151515] hover:bg-[#1a1a1a] hover:border-white/20 transition-all cursor-pointer whitespace-nowrap z-10"
                            style={{
                              left: `${(release.alignedPosition / totalMonths) * 100}%`,
                              top: `${topOffset}px`,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${companyInfo.dotColor}`} />
                              <div className="text-sm font-medium text-gray-200">
                                {release.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {release.date}
                              </div>
                            </div>
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
      </div>
    </div>
  );
}
