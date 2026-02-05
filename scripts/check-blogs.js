#!/usr/bin/env node

/**
 * Daily Blog Checker for AI Release Tracker
 *
 * This script checks the official blogs/news pages of AI companies
 * for new model releases and updates the timeline data if found.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Provider blog configurations
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    blogUrl: 'https://openai.com/blog',
    rssUrl: 'https://openai.com/blog/rss.xml',
    keywords: ['gpt', 'o1', 'o3', 'o4', 'model', 'release', 'introducing', 'announcing'],
    modelPatterns: [
      /GPT-[\d.]+(?:-(?:turbo|mini|nano))?/gi,
      /\bo[1-9]-(?:mini|preview|pro)\b/gi,
      /\bo[1-9]\b(?!\s*(?:clock|day|week|month|year|am|pm))/gi
    ]
  },
  anthropic: {
    name: 'Anthropic',
    blogUrl: 'https://www.anthropic.com/news',
    rssUrl: null, // Anthropic doesn't have a public RSS feed
    keywords: ['claude', 'model', 'release', 'introducing', 'announcing', 'sonnet', 'opus', 'haiku'],
    modelPatterns: [
      /Claude\s+\d+(?:\.\d+)?\s+(?:Sonnet|Opus|Haiku)/gi,
      /Claude\s+(?:Sonnet|Opus|Haiku)(?:\s+\d+(?:\.\d+)?)?/gi,
      /Claude\s+\d+(?:\.\d+)?/gi
    ]
  },
  google: {
    name: 'Google',
    blogUrl: 'https://blog.google/technology/ai/',
    rssUrl: 'https://blog.google/rss/',
    keywords: ['gemini', 'model', 'release', 'introducing', 'announcing'],
    modelPatterns: [
      /Gemini\s+\d+(?:\.\d+)?\s+(?:Pro|Ultra|Nano|Flash|Flash-Lite)/gi,
      /Gemini\s+(?:Pro|Ultra|Nano|Flash|Flash-Lite)(?:\s+\d+(?:\.\d+)?)?/gi,
      /Gemini\s+\d+(?:\.\d+)?/gi,
      /PaLM\s*\d+/gi
    ]
  },
  meta: {
    name: 'Meta',
    blogUrl: 'https://ai.meta.com/blog/',
    rssUrl: null,
    keywords: ['llama', 'model', 'release', 'introducing', 'announcing', 'open source'],
    modelPatterns: [
      /Llama\s+\d+(?:\.\d+)?(?:\s+(?:Scout|Maverick))?/gi,
      /Code\s*Llama(?:\s+\d+B)?/gi
    ]
  },
  xai: {
    name: 'xAI',
    blogUrl: 'https://x.ai/news',
    rssUrl: null,
    keywords: ['grok', 'model', 'release', 'introducing', 'announcing'],
    modelPatterns: [
      /Grok[\s-]+\d+(?:\.\d+)?(?:\s+(?:Fast|Vision))?/gi,
      /Grok[\s-]+(?:Fast|Vision)(?:\s+\d+(?:\.\d+)?)?/gi
    ]
  },
  deepseek: {
    name: 'DeepSeek',
    blogUrl: 'https://www.deepseek.com/',
    rssUrl: null,
    apiUrl: 'https://api-docs.deepseek.com/',
    keywords: ['deepseek', 'model', 'release', 'introducing'],
    modelPatterns: [
      /DeepSeek[\s-]+V\d+(?:\.\d+)?/gi,
      /DeepSeek[\s-]+R\d+/gi,
      /DeepSeek[\s-]+Coder(?:\s+V?\d+(?:\.\d+)?)?/gi,
      /DeepSeek[\s-]+Math/gi
    ]
  },
  mistral: {
    name: 'Mistral AI',
    blogUrl: 'https://mistral.ai/news/',
    rssUrl: null,
    keywords: ['mistral', 'mixtral', 'codestral', 'model', 'release', 'introducing', 'ministral', 'pixtral'],
    modelPatterns: [
      /Mistral\s+(?:Large|Medium|Small)(?:\s+\d+(?:\.\d+)?)?/gi,
      /Mixtral\s+\d+x\d+B/gi,
      /Codestral(?:\s+\d+(?:\.\d+)?)?/gi,
      /Ministral\s+\d+B/gi,
      /Pixtral(?:\s+(?:Large|\d+B))?/gi,
      /Mathstral/gi,
      /Magistral(?:\s+(?:Small|Medium|Large))?/gi,
      /Devstral(?:\s+(?:Small|Medium|Large))?/gi
    ]
  }
};

// Helper to make HTTPS requests
function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIReleaseTracker/1.0; +https://github.com/assentorp/aireleasetracker)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 30000
    };

    const req = protocol.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects > 0) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          fetchUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
          return;
        } else {
          reject(new Error('Too many redirects'));
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Parse RSS feed and extract recent posts
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch ? linkMatch[1].trim() : '',
        pubDate: pubDateMatch ? new Date(pubDateMatch[1]) : null,
        description: descMatch ? descMatch[1].trim() : ''
      });
    }
  }

  return items;
}

// Extract potential model releases from text
function extractModels(text, provider) {
  const config = PROVIDERS[provider];
  const models = new Set();

  // Check if text contains relevant keywords
  const hasKeywords = config.keywords.some(keyword =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!hasKeywords) return [];

  // Extract model names using patterns
  for (const pattern of config.modelPatterns) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Clean up the match
        let cleaned = match.trim()
          .replace(/\s+/g, ' ')
          .replace(/[.,;:!?'"()[\]{}]$/g, '')
          .replace(/\s+(is|are|was|were|has|have|had|will|can|could|would|should|the|a|an|and|or|for|to|in|on|at|by|with|from|of|that|this|it|as|be)$/gi, '')
          .trim();

        // Skip if too short or looks like a partial match
        if (cleaned.length < 4) return;

        // Skip common false positives
        const lowerCleaned = cleaned.toLowerCase();
        if (lowerCleaned.includes('users') ||
            lowerCleaned.includes('comes') ||
            lowerCleaned.includes('based') ||
            lowerCleaned.endsWith(' and') ||
            /\s+(is|are|was|were)$/i.test(cleaned)) {
          return;
        }

        models.add(cleaned);
      });
    }
  }

  return Array.from(models);
}

// Parse HTML to extract article content
function parseHTML(html) {
  // Remove script and style tags
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Extract article/main content areas
  const articleMatch = text.match(/<article[\s\S]*?<\/article>/gi);
  const mainMatch = text.match(/<main[\s\S]*?<\/main>/gi);

  let content = articleMatch ? articleMatch.join(' ') : (mainMatch ? mainMatch.join(' ') : text);

  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);

  // Remove HTML tags
  content = content.replace(/<[^>]+>/g, ' ');
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/\s+/g, ' ');

  return {
    title: titleMatch ? titleMatch[1] : '',
    headings: h1Match ? h1Match.map(h => h.replace(/<[^>]+>/g, '')) : [],
    content: content.trim()
  };
}

// Read existing timeline data
function readTimelineData() {
  const filePath = path.join(__dirname, '..', 'lib', 'timeline-data.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract existing model names
  const existingModels = new Map();

  const releasePattern = /\{\s*date:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = releasePattern.exec(content)) !== null) {
    const date = match[1];
    const name = match[2];
    existingModels.set(name.toLowerCase().replace(/[\u2011\u2010-]/g, '-'), { date, name });
  }

  return { content, existingModels };
}

// Normalize model name for comparison
function normalizeModelName(name) {
  return name.toLowerCase()
    .replace(/[\u2011\u2010\-]/g, '') // Remove all dashes/hyphens
    .replace(/\s+/g, '')              // Remove all spaces
    .replace(/[._]/g, '')             // Remove dots and underscores
    .trim();
}

// Extract version number from model name
function extractVersion(name) {
  const match = name.match(/(\d+(?:\.\d+)?)\s*$/);
  return match ? match[1] : null;
}

// Extract base model name (without version)
function extractBaseName(name) {
  return name.replace(/\s*\d+(?:\.\d+)?\s*$/, '').trim().toLowerCase();
}

// Check if a model already exists (fuzzy matching)
function modelExists(modelName, existingModels) {
  const normalized = normalizeModelName(modelName);
  const newVersion = extractVersion(modelName);
  const newBaseName = extractBaseName(modelName);

  // Check against all existing models
  for (const [key, value] of existingModels.entries()) {
    const existingNormalized = normalizeModelName(key);

    // Direct match after normalization
    if (existingNormalized === normalized) return true;

    // If both have version numbers and same base name, compare versions
    const existingVersion = extractVersion(key);
    const existingBaseName = extractBaseName(key);

    if (newVersion && existingVersion && newBaseName === existingBaseName) {
      // Same base name but different versions = different models
      if (newVersion !== existingVersion) continue;
      return true;
    }

    // Check if one is a prefix/suffix of the other (handles version suffixes)
    // But skip if we're comparing versioned models (handled above)
    if (!newVersion || !existingVersion) {
      if (existingNormalized.startsWith(normalized) || normalized.startsWith(existingNormalized)) {
        const shorterLen = Math.min(existingNormalized.length, normalized.length);
        if (shorterLen >= 6) return true;
      }
    }
  }

  return false;
}

// Format date as "Mon DD YYYY"
function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

// Add new release to timeline data file
function addReleaseToFile(provider, modelName, date, fileContent) {
  const companySection = new RegExp(
    `(company:\\s*['"]${provider}['"][\\s\\S]*?releases:\\s*\\[)([\\s\\S]*?)(\\]\\s*\\})`,
    'i'
  );

  const match = fileContent.match(companySection);
  if (!match) {
    console.error(`Could not find ${provider} section in timeline data`);
    return fileContent;
  }

  const dateStr = formatDate(date);
  const newRelease = `{ date: '${dateStr}', name: '${modelName}', position: getMonthPosition('${dateStr}') }`;

  // Add to the end of releases array
  let releasesContent = match[2].trimEnd();

  // Ensure previous entry has a trailing comma
  if (releasesContent && !releasesContent.endsWith(',')) {
    releasesContent += ',';
  }

  const updatedReleases = releasesContent + '\n      ' + newRelease;

  return fileContent.replace(companySection, `$1${updatedReleases}$3`);
}

// Check a single provider's blog
async function checkProvider(provider) {
  const config = PROVIDERS[provider];
  const findings = [];

  console.log(`\nChecking ${config.name}...`);

  try {
    // Try RSS feed first
    if (config.rssUrl) {
      try {
        console.log(`  Fetching RSS: ${config.rssUrl}`);
        const rssContent = await fetchUrl(config.rssUrl);
        const items = parseRSS(rssContent);

        // Only check recent items (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentItems = items.filter(item =>
          !item.pubDate || item.pubDate >= weekAgo
        ).slice(0, 10);

        console.log(`  Found ${recentItems.length} recent RSS items`);

        for (const item of recentItems) {
          const combinedText = `${item.title} ${item.description}`;
          const models = extractModels(combinedText, provider);

          if (models.length > 0) {
            findings.push({
              source: 'rss',
              title: item.title,
              link: item.link,
              date: item.pubDate || new Date(),
              models
            });
          }
        }
      } catch (rssError) {
        console.log(`  RSS fetch failed: ${rssError.message}`);
      }
    }

    // Also check the blog page directly
    try {
      console.log(`  Fetching blog: ${config.blogUrl}`);
      const htmlContent = await fetchUrl(config.blogUrl);
      const parsed = parseHTML(htmlContent);

      const combinedText = `${parsed.title} ${parsed.headings.join(' ')} ${parsed.content}`;
      const models = extractModels(combinedText, provider);

      if (models.length > 0) {
        findings.push({
          source: 'blog',
          title: parsed.title,
          link: config.blogUrl,
          date: new Date(),
          models
        });
      }
    } catch (htmlError) {
      console.log(`  Blog fetch failed: ${htmlError.message}`);
    }

  } catch (error) {
    console.error(`  Error checking ${config.name}: ${error.message}`);
  }

  return findings;
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('AI Release Tracker - Daily Blog Check');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Read existing data
  const { content: fileContent, existingModels } = readTimelineData();
  console.log(`\nLoaded ${existingModels.size} existing models from timeline data`);

  const allNewModels = [];
  let updatedContent = fileContent;

  // Check each provider
  for (const provider of Object.keys(PROVIDERS)) {
    const findings = await checkProvider(provider);

    for (const finding of findings) {
      for (const model of finding.models) {
        if (!modelExists(model, existingModels)) {
          console.log(`  NEW MODEL FOUND: ${model}`);
          allNewModels.push({
            provider,
            providerName: PROVIDERS[provider].name,
            model,
            date: finding.date,
            source: finding.source,
            link: finding.link
          });
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  if (allNewModels.length === 0) {
    console.log('\nNo new model releases found.');

    // Write output for GitHub Actions
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      fs.appendFileSync(outputPath, 'new_models=false\n');
      fs.appendFileSync(outputPath, 'model_count=0\n');
    }

    return;
  }

  console.log(`\nFound ${allNewModels.length} potential new model(s):\n`);

  const modelSummary = [];

  for (const item of allNewModels) {
    console.log(`- ${item.providerName}: ${item.model}`);
    console.log(`  Source: ${item.source}`);
    console.log(`  Date: ${formatDate(item.date)}`);
    if (item.link) console.log(`  Link: ${item.link}`);
    console.log();

    // Add to timeline data
    updatedContent = addReleaseToFile(item.provider, item.model, item.date, updatedContent);
    modelSummary.push(`${item.providerName}: ${item.model}`);
  }

  // Write updated timeline data
  const timelinePath = path.join(__dirname, '..', 'lib', 'timeline-data.ts');
  fs.writeFileSync(timelinePath, updatedContent);
  console.log('\nTimeline data updated successfully!');

  // Write output for GitHub Actions
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    fs.appendFileSync(outputPath, 'new_models=true\n');
    fs.appendFileSync(outputPath, `model_count=${allNewModels.length}\n`);
    // Escape newlines for multi-line output
    const summary = modelSummary.join(', ');
    fs.appendFileSync(outputPath, `model_summary=${summary}\n`);
  }

  // Also write a summary file for the PR body
  const summaryPath = path.join(__dirname, '..', 'new-models-summary.md');
  const summaryContent = `# New AI Model Releases Detected

**Date:** ${new Date().toISOString().split('T')[0]}

## Models Found

${allNewModels.map(item => `- **${item.providerName}**: ${item.model}
  - Source: ${item.source}
  - Detected: ${formatDate(item.date)}
  ${item.link ? `- Link: ${item.link}` : ''}`).join('\n\n')}

---
*This PR was automatically created by the daily blog checker.*
`;

  fs.writeFileSync(summaryPath, summaryContent);
  console.log('Summary file created: new-models-summary.md');
}

// Run the checker
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
