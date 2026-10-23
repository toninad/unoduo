import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { getRankedApps, type RankedApp } from "@/lib/apps";
import { formatDollars } from "@/lib/format";

export default async function Home() {
  const apps = await getRankedApps();
  const raised = apps.reduce((sum, app) => sum + app.totalCents, 0);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3 pt-6">
        <h1 className="text-[34px] leading-[1.1] font-semibold tracking-tight">
          iPhone Duo apps, ranked by who paid the most.
        </h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Listing is free. Paying moves your app up. Payments add up and never expire.
        </p>
      </section>

      {apps.length > 0 ? (
        <section className="flex flex-col">
          <div className="flex justify-between border-b border-rule pb-2 text-[13px] text-muted">
            <span>
              {apps.length} {apps.length === 1 ? "app" : "apps"}
            </span>
            <span>{formatDollars(raised)} paid</span>
          </div>
          <ol>
            {apps.map((app) => (
              <Row key={app.id} app={app} />
            ))}
          </ol>
        </section>
      ) : (
        <p className="border-t border-rule pt-6 text-[17px]">
          Nothing listed yet, so #1 is free.{" "}
          <Link href="/submit" className="underline underline-offset-4">
            List your app
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function Row({ app }: { app: RankedApp }) {
  const first = app.rank === 1;
  return (
    <li className="border-b border-rule">
      <Link
        href={`/apps/${app.appStoreId}`}
        className={`flex items-center gap-4 hover:bg-subtle ${first ? "py-6" : "py-3.5"}`}
      >
        <span
          className={`w-9 shrink-0 text-right font-semibold ${first ? "text-[28px]" : "text-[17px] text-muted"}`}
        >
          {app.rank}
        </span>
        <AppIcon src={app.iconUrl} name={app.name} size={first ? 72 : 44} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={`font-semibold ${first ? "text-[22px] leading-tight" : "truncate text-[16px]"}`}>
            {app.name}
          </span>
          <span className={`text-muted ${first ? "line-clamp-2 text-[15px]" : "truncate text-[14px]"}`}>
            {app.tagline}
          </span>
        </div>
        <span className={`shrink-0 ${first ? "text-[20px] font-semibold" : "text-[15px]"}`}>
          {formatDollars(app.totalCents)}
        </span>
      </Link>
    </li>
  );
}
