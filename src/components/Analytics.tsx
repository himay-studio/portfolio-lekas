/* R36 tracking plumbing. Mandatory on every portfolio site, and no op safe.

   - GTM container GTM-WZJZTSKG, head snippet as high in <head> as Next allows plus the body
     <noscript> iframe immediately after the opening <body>.
   - GA4 is delivered THROUGH that container using the shared measurement property, so
     himaystudio.com and every portfolio subdomain roll up into one dashboard. No gtag snippet
     is hardcoded here on purpose, the container owns it.
   - This repo had zero prior tracking wiring (no site.ts TRACKING constant, no Meta Pixel
     client component), so the container id is a local constant here rather than threaded
     through a site-data file that does not exist yet. Meta Pixel client wiring is intentionally
     out of scope for this change; the server side CAPI counterpart lives in
     functions/api/meta-events.ts and is no op safe on its own regardless of Pixel presence. */

import Script from "next/script";

const GTM_ID = "GTM-WZJZTSKG";

export function GtmHead() {
  if (!GTM_ID) return null;
  return (
    <Script id="gtm-head" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
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
