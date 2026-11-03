/* Bittar Company — interações e animações */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var root = document.documentElement;

  /* ---------- Contatos vindos do config.js ---------- */
  function waUrl(text) {
    return "https://wa.me/" + (cfg.WHATSAPP_NUMBER || "") + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  document.querySelectorAll("[data-wa-link]").forEach(function (el) {
    if (!cfg.WHATSAPP_NUMBER) { el.hidden = true; return; }
    el.href = waUrl("Olá! Vim pelo site da Bittar Company e quero saber mais sobre o diagnóstico.");
    el.target = "_blank";
    el.rel = "noopener";
    el.addEventListener("click", function () { window.Tracking && Tracking.whatsapp("flutuante"); });
  });

  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    el.textContent = cfg[el.getAttribute("data-cfg")] || "";
  });
  if (cfg.CNPJ) document.querySelector("[data-cnpj-wrap]").hidden = false;
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var links = document.querySelector("[data-footer-links]");
  [["Instagram", cfg.INSTAGRAM_URL], ["LinkedIn", cfg.LINKEDIN_URL], ["E-mail", cfg.EMAIL && "mailto:" + cfg.EMAIL]]
    .forEach(function (item) {
      if (!item[1]) return;
      var li = document.createElement("li");
      li.innerHTML = '<a target="_blank" rel="noopener"></a>';
      li.firstChild.textContent = item[0];
      li.firstChild.href = item[1];
      links.appendChild(li);
    });

  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () { window.Tracking && Tracking.cta(el.getAttribute("data-cta")); });
  });

  /* ---------- Formulário de diagnóstico ---------- */
  var form = document.getElementById("form-diagnostico");
  var progress = form.querySelector("[data-progress]");
  var names = ["nome", "imobiliaria", "ticket", "investimento", "whatsapp"];

  function value(name) {
    var el = form.elements[name];
    return (el && el.value ? String(el.value) : "").trim();
  }
  function phoneOk(v) { return v.replace(/\D/g, "").length >= 10; }
  function filled(name) { return name === "whatsapp" ? phoneOk(value(name)) : !!value(name); }

  function updateProgress() {
    progress.textContent = names.filter(filled).length;
  }
  form.addEventListener("input", updateProgress);
  form.addEventListener("change", updateProgress);

  // Máscara simples de telefone BR
  form.elements.whatsapp.addEventListener("input", function (e) {
    var d = e.target.value.replace(/\D/g, "").slice(0, 11);
    var out = d;
    if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
    e.target.value = out;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = names.filter(function (n) { return !filled(n); });

    form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("is-invalid"); });
    missing.forEach(function (n) {
      var el = form.elements[n];
      var node = el.length && !el.tagName ? el[0] : el; // RadioNodeList
      var field = node.closest(".field");
      if (field) field.classList.add("is-invalid");
    });

    var err = form.querySelector(".form__error");
    if (missing.length) { err.hidden = false; return; }
    err.hidden = true;

    var data = {
      nome: value("nome"), imobiliaria: value("imobiliaria"),
      ticket: value("ticket"), investimento: value("investimento"), whatsapp: value("whatsapp"),
    };

    window.Tracking && Tracking.lead(data);

    var msg =
      "Olá, Bittar Company! Quero meu diagnóstico gratuito de tráfego pago.\n\n" +
      "Nome: " + data.nome + "\n" +
      "Imobiliária: " + data.imobiliaria + "\n" +
      "Preço médio dos imóveis: " + data.ticket + "\n" +
      "Investimento em anúncios: " + data.investimento + "\n" +
      "WhatsApp: " + data.whatsapp;

    var url = waUrl(msg);
    form.querySelector("[data-wa-fallback]").href = url;
    form.querySelector(".form__success").hidden = false;
    if (cfg.WHATSAPP_NUMBER) window.open(url, "_blank", "noopener");
  });

  /* ---------- Header some ao rolar para baixo ---------- */
  var nav = document.querySelector(".nav");
  var lastY = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    nav.classList.toggle("is-hidden", y > lastY && y > 200);
    lastY = y;
  }, { passive: true });

  /* ---------- Animações ---------- */
  window.addEventListener("load", function () {
    if (!root.classList.contains("js") || !window.gsap || !window.ScrollTrigger) {
      root.classList.remove("js");
      return;
    }
    window.__animated = true;
    gsap.registerPlugin(ScrollTrigger);

    // Rolagem suave
    if (window.Lenis) {
      var lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: -20 });
        });
      });
    }

    // 1. Título do hero: linhas sobem por trás de uma máscara
    var intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .to(".hero__title .line > span", { y: 0, duration: 1.1, stagger: 0.12 })
      .to(".hero [data-reveal]", { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.7")
      .fromTo("[data-feed]", { opacity: 0, x: 60, rotate: 6 }, { opacity: 1, x: 0, rotate: 1.5, duration: 1.1 }, "-=0.9")
      .fromTo(".lead", { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.35, ease: "back.out(1.6)" }, "-=0.4");
    gsap.set(".hero [data-reveal]", { y: 20 });

    // 2. Grade do hero em parallax
    gsap.to(".hero__grid", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // 3. Revelações de texto (fora do hero): sobem com fade
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // 4. Cartões: entram em cascata, alternando direção
    var groups = [".pain__grid", ".inc__grid", ".faq__list"];
    groups.forEach(function (sel, gi) {
      var group = document.querySelector(sel);
      if (!group) return;
      var cards = group.querySelectorAll("[data-card]");
      var from = [
        { y: 60 },
        { y: 80, scale: 0.94 },
        { x: -40 },
      ][gi];
      gsap.fromTo(cards, Object.assign({ opacity: 0 }, from), {
        opacity: 1, x: 0, y: 0, scale: 1, rotate: 0,
        duration: 0.9, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 82%" },
        clearProps: "transform",
      });
    });

    // 5. Método: linha laranja preenche conforme a rolagem
    gsap.fromTo("[data-method-fill]", { scaleX: 0 }, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: ".method__track", start: "top 75%", end: "bottom 45%", scrub: true },
    });
    gsap.fromTo("[data-step]", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out",
      scrollTrigger: { trigger: ".method__track", start: "top 78%" },
    });

    // 6. Barras do painel crescem depois da entrada do hero
    intro.fromTo(".rep__bars i", { scaleY: 0 }, {
      scaleY: 1, duration: 1, stagger: 0.08, ease: "elastic.out(1, 0.6)",
    }, "-=0.3");

    // 7. Título final cresce ao entrar
    gsap.fromTo(".final__title", { scale: 0.85, opacity: 0.3 }, {
      scale: 1, opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".final", start: "top 90%", end: "top 30%", scrub: true },
    });
  });
})();
