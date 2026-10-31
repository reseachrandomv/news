"""Fetch free public RSS feeds into data/news.json (stdlib only)."""
import json, re, html, sys, urllib.request, concurrent.futures as cf
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

FEEDS = [  # (source, country, category, url)
 ("Daily Mail","UK","Top stories","https://www.dailymail.com/home/index.rss"),
 ("Daily Mail","World","World","https://www.dailymail.com/news/worldnews/index.rss"),
 ("Daily Mail","World","Science & Tech","https://www.dailymail.com/sciencetech/index.rss"),
 ("BBC News","UK","Top stories","https://feeds.bbci.co.uk/news/uk/rss.xml"),
 ("BBC News","World","World","https://feeds.bbci.co.uk/news/world/rss.xml"),
 ("BBC News","World","Science & Tech","https://feeds.bbci.co.uk/news/technology/rss.xml"),
 ("The Guardian","World","World","https://www.theguardian.com/world/rss"),
 ("Al Jazeera","World","World","https://www.aljazeera.com/xml/rss/all.xml"),
 ("NPR","USA","Top stories","https://feeds.npr.org/1001/rss.xml"),
 ("Sun.mv","Maldives","Top stories","https://sun.mv/feed"),
 ("Mihaaru English","Maldives","Top stories","https://en.mihaaru.com/rss"),
 ("Dhauru","Maldives","Top stories","https://dhauru.com/feed"),
 ("Google News","Maldives","Top stories","https://news.google.com/rss/search?q=Maldives&hl=en-MV&gl=MV&ceid=MV:en"),
 ("The Verge","Tech","Gadgets","https://www.theverge.com/rss/index.xml"),
 ("Engadget","Tech","Gadgets","https://www.engadget.com/rss.xml"),
 ("GSMArena","Tech","Phones","https://www.gsmarena.com/rss-news-reviews.php3"),
 ("TechCrunch","Tech","Tech","https://techcrunch.com/feed/"),
 ("Ars Technica","Tech","Gadgets","https://feeds.arstechnica.com/arstechnica/gadgets"),
 ("Maldives National University","Courses","Announcements","https://mnu.edu.mv/feed/"),
 ("Google News","Courses","Courses & admissions","https://news.google.com/rss/search?q=Maldives+course+OR+admission+OR+scholarship+OR+school+announcement&hl=en-MV&gl=MV&ceid=MV:en"),
 ("Google News","Courses","Education","https://news.google.com/rss/search?q=Maldives+education+OR+university+OR+scholarship&hl=en&gl=US&ceid=US:en"),
 ("Atoll Times","Maldives","Top stories","https://atolltimes.mv/feed"),
 ("Corporate Maldives","Maldives","Business","https://corporatemaldives.com/feed/"),
 ("The Hindu","India","Top stories","https://www.thehindu.com/news/national/feeder/default.rss"),
 ("Times of India","India","Top stories","https://timesofindia.indiatimes.com/rssfeedstopstories.cms"),
 ("Daily Mirror LK","Sri Lanka","Top stories","https://www.dailymirror.lk/rss/breaking-news/108"),
 ("Newswire LK","Sri Lanka","Top stories","https://www.newswire.lk/feed/"),
 ("Gulf News","UAE","Top stories","https://gulfnews.com/feed"),
 ("ABC News AU","Australia","Top stories","https://www.abc.net.au/news/feed/51120/rss.xml"),
 ("Dawn","Pakistan","Top stories","https://www.dawn.com/feeds/home"),
]
MAX_ITEMS, PER_FEED, MV_PER_FEED, MV_QUOTA = 330, 15, 25, 80
MEDIA = "{http://search.yahoo.com/mrss/}"

def clean(t, n=220):
    t = html.unescape(re.sub(r"<[^>]+>", " ", t or ""))
    t = re.sub(r"\s+", " ", t).strip()
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "…"

def when(s):
    if not s: return None
    try: d = parsedate_to_datetime(s)
    except Exception:
        try: d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception: return None
    if d.tzinfo is None: d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc).isoformat()

def image(it):
    for tag in (MEDIA+"thumbnail", MEDIA+"content", "enclosure"):
        for e in it.iter(tag):
            u = e.get("url")
            if u and (tag != "enclosure" or "image" in (e.get("type") or "image")): return u
    m = re.search(r'<img[^>]+src="([^"]+)"', it.findtext("description") or "")
    return m.group(1) if m else None

def fetch(f):
    src, country, cat, url = f
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (News RSS reader)"})
    try: raw = urllib.request.urlopen(req, timeout=20).read()
    except Exception:
        import subprocess
        raw = subprocess.run(["curl", "-sL", "-m", "20", "-A", "Mozilla/5.0", url], capture_output=True, check=True).stdout
    root = ET.fromstring(raw.strip())
    out = []
    A = "{http://www.w3.org/2005/Atom}"
    entries = list(root.iter("item")) or list(root.iter(A+"entry"))
    for it in entries:
        if it.tag == A+"entry":
            for c in list(it):
                t = c.tag.replace(A, "")
                if t == "link" and not it.find("link") is not None: pass
            ln = it.find(A+"link"); e = ET.SubElement(it, "link"); e.text = ln.get("href") if ln is not None else ""
            for a, b in (("title","title"),("summary","description"),("updated","pubDate")):
                v = it.findtext(A+a) or (it.findtext(A+"content") if a == "summary" else None)
                if v: ET.SubElement(it, b).text = v
        title, link = clean(it.findtext("title"), 200), (it.findtext("link") or "").strip()
        if not title or not link: continue
        s2 = src
        if src == "Google News":
            s2 = (it.findtext("source") or "Google News").strip()
            title = re.sub(r"\s+-\s+" + re.escape(s2) + r"$", "", title)
        out.append(dict(title=title, link=link, source=s2, country=country, category=cat,
                        summary="" if country == "Courses" else clean(it.findtext("description")), image=image(it),
                        published=when(it.findtext("pubDate") or it.findtext("{http://purl.org/dc/elements/1.1/}date"))))
        if len(out) >= (MV_PER_FEED if country in ("Maldives","Courses") else PER_FEED): break
    return out

def main():
    items, report = [], []
    with cf.ThreadPoolExecutor(8) as ex:
        for f, fut in [(f, ex.submit(fetch, f)) for f in FEEDS]:
            try: r = fut.result(); items += r; report.append(f"OK   {len(r):3} {f[0]} [{f[1]}] {f[3]}")
            except Exception as e: report.append(f"FAIL     {f[0]} [{f[1]}] {f[3]} -> {type(e).__name__}: {e}")
    seen, uniq = set(), []
    items.sort(key=lambda i: i["published"] or "", reverse=True)
    for i in items:
        k = (re.sub(r"[?#].*", "", i["link"]), i["title"].lower())
        if k[0] in seen or k[1] in seen: continue
        seen.update(k); uniq.append(i)
    # keep balance: guarantee each country some slots, then fill by recency
    by = {}
    for i in uniq: by.setdefault(i["country"], []).append(i)
    keep = [i for v in by.values() for i in v[:(MV_QUOTA if v[0]["country"] == "Maldives" else 40 if v[0]["country"] in ("Tech","Courses") else 10)]]
    rest = [i for i in uniq if i not in keep]
    keep = (keep + rest)[:MAX_ITEMS]
    keep.sort(key=lambda i: i["published"] or "", reverse=True)
    json.dump({"updated": datetime.now(timezone.utc).isoformat(), "items": keep},
              open("data/news.json", "w"), ensure_ascii=False, indent=1)
    print("\n".join(report)); print(f"Saved {len(keep)} items")

if __name__ == "__main__": main()
