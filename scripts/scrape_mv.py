"""Polite headline scraper for Maldivian outlets without working RSS.
Only fetches one listing page per outlet per run, respects robots.txt,
stores headline + link + thumbnail only (no article text)."""
import re, html, json, subprocess, urllib.request, urllib.robotparser
from urllib.parse import urljoin, urlparse
from datetime import datetime, timezone, timedelta

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
# (source, country, category, listing url, article-link regex or "sitemap")
SITES = [
 ("PSM News", "Maldives", "Top stories", "https://psmnews.mv/", r"^https://psmnews\.mv/(?:en/)?\d{4,}"),
 ("Sun.mv", "Maldives", "Top stories", "https://sun.mv/", r"^https://sun\.mv/\d{5,}$"),
 ("Mihaaru", "Maldives", "Top stories", "https://mihaaru.com/sitemap-news.xml", "sitemap"),
 ("Avas", "Maldives", "Top stories", "https://avas.mv/", r"^https://avas\.mv/(?:en/)?\d{5,}$"),
 ("Edition.mv", "Maldives", "Top stories", "https://edition.mv/", r"^https://edition\.mv/[a-z_-]+/\d{4,}$"),
 ("Raajje.mv", "Maldives", "Top stories", "https://raajje.mv/", r"^https://raajje\.mv/(?:en/)?\d{5,}$"),
 ("Villa College", "Courses", "Announcements", "https://villacollege.edu.mv/media-center/news", r"^https://villacollege\.edu\.mv/(?!programmes|media-center)[a-z0-9-]{12,}/\d+$"),
 ("Islamic University of Maldives", "Courses", "Announcements", "https://www.ium.edu.mv/news", r"^https://www\.ium\.edu\.mv/news/\d+$"),
]
PER_SITE = 25

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en,dv;q=0.8"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")

def allowed(url):
    p = urlparse(url); rp = urllib.robotparser.RobotFileParser()
    try:
        txt = get(f"{p.scheme}://{p.netloc}/robots.txt")
        if "<html" in txt[:500].lower(): txt = ""  # 404 page / no robots -> allowed
        rp.parse(txt.splitlines())
    except urllib.error.HTTPError as e:
        if e.code in (401, 403): raise RuntimeError(f"robots.txt HTTP {e.code} (site blocks bots)")
        return True
    return rp.can_fetch(UA, url)

def text(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def from_sitemap(raw, src, country, cat):
    out = []
    for blk in re.findall(r"<url>(.*?)</url>", raw, re.S)[:PER_SITE]:
        loc = re.search(r"<loc>(.*?)</loc>", blk); t = re.search(r"<news:title>(.*?)</news:title>", blk, re.S)
        d = re.search(r"<news:publication_date>(.*?)</news:publication_date>", blk)
        if loc and t:
            pub = None
            if d:
                try: pub = datetime.fromisoformat(d.group(1).strip()).astimezone(timezone.utc).isoformat()
                except Exception: pass
            out.append(dict(title=text(re.sub(r"<!\[CDATA\[|\]\]>", "", t.group(1)))[:200], link=loc.group(1).strip(),
                            source=src, country=country, category=cat, summary="", image=None, published=pub))
    return out

def from_html(raw, base, pat, src, country, cat):
    found = {}
    raw = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    for m in re.finditer(r"<a\b([^>]*)>(.*?)</a>", raw, re.S | re.I):
        h = re.search(r'href=["\']([^"\']+)', m.group(1))
        if not h: continue
        link = re.sub(r"[?#].*", "", urljoin(base, html.unescape(h.group(1))))
        if not re.match(pat, link): continue
        inner = m.group(2)
        hd = re.search(r"<h[1-5][^>]*>(.*?)</h[1-5]>", inner, re.S)
        cands = [(3, text(hd.group(1)) if hd else ""), (2, text(inner))]
        ta = re.search(r'(?:title|aria-label)=["\']([^"\']{12,})', m.group(1)) or re.search(r'alt=["\']([^"\']{12,})', inner)
        if ta: cands.append((1, text(ta.group(1))))
        img = re.search(r'<img[^>]+?(?:data-src|src)=["\']([^"\']+)', inner) or re.search(r'srcset=["\']([^"\' ]+)', inner)
        e = found.setdefault(link, {"title": "", "score": 0, "image": None})
        for sc, t in cands:
            if 12 <= len(t) <= 250 and t.lower() not in ("featured image", "read more") and (sc > e["score"] or (sc == e["score"] and len(t) > len(e["title"]))):
                e["title"], e["score"] = t, sc; break
        if img and not e["image"] and not img.group(1).startswith("data:"): e["image"] = urljoin(base, html.unescape(img.group(1)))
    out = []
    for link, e in found.items():
        if src == "Raajje.mv": e["title"] = re.sub(r"^\d{1,2}\s+", "", e["title"])
        if len(e["title"]) < 12: continue
        out.append(dict(title=e["title"][:200], link=link, source=src, country=country, category=cat,
                        summary="", image=e["image"], published=None))
        if len(out) >= PER_SITE: break
    return out

def scrape(site):
    src, country, cat, url, pat = site
    if not allowed(url): raise RuntimeError("disallowed by robots.txt")
    try: raw = get(url)
    except urllib.error.HTTPError as e: raise RuntimeError(f"HTTP {e.code}" + (" (Cloudflare bot check)" if e.code in (403, 503) else ""))
    if "<title>Just a moment...</title>" in raw[:3000]: raise RuntimeError("Cloudflare bot check")
    items = from_sitemap(raw, src, country, cat) if pat == "sitemap" else from_html(raw, url, pat, src, country, cat)
    if not items: raise RuntimeError("no headlines found (page layout changed?)")
    return items

def scrape_all(previous=None):
    """previous: {link: published} from last run, so first-seen times stay stable."""
    previous = previous or {}
    now = datetime.now(timezone.utc).isoformat()
    items, report = [], []
    for s in SITES:
        try:
            r = scrape(s)
            for n, i in enumerate(r):  # undated listing: first-seen time, staggered by page order
                if not i["published"]:
                    i["published"] = previous.get(i["link"]) or (datetime.now(timezone.utc) - timedelta(minutes=15 * n)).isoformat()
            items += r; report.append(f"OK   {len(r):3} {s[0]} [scraped] {s[3]}")
        except Exception as e:
            report.append(f"FAIL     {s[0]} [scraped] {s[3]} -> {e}")
    return items, report

if __name__ == "__main__":
    it, rep = scrape_all(); print("\n".join(rep))
    for i in it[:60]: print(i["source"], "|", i["title"][:70], "|", i["link"], "|", bool(i["image"]))
