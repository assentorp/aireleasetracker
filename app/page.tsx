'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';
import { timelineData, companies, getLatestRelease } from '../lib/timeline-data';
import { Header } from '../components/Header';
import { ViewToggle } from '../components/ViewToggle';
import { CompanyFilter } from '../components/CompanyFilter';

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

function TimelineContent() {
  const searchParams = useSearchParams();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [clickedCompany, setClickedCompany] = useState<string | null>(null);
  const [hoveredRelease, setHoveredRelease] = useState<string | null>(null);
  const [clickedRelease, setClickedRelease] = useState<string | null>(null);
  const [releaseTooltipPosition, setReleaseTooltipPosition] = useState<{ [key: string]: 'above' | 'below' }>({});
  const [releaseTooltipAlign, setReleaseTooltipAlign] = useState<{ [key: string]: 'left' | 'center' | 'right' }>({});
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [displayMode, setDisplayMode] = useState<'home' | 'analytics'>('home');
  const [homeView, setHomeView] = useState<'timeline' | 'list'>('timeline');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize selected companies after component mounts
  useEffect(() => {
    setSelectedCompanies(Object.keys(companies));
  }, []);
  const monthHeaderRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnLoadRef = useRef(false);
  const savedScrollPositionRef = useRef<number>(0);
  const statsPanelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [statsPanelCoords, setStatsPanelCoords] = useState<{ [key: string]: { top: number; left: number } }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Watch URL params to update display mode
  useEffect(() => {
    const view = searchParams?.get('view');
    if (view === 'analytics') {
      setDisplayMode('analytics');
    } else {
      setDisplayMode('home');
    }
  }, [searchParams]);

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

  // Save scroll position when switching away from timeline view
  useEffect(() => {
    if (homeView !== 'timeline' && scrollContainerRef.current) {
      savedScrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  }, [homeView]);

  // Restore scroll position when switching back to timeline view
  useEffect(() => {
    if (homeView === 'timeline' && scrollContainerRef.current && monthHeaderRef.current && hasScrolledOnLoadRef.current) {
      // Restore saved position
      const savedPosition = savedScrollPositionRef.current;
      scrollContainerRef.current.scrollLeft = savedPosition;
      monthHeaderRef.current.scrollLeft = savedPosition;
    }
  }, [homeView]);

  // Sync scroll position between timeline and month header
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const monthHeader = monthHeaderRef.current;

    if (!scrollContainer || !monthHeader || homeView !== 'timeline') return;

    const handleScroll = () => {
      monthHeader.scrollLeft = scrollContainer.scrollLeft;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [mounted, homeView]);

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
  // Filter by selected companies and sort by their order property
  const filteredData = [...timelineData]
    .filter(item => selectedCompanies.includes(item.company))
    .sort((a, b) => {
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
  type ReleaseItem = {
    date: string;
    name: string;
    position: number;
    parameters?: string;
    contextWindow?: string;
    contextWindowWords?: string;
    type?: string;
  };
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

  // Calculate next expected release for a specific company
  const getCompanyNextExpectedRelease = (companyKey: string): { date: string; daysUntil: number } | null => {
    const now = new Date();
    const company = timelineData.find(c => c.company === companyKey);
    if (!company || company.releases.length === 0) return null;

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

    if (avgDaysBetweenReleases === 0) return null;

    // Calculate expected next release date
    let expectedNextReleaseDate = new Date(lastReleaseDate);
    expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);

    if (daysSinceLastRelease <= avgDaysBetweenReleases) {
      while (expectedNextReleaseDate <= now && avgDaysBetweenReleases > 0) {
        expectedNextReleaseDate.setDate(expectedNextReleaseDate.getDate() + avgDaysBetweenReleases);
      }
    }

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

    return {
      date: formatExpectedDate(expectedNextReleaseDate),
      daysUntil
    };
  };

  // Calculate release data for analytics graphs
  const getAnalyticsData = () => {
    // Get all releases with dates
    const allReleases: { date: Date; company: string; name: string }[] = [];
    timelineData.forEach((item) => {
      item.releases.forEach((release) => {
        allReleases.push({
          date: parseReleaseDate(release.date),
          company: item.company,
          name: release.name
        });
      });
    });

    // Sort by date
    allReleases.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Group by month for frequency graph
    const monthlyData: { [key: string]: number } = {};
    allReleases.forEach((release) => {
      const monthKey = `${release.date.getFullYear()}-${String(release.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Create cumulative data
    const cumulativeData: { month: string; count: number }[] = [];
    let cumulative = 0;
    Object.keys(monthlyData).sort().forEach((monthKey) => {
      cumulative += monthlyData[monthKey];
      cumulativeData.push({ month: monthKey, count: cumulative });
    });

    // Create frequency data
    const frequencyData: { month: string; count: number }[] = [];
    Object.keys(monthlyData).sort().forEach((monthKey) => {
      frequencyData.push({ month: monthKey, count: monthlyData[monthKey] });
    });

    return {
      frequency: frequencyData,
      cumulative: cumulativeData,
      total: allReleases.length
    };
  };

  // Get latest release using shared utility
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

    timelineData
      .filter(item => selectedCompanies.includes(item.company))
      .forEach((item) => {
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
      <Header
        currentPage="home"
        latestRelease={latestRelease}
      />

      {/* Conditional rendering based on display mode */}
      {displayMode === 'home' ? (
        <>
      {/* View Controls - Toggle and Filter */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5">
        <ViewToggle currentView={homeView} onViewChange={setHomeView} />
        <CompanyFilter
          selectedCompanies={selectedCompanies}
          onFilterChange={setSelectedCompanies}
        />
      </div>

      {homeView === 'timeline' ? (
        <>
      {/* Sticky month header - outside scroll container */}
      <div className="flex sticky top-[52px] md:top-[104px] z-40 bg-[#0A0A0A] border-b border-white/5">
          {/* Left spacer to align with company labels */}
          <div className="flex-shrink-0 w-[120px] md:w-[240px]" />

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

      {/* Timeline container - fixed left column + scrollable right */}
      <section className="flex" aria-label="AI Model Release Timeline">
          {/* Fixed left column for company labels */}
          <div className="flex-shrink-0 w-[120px] md:w-[240px] border-r border-white/5 bg-[#0A0A0A] z-30 overflow-visible">

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
                          className="cursor-pointer px-2 md:px-3 py-1.5 md:py-2 hover-transition hover:bg-white/[0.02]"
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
                              setStatsPanelCoords(prev => ({
                                ...prev,
                                [item.company]: {
                                  top: Math.max(headerHeight + 8, rect.top - panelHeight - 8), // Ensure it's below header
                                  left: rect.left + (window.innerWidth >= 768 ? 32 : 8)
                                }
                              }));
                            } else {
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
                              setStatsPanelCoords(prev => ({
                                ...prev,
                                [item.company]: {
                                  top: Math.max(headerHeight + 8, rect.top - panelHeight - 8), // Ensure it's below header
                                  left: rect.left + (window.innerWidth >= 768 ? 32 : 8)
                                }
                              }));
                            } else {
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
                          <div className="flex flex-col gap-1">
                            {/* Company name and dropdown */}
                            <div className="flex items-center gap-1 md:gap-2">
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

                            {/* Expected next release - desktop only */}
                            <div className="hidden md:flex flex-col gap-0.5">
                              {(() => {
                                const nextRelease = getCompanyNextExpectedRelease(item.company);
                                if (!nextRelease) return null;

                                return (
                                  <>
                                    <span className="text-xs text-gray-500">Expected next release</span>
                                    {nextRelease.daysUntil >= 0 ? (
                                      <span className="text-xs text-gray-400">
                                        {nextRelease.date} · In {nextRelease.daysUntil} {nextRelease.daysUntil === 1 ? 'day' : 'days'}
                                      </span>
                                    ) : (
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-orange-400 line-through">
                                          {nextRelease.date}
                                        </span>
                                        <span className="text-xs text-orange-400">
                                          Overdue by {Math.abs(nextRelease.daysUntil)} {Math.abs(nextRelease.daysUntil) === 1 ? 'day' : 'days'}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
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
                        const releaseData = item.releases[idx] as ReleaseItem | undefined;

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
                              const tooltipWidth = 280; // Min width of tooltip
                              const minClearance = 20; // Minimum space from edges
                              const spaceAbove = rect.top - headerHeight;

                              // Check vertical position
                              if (spaceAbove < (tooltipHeight + minClearance)) {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'below' }));
                              } else {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'above' }));
                              }

                              // Calculate horizontal position to prevent overflow
                              const distanceFromRightEdge = window.innerWidth - rect.right;
                              const distanceFromLeftEdge = rect.left;
                              const edgeThreshold = 200; // Open left/right when within 200px of edge

                              if (distanceFromRightEdge < edgeThreshold) {
                                // Within 200px of right edge - align tooltip to right edge (opens left)
                                setReleaseTooltipAlign(prev => ({ ...prev, [releaseKey]: 'right' }));
                              } else if (distanceFromLeftEdge < edgeThreshold) {
                                // Within 200px of left edge - align tooltip to left edge (opens right)
                                setReleaseTooltipAlign(prev => ({ ...prev, [releaseKey]: 'left' }));
                              } else {
                                // Far from edges - center it
                                setReleaseTooltipAlign(prev => ({ ...prev, [releaseKey]: 'center' }));
                              }
                            }}
                            onMouseLeave={() => setHoveredRelease(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Calculate tooltip position on click - prefer above to avoid covering items below
                              const rect = e.currentTarget.getBoundingClientRect();
                              const headerHeight = window.innerWidth >= 768 ? 116 : 52;
                              const tooltipHeight = 320;
                              const tooltipWidth = 280;
                              const minClearance = 20;
                              const spaceAbove = rect.top - headerHeight;

                              // Check vertical position
                              if (spaceAbove < (tooltipHeight + minClearance)) {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'below' }));
                              } else {
                                setReleaseTooltipPosition(prev => ({ ...prev, [releaseKey]: 'above' }));
                              }

                              // Calculate horizontal position to prevent overflow
                              const distanceFromRightEdge = window.innerWidth - rect.right;
                              const distanceFromLeftEdge = rect.left;
                              const edgeThreshold = 200; // Open left/right when within 200px of edge

                              if (distanceFromRightEdge < edgeThreshold) {
                                setReleaseTooltipAlign(prev => ({ ...prev, [releaseKey]: 'right' }));
                              } else if (distanceFromLeftEdge < edgeThreshold) {
                                setReleaseTooltipAlign(prev => ({ ...prev, [releaseKey]: 'left' }));
                              } else {
                                setReleaseTooltipAlign(prev => ({ ...prev, [releaseKey]: 'center' }));
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
                            {isReleaseActive && modelStats && (
                              <div
                                className={`absolute bg-[#151515] border border-white/10 rounded-lg p-3 shadow-xl min-w-[280px] z-[10002] animate-fade-in-slide-up ${
                                  releaseTooltipPosition[releaseKey] === 'below'
                                    ? 'top-full mt-2'
                                    : 'bottom-full mb-2'
                                } ${
                                  releaseTooltipAlign[releaseKey] === 'right'
                                    ? 'right-0'
                                    : releaseTooltipAlign[releaseKey] === 'left'
                                    ? 'left-0'
                                    : 'left-1/2 -translate-x-1/2'
                                }`}
                              >
                                {/* Model name and date */}
                                <div className="mb-3 pb-3 border-b border-white/10">
                                  <div className="text-sm font-semibold text-white mb-1">{release.name}</div>
                                  <div className="text-xs text-gray-500">{releaseData?.date || release.date}</div>
                                </div>

                                <div className="space-y-2.5 text-xs">
                                  {/* Days since/until release */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">
                                      {modelStats.isFuture ? 'Releasing' : 'Released'}
                                    </span>
                                    <span className={`font-medium ${modelStats.isFuture ? 'text-blue-400' : 'text-white'}`}>
                                      {moment(parseReleaseDate(releaseData?.date || release.date)).fromNow()}
                                    </span>
                                  </div>

                                  {/* Parameters */}
                                  {releaseData?.parameters && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">Parameters</span>
                                      <span className="font-medium text-white">{releaseData.parameters}</span>
                                    </div>
                                  )}

                                  {/* Context Window */}
                                  {releaseData?.contextWindow && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">Context Window</span>
                                      <span className="font-medium text-white">
                                        {releaseData.contextWindow}
                                        {releaseData.contextWindowWords && ` (~${releaseData.contextWindowWords} words)`}
                                      </span>
                                    </div>
                                  )}

                                  {/* Model Type */}
                                  {releaseData?.type && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">Type</span>
                                      <span className="font-medium text-white">{releaseData.type}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Tooltip arrow - flips based on position and alignment */}
                                {releaseTooltipPosition[releaseKey] === 'below' ? (
                                  <div
                                    className={`absolute bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#151515] ${
                                      releaseTooltipAlign[releaseKey] === 'right'
                                        ? 'right-4'
                                        : releaseTooltipAlign[releaseKey] === 'left'
                                        ? 'left-4'
                                        : 'left-1/2 -translate-x-1/2'
                                    }`}
                                  ></div>
                                ) : (
                                  <div
                                    className={`absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#151515] ${
                                      releaseTooltipAlign[releaseKey] === 'right'
                                        ? 'right-4'
                                        : releaseTooltipAlign[releaseKey] === 'left'
                                        ? 'left-4'
                                        : 'left-1/2 -translate-x-1/2'
                                    }`}
                                  ></div>
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
                        isListReleaseActive ? 'z-40' : ''
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
        </>
      ) : (
        /* Analytics View */
        <section className="flex justify-center px-4 md:px-8 py-8 min-h-screen" aria-label="Release Analytics">
          <div className="w-full max-w-6xl space-y-8">
            {(() => {
              const analyticsData = getAnalyticsData();
              const maxCumulative = Math.max(...analyticsData.cumulative.map(d => d.count), 1);
              const maxFrequency = Math.max(...analyticsData.frequency.map(d => d.count), 1);

              return (
                <>
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Release Analytics</h2>
                    <p className="text-sm md:text-base text-gray-400">
                      Tracking {analyticsData.total} AI model releases since November 2022
                    </p>
                  </div>

                  {/* Cumulative Releases Graph */}
                  <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Cumulative Releases Over Time</h3>
                    <p className="text-sm text-gray-400 mb-6">Total number of AI models released (exponential growth)</p>

                    <div className="relative h-64 md:h-80">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                        <span>{maxCumulative}</span>
                        <span>{Math.floor(maxCumulative * 0.75)}</span>
                        <span>{Math.floor(maxCumulative * 0.5)}</span>
                        <span>{Math.floor(maxCumulative * 0.25)}</span>
                        <span>0</span>
                      </div>

                      {/* Graph area */}
                      <div className="absolute left-14 right-0 top-0 bottom-8 flex items-end gap-0.5">
                        {analyticsData.cumulative.length > 0 ? analyticsData.cumulative.map((data, idx) => {
                          const height = (data.count / maxCumulative) * 100;

                          return (
                            <div key={data.month} className="flex-1 group relative" style={{ minWidth: '4px' }}>
                              <div
                                className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-200"
                                style={{ height: `${Math.max(height, 0.5)}%` }}
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-white/20 rounded px-2 py-1 text-xs whitespace-nowrap pointer-events-none z-10">
                                  <div className="font-medium text-white">{data.count} models</div>
                                  <div className="text-gray-400">{data.month}</div>
                                </div>
                              </div>
                            </div>
                          );
                        }) : <div className="text-center text-gray-500 text-sm">No data available</div>}
                      </div>

                      {/* X-axis */}
                      <div className="absolute left-14 right-0 bottom-0 h-8 flex items-center justify-between text-xs text-gray-500">
                        {analyticsData.cumulative
                          .filter((_, idx) => idx % Math.ceil(analyticsData.cumulative.length / 8) === 0)
                          .map((data) => (
                            <span key={data.month}>{data.month}</span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Release Frequency Graph */}
                  <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Release Frequency (Per Month)</h3>
                    <p className="text-sm text-gray-400 mb-6">Number of new models released each month</p>

                    <div className="relative h-64 md:h-80">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                        <span>{maxFrequency}</span>
                        <span>{Math.floor(maxFrequency * 0.75)}</span>
                        <span>{Math.floor(maxFrequency * 0.5)}</span>
                        <span>{Math.floor(maxFrequency * 0.25)}</span>
                        <span>0</span>
                      </div>

                      {/* Graph area */}
                      <div className="absolute left-14 right-0 top-0 bottom-8 flex items-end gap-0.5">
                        {analyticsData.frequency.length > 0 ? analyticsData.frequency.map((data, idx) => {
                          const height = (data.count / maxFrequency) * 100;

                          return (
                            <div key={data.month} className="flex-1 group relative" style={{ minWidth: '4px' }}>
                              <div
                                className="w-full bg-green-500 hover:bg-green-600 transition-all duration-200"
                                style={{ height: `${Math.max(height, 0.5)}%` }}
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-white/20 rounded px-2 py-1 text-xs whitespace-nowrap pointer-events-none z-10">
                                  <div className="font-medium text-white">{data.count} releases</div>
                                  <div className="text-gray-400">{data.month}</div>
                                </div>
                              </div>
                            </div>
                          );
                        }) : <div className="text-center text-gray-500 text-sm">No data available</div>}
                      </div>

                      {/* X-axis */}
                      <div className="absolute left-14 right-0 bottom-0 h-8 flex items-center justify-between text-xs text-gray-500">
                        {analyticsData.frequency
                          .filter((_, idx) => idx % Math.ceil(analyticsData.frequency.length / 8) === 0)
                          .map((data) => (
                            <span key={data.month}>{data.month}</span>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}
    </main>
  );
}

export default function Timeline() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <TimelineContent />
    </Suspense>
  );
}
