import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { APPS_TAG } from "@/lib/apps";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    const appId = session.metadata?.app_id;
    if (session.payment_status === "paid" && appId && session.amount_total) {
      const { error } = await supabaseAdmin().rpc("record_boost", {
        p_session_id: session.id,
        p_app_id: appId,
        p_amount_cents: session.amount_total,
      });
      if (error) {
        console.error("record_boost failed", error);
        // A 500 makes Stripe retry; record_boost is idempotent per session.
        return new Response("Failed to record boost", { status: 500 });
      }
      revalidateTag(APPS_TAG, { expire: 0 });
    }
  }

  return Response.json({ received: true });
}
