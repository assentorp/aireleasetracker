'use client';

import { companies } from '../lib/timeline-data';

interface LatestReleaseProps {
  release: {
    company: string;
    model: string;
    date: string;
  };
}

export function LatestRelease({ release }: LatestReleaseProps) {
  const companyInfo = companies[release.company as keyof typeof companies];
  const dotColor = companyInfo?.dotColor || 'bg-gray-500';

  return (
    <div className="hidden lg:block">
      <div className="text-xs text-gray-500 mb-1">Latest Release</div>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <div className="text-sm font-medium text-white">{release.model}</div>
        <div className="text-sm text-gray-500">{release.date}</div>
      </div>
    </div>
  );
}
