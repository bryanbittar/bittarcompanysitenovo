/**
 * RASTREAMENTO — Bittar Company
 * Lê window.SITE_CONFIG (config.js), injeta GTM / GA4 / Google Ads / Meta Pixel
 * e expõe window.Tracking com eventos próprios no dataLayer.
 *
 * No GTM, use os eventos customizados ("lead_submit", "whatsapp_click",
 * "cta_click") como gatilho — não crie Click Triggers nos mesmos botões,
 * senão o clique conta em dobro.
 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  /* Google Tag Manager */
  if (cfg.GTM_ID) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    loadScript("https://www.googletagmanager.com/gtm.js?id=" + cfg.GTM_ID);
  }

  /* GA4 direto (opcional) */
  if (cfg.GA4_ID) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + cfg.GA4_ID);
    gtag("js", new Date());
    gtag("config", cfg.GA4_ID);
  }

  /* Google Ads direto (sem GTM) */
  if (cfg.GOOGLE_ADS_ID && !cfg.GTM_ID) {
    if (!cfg.GA4_ID) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + cfg.GOOGLE_ADS_ID);
      gtag("js", new Date());
    }
    gtag("config", cfg.GOOGLE_ADS_ID);
  }

  /* Meta Pixel */
  if (cfg.META_PIXEL_ID) {
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", cfg.META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  /* Evita disparo duplicado (duplo toque no mobile) */
  var fired = Object.create(null);
  function once(key, fn) {
    var now = Date.now();
    if (fired[key] && now - fired[key] < 800) return;
    fired[key] = now;
    fn();
  }

  window.Tracking = {
    lead: function (data) {
      once("lead", function () {
        window.dataLayer.push({
          event: "lead_submit",
          lead_corretores: data.corretores,
          lead_investimento: data.investimento,
          lead_ticket: data.ticket,
        });
        if (window.fbq) window.fbq("track", "Lead", { content_name: "diagnostico" });
        if (cfg.GOOGLE_ADS_ID && cfg.GOOGLE_ADS_LEAD_LABEL) {
          window.gtag("event", "conversion", { send_to: cfg.GOOGLE_ADS_ID + "/" + cfg.GOOGLE_ADS_LEAD_LABEL });
        }
      });
    },
    whatsapp: function (area) {
      once("wa-" + area, function () {
        window.dataLayer.push({ event: "whatsapp_click", whatsapp_area: area });
        if (window.fbq) window.fbq("track", "Contact", { content_name: "whatsapp_" + area });
      });
    },
    cta: function (area) {
      once("cta-" + area, function () {
        window.dataLayer.push({ event: "cta_click", cta_area: area });
      });
    },
  };
})();
