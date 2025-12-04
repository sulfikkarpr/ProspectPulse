import { google } from 'googleapis';
import { pool } from '../db/connection';
import { oauth2Client } from './google-oauth';

export interface CreateCalendarEventParams {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
  userId: string; // User who is creating the event (their calendar will be used)
}

export const createCalendarEventWithMeet = async (
  params: CreateCalendarEventParams
): Promise<{ eventId: string; meetLink: string }> => {
  try {
    // Get user's refresh token from database
    const userQuery = 'SELECT refresh_token FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [params.userId]);

    if (userResult.rows.length === 0 || !userResult.rows[0].refresh_token) {
      throw new Error('User not found or no refresh token available');
    }

    const refreshToken = userResult.rows[0].refresh_token;

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // Refresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create event with Google Meet
    const event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: params.attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 15 }, // 15 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    const eventId = response.data.id;
    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri || '';

    if (!eventId) {
      throw new Error('Failed to create calendar event');
    }

    return {
      eventId,
      meetLink,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error(`Failed to create calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateCalendarEvent = async (
  eventId: string,
  userId: string,
  updates: {
    startTime?: Date;
    endTime?: Date;
    summary?: string;
    description?: string;
  }
): Promise<void> => {
  try {
    // Get user's refresh token
    const userQuery = 'SELECT refresh_token FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0 || !userResult.rows[0].refresh_token) {
      throw new Error('User not found or no refresh token available');
    }

    const refreshToken = userResult.rows[0].refresh_token;
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    // Update event
    const updatedEvent = {
      ...existingEvent.data,
      ...(updates.summary && { summary: updates.summary }),
      ...(updates.description && { description: updates.description }),
      ...(updates.startTime && {
        start: {
          dateTime: updates.startTime.toISOString(),
          timeZone: 'UTC',
        },
      }),
      ...(updates.endTime && {
        end: {
          dateTime: updates.endTime.toISOString(),
          timeZone: 'UTC',
        },
      }),
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw new Error(`Failed to update calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteCalendarEvent = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    // Get user's refresh token
    const userQuery = 'SELECT refresh_token FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0 || !userResult.rows[0].refresh_token) {
      throw new Error('User not found or no refresh token available');
    }

    const refreshToken = userResult.rows[0].refresh_token;
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw new Error(`Failed to delete calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

