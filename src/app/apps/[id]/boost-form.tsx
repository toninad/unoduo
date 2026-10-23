"use client";

import { useActionState, useState } from "react";
import { startBoost, type FormState } from "@/app/actions";
import { BOOST_PRESETS, MAX_BOOST_DOLLARS, MIN_BOOST_DOLLARS } from "@/lib/boost";

type Suggestion = { label: string; dollars: number };

export function BoostForm({
  appStoreId,
  suggestions,
}: {
  appStoreId: number;
  suggestions: Suggestion[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(startBoost, {});
  const [amount, setAmount] = useState(String(suggestions[0]?.dollars ?? BOOST_PRESETS[1]));

  const chips = [
    ...suggestions,
    ...BOOST_PRESETS.map((dollars) => ({ label: `$${dollars}`, dollars })),
  ].filter((chip) => chip.dollars <= MAX_BOOST_DOLLARS);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="appStoreId" value={appStoreId} />
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setAmount(String(chip.dollars))}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              amount === String(chip.dollars)
                ? "border-accent-2 bg-accent-2/10"
                : "border-border hover:border-muted"
            }`}
          >
            {chip.label === `$${chip.dollars}` ? chip.label : `${chip.label} · $${chip.dollars}`}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-4 focus-within:border-accent-2">
          <span className="text-muted">$</span>
          <input
            name="amount"
            type="number"
            inputMode="numeric"
            min={MIN_BOOST_DOLLARS}
            max={MAX_BOOST_DOLLARS}
            step={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Boost amount in US dollars"
            className="w-full bg-transparent py-3 outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-6 py-3 font-medium text-white duo-gradient disabled:opacity-60"
        >
          {pending ? "Opening checkout…" : "Boost"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      <p className="text-xs text-muted">
        Payments go through Stripe. Boosts are non-refundable and only affect rank.
      </p>
    </form>
  );
}
