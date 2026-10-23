import "server-only";

export type AppStoreApp = {
  appStoreId: number;
  name: string;
  developer: string;
  iconUrl: string;
  appStoreUrl: string;
};

// Accepts links like https://apps.apple.com/us/app/some-name/id1234567890
export function parseAppStoreUrl(input: string): { id: number; country: string } | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.hostname !== "apps.apple.com" && url.hostname !== "itunes.apple.com") {
    return null;
  }
  const id = url.pathname.match(/\/id(\d{5,12})(?:\/|$)/)?.[1];
  if (!id) return null;
  const country = url.pathname.match(/^\/([a-z]{2})\//)?.[1] ?? "us";
  return { id: Number(id), country };
}

// Looks the app up in Apple's public iTunes Search API so every listing is a
// real App Store app with its official name and icon.
export async function lookupApp(id: number, country: string): Promise<AppStoreApp | null> {
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${id}&country=${country}&entity=software`,
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    resultCount: number;
    results: Array<{
      trackId: number;
      trackName: string;
      sellerName?: string;
      artistName?: string;
      artworkUrl512?: string;
      artworkUrl100?: string;
      trackViewUrl: string;
    }>;
  };
  const app = data.results?.[0];
  if (!app) return null;
  return {
    appStoreId: app.trackId,
    name: app.trackName,
    developer: app.sellerName ?? app.artistName ?? "Unknown developer",
    iconUrl: app.artworkUrl512 ?? app.artworkUrl100 ?? "",
    appStoreUrl: app.trackViewUrl.split("?")[0],
  };
}
