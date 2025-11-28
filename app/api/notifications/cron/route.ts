import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { Resend } from 'resend';
import { getRecentReleases, ReleaseWithCompany } from '../../../../lib/timeline-data';

const resend = new Resend(process.env.RESEND_API_KEY);

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
// It checks for users who need weekly/monthly digests and sends them

interface Release {
  company: string;
  companyName: string;
  modelName: string;
  date: string;
}

export async function GET(request: Request) {
  try {
    // Verify this is a cron request (add your cron secret for security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();

    // Get all users (you may want to paginate this in production)
    // For now, we'll get users in batches
    const users = await client.users.getUserList({ limit: 100 });

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = now.getDate();

    // Determine what type of digest to send
    // Weekly: Every Monday (day 1)
    // Monthly: First day of month (day 1)
    const sendWeekly = dayOfWeek === 1; // Monday
    const sendMonthly = dayOfMonth === 1; // First of month

    if (!sendWeekly && !sendMonthly) {
      return NextResponse.json({ message: 'No digests scheduled for today' });
    }

    // Get recent releases (last 7 days for weekly, last 30 days for monthly)
    const daysToCheck = sendWeekly ? 7 : 30;
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysToCheck);

    // Fetch recent releases from shared data
    const recentReleasesData = getRecentReleases(cutoffDate);

    // Convert to the format expected by email template
    const recentReleases: Release[] = recentReleasesData.map(r => ({
      company: r.company,
      companyName: r.companyName,
      modelName: r.modelName,
      date: r.date,
    }));

    if (recentReleases.length === 0) {
      return NextResponse.json({ message: 'No new releases to send' });
    }

    // Send emails to users based on their preferences
    const results = {
      weekly: { sent: 0, failed: 0 },
      monthly: { sent: 0, failed: 0 },
    };

    for (const user of users.data) {
      const metadata = user.publicMetadata as {
        emailNotifications?: boolean;
        notificationFrequency?: string;
        lastWeeklyDigest?: string;
        lastMonthlyDigest?: string;
      };

      if (!metadata.emailNotifications) continue;

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      if (sendWeekly && metadata.notificationFrequency === 'weekly') {
        // Check if we already sent this week
        const lastSent = metadata.lastWeeklyDigest ? new Date(metadata.lastWeeklyDigest) : null;
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

        if (!lastSent || lastSent < weekStart) {
          const success = await sendDigestEmail(email, recentReleases, 'weekly', client, user.id);
          if (success) {
            results.weekly.sent++;
            // Update last sent date
            await client.users.updateUserMetadata(user.id, {
              publicMetadata: {
                ...metadata,
                lastWeeklyDigest: now.toISOString(),
              },
            });
          } else {
            results.weekly.failed++;
          }
        }
      }

      if (sendMonthly && metadata.notificationFrequency === 'monthly') {
        // Check if we already sent this month
        const lastSent = metadata.lastMonthlyDigest ? new Date(metadata.lastMonthlyDigest) : null;
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        if (!lastSent || lastSent < monthStart) {
          const success = await sendDigestEmail(email, recentReleases, 'monthly', client, user.id);
          if (success) {
            results.monthly.sent++;
            // Update last sent date
            await client.users.updateUserMetadata(user.id, {
              publicMetadata: {
                ...metadata,
                lastMonthlyDigest: now.toISOString(),
              },
            });
          } else {
            results.monthly.failed++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      releasesFound: recentReleases.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}


async function sendDigestEmail(
  email: string,
  releases: Release[],
  type: 'weekly' | 'monthly',
  client: Awaited<ReturnType<typeof clerkClient>>,
  userId: string
): Promise<boolean> {
  try {
    const emailContent = generateEmailContent(releases, type);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'AI Release Tracker <notifications@aireleasetracker.com>',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return !error;
  } catch (error) {
    console.error(`Error sending ${type} digest to ${email}:`, error);
    return false;
  }
}

function generateEmailContent(releases: Release[], type: 'weekly' | 'monthly') {
  const companyColors: { [key: string]: string } = {
    'Anthropic': '#f97316',
    'OpenAI': '#10b981',
    'Google': '#3b82f6',
    'Meta': '#0ea5e9',
    'xAI': '#a855f7',
    'DeepSeek': '#ec4899',
    'Mistral AI': '#f59e0b',
  };

  const subject = type === 'weekly'
    ? `Weekly AI Release Digest - ${releases.length} New ${releases.length === 1 ? 'Release' : 'Releases'}`
    : `Monthly AI Release Summary - ${releases.length} New ${releases.length === 1 ? 'Release' : 'Releases'}`;

  const title = type === 'weekly' ? 'Weekly AI Release Digest' : 'Monthly AI Release Summary';

  const releasesByCompany: { [key: string]: Release[] } = {};
  for (const release of releases) {
    if (!releasesByCompany[release.companyName]) {
      releasesByCompany[release.companyName] = [];
    }
    releasesByCompany[release.companyName].push(release);
  }

  const companySections = Object.entries(releasesByCompany)
    .map(([companyName, companyReleases]) => {
      const color = companyColors[companyName] || '#ffffff';
      const releasesList = companyReleases
        .map(release => `
          <div style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: 600; color: #ffffff; margin-bottom: 4px;">${release.modelName}</div>
            <div style="font-size: 14px; color: #9ca3af;">${release.date}</div>
          </div>
        `)
        .join('');

      return `
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color};"></div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">${companyName}</h2>
          </div>
          ${releasesList}
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">${title}</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">${releases.length} new ${releases.length === 1 ? 'release' : 'releases'}</p>
          </div>

          <div style="background-color: #151515; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 24px;">
            ${companySections}
          </div>

          <div style="margin-top: 40px; text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aireleasetracker.com'}" style="color: #ffffff; text-decoration: none;">View Full Timeline</a>
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aireleasetracker.com'}/settings" style="color: #9ca3af; text-decoration: underline;">Manage notification preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}
