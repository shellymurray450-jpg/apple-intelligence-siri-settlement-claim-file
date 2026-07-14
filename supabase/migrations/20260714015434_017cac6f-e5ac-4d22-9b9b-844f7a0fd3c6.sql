CREATE TABLE public.claims (
  id text PRIMARY KEY,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  tier text,
  tier_name text,
  amount numeric,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  state_val text,
  zip text,
  payment text,
  paypal_email text,
  account_type text,
  routing text,
  account_last4 text,
  mailing_same_as_address boolean,
  payload jsonb NOT NULL
);

GRANT ALL ON public.claims TO service_role;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE INDEX claims_submitted_at_idx ON public.claims (submitted_at DESC);
