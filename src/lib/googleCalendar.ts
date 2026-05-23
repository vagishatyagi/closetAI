import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";
import type { CalendarEventPayload } from "./ootdUtils";

const GOOGLE_OAUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_LIST_URL = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
const GOOGLE_CALENDAR_EVENTS_BASE_URL = "https://www.googleapis.com/calendar/v3/calendars";
const REFRESH_COOKIE = "closet_google_refresh_token";
const CONNECTED_COOKIE = "closet_google_calendar_connected";
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

type CalendarRange = "today" | "upcoming";

type GoogleCalendarInfo = {
  id: string;
  summary: string;
  primary?: boolean;
  selected?: boolean;
  hidden?: boolean;
  accessRole?: string;
  timeZone?: string;
};

type CalendarQueryDebug = {
  range: CalendarRange;
  timeMin: string;
  timeMax: string;
  timeZone: string;
  eventsFound: number;
  calendars: Array<{
    id: string;
    summary: string;
    primary?: boolean;
    selected?: boolean;
    hidden?: boolean;
    accessRole?: string;
    eventCount: number;
    status?: number;
    error?: string;
  }>;
};

export type GoogleCalendarDebug = {
  connectedCookie: boolean;
  refreshTokenPresent: boolean;
  accessTokenRefreshed: boolean;
  calendarCount: number;
  primaryCalendarId?: string;
  accountHint?: string;
  queries: CalendarQueryDebug[];
};

export function getGoogleConfig(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${new URL(req.url).origin}/api/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  return { clientId, clientSecret, redirectUri };
}

export function buildGoogleAuthUrl(req: NextRequest, returnTo = "/") {
  const { clientId, redirectUri } = getGoogleConfig(req);
  const state = Buffer.from(JSON.stringify({ returnTo }), "utf8").toString("base64url");
  const authUrl = new URL(GOOGLE_OAUTH_BASE);

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", CALENDAR_SCOPES.join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("state", state);

  return authUrl.toString();
}

export async function exchangeCodeForGoogleTokens(req: NextRequest, code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig(req);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Google token exchange failed.");
  }

  return payload as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string };
}

export async function refreshGoogleAccessToken(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const { clientId, clientSecret } = getGoogleConfig(req);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    logger.warn("Google refresh token failed.", { error: payload.error, description: payload.error_description });
    return null;
  }

  return payload.access_token as string;
}

export function hasGoogleRefreshToken(req: NextRequest) {
  return Boolean(req.cookies.get(REFRESH_COOKIE)?.value);
}

export function hasGoogleConnectedCookie(req: NextRequest) {
  return req.cookies.get(CONNECTED_COOKIE)?.value === "1";
}

export async function fetchGoogleCalendarEvents(req: NextRequest): Promise<{
  connected: boolean;
  events: CalendarEventPayload[];
  error?: string;
  debug: GoogleCalendarDebug;
}> {
  const debug: GoogleCalendarDebug = {
    connectedCookie: hasGoogleConnectedCookie(req),
    refreshTokenPresent: hasGoogleRefreshToken(req),
    accessTokenRefreshed: false,
    calendarCount: 0,
    queries: [],
  };

  try {
    const accessToken = await refreshGoogleAccessToken(req);
    if (!accessToken) return { connected: false, events: [], debug };
    debug.accessTokenRefreshed = true;

    const calendars = await fetchCalendarList(accessToken);
    debug.calendarCount = calendars.length;
    const primaryCalendar = calendars.find(calendar => calendar.primary) || calendars[0];
    debug.primaryCalendarId = primaryCalendar?.id;
    debug.accountHint = getCalendarAccountHint(primaryCalendar);

    const timeZone = getRuntimeTimeZone();
    const { start, end } = getTodayBounds();
    const todayResult = await fetchEventsAcrossCalendars(accessToken, calendars, start, end, "today", timeZone);
    debug.queries.push(todayResult.debug);
    let events = todayResult.events;

    if (events.length === 0) {
      const upcomingEnd = new Date(start);
      upcomingEnd.setDate(upcomingEnd.getDate() + 7);
      const upcomingResult = await fetchEventsAcrossCalendars(accessToken, calendars, new Date(), upcomingEnd, "upcoming", timeZone);
      debug.queries.push(upcomingResult.debug);
      events = upcomingResult.events;
    }

    return {
      connected: true,
      events,
      debug,
    };
  } catch (error: any) {
    logger.error("Failed to fetch Google Calendar events.", error);
    return { connected: false, events: [], error: error.message, debug };
  }
}

export function setGoogleCalendarCookies(response: NextResponse, refreshToken: string) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  response.cookies.set(CONNECTED_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export function clearGoogleCalendarCookies(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CONNECTED_COOKIE, "", { path: "/", maxAge: 0 });
}

export function decodeGoogleState(state: string | null) {
  if (!state) return "/";
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    return typeof parsed.returnTo === "string" && parsed.returnTo.startsWith("/") ? parsed.returnTo : "/";
  } catch {
    return "/";
  }
}

async function fetchCalendarList(accessToken: string): Promise<GoogleCalendarInfo[]> {
  const calendars: GoogleCalendarInfo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(GOOGLE_CALENDAR_LIST_URL);
    url.searchParams.set("maxResults", "250");
    url.searchParams.set("showHidden", "true");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.warn("Google Calendar list fetch failed. Falling back to primary calendar.", {
        status: response.status,
        error: payload.error,
      });
      return [{ id: "primary", summary: "Primary calendar" }];
    }

    calendars.push(...((payload.items || []) as any[]));
    pageToken = payload.nextPageToken;
  } while (pageToken);

  const visibleCalendars = calendars
    .filter((calendar: any) => !calendar.deleted && calendar.accessRole !== "none")
    .map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary || calendar.id,
      primary: Boolean(calendar.primary),
      selected: Boolean(calendar.selected),
      hidden: Boolean(calendar.hidden),
      accessRole: calendar.accessRole,
      timeZone: calendar.timeZone,
    }));

  return visibleCalendars.length > 0 ? visibleCalendars : [{ id: "primary", summary: "Primary calendar", primary: true }];
}

async function fetchEventsAcrossCalendars(
  accessToken: string,
  calendars: GoogleCalendarInfo[],
  start: Date,
  end: Date,
  range: CalendarRange,
  timeZone: string
) {
  const responses = await Promise.all(
    calendars.map(async (calendar) => {
      const allEvents: any[] = [];
      let pageToken: string | undefined;
      let lastStatus = 200;

      do {
        const url = new URL(`${GOOGLE_CALENDAR_EVENTS_BASE_URL}/${encodeURIComponent(calendar.id)}/events`);
        url.searchParams.set("timeMin", start.toISOString());
        url.searchParams.set("timeMax", end.toISOString());
        url.searchParams.set("timeZone", calendar.timeZone || timeZone);
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");
        url.searchParams.set("maxResults", "50");
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });

        lastStatus = response.status;
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          logger.warn("Google Calendar events fetch failed for a calendar.", {
            calendar: calendar.summary,
            status: response.status,
            error: payload.error,
          });
          return {
            events: [],
            debug: buildCalendarQueryCalendarDebug(calendar, 0, response.status, payload.error?.message || payload.error),
          };
        }

        allEvents.push(...(payload.items || []));
        pageToken = payload.nextPageToken;
      } while (pageToken && allEvents.length < 100);

      const events = allEvents
        .filter((event: any) => event.status !== "cancelled")
        .map((event: any) => normalizeGoogleCalendarEvent(event, calendar, range))
        .filter(Boolean) as CalendarEventPayload[];

      return {
        events,
        debug: buildCalendarQueryCalendarDebug(calendar, events.length, lastStatus),
      };
    })
  );

  const deduped = new Map<string, CalendarEventPayload>();
  for (const event of responses.flatMap(response => response.events)) {
    const key = `${event.source}:${event.id || event.start}:${event.title}`;
    if (!deduped.has(key)) deduped.set(key, event);
  }

  const events = [...deduped.values()]
    .sort((a, b) => new Date(a.start || "").getTime() - new Date(b.start || "").getTime())
    .slice(0, 10);

  return {
    events,
    debug: {
      range,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone,
      eventsFound: events.length,
      calendars: responses.map(response => response.debug),
    },
  };
}

function normalizeGoogleCalendarEvent(
  event: any,
  calendar: GoogleCalendarInfo,
  range: CalendarRange = "today"
): CalendarEventPayload | null {
  if (!event) return null;
  const startValue = event.start?.dateTime || event.start?.date;
  const endValue = event.end?.dateTime || event.end?.date;
  const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);

  return {
    id: event.id,
    time: isAllDay ? "All day" : formatEventTime(startValue),
    title: event.summary || "Untitled calendar event",
    description: stripHtml(event.description || ""),
    start: startValue,
    end: endValue,
    location: event.location || "",
    source: `google:${range}:${calendar.summary || calendar.id}`,
  };
}

function buildCalendarQueryCalendarDebug(
  calendar: GoogleCalendarInfo,
  eventCount: number,
  status?: number,
  error?: string
) {
  return {
    id: calendar.id,
    summary: calendar.summary,
    primary: calendar.primary,
    selected: calendar.selected,
    hidden: calendar.hidden,
    accessRole: calendar.accessRole,
    eventCount,
    status,
    error,
  };
}

function getTodayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

function getRuntimeTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getCalendarAccountHint(calendar?: GoogleCalendarInfo) {
  if (!calendar) return undefined;
  if (calendar.id.includes("@")) return calendar.id;
  if (calendar.summary.includes("@")) return calendar.summary;
  return calendar.summary;
}

function formatEventTime(value?: string) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
