// supabase/functions/register-sponsor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Expected multipart/form-data", { status: 400 });
    }

    const form = await req.formData();
    const company_name = form.get("company_name")?.toString() || "";
    const contact_first = form.get("contact_first")?.toString() || "";
    const contact_last = form.get("contact_last")?.toString() || "";
    const contact_email = form.get("contact_email")?.toString() || "";
    const contact_phone = form.get("contact_phone")?.toString() || "";
    const tier = form.get("tier")?.toString() || "";
    const tier_amount = parseFloat(form.get("tier_amount")?.toString() || "0");
    const pay_status = form.get("pay_status")?.toString() || "";
    const logo = form.get("logo") as File | null;

    let logo_path: string | null = null;

    if (logo && logo.size > 0) {
      if (logo.size > 2 * 1024 * 1024) {
        return new Response("Logo too large. Max size is 2MB.", { status: 413 });
      }

      const fileName = `${Date.now()}-${logo.name}`;
      logo_path = `images/sponsors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("sponsor-logos")
        .upload(logo_path, logo, {
          cacheControl: "3600",
          contentType: logo.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Logo upload failed:", uploadError);
        return new Response("Logo upload failed", { status: 500 });
      }
    }

    const { error } = await supabase.rpc("register_sponsor", {
      company_name,
      contact_first,
      contact_last,
      contact_email,
      contact_phone,
      tier,
      tier_amount,
      pay_status,
      logo_path
    });

    if (error) {
      console.error("RPC Error:", error);
      return new Response("Sponsor registration failed", { status: 500 });
    }

    return new Response("Sponsor registered successfully", { status: 200 });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
