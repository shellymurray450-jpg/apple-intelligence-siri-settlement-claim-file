import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";

const searchSchema = z.object({
  id: z.string().optional(),
  tier: z.string().optional(),
  payment: z.string().optional(),
  amount: z.number().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/confirmation")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Claim Submitted — Apple Intelligence & Siri Settlement" },
      { name: "description", content: "Your claim has been successfully submitted." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

const PAYMENT_NAMES: Record<string, string> = {
  paypal: "PayPal",
  ach: "ACH Direct Deposit",
  echeck: "Electronic Check",
  paper: "Paper Check",
};

const TIER_NAMES: Record<string, string> = {
  standard: "Standard Claim",
  documented: "Documented Claim",
  family: "Family Claim",
};

function Confirmation() {
  const { id, tier, payment, amount, email } = Route.useSearch();

  if (!id) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">No claim found</h1>
        <p className="mt-2 text-muted-foreground">Start a new claim to see your confirmation.</p>
        <Link to="/claim" className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">File a claim</Link>
      </section>
    );
  }

  const amountStr = amount ? amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "";

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-elevated sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Claim submitted successfully</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you. Your claim has been received and is being reviewed. A confirmation has been sent to your email.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5 text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your claim ID</div>
          <div className="mt-1 font-mono text-lg font-semibold">{id}</div>
          <div className="mt-4 grid gap-2 text-sm">
            {tier && <Row label="Claim type" value={TIER_NAMES[tier] ?? tier} />}
            {amountStr && <Row label="Amount" value={amountStr} />}
            {payment && <Row label="Payment method" value={PAYMENT_NAMES[payment] ?? payment} />}
            {email && <Row label="Confirmation sent to" value={email} />}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-left text-sm text-muted-foreground">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            Keep your claim ID for your records. Payments will be issued after final court approval, expected in Q4 2026.
          </div>
        </div>

        <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
          Return home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
