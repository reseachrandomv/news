/* Swap the site name in this file.
   The Dawnline mark is an inline SVG in the header and About page.
   Its glass-sun gradients follow CSS variables (--logo-*) so one mark
   recolours for light and dark. Favicon stays an SVG, with PNG fallbacks
   for older browsers and apple-touch. */
window.BRAND = {
  name: "Dawnline",
  nameDv: "ޑޯންލައިން",
  favicon: "dawnline-favicon.svg"
};

const UI_ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  star: '<path d="M12 3.2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.6 7.2 18.1l.9-5.4-3.9-3.8 5.4-.8z"/>',
  sparkle: '<path d="M12 3l1.15 5.15L18 9.3l-4.85 1.15L12 15.6l-1.15-5.15L6 9.3l4.85-1.15z"/><path d="M18.6 14.7l.55 2.2 2.2.55-2.2.55-.55 2.2-.55-2.2-2.2-.55 2.2-.55z"/>',
  chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
  chevronRight: '<path d="M9 5l7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
  maldives: '<circle cx="12" cy="8" r="3"/><path d="M3 15.5c2.1-2 3.4-2 5.5 0s3.4 2 5.5 0 3.4-2 5.5 0"/><path d="M3 19.5c2.1-1.6 3.4-1.6 5.5 0s3.4 1.6 5.5 0 3.4-1.6 5.5 0"/>',
  globe: '<circle cx="12" cy="12" r="8"/><path d="M12 4c2.2 2.3 3.4 5 3.4 8s-1.2 5.7-3.4 8c-2.2-2.3-3.4-5-3.4-8s1.2-5.7 3.4-8zM4.2 12h15.6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17h2"/>',
  cap: '<path d="M3 10 12 5l9 5-9 5-9-5z"/><path d="M7 12.5v4.2c0 .7 2.2 2.3 5 2.3s5-1.6 5-2.3v-4.2"/><path d="M21 10v6"/>',
  flask: '<path d="M9 3h6M10 3v6L5.5 18a3 3 0 0 0 2.6 4.5h7.8a3 3 0 0 0 2.6-4.5L14 9V3"/>',
  contrast: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z"/>',
  type: '<path d="M5 19h14M8.5 15 12 6l3.5 9M9.7 12h4.6"/>',
  lang: '<circle cx="12" cy="12" r="8"/><path d="M4.2 9h15.6M4.2 15h15.6M12 4c2.5 2.8 3.8 5.8 3.8 8s-1.3 5.2-3.8 8c-2.5-2.8-3.8-5.8-3.8-8s1.3-5.2 3.8-8z"/>',
  sprout: '<path d="M12 21V11"/><path d="M12 14c-3-1-5-3.5-5-7 4 0 5 3 5 7z"/><path d="M12 13c3-1 5-3.2 5-6.5-3.5 0-5 2.8-5 6.5z"/>',
  sunset: '<path d="M4 18h16M6 15a6 6 0 0 1 12 0"/><path d="M12 9V6M8.2 10.2 6.5 8.5M15.8 10.2l1.7-1.7"/>',
  trend: '<path d="M4 17l5.5-5.5 3.5 3.5L20 7"/><path d="M14 7h6v6"/>'
};

window.uiIcon = function uiIcon(name, extraClass) {
  const d = UI_ICON_PATHS[name];
  if (!d) return "";
  const cls = "ui-icon ui-icon-" + name + (extraClass ? " " + extraClass : "");
  return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + d + "</svg>";
};

window.applyBrand = function applyBrand() {
  const b = window.BRAND;
  if (!b) return;
  try {
    if (b.favicon) {
      document.querySelectorAll("link[rel='icon'][type='image/svg+xml']").forEach(function (l) {
        l.setAttribute("href", b.favicon);
      });
    }
    document.querySelectorAll("[data-brand-logo]").forEach(function (el) {
      if (b.name) el.setAttribute("aria-label", b.name);
    });
    if (b.name) {
      document.querySelectorAll('meta[property="og:title"]').forEach(function (m) {
        m.setAttribute("content", b.name);
      });
      const title = document.title || "";
      const suffix = title.match(/(\s+[\u2013\u2014\-]\s+.*)$/);
      if (suffix) document.title = b.name + suffix[1];
      else if (/about\.html/i.test(location.pathname)) document.title = b.name + " \u2013 About";
      else if (title) document.title = b.name + " \u2013 Made by Fathimath Malaak Jaufar";
    }
  } catch (e) {}
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBrand);
  }
};
window.applyBrand();
