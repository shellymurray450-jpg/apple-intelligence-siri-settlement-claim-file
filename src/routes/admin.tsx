import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Folder, Lock, ArrowLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Apple Intelligence & Siri Settlement Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const ADMIN_PASSWORD = "Admin123$";
const SESSION_FLAG = "admin:unlocked";

type Claim = Record<string, unknown> & {
  id?: string;
  submittedAt?: string;
  tierName?: string;
  amount?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

function Admin() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selected, setSelected] = useState<Claim | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_FLAG) === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const list: Claim[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("claim:")) {
        try {
          const raw = sessionStorage.getItem(key);
          if (raw) list.push(JSON.parse(raw));
        } catch { /* ignore */ }
      }
    }
    list.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    setClaims(list);
  }, [unlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_FLAG, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
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
            <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Open Folder
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
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
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
            {claims.length} submitted {claims.length === 1 ? "claim" : "claims"} in this session.
          </p>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem(SESSION_FLAG);
            setUnlocked(false);
          }}
          className="hidden rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary sm:inline-flex"
        >
          Lock
        </button>
      </div>

      <div className="mt-8">
        {claims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No claims submitted yet in this browser session.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-background text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Claimant</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claims.map((c) => (
                  <tr
                    key={String(c.id)}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer transition hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{String(c.id)}</td>
                    <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{c.tierName}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {typeof c.amount === "number" ? c.amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Claim Details</div>
            <div className="mt-1 font-mono text-sm font-bold">{String(selected.id)}</div>
            <pre className="mt-4 max-h-[60vh] overflow-auto rounded-lg bg-background p-4 text-xs">
{JSON.stringify(selected, null, 2)}
            </pre>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </section>
  );
}
