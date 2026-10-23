import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppIcon } from "@/components/app-icon";
import { getListingStatus, getRankedApps } from "@/lib/apps";
import { formatDollars } from "@/lib/format";
import { BoostForm } from "./boost-form";

export default function AppPage({ params, searchParams }: PageProps<"/apps/[id]">) {
  return (
    <Suspense fallback={<div className="h-64" />}>
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
    <div className="flex flex-col gap-10 pt-6">
      {query.listed && <Notice>You&apos;re listed. Pay any amount to move up.</Notice>}
      {query.already && <Notice>This app is already listed. You can still pay to move it up.</Notice>}
      {query.boosted && (
        <Notice>Payment received. The new rank shows up within a few seconds.</Notice>
      )}

      <section className="flex items-center gap-5">
        <AppIcon src={app.iconUrl} name={app.name} size={96} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight">{app.name}</h1>
          <p className="text-[15px] text-muted">{app.developer}</p>
          <a
            href={app.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 self-start rounded-full bg-subtle px-4 py-1.5 text-[15px] font-semibold text-[#0a84ff]"
          >
            View on App Store
          </a>
        </div>
      </section>

      <p className="text-[17px] leading-relaxed">{app.tagline}</p>

      <dl className="grid grid-cols-2 border-y border-rule py-4">
        <div>
          <dt className="text-[13px] text-muted">Rank</dt>
          <dd className="text-[22px] font-semibold">#{app.rank}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-muted">Paid so far</dt>
          <dd className="text-[22px] font-semibold">{formatDollars(app.totalCents)}</dd>
        </div>
      </dl>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold">Move up</h2>
          <p className="text-[15px] leading-relaxed text-muted">
            {above
              ? `#${above.rank} has ${formatDollars(above.totalCents)}. Pay $${dollarsToPass(above.totalCents, app.totalCents)} or more to pass it.`
              : "This app is #1. Paying more keeps it out of reach."}{" "}
            Payments add up and never expire. Anyone can pay for any app.
          </p>
        </div>
        <BoostForm appStoreId={app.appStoreId} suggestions={suggestions} />
      </section>

      <Link href="/" className="text-[15px] text-muted hover:text-foreground">
        ← All apps
      </Link>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-subtle px-4 py-3 text-[15px]">{children}</p>;
}
