import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const claimSchema = z.object({
  id: z.string().min(1).max(80),
  submittedAt: z.string(),
  tier: z.string(),
  tierName: z.string(),
  amount: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  stateVal: z.string(),
  zip: z.string(),
  payment: z.string(),
  paypalEmail: z.string().optional().default(""),
  accountType: z.string().optional().default(""),
  routing: z.string().optional().default(""),
  accountLast4: z.string().optional().default(""),
  mailingSameAsAddress: z.boolean().optional().default(true),
}).passthrough();

export const saveClaim = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => claimSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("claims").upsert({
      id: data.id,
      submitted_at: data.submittedAt,
      tier: data.tier,
      tier_name: data.tierName,
      amount: data.amount,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state_val: data.stateVal,
      zip: data.zip,
      payment: data.payment,
      paypal_email: data.paypalEmail ?? "",
      account_type: data.accountType ?? "",
      routing: data.routing ?? "",
      account_last4: data.accountLast4 ?? "",
      mailing_same_as_address: data.mailingSameAsAddress ?? true,
      payload: data as unknown as Record<string, never>,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listClaimsAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || data.password !== expected) {
      throw new Error("Unauthorized");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("claims")
      .select("payload, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { claims: JSON.parse(JSON.stringify(rows ?? [])).map((r: { payload: unknown }) => r.payload) as unknown[] };
  });
