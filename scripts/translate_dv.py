"""Add Dhivehi machine translations (title_dv / summary_dv) to English stories in data/news.json.
Free Google Translate web endpoints, stdlib only. Each story is translated once and cached in
data/translations.json keyed by a hash of its link. Failures are skipped (site falls back to English)."""
import json, hashlib, re, time, urllib.request, urllib.parse
THAANA = re.compile(r"[\u0780-\u07BF]")
CACHE, NEWS, MAX_NEW = "data/translations.json", "data/news.json", 200
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}

def _get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))

def translate(texts):
    q = "&".join("q=" + urllib.parse.quote(t) for t in texts)
    try:
        out = _get("https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=dv&" + q)
        out = [o if isinstance(o, str) else o[0] for o in out]
        if len(out) == len(texts): return out
    except Exception: pass
    res = []
    for t in texts:  # fallback endpoint, one at a time
        d = _get("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=dv&dt=t&q=" + urllib.parse.quote(t))
        res.append("".join(s[0] for s in d[0] if s and s[0]))
    return res

def main():
    try: cache = json.load(open(CACHE, encoding="utf-8"))
    except Exception: cache = {}
    data = json.load(open(NEWS, encoding="utf-8"))
    new = fail = 0
    for it in data["items"]:
        if THAANA.search(it.get("title", "")): continue
        k = hashlib.sha1(it["link"].encode()).hexdigest()[:16]
        if k not in cache and new < MAX_NEW and fail < 5:
            texts = [it["title"]] + ([it["summary"]] if it.get("summary") else [])
            try:
                tr = translate(texts); cache[k] = {"t": tr[0], "s": tr[1] if len(tr) > 1 else ""}; new += 1
                time.sleep(0.3)
            except Exception as e:
                fail += 1; print("translate failed:", type(e).__name__)
        if k in cache and THAANA.search(cache[k]["t"]):
            it["title_dv"] = cache[k]["t"]
            if cache[k]["s"]: it["summary_dv"] = cache[k]["s"]
    live = {hashlib.sha1(i["link"].encode()).hexdigest()[:16] for i in data["items"]}
    cache = {k: v for k, v in cache.items() if k in live}
    json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    json.dump(data, open(NEWS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Translated {new} new stories; {sum('title_dv' in i for i in data['items'])} have Dhivehi")

if __name__ == "__main__": main()
