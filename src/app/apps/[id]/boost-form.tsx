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
            className={`rounded-lg border px-3 py-1.5 text-[15px] ${
              amount === String(chip.dollars)
                ? "border-foreground bg-foreground text-background"
                : "border-rule hover:border-muted"
            }`}
          >
            {chip.label === `$${chip.dollars}` ? chip.label : `${chip.label} · $${chip.dollars}`}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 items-center gap-1 rounded-lg border border-rule bg-background px-3 focus-within:border-foreground">
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
            className="w-full bg-transparent py-2.5 text-[16px] outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-5 py-2.5 text-[15px] font-medium text-background disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : "Pay"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-[15px] text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <p className="text-[13px] text-muted">
        Paid through Stripe. Non-refundable. Only affects rank.
      </p>
    </form>
  );
}
