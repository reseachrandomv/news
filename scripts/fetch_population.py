"""World Bank open API -> data/population.json (stdlib only)."""
import json, urllib.request
from datetime import datetime, timezone
API = "https://api.worldbank.org/v2/country/{c}/indicator/{i}?format=json&mrnev=1&per_page=400"
def get(c, i):
    d = json.load(urllib.request.urlopen(API.format(c=c, i=i), timeout=30))[1] or []
    return d
def one(c, i):
    r = get(c, i)[0]; return {"value": r["value"], "year": int(r["date"])}
AGG = "WLD"
out = {"source": "World Bank Open Data (World Development Indicators, based on UN World Population Prospects)",
       "source_url": "https://data.worldbank.org/indicator/SP.POP.TOTL", "fetched": datetime.now(timezone.utc).isoformat()}
out["world"] = {k: one("WLD", i) for k, i in (("pop","SP.POP.TOTL"),("growth","SP.POP.GROW"),("birth_rate","SP.DYN.CBRT.IN"),("death_rate","SP.DYN.CDRT.IN"),("life_exp","SP.DYN.LE00.IN"),("urban_pct","SP.URB.TOTL.IN.ZS"))}
out["maldives"] = {k: one("MDV", i) for k, i in (("pop","SP.POP.TOTL"),("growth","SP.POP.GROW"))}
rows = [r for r in get("all", "SP.POP.TOTL") if r["value"] and r["countryiso3code"] and len(r["countryiso3code"]) == 3]
meta = json.load(urllib.request.urlopen("https://api.worldbank.org/v2/country?format=json&per_page=400", timeout=30))[1]
real = {m["id"] for m in meta if m["region"]["value"] != "Aggregates"}
rows = sorted([r for r in rows if r["countryiso3code"] in real], key=lambda r: -r["value"])[:10]
out["top"] = [{"name": r["country"]["value"], "pop": r["value"], "year": int(r["date"])} for r in rows]
try:
    old = json.load(open("data/population.json"))
except Exception:
    old = {}
if len(out["top"]) < 5 and len(old.get("top") or []) >= 5:
    out["top"] = old["top"]
if len(out["top"]) < 5:
    raise SystemExit("top countries list incomplete; keeping old file")
json.dump(out, open("data/population.json", "w"), indent=1)
print("population ok", out["world"]["pop"], [t["name"] for t in out["top"]])
