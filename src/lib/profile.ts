import { getSupabaseAdmin } from "./supabase";
import { logger } from "./logger";
import { createHash } from "crypto";

export interface ProfileInput {
  userId?: string | null;
  fullName?: string | null;
  email?: string | null;
  locationCity?: string | null;
  budgetLimit?: number | null;
}

const DEMO_EMAIL_DOMAIN = "closet-companion.local";

export async function resolveAppUser(input: ProfileInput = {}) {
  const functionName = "resolveAppUser";
  const email = sanitizeEmail(input.email);
  const fullName = input.fullName?.trim() || "Style Partner";
  const locationCity = input.locationCity?.trim() || "New York";
  const budgetLimit = typeof input.budgetLimit === "number" ? input.budgetLimit : 100;

  const admin = getSupabaseAdmin();
  let userId = isUuid(input.userId) ? input.userId! : null;
  const lookupEmail = email || `demo-${stableProfileSlug(fullName)}@${DEMO_EMAIL_DOMAIN}`;

  try {
    if (!userId) {
      // 1. Attempt rapid resolution via profiles table (takes < 50ms)
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", lookupEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        userId = existingProfile.id;
      } else {
        // 2. Fallback to slow listUsers only if profile does not exist yet
        const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) throw error;
        const existing = data.users.find((user) => user.email?.toLowerCase() === lookupEmail.toLowerCase());

        if (existing) {
          userId = existing.id;
        } else {
          const { data: created, error: createError } = await admin.auth.admin.createUser({
            email: lookupEmail,
            password: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
            email_confirm: true,
            user_metadata: { full_name: fullName, name: fullName },
          });

          if (createError || !created.user) throw createError || new Error("Supabase did not return a created user.");
          userId = created.user.id;
        }
      }
    }

    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        email: email || lookupEmail,
        location_city: locationCity,
        temperature_unit: "F",
        budget_cap_usd: budgetLimit,
      });

    if (profileError) {
      logger.warn("Failed to upsert profile after resolving user.", profileError);
    }

    logger.info(functionName, { userId, email: email || lookupEmail, locationCity, budgetLimit });

    return {
      userId: userId as string,
      profile: {
        id: userId as string,
        full_name: fullName,
        email: email || lookupEmail,
        location_city: locationCity,
        temperature_unit: "F",
        budget_cap_usd: budgetLimit,
      },
    };
  } catch (error) {
    const fallbackUserId = stableUuid(lookupEmail || fullName);
    logger.error("Failed to resolve Supabase app user. Continuing with a local deterministic profile id.", error);
    return {
      userId: fallbackUserId,
      profile: {
        id: fallbackUserId,
        full_name: fullName,
        email: email || lookupEmail,
        location_city: locationCity,
        temperature_unit: "F",
        budget_cap_usd: budgetLimit,
      },
      databaseBacked: false,
    };
  }
}

function sanitizeEmail(email?: string | null) {
  const value = email?.trim();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function stableProfileSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36) || "user";
}

function stableUuid(seed: string) {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  const variant = parseInt(hex[16], 16);
  hex[16] = ((variant & 0x3) | 0x8).toString(16);
  const value = hex.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
