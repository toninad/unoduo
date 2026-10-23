"use client";

import { useActionState } from "react";
import { submitApp, type FormState } from "@/app/actions";

const inputClass =
  "w-full rounded-lg border border-rule bg-background px-3 py-2.5 text-[16px] outline-none focus:border-foreground";

export function SubmitForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitApp, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-medium">App Store link</span>
        <input
          name="appStoreUrl"
          type="url"
          required
          placeholder="https://apps.apple.com/us/app/your-app/id1234567890"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-medium">Tagline</span>
        <input
          name="tagline"
          required
          maxLength={80}
          placeholder="What does it do on iPhone Duo?"
          className={inputClass}
        />
        <span className="text-[13px] text-muted">Up to 80 characters.</span>
      </label>
      {/* Honeypot for bots; hidden from people and screen readers. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && (
        <p role="alert" className="text-[15px] text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-foreground px-5 py-2.5 text-[15px] font-medium text-background disabled:opacity-50"
      >
        {pending ? "Looking up your app…" : "List my app"}
      </button>
    </form>
  );
}
