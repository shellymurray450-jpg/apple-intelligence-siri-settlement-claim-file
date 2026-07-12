import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck, FileText, Users, ArrowRight, Clock, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

const tiers = [
  {
    id: "standard",
    icon: ShieldCheck,
    name: "Standard Claim",
    amount: "$1,980",
    description: "For eligible users who owned a Siri-enabled Apple device during the class period.",
    features: [
      "No documentation required",
      "Attestation under penalty of perjury",
      "Fastest processing time",
    ],
    highlight: false,
  },
  {
    id: "documented",
    icon: FileText,
    name: "Documented Claim",
    amount: "$12,980",
    description: "For claimants who can provide verifiable proof of ownership and eligibility.",
    features: [
      "Upload receipt or proof of purchase",
      "Serial number verification",
      "Higher approval priority",
    ],
    highlight: true,
  },
  {
    id: "family",
    icon: Users,
    name: "Family Claim",
    amount: "$20,980",
    description: "For households with multiple eligible Apple devices used under Family Sharing.",
    features: [
      "Covers up to 6 family members",
      "Bundled household submission",
      "Proof of Family Sharing required",
    ],
    highlight: false,
  },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Claim filing is now open
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Apple Intelligence & Siri Class Action Settlement
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              If you owned a Siri-enabled Apple device between September 17, 2014 and December 31, 2024,
              you may be entitled to compensation. File your claim in under 5 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/claim" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:opacity-90">
                Start Your Claim <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/faq" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
                Read the FAQ
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> 256-bit SSL encrypted</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Filing deadline: July 2, 2026</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Court-authorized portal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your claim type</h2>
          <p className="mt-3 text-muted-foreground">
            Three claim tiers are available. Select the one that best matches your situation.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`relative rounded-2xl border bg-card p-7 shadow-card transition hover:shadow-elevated ${
                t.highlight ? "border-accent ring-1 ring-accent/40" : "border-border"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
                  Most Claimed
                </div>
              )}
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{t.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{t.amount}</span>
                <span className="text-sm text-muted-foreground">per claim</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/claim"
                search={{ tier: t.id }}
                className={`mt-7 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  t.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-background hover:bg-secondary"
                }`}
              >
                Select {t.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How filing works</h2>
            <p className="mt-3 text-muted-foreground">Three quick steps. Most claims complete in under 5 minutes.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { n: "01", t: "Confirm eligibility", d: "Answer a few questions to identify your claim tier." },
              { n: "02", t: "Provide details", d: "Enter your contact info and, if applicable, upload proof of ownership." },
              { n: "03", t: "Choose payment", d: "Select PayPal, ACH direct deposit, e-check, or a mailed paper check." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="text-xs font-semibold tracking-widest text-accent">{s.n}</div>
                <div className="mt-2 text-lg font-semibold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/claim" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90">
              File a Claim Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
