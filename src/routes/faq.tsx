import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Apple Intelligence & Siri Settlement" },
      { name: "description", content: "Frequently asked questions about eligibility, claim amounts, documentation, and payment methods." },
      { property: "og:title", content: "FAQ — Apple Intelligence & Siri Settlement" },
      { property: "og:description", content: "Learn about claim tiers, documentation requirements, and how you'll get paid." },
    ],
  }),
  component: Faq,
});

const faqs = [
  { q: "Who is eligible to file a claim?", a: "Any U.S. resident who owned or used a Siri-enabled Apple device (iPhone, iPad, Apple Watch, HomePod, Mac, or Apple TV) between September 17, 2014 and December 31, 2024." },
  { q: "What are the claim amounts?", a: "Standard Claim: $1,980. Documented Claim: $12,980 (requires proof of ownership). Family Claim: $20,980 (covers up to 6 family members)." },
  { q: "What documentation is required for the Documented Claim?", a: "Upload a receipt, invoice, order confirmation, or a screenshot showing the device serial number tied to your Apple ID as proof of ownership." },
  { q: "What payment methods are available?", a: "You can choose PayPal, ACH Direct Deposit, Electronic Check (e-Check), or a mailed Paper Check when submitting your claim." },
  { q: "When is the deadline to file?", a: "All claims must be submitted no later than July 2, 2026 at 11:59 PM Pacific Time." },
  { q: "When will I receive my payment?", a: "Payments are issued after the settlement receives final court approval, expected in Q4 2026. Most electronic payments arrive within 5–7 business days of approval." },
  { q: "Is my information secure?", a: "Yes. All submissions are transmitted over 256-bit SSL encryption and stored on court-authorized secure servers." },
];

function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
      <p className="mt-4 text-muted-foreground">Everything you need to know before you file your claim.</p>

      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="text-lg font-semibold">Ready to file?</div>
        <p className="mt-1 text-sm text-muted-foreground">It only takes a few minutes.</p>
        <Link to="/claim" className="mt-4 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          Start your claim
        </Link>
      </div>
    </section>
  );
}
