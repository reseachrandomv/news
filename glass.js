/* Sliding glass pills, panel entrances, and decorative orb hooks. */
(function () {
  const reduce = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ensurePill(container) {
    let pill = container.querySelector(":scope > .tab-pill");
    if (!pill) {
      pill = document.createElement("span");
      pill.className = "tab-pill";
      pill.setAttribute("aria-hidden", "true");
      container.insertBefore(pill, container.firstChild);
    }
    return pill;
  }

  function placePill(container, active) {
    if (!container) return;
    const pill = ensurePill(container);
    if (!active) {
      pill.style.opacity = "0";
      return;
    }
    const cr = container.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const style = getComputedStyle(container);
    const pl = parseFloat(style.paddingLeft) || 0;
    const pt = parseFloat(style.paddingTop) || 0;
    const x = ar.left - cr.left - pl + container.scrollLeft;
    const y = ar.top - cr.top - pt + container.scrollTop;
    const first = !pill.dataset.ready;
    if (first) pill.classList.add("is-placing");
    pill.style.opacity = "1";
    pill.style.width = ar.width + "px";
    pill.style.height = ar.height + "px";
    pill.style.transform = "translate(" + x + "px," + y + "px)";
    if (first) {
      requestAnimationFrame(function () {
        pill.classList.remove("is-placing");
        pill.dataset.ready = "1";
      });
    }
  }

  function updateCountriesFade() {
    const nav = document.getElementById("countries");
    const shell = document.getElementById("countriesShell") || (nav && nav.parentElement);
    if (!nav || !shell || !shell.classList.contains("countries-shell")) return;
    const buttons = nav.querySelectorAll("button");
    if (!buttons.length) {
      shell.classList.remove("fade-left", "fade-right");
      return;
    }
    const nr = nav.getBoundingClientRect();
    const first = buttons[0].getBoundingClientRect();
    const last = buttons[buttons.length - 1].getBoundingClientRect();
    const slop = 2;
    shell.classList.toggle("fade-left", first.left < nr.left - slop);
    shell.classList.toggle("fade-right", last.right > nr.right + slop);
  }

  function syncGlassPills() {
    const nav = document.getElementById("countries");
    if (nav) {
      nav.classList.add("has-tab-pill");
      const active = nav.querySelector("button[aria-pressed='true']");
      placePill(nav, active);
    }
    updateCountriesFade();
    const dock = document.getElementById("dock");
    if (dock) {
      dock.classList.add("has-tab-pill");
      const active = dock.querySelector("[aria-current='page']");
      placePill(dock, active);
    }
    document.querySelectorAll(".filt").forEach(function (filt) {
      filt.classList.add("has-tab-pill");
      const active = filt.querySelector("button[aria-pressed='true']");
      placePill(filt, active);
    });
  }

  window.syncGlassPills = syncGlassPills;
  window.updateCountriesFade = updateCountriesFade;

  function animatePanel(el) {
    if (!el || reduce()) return;
    el.classList.remove("panel-in");
    void el.offsetWidth;
    el.classList.add("panel-in");
  }

  let lastSaved = null;
  function watchPanels() {
    const saved = document.getElementById("savedBtn");
    const pressed = saved && saved.getAttribute("aria-pressed") === "true";
    if (pressed !== lastSaved) {
      lastSaved = pressed;
      const list = document.getElementById("list");
      if (list) animatePanel(list);
    }
  }

  document.addEventListener(
    "click",
    function () {
      requestAnimationFrame(function () {
        syncGlassPills();
        watchPanels();
      });
    },
    true
  );

  window.addEventListener("resize", syncGlassPills);
  window.addEventListener("load", function () {
    syncGlassPills();
    const about = document.querySelector(".about-hero-card, body.about main");
    if (about) animatePanel(about);
  });

  function observe(el) {
    if (!el || !window.MutationObserver) return;
    new MutationObserver(function () {
      syncGlassPills();
      watchPanels();
    }).observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-pressed", "aria-current"] });
  }

  function boot() {
    observe(document.getElementById("countries"));
    observe(document.getElementById("dock"));
    observe(document.getElementById("list"));
    syncGlassPills();
    const nav = document.getElementById("countries");
    if (nav) nav.addEventListener("scroll", syncGlassPills, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  const prev = window.renderDock;
  if (typeof prev === "function") {
    window.renderDock = function () {
      prev.apply(this, arguments);
      syncGlassPills();
    };
  }
})();
