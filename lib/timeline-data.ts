// Shared timeline data and utilities for notifications

export interface Release {
  date: string;
  name: string;
  position: number;
}

export interface TimelineCompany {
  company: string;
  releases: Release[];
}

export interface ReleaseWithCompany {
  company: string;
  companyName: string;
  modelName: string;
  date: string;
  dateObj: Date;
}

export const companies = {
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
    name: 'Mistral AI',
    dotColor: 'bg-amber-500',
    initial: 'Mi',
    order: 7,
  },
};

// Helper function to calculate months from start date (Nov 2022)
function getMonthPosition(dateStr: string): number {
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
}

// Timeline data organized by company
export const timelineData: TimelineCompany[] = [
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
      { date: 'Nov 17 2025', name: 'Grok 4.1', position: getMonthPosition('Nov 17 2025') },
      { date: 'Nov 19 2025', name: 'Grok 4.1 Fast', position: getMonthPosition('Nov 19 2025') }
    ]
  },
  {
    company: 'anthropic',
    releases: [
      { date: 'Mar 14 2023', name: 'Claude 1', position: getMonthPosition('Mar 14 2023') },
      { date: 'Jul 11 2023', name: 'Claude 2', position: getMonthPosition('Jul 11 2023') },
      { date: 'Aug 9 2023', name: 'Claude Instant 1.2', position: getMonthPosition('Aug 9 2023') },
      { date: 'Nov 21 2023', name: 'Claude 2.1', position: getMonthPosition('Nov 21 2023') },
      { date: 'Mar 4 2024', name: 'Claude 3 Haiku', position: getMonthPosition('Mar 4 2024') + 0.1 },
      { date: 'Mar 4 2024', name: 'Claude 3 Sonnet', position: getMonthPosition('Mar 4 2024') + 0.2 },
      { date: 'Mar 4 2024', name: 'Claude 3 Opus', position: getMonthPosition('Mar 4 2024') + 0.3 },
      { date: 'Jun 20 2024', name: 'Claude 3.5 Sonnet', position: getMonthPosition('Jun 20 2024') },
      { date: 'Oct 22 2024', name: 'Claude 3.5 Haiku', position: getMonthPosition('Oct 22 2024') },
      { date: 'Feb 24 2025', name: 'Claude 3.7 Sonnet', position: getMonthPosition('Feb 24 2025') },
      { date: 'May 22 2025', name: 'Claude Sonnet 4', position: getMonthPosition('May 22 2025') + 0.1 },
      { date: 'May 22 2025', name: 'Claude Opus 4', position: getMonthPosition('May 22 2025') + 0.2 },
      { date: 'Aug 5 2025', name: 'Claude Opus 4.1', position: getMonthPosition('Aug 5 2025') },
      { date: 'Sep 29 2025', name: 'Claude Sonnet 4.5', position: getMonthPosition('Sep 29 2025') },
      { date: 'Oct 15 2025', name: 'Claude Haiku 4.5', position: getMonthPosition('Oct 15 2025') },
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
    releases:[
      { date: 'Mar 21 2023', name: 'Bard', position: getMonthPosition('Mar 21 2023') },
      { date: 'Dec 6 2023', name: 'Gemini 1.0 Nano', position: getMonthPosition('Dec 6 2023') },
      { date: 'Dec 13 2023', name: 'Gemini 1.0 Pro', position: getMonthPosition('Dec 13 2023') },
      { date: 'Feb 8 2024', name: 'Gemini 1.0 Ultra', position: getMonthPosition('Feb 8 2024') },
      { date: 'Feb 15 2024', name: 'Gemini 1.5 Pro', position: getMonthPosition('Feb 15 2024') },
      { date: 'May 14 2024', name: 'Gemini 1.5 Flash', position: getMonthPosition('May 14 2024') },
      { date: 'Sep 24 2024', name: 'Gemini 1.5 Pro-002', position: getMonthPosition('Sep 24 2024') },
      { date: 'Sep 24 2024', name: 'Gemini 1.5 Flash-002', position: getMonthPosition('Sep 24 2024') },
      { date: 'Oct 3 2024', name: 'Gemini 1.5 Flash-8B', position: getMonthPosition('Oct 3 2024') },
      { date: 'Jan 30 2025', name: 'Gemini 2.0 Flash', position: getMonthPosition('Jan 30 2025') },
      { date: 'Feb 1 2025', name: 'Gemini 2.0 Flash-Lite', position: getMonthPosition('Feb 1 2025') },
      { date: 'Feb 5 2025', name: 'Gemini 2.0 Pro', position: getMonthPosition('Feb 5 2025') },
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
      { date: 'Nov 30 2022', name: 'GPT-3.5', position: getMonthPosition('Nov 30 2022') },
      { date: 'Mar 14 2023', name: 'GPT-4', position: getMonthPosition('Mar 14 2023') },
      { date: 'May 13 2024', name: 'GPT-4o', position: getMonthPosition('May 13 2024') },
      { date: 'Jul 18 2024', name: 'GPT-4o mini', position: getMonthPosition('Jul 18 2024') },
      { date: 'Sep 12 2024', name: 'o1-preview', position: getMonthPosition('Sep 12 2024') },
      { date: 'Sep 12 2024', name: 'o1-mini', position: getMonthPosition('Sep 12 2024') + 0.1 },
      { date: 'Dec 5 2024', name: 'o1', position: getMonthPosition('Dec 5 2024') },
      { date: 'Jan 31 2025', name: 'o3-mini', position: getMonthPosition('Jan 31 2025') },
      { date: 'Jan 31 2025', name: 'o3-mini-high', position: getMonthPosition('Jan 31 2025') + 0.1 },
      { date: 'Feb 27 2025', name: 'GPT-4.5', position: getMonthPosition('Feb 27 2025') },
      { date: 'Mar 19 2025', name: 'o1-pro', position: getMonthPosition('Mar 19 2025') },
      { date: 'Apr 16 2025', name: 'o3', position: getMonthPosition('Apr 16 2025') },
      { date: 'Apr 16 2025', name: 'o4-mini', position: getMonthPosition('Apr 16 2025') + 0.1 },
      { date: 'Apr 16 2025', name: 'o4-mini-high', position: getMonthPosition('Apr 16 2025') + 0.2 },
      { date: 'May 14 2025', name: 'GPT-4.1', position: getMonthPosition('May 14 2025') },
      { date: 'May 14 2025', name: 'GPT-4.1 mini', position: getMonthPosition('May 14 2025') + 0.1 },
      { date: 'Jun 10 2025', name: 'o3-pro', position: getMonthPosition('Jun 10 2025') },
      { date: 'Aug 5 2025', name: 'gpt-oss-120b', position: getMonthPosition('Aug 5 2025') },
      { date: 'Aug 5 2025', name: 'gpt-oss-20b', position: getMonthPosition('Aug 5 2025') + 0.1 },
      { date: 'Aug 7 2025', name: 'GPT-5', position: getMonthPosition('Aug 7 2025') },
      { date: 'Aug 7 2025', name: 'GPT-5 mini', position: getMonthPosition('Aug 7 2025') + 0.1 },
      { date: 'Sep 15 2025', name: 'GPT-5-Codex', position: getMonthPosition('Sep 15 2025') },
      { date: 'Nov 8 2025', name: 'GPT-5-Codex-Mini', position: getMonthPosition('Nov 8 2025') },
      { date: 'Nov 12 2025', name: 'GPT-5.1', position: getMonthPosition('Nov 12 2025') },
      { date: 'Nov 19 2025', name: 'GPT-5.1-Codex-Max', position: getMonthPosition('Nov 19 2025') }
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
      { date: 'Nov 20 2024', name: 'DeepSeek-R1-Lite Preview', position: getMonthPosition('Nov 20 2024') },
      { date: 'Dec 2024', name: 'DeepSeek V2.5 (Revised)', position: getMonthPosition('Dec 2024') + 0.1 },
      { date: 'Dec 2024', name: 'DeepSeek V3 Base', position: getMonthPosition('Dec 2024') },
      { date: 'Dec 2024', name: 'DeepSeek V3 Chat', position: getMonthPosition('Dec 2024') + 0.2 },
      { date: 'Jan 20 2025', name: 'DeepSeek Chat (R1-based)', position: getMonthPosition('Jan 20 2025') },
      { date: 'Mar 24 2025', name: 'DeepSeek V3-0324', position: getMonthPosition('Mar 24 2025') },
      { date: 'May 28 2025', name: 'DeepSeek R1-0528', position: getMonthPosition('May 28 2025') },
      { date: 'Aug 21 2025', name: 'DeepSeek V3.1', position: getMonthPosition('Aug 21 2025') },
      { date: 'Sep 22 2025', name: 'DeepSeek V3.1 Terminus', position: getMonthPosition('Sep 22 2025') },
      { date: 'Sep 29 2025', name: 'DeepSeek V3.2 Exp', position: getMonthPosition('Sep 29 2025') },
      { date: 'Dec 1 2025', name: 'DeepSeek-V3.2', position: getMonthPosition('Dec 1 2025') }
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
      { date: 'Jun 10 2025', name: 'Magistral Medium', position: getMonthPosition('Jun 10 2025') + 0.1 },
      { date: 'Dec 2 2025', name: 'Ministral 3 3B-25-12', position: getMonthPosition('Dec 2 2025') },
      { date: 'Dec 2 2025', name: 'Ministral 3 8B-25-12', position: getMonthPosition('Dec 2 2025') + 0.1 },
      { date: 'Dec 2 2025', name: 'Ministral 3 14B-25-12', position: getMonthPosition('Dec 2 2025') + 0.2 },
      { date: 'Dec 2 2025', name: 'Mistral Large 3', position: getMonthPosition('Dec 2 2025') + 0.3 }
    ]
  }
];

// Parse release date string to Date object
export function parseReleaseDate(dateStr: string): Date {
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
}

// Get all releases with company info, sorted by date
export function getAllReleases(): ReleaseWithCompany[] {
  const allReleases: ReleaseWithCompany[] = [];

  timelineData.forEach((item) => {
    const companyInfo = companies[item.company as keyof typeof companies];
    item.releases.forEach((release) => {
      allReleases.push({
        company: item.company,
        companyName: companyInfo.name,
        modelName: release.name,
        date: release.date,
        dateObj: parseReleaseDate(release.date),
      });
    });
  });

  // Sort by date (newest first)
  return allReleases.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
}

// Get recent releases after a cutoff date
export function getRecentReleases(cutoffDate: Date): ReleaseWithCompany[] {
  const allReleases = getAllReleases();
  return allReleases.filter(release => release.dateObj >= cutoffDate);
}

// Get the latest release across all companies
export function getLatestRelease(): { company: string; model: string; date: string } | null {
  let latestRelease: { company: string; model: string; date: string; releaseDate: Date } | undefined = undefined;
  const now = new Date();

  timelineData.forEach((item) => {
    const releases = item.releases;
    if (releases.length > 0) {
      // Find the actual latest release by date (don't assume array is sorted)
      const sortedReleases = [...releases].sort((a, b) => {
        const dateA = parseReleaseDate(a.date);
        const dateB = parseReleaseDate(b.date);
        return dateB.getTime() - dateA.getTime(); // Sort newest first
      });
      const lastRelease = sortedReleases[0];
      const releaseDate = parseReleaseDate(lastRelease.date);

      if (!latestRelease || releaseDate > latestRelease.releaseDate) {
        latestRelease = {
          company: item.company,
          model: lastRelease.name,
          date: lastRelease.date,
          releaseDate,
        };
      }
    }
  });

  if (!latestRelease) return null;

  const { company, model, date } = latestRelease;
  return {
    company,
    model,
    date,
  };
}
