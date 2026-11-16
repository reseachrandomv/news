/* Swap the site name and logo in this file only.
   1) Change BRAND.name (English) and BRAND.nameDv (Dhivehi).
   2) Replace logo-mark.svg (or point BRAND.logo at a new SVG in this folder).
   Header, About, document title, favicon, and the --brand-logo CSS variable all read from here. */
window.BRAND = {
  name: "Raajjé Digest",
  nameDv: "ރާއްޖެ ޑައިޖެސްޓް",
  logo: "logo-mark.svg"
};
(function applyBrand() {
  const b = window.BRAND;
  if (!b) return;
  try {
    if (b.logo) {
      document.documentElement.style.setProperty("--brand-logo", 'url("' + b.logo + '")');
      document.querySelectorAll("link[rel='icon']").forEach(function (l) { l.setAttribute("href", b.logo); });
      document.querySelectorAll("[data-brand-logo]").forEach(function (img) { img.setAttribute("src", b.logo); });
    }
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
})();
