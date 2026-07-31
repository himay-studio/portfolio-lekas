"use client";

/* R36 tracking plumbing. Mandatory on every portfolio site, and no op safe.

   - GTM container GTM-WZJZTSKG, head snippet as high in <head> as Next allows plus the body
     <noscript> iframe immediately after the opening <body>.
   - GA4 is delivered THROUGH that container using the shared measurement property, so
     himaystudio.com and every portfolio subdomain roll up into one dashboard. No gtag snippet
     is hardcoded here on purpose, the container owns it.
   - This repo had zero prior tracking wiring beyond GTM (no site.ts TRACKING constant), so the
     container id and category live as local constants here rather than through a site-data file
     that does not exist. HIM-360 adds the missing client half: Meta Pixel (browser) + Meta CAPI
     (server, via the already-correct functions/api/meta-events.ts, untouched here). `TRACKING`
     below exposes `gtmId`/`category` as the site-config source src/lib/analytics.ts imports. */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { META_PIXEL_ID, trackPageView, trackLead, type LeadMethod } from "@/lib/analytics";

const GTM_ID = "GTM-WZJZTSKG";

/* HIM-356: portfolio industry classification, emitted as `portfolio_category`
   on the GTM dataLayer so retargeting audiences can be segmented per brand
   category. Lekas is a POS (kasir) app for retail stores and F&B kiosks
   (README: "toko retail dan kedai F&B skala UMKM"), which does not cleanly
   fit any of ecommerce/fashion/distributor/food-and-beverage/services/hotel
   (it spans both physical retail checkout and food-service checkout, not an
   online store and not a single-brand restaurant), so a new value "retail"
   is used here rather than forcing a bad fit into one of the given options.
   This repo had zero prior tracking wiring beyond GTM (no site.ts, no Meta
   Pixel client component), so this is a local constant like GTM_ID above. */
const PORTFOLIO_CATEGORY: string | null = "retail";

/* HIM-360: site-config source read by src/lib/analytics.ts (the Meta Pixel +
   CAPI client half). Sibling of the GTM/category constants above, not a new
   data file, since this repo never had a site.ts to begin with. */
export const TRACKING = {
  gtmId: GTM_ID,
  category: PORTFOLIO_CATEGORY,
};

export function GtmHead() {
  if (!GTM_ID) return null;
  const categoryPush = PORTFOLIO_CATEGORY
    ? `window.dataLayer=window.dataLayer||[];window.dataLayer.push({portfolio_category:${JSON.stringify(PORTFOLIO_CATEGORY)}});`
    : "";
  return (
    <Script id="gtm-head" strategy="afterInteractive">
      {`${categoryPush}(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

export function GtmNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

const WA_PATTERN = /wa\.me|api\.whatsapp\.com|^whatsapp:/i;

function leadMethodFromHref(href: string): LeadMethod | null {
  if (WA_PATTERN.test(href)) return "whatsapp";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  return null;
}

function labelFromAnchor(anchor: Element): string {
  const explicit =
    anchor.getAttribute("data-track") || anchor.getAttribute("aria-label");
  if (explicit) return explicit;
  const text = (anchor.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 80);
  return "cta";
}

// R36/HIM-360 Meta Pixel client. Loads the Meta Pixel only when META_PIXEL_ID
// is set (no-op otherwise), fires PageView on every route change, and listens
// globally for WhatsApp/email/phone clicks to fire Lead/Contact.
export function MetaPixelClient() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const method = leadMethodFromHref(anchor.getAttribute("href") || "");
      if (!method) return;
      trackLead(method, `${labelFromAnchor(anchor)} (${window.location.pathname})`);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      {/* Creates the stub (if not present) and loads fbevents.js. fbq('init')
          is called from src/lib/analytics.ts so the init queue always precedes
          the first event. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(!f.fbq){n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
