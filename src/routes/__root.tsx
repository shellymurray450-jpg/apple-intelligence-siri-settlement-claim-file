import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Apple Intelligence & Siri Settlement Claim Center" },
      { name: "description", content: "File your claim for the Apple Intelligence and Siri class action settlement. Standard, Documented, and Family claim options available." },
      { name: "author", content: "Settlement Claim Center" },
      { property: "og:title", content: "Apple Intelligence & Siri Settlement Claim Center" },
      { property: "og:description", content: "Submit your claim securely and select your preferred payment method." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-label="Apple logo">
              <path d="M17.3 8.55c-.04-1.55.63-2.73 1.99-3.6-.76-1.1-1.9-1.7-3.38-1.77-1.42-.08-2.98.84-3.56.84-.6 0-2.04-.8-3.24-.8C6.58 3.45 4 5.43 4 8.48c0 .98.18 1.99.54 3.03.48 1.4 2.21 4.82 4.01 4.77 1.2-.02 2.04-.86 3.6-.86 1.5 0 2.28.86 3.6.84 1.88-.03 3.16-3.1 3.63-4.5-2.31-1.08-2.73-3.93-2.73-4.78.02-1.4.83-2.57 2.04-3.2-.18-.45-.78-1.36-1.57-2.23zM14.66 3.3c.82-1 1.37-2.37 1.22-3.75-1.18.05-2.6.79-3.45 1.78-.76.88-1.42 2.28-1.24 3.65 1.32.1 2.67-.66 3.47-1.68z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Settlement Claim Center</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link to="/" className="transition-colors hover:text-foreground">Overview</Link>
          <Link to="/faq" className="transition-colors hover:text-foreground">FAQ</Link>
          <Link to="/claim" className="inline-flex items-center rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-card transition hover:opacity-90">File a Claim</Link>
        </nav>
        <Link to="/claim" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground sm:hidden">File Claim</Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="font-semibold text-foreground">Settlement Claim Center</div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed">
              Secure online filing portal for the Apple Intelligence & Siri class action settlement.
            </p>
          </div>
          <div>
            <div className="font-semibold text-foreground">Navigate</div>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li><Link to="/" className="hover:text-foreground">Overview</Link></li>
              <li><Link to="/claim" className="hover:text-foreground">File a Claim</Link></li>
              <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground">Need Help? Contact Support</div>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li><a href="tel:19856023749" className="hover:text-foreground">1-985-602-3749</a></li>
              <li><a href="mailto:applesettlementclaim@icloud.com" className="hover:text-foreground break-all">applesettlementclaim@icloud.com</a></li>
              <li>Mon–Fri, 9am–6pm ET</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-4 text-[11px] leading-relaxed">
          This portal is for informational and filing purposes. Not affiliated with or endorsed by Apple Inc. Apple, Siri, and Apple Intelligence are trademarks of Apple Inc.
          © {new Date().getFullYear()} Settlement Claim Center.
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1"><Outlet /></main>
        <SiteFooter />
      </div>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
