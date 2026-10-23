import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppIcon } from "@/components/app-icon";
import { getListingStatus, getRankedApps } from "@/lib/apps";
import { formatDollars } from "@/lib/format";
import { BoostForm } from "./boost-form";

export default function AppPage({ params, searchParams }: PageProps<"/apps/[id]">) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-card" />}>
      <AppDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

// Whole dollars needed to pass an app with `targetCents` when you have
// `ownCents`. Ties go to whoever got there first, so you need strictly more.
function dollarsToPass(targetCents: number, ownCents: number) {
  return Math.max(1, Math.ceil((targetCents - ownCents + 1) / 100));
}

async function AppDetail({
  params,
  searchParams,
}: Pick<PageProps<"/apps/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const query = await searchParams;
  const appStoreId = Number(id);
  if (!Number.isSafeInteger(appStoreId)) notFound();

  const apps = await getRankedApps();
  const index = apps.findIndex((app) => app.appStoreId === appStoreId);

  if (index === -1) {
    const listing = await getListingStatus(appStoreId);
    if (!listing || listing.status === "hidden") notFound();
    return (
      <Notice>
        <strong>{listing.name}</strong> is waiting for review. It shows up on the leaderboard once
        it&apos;s approved.
      </Notice>
    );
  }

  const app = apps[index];
  const above = index > 0 ? apps[index - 1] : null;
  const top = apps[0];
  const suggestions = [
    above && { label: `Pass #${above.rank}`, dollars: dollarsToPass(above.totalCents, app.totalCents) },
    above && above.rank !== 1 && { label: "Take #1", dollars: dollarsToPass(top.totalCents, app.totalCents) },
  ].filter((s): s is { label: string; dollars: number } => Boolean(s));

  return (
    <div className="flex flex-col gap-6">
      {query.listed && <Notice>You&apos;re listed. Boost your app to climb the leaderboard.</Notice>}
      {query.already && <Notice>This app is already listed. You can still boost it.</Notice>}
      {query.boosted && (
        <Notice>
          Thanks! Your boost shows up as soon as the payment clears, usually within a few seconds.
        </Notice>
      )}

      <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <AppIcon src={app.iconUrl} name={app.name} size={112} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest duo-text">
            #{app.rank} on iPhone Duo
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">{app.name}</h1>
          <p className="text-muted">{app.tagline}</p>
          <p className="text-xs text-muted">by {app.developer}</p>
        </div>
        <a
          href={app.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background sm:self-center"
        >
          Get on the App Store
        </a>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">Boost {app.name}</h2>
          <span className="font-mono text-sm text-muted">
            {formatDollars(app.totalCents)} boosted so far
          </span>
        </div>
        <p className="text-sm text-muted">
          {above
            ? `#${above.rank} has ${formatDollars(above.totalCents)}. Boost $${dollarsToPass(above.totalCents, app.totalCents)} or more to pass it. Boosts add up, never expire, and anyone can boost any app.`
            : "This app holds #1. Boost it to stay out of reach. Boosts never expire."}
        </p>
        <BoostForm appStoreId={app.appStoreId} suggestions={suggestions} />
      </section>

      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to the leaderboard
      </Link>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-accent-2/40 bg-accent-2/10 px-4 py-3 text-sm">
      {children}
    </p>
  );
}
