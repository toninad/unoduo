import type { Metadata } from "next";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "List your app · unoduo",
};

export default function SubmitPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">List your iPhone Duo app</h1>
        <p className="text-muted">
          Listing is free. Paste your App Store link and we pull in the name and icon. Once
          you&apos;re listed, boost your app to move up the leaderboard.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
