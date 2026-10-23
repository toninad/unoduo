"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { lookupApp, parseAppStoreUrl } from "@/lib/appstore";
import { APPS_TAG } from "@/lib/apps";
import { supabaseAdmin } from "@/lib/supabase";
import { MAX_BOOST_DOLLARS, MIN_BOOST_DOLLARS } from "@/lib/boost";
import { stripe } from "@/lib/stripe";

export type FormState = { error?: string };

async function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function submitApp(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: real people never fill this hidden field.
  if (formData.get("website")) return {};

  const parsed = parseAppStoreUrl(String(formData.get("appStoreUrl") ?? ""));
  if (!parsed) {
    return { error: "Paste a full App Store link, like https://apps.apple.com/us/app/name/id123456789" };
  }

  const tagline = String(formData.get("tagline") ?? "").trim().replace(/\s+/g, " ");
  if (tagline.length < 1 || tagline.length > 80) {
    return { error: "Add a tagline of up to 80 characters about what your app does on iPhone Duo." };
  }

  const app = await lookupApp(parsed.id, parsed.country).catch(() => null);
  if (!app || !app.iconUrl) {
    return { error: "We couldn't find that app on the App Store. Check the link and try again." };
  }

  const status = process.env.REQUIRE_APPROVAL === "true" ? "pending" : "approved";
  const { error } = await supabaseAdmin().from("apps").insert({
    app_store_id: app.appStoreId,
    name: app.name,
    developer: app.developer,
    tagline,
    icon_url: app.iconUrl,
    app_store_url: app.appStoreUrl,
    status,
  });

  if (error?.code === "23505") {
    redirect(`/apps/${app.appStoreId}?already=1`);
  }
  if (error) {
    console.error("submitApp insert failed", error);
    return { error: "Something went wrong saving your listing. Please try again." };
  }

  updateTag(APPS_TAG);
  redirect(`/apps/${app.appStoreId}?listed=1`);
}

export async function startBoost(_prev: FormState, formData: FormData): Promise<FormState> {
  const appStoreId = Number(formData.get("appStoreId"));
  const dollars = Number(formData.get("amount"));
  if (!Number.isInteger(dollars) || dollars < MIN_BOOST_DOLLARS || dollars > MAX_BOOST_DOLLARS) {
    return {
      error: `Enter a whole-dollar amount between $${MIN_BOOST_DOLLARS} and $${MAX_BOOST_DOLLARS.toLocaleString("en-US")}.`,
    };
  }

  const { data: app, error } = await supabaseAdmin()
    .from("apps")
    .select("id, app_store_id, name, icon_url, status")
    .eq("app_store_id", appStoreId)
    .maybeSingle();
  if (error || !app || app.status !== "approved") {
    return { error: "This app can't be boosted right now." };
  }

  const base = await siteUrl();
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: dollars * 100,
          product_data: {
            name: `Boost ${app.name} on unoduo`,
            description: "Moves your app up the iPhone Duo leaderboard. Boosts add up and don't expire.",
            images: [app.icon_url],
          },
        },
      },
    ],
    metadata: { app_id: app.id },
    success_url: `${base}/apps/${app.app_store_id}?boosted=1`,
    cancel_url: `${base}/apps/${app.app_store_id}`,
  });

  if (!session.url) return { error: "Couldn't start checkout. Please try again." };
  redirect(session.url);
}
