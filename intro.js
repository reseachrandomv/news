/* Dawnline opening mark — CSS + WAAPI only. Off the critical path (deferred).
   Timing (2.50s): bar 0–360ms, sun+glow 80–1180ms, word 680–1560ms,
   i-dot 1320–1620ms, 300ms hold, dissolve + 70ms panel stagger 1920–2500ms. */
(function () {
  const KEY = "dawnlineIntro";
  const TOTAL = 2500;
  const DISSOLVE_AT = 1920;
  const DISSOLVE = 580;
  const STAGGER = 70;
  const REDUCE = "(prefers-reduced-motion: reduce)";
  const EASE = "cubic-bezier(.22,.8,.28,1)";
  const SPRING = "cubic-bezier(.18,1.18,.32,1)";
  const SPRING_SOFT = "cubic-bezier(.22,1.12,.36,1)";
  const PANEL_SEL = [
    "header",
    ".countries-shell",
    ".ticker-wrap",
    "#list",
    "footer",
    "#dock",
    "body.about .top",
    "body.about .about-hero-card",
    "body.about main > h2",
    "body.about #grid",
    "body.about a.cta"
  ];

  const root = document.documentElement;
  const force = /(?:\?|&)intro=1(?:&|$)/.test(location.search);
  const reduce = matchMedia(REDUCE).matches;

  try { localStorage.setItem("introSeen", "1"); } catch (e) {}

  if (reduce && !force) {
    clearIntro();
    return;
  }
  if (!force && root.dataset.intro !== "pending") return;
  if (!document.body) return;

  const motions = [];
  let done = false;

  try {
    if (!force) sessionStorage.setItem(KEY, "1");
  } catch (e) {}

  const overlay = build();
  document.body.appendChild(overlay);
  root.dataset.intro = "playing";
  markPanels();

  const bar = overlay.querySelector(".dawn-intro-bar");
  const sun = overlay.querySelector(".dawn-intro-sun");
  const glow = overlay.querySelector(".dawn-intro-glow");
  const word = overlay.querySelector(".dawn-intro-word");
  const dot = overlay.querySelector(".dawn-intro-dot");
  const lockup = overlay.querySelector(".dawn-intro-lockup");

  play(bar, [
    { transform: "scaleX(0)", opacity: 0.35 },
    { transform: "scaleX(1)", opacity: 1 }
  ], { duration: 360, easing: EASE, fill: "forwards" });

  play(sun, [
    { transform: "translateY(22px) scale(.9)", opacity: 0.15 },
    { transform: "translateY(-2px) scale(1.03)", opacity: 1, offset: 0.78 },
    { transform: "translateY(0) scale(1)", opacity: 1 }
  ], { duration: 1100, delay: 80, easing: SPRING, fill: "forwards" });

  play(glow, [
    { opacity: 0, transform: "scale(.55)" },
    { opacity: 0.9, transform: "scale(1.4)", offset: 0.52 },
    { opacity: 0.55, transform: "scale(1)" }
  ], { duration: 1100, delay: 160, easing: "cubic-bezier(.16,1.08,.3,1)", fill: "forwards" });

  play(word, [
    { opacity: 0, transform: "translateY(14px)", letterSpacing: "0.16em" },
    { opacity: 1, transform: "translateY(0)", letterSpacing: "0.015em" }
  ], { duration: 880, delay: 680, easing: SPRING_SOFT, fill: "forwards" });

  play(dot, [
    { opacity: 0, transform: "translate(-50%,0) scale(0)" },
    { opacity: 1, transform: "translate(-50%,0) scale(1.18)", offset: 0.62 },
    { opacity: 1, transform: "translate(-50%,0) scale(1)" }
  ], { duration: 300, delay: 1320, easing: SPRING, fill: "forwards" });

  const dissolveTimer = setTimeout(dissolve, DISSOLVE_AT);
  const failsafe = setTimeout(function () { finish(true); }, TOTAL + 800);

  overlay.addEventListener("pointerdown", skip, { passive: true });
  window.addEventListener("keydown", skip, { passive: true });

  function play(el, keyframes, opts) {
    if (!el || !el.animate) return;
    motions.push(el.animate(keyframes, opts));
  }

  function skip() {
    if (done) return;
    clearTimeout(dissolveTimer);
    motions.forEach(function (m) { try { m.cancel(); } catch (e) {} });
    overlay.classList.add("is-skipping");
    play(overlay, [
      { opacity: 1, filter: "blur(0px)" },
      { opacity: 0, filter: "blur(12px)" }
    ], { duration: 160, easing: EASE, fill: "forwards" });
    enterPanels(0);
    setTimeout(function () { finish(true); }, 180);
  }

  function dissolve() {
    if (done) return;
    play(overlay, [
      { opacity: 1, filter: "blur(0px)" },
      { opacity: 0, filter: "blur(18px)" }
    ], { duration: DISSOLVE, easing: "cubic-bezier(.45,.05,.2,1)", fill: "forwards" });
    play(lockup, [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(1.04)" }
    ], { duration: DISSOLVE, easing: "cubic-bezier(.45,.05,.2,1)", fill: "forwards" });
    enterPanels(STAGGER);
    setTimeout(function () { finish(false); }, DISSOLVE + 20);
  }

  function markPanels() {
    panelNodes().forEach(function (el) { el.classList.add("dawn-panel"); });
  }

  function panelNodes() {
    const seen = new Set();
    const out = [];
    PANEL_SEL.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);
        out.push(el);
      });
    });
    return out;
  }

  function enterPanels(stagger) {
    root.dataset.intro = "entering";
    panelNodes().forEach(function (el, i) {
      el.style.setProperty("--dawn-delay", (i * stagger) + "ms");
      el.classList.add("dawn-panel-in");
    });
  }

  function finish(immediate) {
    if (done) return;
    done = true;
    clearTimeout(dissolveTimer);
    clearTimeout(failsafe);
    overlay.removeEventListener("pointerdown", skip);
    window.removeEventListener("keydown", skip);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    clearIntro();
    if (immediate) {
      panelNodes().forEach(function (el) {
        el.classList.remove("dawn-panel", "dawn-panel-in");
        el.style.removeProperty("--dawn-delay");
      });
    } else {
      const last = panelNodes().length;
      setTimeout(function () {
        panelNodes().forEach(function (el) {
          el.classList.remove("dawn-panel", "dawn-panel-in");
          el.style.removeProperty("--dawn-delay");
        });
      }, last * STAGGER + 700);
    }
  }

  function clearIntro() {
    delete root.dataset.intro;
  }

  function build() {
    const wrap = document.createElement("div");
    wrap.id = "dawnIntro";
    wrap.className = "dawn-intro";
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("role", "presentation");
    wrap.dir = "ltr";
    wrap.innerHTML =
      '<div class="dawn-intro-bg"></div>' +
      '<div class="dawn-intro-lockup">' +
        '<div class="dawn-intro-mark">' +
          '<svg class="brand-mark dawn-intro-svg" viewBox="0 0 64 64" fill="none" width="120" height="120" focusable="false">' +
            '<defs>' +
              '<linearGradient id="intro-logo-rim" x1="12%" y1="0%" x2="88%" y2="100%">' +
                '<stop offset="0%" stop-color="var(--logo-rim-0)" stop-opacity=".95"/>' +
                '<stop offset="38%" stop-color="var(--logo-rim-1)" stop-opacity=".8"/>' +
                '<stop offset="100%" stop-color="var(--logo-rim-2)" stop-opacity=".35"/>' +
              '</linearGradient>' +
              '<linearGradient id="intro-logo-bar" x1="0%" y1="0%" x2="100%" y2="0%">' +
                '<stop offset="0%" stop-color="var(--logo-bar-0)" stop-opacity=".95"/>' +
                '<stop offset="35%" stop-color="var(--logo-bar-1)" stop-opacity=".95"/>' +
                '<stop offset="100%" stop-color="var(--logo-bar-2)" stop-opacity=".8"/>' +
              '</linearGradient>' +
              '<radialGradient id="intro-logo-sun" cx="36%" cy="32%" r="70%">' +
                '<stop offset="0%" stop-color="var(--logo-sun-0)"/>' +
                '<stop offset="28%" stop-color="var(--logo-sun-1)"/>' +
                '<stop offset="62%" stop-color="var(--logo-sun-2)"/>' +
                '<stop offset="100%" stop-color="var(--logo-sun-3)"/>' +
              '</radialGradient>' +
              '<clipPath id="intro-horizon-clip">' +
                '<rect x="0" y="0" width="64" height="43.35"/>' +
              '</clipPath>' +
            '</defs>' +
            '<g class="dawn-intro-rise" clip-path="url(#intro-horizon-clip)">' +
              '<circle class="dawn-intro-glow" cx="32" cy="28.2" r="16" fill="var(--logo-glow)"/>' +
              '<g class="dawn-intro-sun">' +
                '<circle cx="32" cy="28.2" r="12" fill="url(#intro-logo-sun)"/>' +
                '<circle cx="32" cy="28.2" r="12" fill="none" stroke="url(#intro-logo-rim)" stroke-width="1.2"/>' +
                '<ellipse cx="27.4" cy="23.4" rx="3.8" ry="2.3" fill="var(--logo-sheen)" opacity=".78"/>' +
              '</g>' +
            '</g>' +
            '<g class="dawn-intro-bar">' +
              '<rect x="7" y="43.35" width="50" height="3.4" rx="1.7" fill="url(#intro-logo-bar)"/>' +
              '<rect x="7" y="43.35" width="50" height="3.4" rx="1.7" fill="none" stroke="url(#intro-logo-rim)" stroke-width=".9"/>' +
              '<rect x="13" y="43.9" width="16" height=".85" rx=".4" fill="var(--logo-sheen)" opacity=".55"/>' +
            '</g>' +
          '</svg>' +
        '</div>' +
        '<p class="dawn-intro-word">Dawnl<span class="dawn-intro-i">i<span class="dawn-intro-dot"></span></span>ne</p>' +
      '</div>';
    return wrap;
  }
})();
