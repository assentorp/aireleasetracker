import { Metadata } from 'next';
import { timelineData, companies } from '@/lib/timeline-data';
import ModelDetailClient from './ModelDetailClient';

type Props = {
  params: { company: string; model: string };
};

// Parse release date helper function
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In Next.js 15+, params is a Promise
  const { company, model } = await params;
  const decodedCompanySlug = decodeURIComponent(company);
  const decodedModelSlug = decodeURIComponent(model);

  const companyData = timelineData.find(c => c.company === decodedCompanySlug);
  const modelData = companyData?.releases.find(
    r => r.name.toLowerCase().replace(/\s+/g, '-') === decodedModelSlug.toLowerCase()
  );

  if (!companyData || !modelData) {
    return {
      title: 'Model Not Found | AI Release Tracker',
      description: 'The AI model you are looking for could not be found.'
    };
  }

  const companyInfo = companies[companyData.company as keyof typeof companies];
  const releaseDate = parseReleaseDate(modelData.date);

  const title = `${modelData.name} by ${companyInfo.name} | AI Model Release Tracker`;
  const description = `${modelData.name} released by ${companyInfo.name} on ${modelData.date}. ${modelData.parameters ? `Parameters: ${modelData.parameters}.` : ''} ${modelData.contextWindow ? `Context: ${modelData.contextWindow}.` : ''} Complete specs and details.`;

  return {
    title,
    description,
    keywords: [
      modelData.name,
      companyInfo.name,
      'AI model',
      'LLM',
      'large language model',
      'release date',
      ...(modelData.parameters ? [modelData.parameters] : []),
      ...(modelData.type ? [modelData.type] : [])
    ],
    authors: [{ name: 'AI Release Tracker' }],
    openGraph: {
      title,
      description,
      url: `https://aireleasetracker.com/model/${company}/${model}`,
      siteName: 'AI Release Tracker',
      locale: 'en_US',
      type: 'article',
      publishedTime: releaseDate.toISOString(),
      authors: [companyInfo.name],
      images: [
        {
          url: '/ogimage.png',
          width: 1200,
          height: 630,
          alt: `${modelData.name} by ${companyInfo.name}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/ogimage.png'],
    },
    alternates: {
      canonical: `https://aireleasetracker.com/model/${company}/${model}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for all models (optional - for static generation)
export async function generateStaticParams() {
  const paths: { company: string; model: string }[] = [];

  timelineData.forEach((company) => {
    company.releases.forEach((release) => {
      const modelSlug = release.name.toLowerCase().replace(/\s+/g, '-');
      paths.push({
        company: company.company,
        model: modelSlug,
      });
    });
  });

  return paths;
}

export default async function ModelDetailPage({ params }: Props) {
  // In Next.js 15+, params is a Promise
  const { company, model } = await params;
  return <ModelDetailClient company={company} model={model} />;
}
