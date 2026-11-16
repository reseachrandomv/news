/* Soft-squircle floating dock with spring physics and theme switch. */
(function () {
  const icon = (paths) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const I = {
    mv: icon('<circle cx="12" cy="8" r="3"/><path d="M3 15.5c2.1-2 3.4-2 5.5 0s3.4 2 5.5 0 3.4-2 5.5 0"/><path d="M3 19.5c2.1-1.6 3.4-1.6 5.5 0s3.4 1.6 5.5 0 3.4-1.6 5.5 0"/>'),
    world: icon('<circle cx="12" cy="12" r="8"/><path d="M12 4c2.2 2.3 3.4 5 3.4 8s-1.2 5.7-3.4 8c-2.2-2.3-3.4-5-3.4-8s1.2-5.7 3.4-8zM4.2 12h15.6"/>'),
    pop: icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    about: icon('<circle cx="12" cy="8" r="3.1"/><path d="M5.2 19.6c1.2-3.1 3.5-4.6 6.8-4.6s5.6 1.5 6.8 4.6"/>'),
    sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3 5.1 18.9"/>'),
    moon: icon('<path d="M16 3.4A7.8 7.8 0 1 0 20.6 13 6.6 6.6 0 0 1 16 3.4z"/>')
  };
  const dock = document.createElement("nav");
  dock.className = "dock";
  dock.id = "dock";
  dock.innerHTML =
    `<a data-dock="Maldives" href="index.html?tab=Maldives">${I.mv}<span class="dock-lb"></span></a>` +
    `<a data-dock="World" href="index.html?tab=World">${I.world}<span class="dock-lb"></span></a>` +
    `<a data-dock="Population" href="index.html?tab=Population">${I.pop}<span class="dock-lb"></span></a>` +
    `<a data-dock="about" href="about.html">${I.about}<span class="dock-lb"></span></a>` +
    `<button type="button" id="docktm">${I.sun}${I.moon}<span class="dock-lb"></span></button>`;
  document.body.appendChild(dock);
  const themeBtn = dock.querySelector("#docktm");
  const sun = themeBtn.querySelector("svg");
  const moon = themeBtn.querySelectorAll("svg")[1];

  function reserve() {
    const bottom = parseFloat(getComputedStyle(dock).bottom) || 12;
    document.body.style.paddingBottom = (dock.offsetHeight + bottom + 18) + "px";
  }
  function currentTab() {
    const pressed = document.querySelector("#countries button[aria-pressed='true']");
    if (pressed) return pressed.dataset.c;
    return new URLSearchParams(location.search).get("tab") || safeGet("country", "Maldives");
  }
  function renderDock() {
    const onAbout = /about\.html$/.test(location.pathname);
    const tab = currentTab();
    dock.setAttribute("aria-label", t("chooseTab"));
    dock.querySelectorAll("a[data-dock]").forEach((a) => {
      const key = a.dataset.dock;
      const label = key === "about" ? t("about") : (STR[LANG].tabs[key] || STR.en.tabs[key] || key);
      a.querySelector(".dock-lb").textContent = label;
      const on = onAbout ? key === "about" : key === tab;
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const dark = document.documentElement.dataset.theme !== "light";
    const tc = document.getElementById("themeColor");
    if (tc) tc.setAttribute("content", dark ? "#001018" : "#eaf8fb");
    themeBtn.querySelector(".dock-lb").textContent = dark ? t("light") : t("dark");
    themeBtn.setAttribute("aria-label", dark ? t("toLight") : t("toDark"));
    sun.style.display = dark ? "block" : "none";
    moon.style.display = dark ? "none" : "block";
    reserve();
  }
  dock.querySelectorAll("a[data-dock]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const key = a.dataset.dock;
      const onAbout = /about\.html$/.test(location.pathname);
      if (!onAbout && key !== "about") {
        const btn = document.querySelector(`#countries button[data-c="${key}"]`);
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    });
  });
  themeBtn.addEventListener("click", () => {
    const headerToggle = document.getElementById("tm");
    if (headerToggle) {
      headerToggle.click();
      return;
    }
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    safeSet("theme", next);
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    renderDock();
  });
  window.renderDock = renderDock;
  renderDock();
  if (window.ResizeObserver) new ResizeObserver(reserve).observe(dock);
  window.addEventListener("resize", reserve);
})();
