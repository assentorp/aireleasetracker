import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Release {
  company: string;
  companyName: string;
  modelName: string;
  date: string;
}

// This endpoint broadcasts a new release to all users based on their notification preferences
// Requires ADMIN_SECRET in Authorization header for security
export async function POST(request: Request) {
  try {
    // Verify this is an admin request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { releases } = body; // Array of new releases

    if (!releases || !Array.isArray(releases) || releases.length === 0) {
      return NextResponse.json({ error: 'Invalid releases data' }, { status: 400 });
    }

    const client = await clerkClient();

    // Get all users (paginate if needed in production)
    let allUsers: any[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 100;

    while (hasMore) {
      const response = await client.users.getUserList({ limit, offset });
      allUsers = [...allUsers, ...response.data];
      hasMore = response.data.length === limit;
      offset += limit;
    }

    const results = {
      immediate: { sent: 0, failed: 0 },
      skipped: 0,
    };

    // Send immediate notifications to users who have them enabled
    for (const user of allUsers) {
      const metadata = user.publicMetadata as {
        emailNotifications?: boolean;
        notificationFrequency?: string;
      };

      // Skip users who don't have notifications enabled or don't want immediate notifications
      if (!metadata.emailNotifications || metadata.notificationFrequency !== 'immediately') {
        results.skipped++;
        continue;
      }

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        results.skipped++;
        continue;
      }

      // Generate email content
      const emailContent = generateEmailContent(releases, 'immediate');

      // Send email via Resend
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'AI Release Tracker <notifications@aireleasetracker.com>',
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      if (error) {
        console.error(`Failed to send to ${email}:`, error);
        results.immediate.failed++;
      } else {
        results.immediate.sent++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalUsers: allUsers.length,
      releasesSent: releases.length,
    });
  } catch (error) {
    console.error('Error broadcasting notifications:', error);
    return NextResponse.json({ error: 'Failed to broadcast notifications' }, { status: 500 });
  }
}

function generateEmailContent(releases: Release[], type: string) {
  const companyColors: { [key: string]: string } = {
    'Anthropic': '#f97316', // orange-500
    'OpenAI': '#10b981', // emerald-500
    'Google': '#3b82f6', // blue-500
    'Meta': '#0ea5e9', // sky-500
    'xAI': '#a855f7', // purple-500
    'DeepSeek': '#ec4899', // pink-500
    'Mistral AI': '#f59e0b', // amber-500
  };

  let subject = '';
  let title = '';

  if (type === 'immediate') {
    subject = `New AI Model Release: ${releases[0].modelName}`;
    title = 'New AI Model Release';
  } else if (type === 'weekly') {
    subject = `Weekly AI Release Digest - ${releases.length} New ${releases.length === 1 ? 'Release' : 'Releases'}`;
    title = 'Weekly AI Release Digest';
  } else if (type === 'monthly') {
    subject = `Monthly AI Release Summary - ${releases.length} New ${releases.length === 1 ? 'Release' : 'Releases'}`;
    title = 'Monthly AI Release Summary';
  }

  // Group releases by company
  const releasesByCompany: { [key: string]: Release[] } = {};
  releases.forEach(release => {
    if (!releasesByCompany[release.companyName]) {
      releasesByCompany[release.companyName] = [];
    }
    releasesByCompany[release.companyName].push(release);
  });

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
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">${title}</h1>
            ${type === 'immediate' ? '' : `<p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">${releases.length} new ${releases.length === 1 ? 'release' : 'releases'}</p>`}
          </div>

          <!-- Releases -->
          <div style="background-color: #151515; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 24px;">
            ${companySections}
          </div>

          <!-- Footer -->
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
