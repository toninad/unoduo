import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEMO_APPS, isDemoMode } from "@/lib/demo";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export const APPS_TAG = "apps";

export type RankedApp = {
  id: string;
  appStoreId: number;
  name: string;
  developer: string;
  tagline: string;
  iconUrl: string;
  appStoreUrl: string;
  totalCents: number;
  rank: number;
};

type AppRow = {
  id: string;
  app_store_id: number;
  name: string;
  developer: string;
  tagline: string;
  icon_url: string;
  app_store_url: string;
  total_cents: number;
};

const LEADERBOARD_LIMIT = 500;

export async function getRankedApps(): Promise<RankedApp[]> {
  "use cache";
  cacheTag(APPS_TAG);
  cacheLife("minutes");

  if (!isSupabaseConfigured()) {
    if (isDemoMode()) return DEMO_APPS;
    console.warn("Supabase is not configured; showing an empty leaderboard.");
    return [];
  }

  const { data, error } = await supabaseAdmin()
    .from("apps")
    .select("id, app_store_id, name, developer, tagline, icon_url, app_store_url, total_cents")
    .eq("status", "approved")
    .order("total_cents", { ascending: false })
    .order("ranked_at", { ascending: true })
    .limit(LEADERBOARD_LIMIT);
  if (error) throw error;

  return (data as AppRow[]).map((row, i) => ({
    id: row.id,
    appStoreId: row.app_store_id,
    name: row.name,
    developer: row.developer,
    tagline: row.tagline,
    iconUrl: row.icon_url,
    appStoreUrl: row.app_store_url,
    totalCents: Number(row.total_cents),
    rank: i + 1,
  }));
}

export async function getRankedApp(appStoreId: number): Promise<RankedApp | null> {
  const apps = await getRankedApps();
  return apps.find((app) => app.appStoreId === appStoreId) ?? null;
}

// Uncached lookup that also sees listings waiting for review.
export async function getListingStatus(
  appStoreId: number,
): Promise<{ id: string; name: string; status: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabaseAdmin()
    .from("apps")
    .select("id, name, status")
    .eq("app_store_id", appStoreId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
