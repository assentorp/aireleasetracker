'use client';

import { useState } from 'react';

export default function Timeline() {
  const [selectedCompany, setSelectedCompany] = useState('all');

  // Company configurations with colors
  const companies = {
    anthropic: {
      name: 'Anthropic',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      initial: 'A',
    },
    openai: {
      name: 'OpenAI',
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      initial: 'O',
    },
    google: {
      name: 'Google',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      initial: 'G',
    },
    meta: {
      name: 'Meta',
      color: 'bg-sky-500',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      initial: 'M',
    },
    xai: {
      name: 'xAI',
      color: 'bg-purple-500',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      initial: 'X',
    },
    deepseek: {
      name: 'DeepSeek',
      color: 'bg-pink-500',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
      initial: 'D',
    },
    mistral: {
      name: 'Mistral AI',
      color: 'bg-amber-500',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
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

  // Timeline data organized by company (accurate data from Wikipedia/sources)
  const timelineData = [
    {
      company: 'anthropic',
      releases: [
        { date: 'Mar 14 2023', name: 'Claude 1.0', position: getMonthPosition('Mar 14 2023') },
        { date: 'Jul 11 2023', name: 'Claude 2.0', position: getMonthPosition('Jul 11 2023') },
        { date: 'Nov 21 2023', name: 'Claude 2.1', position: getMonthPosition('Nov 21 2023') },
        { date: 'Mar 04 2024', name: 'Claude 3 (Haiku/Sonnet/Opus)', position: getMonthPosition('Mar 04 2024') },
        { date: 'Jun 20 2024', name: 'Claude 3.5 Sonnet', position: getMonthPosition('Jun 20 2024') },
        { date: 'Oct 22 2024', name: 'Claude 3.5 Sonnet (New)', position: getMonthPosition('Oct 22 2024') },
        { date: 'Oct 22 2024', name: 'Claude 3.5 Haiku', position: getMonthPosition('Oct 22 2024') + 0.1 },
        { date: 'Feb 24 2025', name: 'Claude 3.7 Sonnet', position: getMonthPosition('Feb 24 2025') },
        { date: 'May 22 2025', name: 'Claude 4 (Sonnet/Opus)', position: getMonthPosition('May 22 2025') },
        { date: 'Sep 2025', name: 'Claude Sonnet 4.5', position: getMonthPosition('Sep 2025') },
        { date: 'Oct 2025', name: 'Claude Haiku 4.5', position: getMonthPosition('Oct 2025') },
        { date: 'Nov 24 2025', name: 'Claude Opus 4.5', position: getMonthPosition('Nov 24 2025') },
      ],
    },
    {
      company: 'openai',
      releases: [
        { date: 'Nov 30 2022', name: 'ChatGPT (GPT-3.5)', position: 0 },
        { date: 'Mar 14 2023', name: 'GPT-4', position: getMonthPosition('Mar 14 2023') },
        { date: 'May 2024', name: 'GPT-4o', position: getMonthPosition('May 2024') },
        { date: 'Jul 18 2024', name: 'GPT-4o mini', position: getMonthPosition('Jul 18 2024') },
        { date: 'Dec 2024', name: 'o3 (Announced)', position: getMonthPosition('Dec 2024') },
        { date: 'Aug 07 2025', name: 'GPT-5', position: getMonthPosition('Aug 07 2025') },
      ],
    },
    {
      company: 'meta',
      releases: [
        { date: 'Feb 2023', name: 'LLaMA 1', position: getMonthPosition('Feb 2023') },
        { date: 'Jul 2023', name: 'Llama 2', position: getMonthPosition('Jul 2023') },
        { date: 'Apr 2024', name: 'Llama 3', position: getMonthPosition('Apr 2024') },
        { date: 'Jul 23 2024', name: 'Llama 3.1 (405B)', position: getMonthPosition('Jul 23 2024') },
        { date: 'Oct 2024', name: 'Llama 3.2', position: getMonthPosition('Oct 2024') },
        { date: 'Dec 2024', name: 'Llama 3.3', position: getMonthPosition('Dec 2024') },
        { date: 'Apr 05 2025', name: 'Llama 4 (Scout/Maverick)', position: getMonthPosition('Apr 05 2025') },
      ],
    },
    {
      company: 'google',
      releases: [
        { date: 'May 10 2023', name: 'Bard (PaLM 2)', position: getMonthPosition('May 10 2023') },
        { date: 'Dec 06 2023', name: 'Gemini 1.0', position: getMonthPosition('Dec 06 2023') },
        { date: 'Feb 2024', name: 'Gemini 1.5', position: getMonthPosition('Feb 2024') },
        { date: 'Dec 11 2024', name: 'Gemini 2.0 Flash (Experimental)', position: getMonthPosition('Dec 11 2024') },
        { date: 'Jan 30 2025', name: 'Gemini 2.0 Flash', position: getMonthPosition('Jan 30 2025') },
        { date: 'Jun 2025', name: 'Gemini 2.5', position: getMonthPosition('Jun 2025') },
      ],
    },
    {
      company: 'xai',
      releases: [
        { date: 'Nov 2023', name: 'Grok-1', position: getMonthPosition('Nov 2023') },
        { date: 'Mar 2024', name: 'Grok-1.5', position: getMonthPosition('Mar 2024') },
        { date: 'Aug 2024', name: 'Grok-2', position: getMonthPosition('Aug 2024') },
        { date: 'Feb 17 2025', name: 'Grok-3', position: getMonthPosition('Feb 17 2025') },
      ],
    },
    {
      company: 'deepseek',
      releases: [
        { date: 'May 06 2024', name: 'DeepSeek-V2', position: getMonthPosition('May 06 2024') },
        { date: 'Dec 2024', name: 'DeepSeek-V3', position: getMonthPosition('Dec 2024') },
        { date: 'Jan 20 2025', name: 'DeepSeek-R1', position: getMonthPosition('Jan 20 2025') },
        { date: 'Mar 24 2025', name: 'DeepSeek-V3-0324', position: getMonthPosition('Mar 24 2025') },
        { date: 'May 28 2025', name: 'DeepSeek-R1-0528', position: getMonthPosition('May 28 2025') },
        { date: 'Aug 2025', name: 'DeepSeek-V3.1', position: getMonthPosition('Aug 2025') },
      ],
    },
    {
      company: 'mistral',
      releases: [
        { date: 'Sep 27 2023', name: 'Mistral 7B', position: getMonthPosition('Sep 27 2023') },
        { date: 'Dec 2023', name: 'Mixtral 8x7B', position: getMonthPosition('Dec 2023') },
        { date: 'Feb 26 2024', name: 'Mistral Large', position: getMonthPosition('Feb 26 2024') },
        { date: 'Apr 10 2024', name: 'Mixtral 8x22B', position: getMonthPosition('Apr 10 2024') },
        { date: 'Jul 2024', name: 'Mistral Large (Upgraded)', position: getMonthPosition('Jul 2024') },
        { date: 'Nov 18 2024', name: 'Pixtral Large', position: getMonthPosition('Nov 18 2024') },
        { date: 'Mar 17 2025', name: 'Mistral Small 3.1', position: getMonthPosition('Mar 17 2025') },
        { date: 'May 07 2025', name: 'Mistral Medium 3', position: getMonthPosition('May 07 2025') },
      ],
    },
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

  const filteredData =
    selectedCompany === 'all'
      ? timelineData
      : timelineData.filter((item) => item.company === selectedCompany);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-full mx-auto">
        {/* Header with filters */}
        <div className="mb-12 flex gap-2 sticky top-0 bg-[#0A0A0A] z-50 py-4">
          <button
            onClick={() => setSelectedCompany('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedCompany === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-transparent text-gray-400 border border-transparent hover:bg-white/5'
            }`}
          >
            All Companies
          </button>
          {Object.entries(companies).map(([key, company]) => (
            <button
              key={key}
              onClick={() => setSelectedCompany(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedCompany === key
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-transparent text-gray-400 border border-transparent hover:bg-white/5'
              }`}
            >
              {company.name}
            </button>
          ))}
        </div>

        {/* Timeline container - scrollable */}
        <div className="overflow-x-auto pb-8">
          <div className="relative" style={{ minWidth: `${totalMonths * 120}px` }}>
            {/* Timeline header with dates */}
            <div className="relative mb-8 h-8">
              {/* Timeline line */}
              <div className="absolute top-4 left-0 right-0 h-[1px] bg-white/10" />

              {/* Month markers with dotted lines */}
              {monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-0"
                  style={{ left: `${(marker.position / totalMonths) * 100}%` }}
                >
                  {/* Dotted vertical line */}
                  <div className="absolute top-8 w-[1px] h-[600px] border-l border-dotted border-gray-800" />

                  {/* Month label */}
                  <div className={`text-sm font-medium ${marker.isJanuary ? 'text-gray-400' : 'text-gray-600'}`}>
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
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-8 h-8 rounded-md ${companyInfo.color} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {companyInfo.initial}
                      </div>
                      <span className="text-white font-medium">
                        {companyInfo.name}
                      </span>
                    </div>

                    {/* Timeline releases */}
                    <div className="relative h-16">
                      {item.releases.map((release, idx) => (
                        <div
                          key={idx}
                          className={`absolute top-0 border ${companyInfo.borderColor} rounded-lg px-4 py-2 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap`}
                          style={{
                            left: `${(release.position / totalMonths) * 100}%`,
                          }}
                        >
                          <div className={`text-sm font-medium ${companyInfo.textColor}`}>
                            {release.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {release.date}
                          </div>
                        </div>
                      ))}
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
