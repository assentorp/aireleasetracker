import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, frequency } = body;

    if (typeof emailNotifications !== 'boolean' || !['immediately', 'weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Update user metadata with notification preferences
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        emailNotifications,
        notificationFrequency: frequency,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
