/* Interface strings. To add a language: add a block with the same keys, and its code to LANGS. */
const LANGS={en:{label:"English",dir:"ltr"},dv:{label:"ދިވެހި",dir:"rtl"}};
const STR={
en:{site:"Malaak's News",madeBy:"Made by Fathimath Malaak Jaufar",light:"Light mode",dark:"Dark mode",toLight:"Switch to light mode",toDark:"Switch to dark mode",
 textSize:"Text size",smaller:"Make text smaller",larger:"Make text larger",reset:"Reset text size (now {p}%)",langBtn:"ދިވެހި",langAria:"Switch language to Dhivehi",about:"About",
 chooseTab:"Choose a section",loading:"Loading headlines…",loadFail:"Could not load news. Please try again.",empty:"No stories here right now.",
 tabNews:"{c} news",readAt:"Read at {s} →",minAgo:"{n} min ago",hAgo:"{n} h ago",
 filter:"Show",fAll:"All",fDv:"Dhivehi news only",
 contact:"Contact:",email:"Email",srcNote:"Headlines and links come from each outlet's public RSS feed or headline page (Sun, Mihaaru, Avas, Edition, Raajje); full stories belong to the named source.",
 updated:"Updated {t}. Refreshes every 30 minutes.",
 popTitle:"World Population",popLive:"World population (live estimate)",popBirths:"Births this year (estimate)",popDeaths:"Deaths this year (estimate)",popGrowth:"Population growth this year (estimate)",
 popNote:"These are <strong>estimates</strong>, not exact counts. They start from the World Bank's {y} figure ({b}) and add the {gy} growth rate ({g}% a year), birth rate ({br} per 1,000) and death rate ({dr} per 1,000).",
 source:"Source:",mvPop:"Maldives population (World Bank, {y})",mvGrowth:"Growth {g}% a year ({y}).",other:"Other facts (World Bank, {y})",life:"Life expectancy worldwide:",years:"years",urban:"People living in cities:",top:"Most populated countries (World Bank, {y})",
 tabs:{Maldives:"Maldives",Courses:"Courses & Announcements",Tech:"Tech & Gadgets",Science:"Science & Discoveries",Population:"World Population",World:"World",UK:"UK",USA:"USA",India:"India","Sri Lanka":"Sri Lanka",Pakistan:"Pakistan",UAE:"UAE",Australia:"Australia"},
 cats:{}},
dv:{site:"މަލާކްގެ ޚަބަރު",madeBy:"ހެދީ: ފާތިމަތު މަލާކް ޖައުފަރު",light:"ލައިޓް މޯޑް",dark:"ޑާކް މޯޑް",toLight:"ލައިޓް މޯޑަށް ބަދަލުކުރޭ",toDark:"ޑާކް މޯޑަށް ބަދަލުކުރޭ",
 textSize:"އަކުރުގެ ސައިޒު",smaller:"އަކުރު ކުޑަކުރޭ",larger:"އަކުރު ބޮޑުކުރޭ",reset:"އަކުރުގެ ސައިޒު އަސްލަށް ގެނޭ (މިހާރު {p}%)",langBtn:"English",langAria:"Switch language to English",about:"ތަޢާރަފު",
 chooseTab:"ބައެއް ހޮވާ",loading:"ސުރުޚީތައް ލޯޑުވަނީ…",loadFail:"ޚަބަރުތައް ލޯޑެއް ނުވި. އަލުން މަސައްކަތްކޮށްލައްވާ.",empty:"މިވަގުތު މިބައިގައި ޚަބަރެއް ނެތް.",
 tabNews:"{c} ޚަބަރު",readAt:"{s} ގައި ކިޔާލާ ←",minAgo:"{n} މިނިޓު ކުރިން",hAgo:"{n} ގަޑިއިރު ކުރިން",
 filter:"ދައްކާ",fAll:"ހުރިހާ ޚަބަރެއް",fDv:"ދިވެހި ޚަބަރު އެކަނި",
 contact:"ގުޅުއްވުމަށް:",email:"އީމެއިލް",srcNote:"ސުރުޚީތަކާއި ލިންކުތައް ނަގަނީ ކޮންމެ ނޫހެއްގެ ޢާއްމު RSS ފީޑު ނުވަތަ ސުރުޚީގެ ޞަފްޙާއިން (ސަން، މިހާރު، އަވަސް، އެޑިޝަން، ރާއްޖެ). ފުރިހަމަ ޚަބަރުތައް ނިސްބަތްވަނީ އެ ނޫސްތަކަށް.",
 updated:"އަޕްޑޭޓްކުރީ {t}. ކޮންމެ 30 މިނިޓަކުން އާވޭ.",
 popTitle:"ދުނިޔޭގެ އާބާދީ",popLive:"ދުނިޔޭގެ އާބާދީ (ލައިވް އަންދާޒާ)",popBirths:"މިއަހަރު އުފަންވި ކުދިން (އަންދާޒާ)",popDeaths:"މިއަހަރު މަރުވި މީހުން (އަންދާޒާ)",popGrowth:"މިއަހަރު އާބާދީ އިތުރުވި މިންވަރު (އަންދާޒާ)",
 popNote:"މިއީ <strong>އަންދާޒާ</strong>، ސީދާ އަދަދުތަކެއް ނޫން. ވޯލްޑް ބޭންކުގެ {y} ވަނަ އަހަރުގެ އަދަދު ({b}) އިން ފަށައިގެން، {gy} ގެ ކުރިއެރުމުގެ ރޭޓު (އަހަރަކު {g}%)، އުފަންވުމުގެ ރޭޓު (1,000 އަކަށް {br}) އަދި މަރުވުމުގެ ރޭޓު (1,000 އަކަށް {dr}) ބޭނުންކޮށްގެން ހިސާބުކުރެވިފައި.",
 source:"މަސްދަރު:",mvPop:"ދިވެހިރާއްޖޭގެ އާބާދީ (ވޯލްޑް ބޭންކް، {y})",mvGrowth:"އަހަރަކު {g}% އިތުރުވޭ ({y}).",other:"އެހެނިހެން މަޢުލޫމާތު (ވޯލްޑް ބޭންކް، {y})",life:"ދުނިޔޭގެ އާއްމު އުމުރު:",years:"އަހަރު",urban:"ސިޓީތަކުގައި ދިރިއުޅޭ މީހުން:",top:"އެންމެ ގިނަ އާބާދީ ހުރި ޤައުމުތައް (ވޯލްޑް ބޭންކް، {y})",
 tabs:{Maldives:"ދިވެހިރާއްޖެ",Courses:"ކޯސްތަކާއި އިޢުލާންތައް",Tech:"ޓެކް އަދި ގެޖެޓްސް",Science:"ސައިންސާއި ހޯދުންތައް",Population:"ދުނިޔޭގެ އާބާދީ",World:"ދުނިޔެ",UK:"ޔޫކޭ",USA:"އެމެރިކާ",India:"އިންޑިއާ","Sri Lanka":"ސްރީ ލަންކާ",Pakistan:"ޕާކިސްތާން",UAE:"ޔޫއޭއީ",Australia:"އޮސްޓްރޭލިއާ"},
 cats:{"Top stories":"މުހިއްމު ޚަބަރު",World:"ދުނިޔެ","Science & Tech":"ސައިންސް އަދި ޓެކް",Gadgets:"ގެޖެޓްސް",Phones:"ފޯނު",Tech:"ޓެކް",Announcements:"އިޢުލާން","Courses & admissions":"ކޯސް އަދި އެޑްމިޝަން",Education:"ތަޢުލީމު",UK:"ޔޫކޭ",Discoveries:"ހޯދުންތައް",Space:"ޖައްވު",Business:"ވިޔަފާރި"}}
};
let LANG=LANGS[localStorage.lang]?localStorage.lang:"en";
function t(k,v){let s=(STR[LANG][k]??STR.en[k]??k);for(const x in v||{})s=s.split("{"+x+"}").join(v[x]);return s}
function setLangAttrs(){const h=document.documentElement;h.lang=LANG;h.dir=LANGS[LANG].dir}
setLangAttrs();
