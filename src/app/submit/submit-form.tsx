"use client";

import { useActionState } from "react";
import { submitApp, type FormState } from "@/app/actions";

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-accent-2";

export function SubmitForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitApp, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">App Store link</span>
        <input
          name="appStoreUrl"
          type="url"
          required
          placeholder="https://apps.apple.com/us/app/your-app/id1234567890"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Tagline</span>
        <input
          name="tagline"
          required
          maxLength={80}
          placeholder="What does your app do on iPhone Duo?"
          className={inputClass}
        />
        <span className="text-xs text-muted">Up to 80 characters.</span>
      </label>
      {/* Honeypot for bots; hidden from people and screen readers. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && (
        <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full px-5 py-3 font-medium text-white duo-gradient disabled:opacity-60"
      >
        {pending ? "Looking up your app…" : "List my app for free"}
      </button>
    </form>
  );
}
