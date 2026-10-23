import type { Metadata } from "next";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "List your app · unoduo",
};

export default function SubmitPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-[34px] leading-[1.1] font-semibold tracking-tight">List your app</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Free. Paste your App Store link and we&apos;ll pull in the name and icon. Once
          you&apos;re listed, you can pay to move up.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
