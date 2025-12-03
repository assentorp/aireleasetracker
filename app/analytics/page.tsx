'use client';

import { timelineData, companies, getLatestRelease } from '../../lib/timeline-data';
import { Header } from '../../components/Header';
import { LineChart } from '../../components/LineChart';

export default function AnalyticsPage() {

  // Parse release date from string (format: "Dec 25, 2024" or "2024-12-25")
  const parseReleaseDate = (dateStr: string): Date => {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    return new Date();
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

  const analyticsData = getAnalyticsData();

  // Get company breakdown data
  const getCompanyBreakdown = () => {
    const companyData: { [key: string]: number } = {};

    timelineData.forEach((item) => {
      const companyInfo = companies[item.company as keyof typeof companies];
      const companyName = companyInfo?.name || item.company;
      companyData[companyName] = item.releases.length;
    });

    return Object.entries(companyData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const companyBreakdown = getCompanyBreakdown();

  // Get latest release using shared utility
  const latestRelease = getLatestRelease();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <Header
        currentPage="analytics"
        latestRelease={latestRelease}
      />

      {/* Analytics Content */}
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-8 sm:py-16 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl font-medium text-white">Release Analytics</h1>
        </div>

        {/* Cumulative Releases Graph */}
        <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-6">Cumulative Releases Over Time</h2>

          <LineChart
            data={analyticsData.cumulative}
            label="models"
          />
        </div>

        {/* Release Frequency Graph */}
        <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-6">Release Frequency (Per Month)</h2>

          <LineChart
            data={analyticsData.frequency}
            label="releases"
          />
        </div>

        {/* Releases by Company - Horizontal Bar Chart */}
        <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-6">Total Releases by Company</h2>

          <div className="space-y-3">
            {companyBreakdown.map((item) => {
              const maxCount = companyBreakdown[0].count;
              const percentage = (item.count / maxCount) * 100;

              // Get company color - match with timeline/list view
              const companyKey = Object.keys(companies).find(key =>
                companies[key as keyof typeof companies].name === item.name
              );
              const companyColorClass = companyKey
                ? companies[companyKey as keyof typeof companies].dotColor.replace('bg-', '')
                : 'gray-500';

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${companyColorClass}`} />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.count}</span>
                  </div>
                  <div className="h-1 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
