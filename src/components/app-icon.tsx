import Image from "next/image";

// App Store artwork is already served sized from Apple's CDN, so skip the optimizer.
export function AppIcon({ src, name, size }: { src: string; name: string; size: number }) {
  return (
    <Image
      src={src}
      alt={`${name} icon`}
      width={size}
      height={size}
      unoptimized
      className="shrink-0 border border-border"
      style={{ borderRadius: size * 0.225 }}
    />
  );
}
