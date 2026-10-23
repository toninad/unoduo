import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { getRankedApps, type RankedApp } from "@/lib/apps";
import { formatDollars } from "@/lib/format";

export default async function Home() {
  const apps = await getRankedApps();
  const [top, ...rest] = apps;
  const raised = apps.reduce((sum, app) => sum + app.totalCents, 0);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted">iPhone Duo is here.</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          The best apps for iPhone Duo, <span className="duo-text">ranked by who paid most.</span>
        </h1>
        <p className="max-w-xl text-muted">
          List your app for free. Boost it with any amount to climb. Boosts add up and never
          expire, so the top spot belongs to whoever wants it most.
        </p>
        {apps.length > 0 && (
          <p className="font-mono text-xs text-muted">
            {apps.length} {apps.length === 1 ? "app" : "apps"} · {formatDollars(raised)} in boosts
          </p>
        )}
      </section>

      {top ? (
        <>
          <Spotlight app={top} />
          {rest.length > 0 && (
            <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {rest.map((app) => (
                <Row key={app.id} app={app} />
              ))}
            </ol>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function Spotlight({ app }: { app: RankedApp }) {
  return (
    <Link
      href={`/apps/${app.appStoreId}`}
      className="group relative overflow-hidden rounded-3xl p-[2px] duo-gradient"
    >
      <div className="flex flex-col gap-5 rounded-[22px] bg-card p-6 sm:flex-row sm:items-center">
        <AppIcon src={app.iconUrl} name={app.name} size={96} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest duo-text">
            #1 on iPhone Duo
          </span>
          <h2 className="truncate text-2xl font-semibold">{app.name}</h2>
          <p className="text-muted">{app.tagline}</p>
          <p className="text-xs text-muted">by {app.developer}</p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <span className="font-mono text-lg font-semibold">{formatDollars(app.totalCents)}</span>
          <span className="text-xs text-muted group-hover:text-foreground">View &amp; boost →</span>
        </div>
      </div>
    </Link>
  );
}

function Row({ app }: { app: RankedApp }) {
  return (
    <li>
      <Link
        href={`/apps/${app.appStoreId}`}
        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-background"
      >
        <span className="w-8 text-right font-mono text-sm text-muted">{app.rank}</span>
        <AppIcon src={app.iconUrl} name={app.name} size={48} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{app.name}</span>
          <span className="truncate text-sm text-muted">{app.tagline}</span>
        </div>
        <span className="font-mono text-sm">{formatDollars(app.totalCents)}</span>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border p-10 text-center">
      <p className="text-lg font-medium">No apps yet. The #1 spot is wide open.</p>
      <Link
        href="/submit"
        className="rounded-full px-5 py-2.5 text-sm font-medium text-white duo-gradient"
      >
        List your app first
      </Link>
    </div>
  );
}
