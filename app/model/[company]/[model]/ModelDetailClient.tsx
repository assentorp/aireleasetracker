'use client';

import { useRouter } from 'next/navigation';
import { timelineData, companies } from '@/lib/timeline-data';
import { Header } from '@/components/Header';
import moment from 'moment';
import { useEffect } from 'react';

type Props = {
  company: string;
  model: string;
};

export default function ModelDetailClient({ company, model }: Props) {
  const router = useRouter();
  const decodedCompanySlug = decodeURIComponent(company);
  const decodedModelSlug = decodeURIComponent(model);

  console.log('Looking for:', { decodedCompanySlug, decodedModelSlug });

  // Find the company data
  const companyData = timelineData.find(c => c.company === decodedCompanySlug);

  console.log('Company data found:', companyData ? 'yes' : 'no');

  // Find the specific model
  const modelData = companyData?.releases.find(
    r => {
      const slug = r.name.toLowerCase().replace(/\s+/g, '-');
      console.log('Checking:', { name: r.name, slug, matches: slug === decodedModelSlug.toLowerCase() });
      return slug === decodedModelSlug.toLowerCase();
    }
  );

  console.log('Model data found:', modelData ? 'yes' : 'no');

  if (!companyData || !modelData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Header currentPage="home" latestRelease={null} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Model Not Found</h1>
          <p className="text-gray-400 mb-8">The model you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
          >
            Back to Timeline
          </button>
        </div>
      </div>
    );
  }

  const companyInfo = companies[companyData.company as keyof typeof companies];

  // Parse release date
  const parseReleaseDate = (dateStr: string): Date => {
    const parts = dateStr.split(' ');
    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    if (parts.length === 3) {
      const month = monthMap[parts[0]] || 0;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    } else if (parts.length === 2) {
      const month = monthMap[parts[0]] || 0;
      const year = parseInt(parts[1]);
      return new Date(year, month, 1);
    }
    return new Date();
  };

  const releaseDate = parseReleaseDate(modelData.date);

  // Add structured data with useEffect for client-side only
  useEffect(() => {
    if (modelData && companyInfo) {
      // Add JSON-LD structured data for Software Application and Breadcrumbs
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: modelData.name,
        applicationCategory: 'AIApplication',
        operatingSystem: 'Cloud',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        author: {
          '@type': 'Organization',
          name: companyInfo.name
        },
        datePublished: releaseDate.toISOString(),
        description: `${modelData.name} released by ${companyInfo.name} on ${modelData.date}`,
        url: `https://aireleasetracker.com/model/${company}/${model}`,
        ...(modelData.parameters && {
          'additionalProperty': [
            {
              '@type': 'PropertyValue',
              name: 'Parameters',
              value: modelData.parameters
            },
            ...(modelData.contextWindow ? [{
              '@type': 'PropertyValue',
              name: 'Context Window',
              value: modelData.contextWindow
            }] : [])
          ]
        })
      };

      // Add breadcrumb structured data
      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://aireleasetracker.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: companyInfo.name,
            item: `https://aireleasetracker.com/?company=${company}`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: modelData.name,
            item: `https://aireleasetracker.com/model/${company}/${model}`
          }
        ]
      };

      let scriptTag = document.querySelector('script[type="application/ld+json"][data-model-detail]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('data-model-detail', 'true');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify([structuredData, breadcrumbData]);
    }

    // Cleanup on unmount
    return () => {
      const scriptTag = document.querySelector('script[type="application/ld+json"][data-model-detail]');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [modelData, companyInfo, company, model, releaseDate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Header currentPage="home" latestRelease={null} />

      {/* Back button section with border */}
      <div>
        <div className="px-4 md:px-8 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Timeline
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Company badge */}
        <div className="inline-flex items-center gap-2 mb-5 border border-white/10 rounded-full py-0.5 px-2">
          <div className={`w-2 h-2 rounded-full ${companyInfo.dotColor}`} />
          <span className="text-xs text-gray-400">{companyInfo.name}</span>
        </div>

        {/* Model name */}
        <h1 className="text-2xl md:text-4xl font-medium text-white mb-3">
          {modelData.name}
        </h1>

        {/* Release date */}
        <div className="text-sm text-gray-400 mb-5">
          Released {moment(releaseDate).fromNow()} · {modelData.date}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-1 gap-2 mb-6">
          {modelData.parameters && (
            <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Parameters</div>
              <div className="text-2xl font-semibold text-white">{modelData.parameters}</div>
            </div>
          )}

          {modelData.contextWindow && (
            <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Context Window</div>
              <div className="text-2xl font-semibold text-white">
                {modelData.contextWindow}
                {modelData.contextWindowWords && (
                  <div className="text-sm text-gray-400 mt-1">~{modelData.contextWindowWords} words</div>
                )}
              </div>
            </div>
          )}

          {modelData.type && (
            <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-2">Model Type</div>
              <div className="text-2xl font-semibold text-white">{modelData.type}</div>
            </div>
          )}
        </div>

        {/* Benchmarks section */}
        {(modelData.gpqaDiamond || modelData.mmmuPro || modelData.sweBenchVerified) && (
          <div className="mb-6">
            <h2 className="text-xl text-white mb-4">Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {modelData.gpqaDiamond && (
                <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-gray-500 mb-2">GPQA Diamond</div>
                  <div className="text-2xl font-semibold text-white">{modelData.gpqaDiamond}</div>
                </div>
              )}

              {modelData.mmmuPro && (
                <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-gray-500 mb-2">MMMU-Pro</div>
                  <div className="text-2xl font-semibold text-white">{modelData.mmmuPro}</div>
                </div>
              )}

              {modelData.sweBenchVerified && (
                <div className="bg-[#151515] border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-gray-500 mb-2">SWE-Bench Verified</div>
                  <div className="text-2xl font-semibold text-white">{modelData.sweBenchVerified}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder for more content */}
        <div>
          <h2 className="text-xl text-white mb-4">About {modelData.name}</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            More detailed information about {modelData.name} will be added here as the timeline data becomes more comprehensive.
          </p>
          <p className="text-gray-500 text-sm">
            This page is ready for additional content including benchmarks, features, capabilities, comparisons, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
