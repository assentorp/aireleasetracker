'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

export default function Timeline() {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const companies = {
    anthropic: {
      name: 'Anthropic',
      dotColor: 'bg-orange-500',
      initial: 'A',
    },
    openai: {
      name: 'OpenAI',
      dotColor: 'bg-emerald-500',
      initial: 'O',
    },
    google: {
      name: 'Google',
      dotColor: 'bg-blue-500',
      initial: 'G',
    },
    meta: {
      name: 'Meta',
      dotColor: 'bg-sky-500',
      initial: 'M',
    },
    xai: {
      name: 'xAI',
      dotColor: 'bg-purple-500',
      initial: 'X',
    },
    deepseek: {
      name: 'DeepSeek',
      dotColor: 'bg-pink-500',
      initial: 'D',
    },
    mistral: {
      name: 'Mistral AI',
      dotColor: 'bg-amber-500',
      initial: 'Mi',
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
        { date: 'Feb 25 2025', name: 'Claude Code', position: getMonthPosition('Feb 25 2025') },
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
        { date: 'Mar 14 2023', name: 'GPT-4', position: getMonthPosition('Mar 14 2023') },
        { date: 'Nov 6 2023', name: 'GPT-4 Turbo', position: getMonthPosition('Nov 6 2023') },
        { date: 'May 13 2024', name: 'GPT-4o', position: getMonthPosition('May 13 2024') },
        { date: 'Jul 18 2024', name: 'GPT-4o mini', position: getMonthPosition('Jul 18 2024') },
        { date: 'Sep 12 2024', name: 'o1', position: getMonthPosition('Sep 12 2024') },
        { date: 'Sep 12 2024', name: 'o1 mini', position: getMonthPosition('Sep 12 2024') + 0.1 },
        { date: 'Jan 31 2025', name: 'o3 mini', position: getMonthPosition('Jan 31 2025') },
        { date: 'Feb 27 2025', name: 'GPT-4.5', position: getMonthPosition('Feb 27 2025') },
        { date: 'May 14 2025', name: 'GPT-4.1', position: getMonthPosition('May 14 2025') },
        { date: 'May 14 2025', name: 'GPT-4.1 mini', position: getMonthPosition('May 14 2025') + 0.1 },
        { date: 'Jun 6 2025', name: 'o4 mini', position: getMonthPosition('Jun 6 2025') },
        { date: 'Jun 10 2025', name: 'o3 pro', position: getMonthPosition('Jun 10 2025') },
        { date: 'Aug 5 2025', name: 'GPT-5 (gpt-oss-120b/20b)', position: getMonthPosition('Aug 5 2025') }
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
  const filteredData = timelineData;

  // Group overlapping releases (within 0.3 months of each other)
  const groupOverlappingReleases = (releases: any[]) => {
    const groups: any[][] = [];
    const sorted = [...releases].sort((a, b) => a.position - b.position);

    sorted.forEach((release) => {
      let added = false;
      for (const group of groups) {
        const lastInGroup = group[group.length - 1];
        if (Math.abs(lastInGroup.position - release.position) < 0.3) {
          group.push(release);
          added = true;
          break;
        }
      }
      if (!added) {
        groups.push([release]);
      }
    });

    return groups;
  };

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-12 sticky top-0 bg-[#0A0A0A] z-50 py-4">
          <h1 className="text-2xl font-semibold text-white mb-2">
            AI Model Timeline
          </h1>
          <p className="text-sm text-gray-500">
            Major AI model releases since ChatGPT (November 30, 2022)
          </p>
        </div>

        {/* Timeline container - scrollable */}
        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto pb-8 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        >
          <div className="relative" style={{ minWidth: `${totalMonths * 120}px` }}>
            {/* Timeline header with dates */}
            <div className="relative mb-8 h-8">
              {/* Timeline line */}
              <div className="absolute top-4 left-0 right-0 h-[1px] bg-white/5" />

              {/* Month markers with dotted lines */}
              {monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-0"
                  style={{ left: `${(marker.position / totalMonths) * 100}%` }}
                >
                  {/* Dotted vertical line */}
                  <div className="absolute top-8 w-[1px] h-[600px] border-l border-dotted border-white/5" />

                  {/* Month label */}
                  <div className={`text-xs font-medium ${marker.isJanuary ? 'text-gray-500' : 'text-gray-700'}`}>
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Company rows */}
            <div className="space-y-8 mt-16">
              {filteredData.map((item) => {
                const companyInfo = companies[item.company as keyof typeof companies];
                return (
                  <div key={item.company} className="relative">
                    {/* Company label */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-2 h-2 rounded-full ${companyInfo.dotColor}`} />
                      <span className="text-gray-400 text-sm font-medium">
                        {companyInfo.name}
                      </span>
                    </div>

                    {/* Timeline releases */}
                    <div className="relative h-24">
                      {groupOverlappingReleases(item.releases).map((group, groupIdx) => {
                        const avgPosition = group.reduce((sum, r) => sum + r.position, 0) / group.length;
                        const groupId = `${item.company}-${groupIdx}`;
                        const isHovered = hoveredGroup === groupId;

                        if (group.length === 1) {
                          // Single release - render normally
                          const release = group[0];
                          return (
                            <div
                              key={groupIdx}
                              className="absolute top-0 border border-white/10 rounded-md px-3 py-2 bg-[#151515] hover:bg-[#1a1a1a] hover:border-white/20 transition-all cursor-pointer whitespace-nowrap z-10 group"
                              style={{
                                left: `${(release.position / totalMonths) * 100}%`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${companyInfo.dotColor}`} />
                                <div className="text-sm font-medium text-gray-200">
                                  {release.name}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 ml-3.5">
                                {release.date}
                              </div>
                            </div>
                          );
                        }

                        // Multiple releases - render as stacked cards
                        return (
                          <div
                            key={groupIdx}
                            className="absolute top-0"
                            style={{
                              left: `${(avgPosition / totalMonths) * 100}%`,
                            }}
                            onMouseEnter={() => setHoveredGroup(groupId)}
                            onMouseLeave={() => setHoveredGroup(null)}
                          >
                            {group.map((release, idx) => (
                              <div
                                key={idx}
                                className="border border-white/10 rounded-md px-3 py-2 bg-[#151515] hover:bg-[#1a1a1a] hover:border-white/20 transition-all cursor-pointer whitespace-nowrap"
                                style={{
                                  position: isHovered ? 'relative' : 'absolute',
                                  top: isHovered ? 0 : idx * 2,
                                  left: isHovered ? 0 : idx * 2,
                                  zIndex: isHovered ? 20 + idx : 10 + (group.length - idx),
                                  marginBottom: isHovered ? '8px' : 0,
                                  transform: isHovered ? 'translateY(0)' : 'translateY(0)',
                                  opacity: isHovered ? 1 : (idx === group.length - 1 ? 1 : 0.7),
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${companyInfo.dotColor}`} />
                                  <div className="text-sm font-medium text-gray-200">
                                    {release.name}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 ml-3.5">
                                  {release.date}
                                </div>
                              </div>
                            ))}
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
