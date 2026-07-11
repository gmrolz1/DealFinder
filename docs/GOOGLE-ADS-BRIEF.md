# Google Ads Campaign Brief — egy.deals Developer Campaigns

> **Paste this whole file into the agency-ops Google Ads AI chat** (the one with
> the Google Ads API skills). It has everything needed to build + launch the
> campaigns via the API. Grounded in live egy.deals inventory as of 2026-07.

---

## 0. Your task (one line)

In Google Ads account **AW-18195355585 ("the deal makers", 386-792-3119)**, build and enable **mobile-only Arabic + English Search campaigns — one per developer** in the roster below, all optimizing to the **"Lead - egy.deals"** conversion, on a **10,000 EGP/day TOTAL shared budget**, **Maximize Conversions**. Each developer's ads point at that developer's own page on egy.deals.

---

## 1. Account + conversion linking — DO FIRST, then verify

- **Account:** `AW-18195355585` (the deal makers). Manager: the deal maker (686-056-4937).
- **Conversion action:** `Lead - egy.deals` — `send_to = AW-18195355585/NMfzCPzfrMUcEMGvnORD`.
  It already fires on the website for **every WhatsApp click, Call click, lead form submit, and AI-chat handoff** (routed through `/api/go` + `/api/lead`).
- **Verify before launch:**
  1. Conversion status = **Recording conversions** (not "No recent conversions" / inactive).
  2. Set it as a **Primary** conversion for the account/campaigns.
  3. **Enhanced Conversions for Leads = ON.**
  4. **Auto-tagging = ON** at account level — the site reads `gclid` (first-touch) into Supabase for offline import; without auto-tagging there is no gclid.
  5. Category: **Submit lead form / Contact**.
- **Final URL suffix / tracking:** keep `gclid` flowing — do not strip query params on the landing URLs. Auto-tagging handles it.
- **Offline Conversion Import (quality upgrade — set up after launch):** the website stores each lead's `gclid` + a `status` (`new` / `contacted` / `junk`) in Supabase. Upload **qualified** leads (status = contacted) back to Google Ads by `gclid` so Smart Bidding learns *real* leads, not clicks. The web project will expose a secured leads-export endpoint — **ask for `/api/leads-export` if you want to build the OCI feed.** This is the single biggest CPL lever once there's volume.

---

## 2. Global campaign settings — apply to EVERY campaign

| Setting | Value |
|---|---|
| Type | **Search** |
| Networks | **Google Search only** — Search Partners OFF, Display OFF |
| Devices | **MOBILE ONLY** — desktop bid adj **−100%**, tablet bid adj **−100%** |
| Locations | **Egypt** · target "presence: people in your targeted locations" |
| Languages | **Arabic + English** |
| Bidding | **Maximize Conversions**. Switch a campaign to **Target CPA** only after it logs ~30 conversions. Prefer a **portfolio (shared) strategy** across all campaigns so the 10k/day flows to the best performers. |
| Budget | **10,000 EGP/day TOTAL** via a **shared budget** (not 10k per campaign). |
| Ad rotation | Optimize |
| Match types | Start **Phrase + Exact**. Add **Broad** only once the conversion signal is live and OCI is feeding. |
| Ad schedule | All day (real-estate intent is 24/7); revisit after 2 weeks of data. |

**Budget reality:** 10k/day across 14 Wave-1 campaigns ≈ 700/day each — workable for Search. Do **not** launch all 42 at once (that's ~240/day each, too thin). Launch **Wave 1 (top ~14)** live, keep the rest **paused**, expand as CPL proves out.

---

## 3. Structure — repeat per developer

```
Campaign:  "DEV — <Developer> — Search — Mobile"
  Ad group (AR):  "<Developer> — AR"
     Final URL:   https://www.egy.deals/ar/developers/<slug>
     Keywords:    Arabic (phrase + exact) — developer + each top compound + area intent
     RSA (Arabic): up to 15 headlines (≤30 chars), 4 descriptions (≤90 chars)
  Ad group (EN):  "<Developer> — EN"
     Final URL:   https://www.egy.deals/developers/<slug>
     Keywords:    English (phrase + exact)
     RSA (English): up to 15 headlines (≤30 chars), 4 descriptions (≤90 chars)
```

The developer pages already carry the AI chat ("Layla") + WhatsApp/Call CTAs wired into the lead-rotation engine, so every landing is conversion-ready.

---

## 4. Keyword patterns (fill with each developer's compounds — seeds provided in §7)

**Arabic (phrase):**
`شقق للبيع في <منطقة>` · `<كمبوند> <مطور>` · `كمبوند <كمبوند>` · `<مطور> <منطقة>` · `شقق تقسيط <منطقة>` · `<كمبوند> اسعار` · `فيلات للبيع في <منطقة>` · `<مطور> كمبوندات`

**English (phrase):**
`apartments for sale in <area>` · `<compound> compound` · `<developer> <compound>` · `<developer> <area>` · `<compound> prices` · `installments <area>` · `villas for sale in <area>`

Keep each ad group's keywords to that developer's real compounds/areas only (relevance = Quality Score = lower CPL).

---

## 5. RSA angles — from the site's real deal hooks

Every developer page sells the same value; weave these into headlines/descriptions, always naming the **developer + a top compound + area + starting price**:

- From **5%–10% down** · installments **up to 8–15 years**
- **Primary units, developer-direct prices** (no resale)
- **Fully-finished** options · modern delivery
- **WhatsApp for the price list & payment plan**
- Starting from **`<fromPrice>`**

**Arabic RSA headline examples** (≤30 chars — validate):
`<مطور> العاصمة الإدارية` · `شقق تقسيط 15 سنة` · `مقدم 10% وتقسيط طويل` · `<كمبوند> بأفضل الأسعار` · `احجز وحدتك الآن` · `تواصل واتساب للأسعار`

**Arabic description examples** (≤90 chars):
`وحدات أولية من <مطور> في <منطقة>. مقدم من 10% وتقسيط حتى 15 سنة. راسلنا واتساب للأسعار.`

**English RSA headline examples** (≤30 chars):
`<Developer> — <Area>` · `From <fromPrice> · 10% Down` · `Up to 15-Yr Installments` · `<Compound> Best Prices` · `Primary Units, Direct` · `WhatsApp for Price List`

**English description examples** (≤90 chars):
`Primary units by <Developer> in <Area>. From 10% down, up to 15-yr plans. WhatsApp us for prices.`

Pin one "brand" headline (developer name) to position 1; let Google optimize the rest. Add **sitelinks** (compounds), **callouts** (Primary units, Flexible plans, Direct developer prices), and a **call extension** to the broker number.

---

## 6. Negative keywords (shared negative list)

**Arabic:** `ايجار` · `إيجار` · `للايجار` · `مفروش` · `ريسيل` · `وظائف` · `مطلوب` · `فرش` · `تمويل عقاري` · `مقاول`
**English:** `rent` · `rental` · `for rent` · `resale` · `jobs` · `careers` · `salary` · `furnished` · `wallpaper` · `second hand` · `used`

---

## 7. Wave 1 — launch these first (top 14 by live inventory)

Each block = landing URLs + real top compounds + starting price + grounded keyword seeds (AR + EN). Build the two ad groups per §3.

### Madinet Masr  ·  2823 units · from 1.9M
Landing: **AR** https://www.egy.deals/ar/developers/54-madinet-masr  ·  **EN** https://www.egy.deals/developers/54-madinet-masr
Top areas: New Cairo, New Heliopolis, Mostakbal City
Top compounds: Talala, ELM Tree - Sarai, The Butterfly, Club Views - Sarai, Esse Residence, D2N - Sarai

AR keyword seeds: `كمبوند طلاله` · `كمبوند ايلم ترى - سراى` · `كمبوند ذا بترفلاى` · `كمبوند كلوب فيوز - سراى` · `طلاله اسعار` · `ايلم ترى - سراى اسعار` · `ذا بترفلاى اسعار` · `شقق للبيع في القاهرة الجديدة` · `شقق للبيع في هيليوبوليس الجديدة` · `شقق تقسيط القاهرة الجديدة` · `شقق تقسيط هيليوبوليس الجديدة` · `مدينة نصر للاسكان القاهرة الجديدة` · `مدينة نصر للاسكان كمبوندات`
EN keyword seeds: `Talala compound` · `ELM Tree - Sarai compound` · `The Butterfly compound` · `Club Views - Sarai compound` · `Talala prices` · `ELM Tree - Sarai prices` · `The Butterfly prices` · `apartments for sale in New Cairo` · `apartments for sale in New Heliopolis` · `Madinet New Cairo` · `villas for sale in New Cairo` · `villas for sale in New Heliopolis`

### Palm Hills Developments  ·  2139 units · from 5.9M
Landing: **AR** https://www.egy.deals/ar/developers/16-palm-hills-developments  ·  **EN** https://www.egy.deals/developers/16-palm-hills-developments
Top areas: New Zayed, October Gardens, 6th of October City
Top compounds: Jirian-Phase One, PX-Phase One, Hacienda Waters, VILLAGE DE LA CAPITALE, VILLAGE DE LA CAPITALE-Phase 1, District 2 - Moon Heights

AR keyword seeds: `كمبوند جريان المرحلة الاولى` · `كمبوند بي إكس المرحلة الأولى` · `كمبوند هاسيندا ووترز` · `كمبوند فيلاج دو لا كابيتال` · `جريان المرحلة الاولى اسعار` · `بي إكس المرحلة الأولى اسعار` · `هاسيندا ووترز اسعار` · `شقق للبيع في الشيخ زايد الجديدة` · `شقق للبيع في حدائق اكتوبر` · `شقق تقسيط الشيخ زايد الجديدة` · `شقق تقسيط حدائق اكتوبر` · `بالم هيلز الشيخ زايد الجديدة` · `بالم هيلز كمبوندات`
EN keyword seeds: `Jirian-Phase One compound` · `PX-Phase One compound` · `Hacienda Waters compound` · `VILLAGE DE LA CAPITALE compound` · `Jirian-Phase One prices` · `PX-Phase One prices` · `Hacienda Waters prices` · `apartments for sale in New Zayed` · `apartments for sale in October Gardens` · `Palm New Zayed` · `villas for sale in New Zayed` · `villas for sale in October Gardens`

### City Edge Developments  ·  2099 units · from 4.1M
Landing: **AR** https://www.egy.deals/ar/developers/74-city-edge-developments  ·  **EN** https://www.egy.deals/developers/74-city-edge-developments
Top areas: Al Alamein, New Capital City, New Cairo
Top compounds: Mazarine, New Garden City, Il Latini City Edge, Mazarine Chalet Extension, Beach Front Towers, Lush Valley

AR keyword seeds: `كمبوند مزارين` · `كمبوند نيو جاردن سيتى` · `كمبوند الحي اللاتيني سيتي ايدج` · `كمبوند مزارين شاليه اكستنشن` · `مزارين اسعار` · `نيو جاردن سيتى اسعار` · `الحي اللاتيني سيتي ايدج اسعار` · `شقق للبيع في العلمين` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق تقسيط العلمين` · `شقق تقسيط العاصمة الإدارية الجديدة` · `سيتي ايدج العلمين` · `سيتي ايدج كمبوندات`
EN keyword seeds: `Mazarine compound` · `New Garden City compound` · `Il Latini City Edge compound` · `Mazarine Chalet Extension compound` · `Mazarine prices` · `New Garden City prices` · `Il Latini City Edge prices` · `apartments for sale in Al Alamein` · `apartments for sale in New Capital City` · `City Al Alamein` · `villas for sale in Al Alamein` · `villas for sale in New Capital City`

### Saudi Egyptian Developers (SED)  ·  1118 units · from 3.9M
Landing: **AR** https://www.egy.deals/ar/developers/87-saudi-egyptian-developers-sed  ·  **EN** https://www.egy.deals/developers/87-saudi-egyptian-developers-sed
Top areas: Al Alamein, 6th settlement, New Capital City
Top compounds: Il Latini SED, Tierra, Bleu Vert, Marina 8 By The Lake, Jayd, Central New Cairo

AR keyword seeds: `كمبوند SED الحي اللاتيني` · `كمبوند تييرا` · `كمبوند بلو فيرت` · `كمبوند مارينا 8 باى ذا ليك` · `SED الحي اللاتيني اسعار` · `تييرا اسعار` · `بلو فيرت اسعار` · `شقق للبيع في العلمين` · `شقق للبيع في التجمع السادس` · `شقق تقسيط العلمين` · `شقق تقسيط التجمع السادس` · `السعودية المصرية العلمين` · `السعودية المصرية كمبوندات`
EN keyword seeds: `Il Latini SED compound` · `Tierra compound` · `Bleu Vert compound` · `Marina 8 By The Lake compound` · `Il Latini SED prices` · `Tierra prices` · `Bleu Vert prices` · `apartments for sale in Al Alamein` · `apartments for sale in 6th settlement` · `Saudi Al Alamein` · `villas for sale in Al Alamein` · `villas for sale in 6th settlement`

### SODIC  ·  1020 units · from 9.5M
Landing: **AR** https://www.egy.deals/ar/developers/8-sodic  ·  **EN** https://www.egy.deals/developers/8-sodic
Top areas: Mostakbal City, New Zayed, Ras El Hekma
Top compounds: East Vale, Karmell New Zayed, Ogami Ras El Hekma, The Estates Residence, Aquamarine-June, Water Chalet - Ogami

AR keyword seeds: `كمبوند ايست فالى` · `كمبوند كارميل زايد الجديدة` · `كمبوند أوجامي رأس الحكمة` · `كمبوند استيتس ريزيدينس` · `ايست فالى اسعار` · `كارميل زايد الجديدة اسعار` · `أوجامي رأس الحكمة اسعار` · `شقق للبيع في مدينة المستقبل` · `شقق للبيع في الشيخ زايد الجديدة` · `شقق تقسيط مدينة المستقبل` · `شقق تقسيط الشيخ زايد الجديدة` · `سوديك مدينة المستقبل` · `سوديك كمبوندات`
EN keyword seeds: `East Vale compound` · `Karmell New Zayed compound` · `Ogami Ras El Hekma compound` · `The Estates Residence compound` · `East Vale prices` · `Karmell New Zayed prices` · `Ogami Ras El Hekma prices` · `apartments for sale in Mostakbal City` · `apartments for sale in New Zayed` · `SODIC Mostakbal City` · `villas for sale in Mostakbal City` · `villas for sale in New Zayed`

### Mountain View  ·  971 units · from 8.2M
Landing: **AR** https://www.egy.deals/ar/developers/6-mountain-view  ·  **EN** https://www.egy.deals/developers/6-mountain-view
Top areas: Sidi Abdel Rahman, Mostakbal City, New Zayed
Top compounds: Kin Island-Crysta, Jirian - Mountain View, Lagoon Beach Park Mountain View I-City October, Lagoon Beach Park - Aliva, Club Park - ICity October, The Greens

AR keyword seeds: `كمبوند كين ايلاند-كريستا` · `كمبوند جريان - ماونتن فيو` · `كمبوند لاجون بيتش بارك ماونتن فيو اي سيتي اكتوبر` · `كمبوند لاجون بيتش بارك` · `كين ايلاند-كريستا اسعار` · `جريان - ماونتن فيو اسعار` · `لاجون بيتش بارك ماونتن فيو اي سيتي اكتوبر اسعار` · `شقق للبيع في سيدي عبد الرحمن` · `شقق للبيع في مدينة المستقبل` · `شقق تقسيط سيدي عبد الرحمن` · `شقق تقسيط مدينة المستقبل` · `ماونتن فيو سيدي عبد الرحمن` · `ماونتن فيو كمبوندات`
EN keyword seeds: `Kin Island-Crysta compound` · `Jirian - Mountain View compound` · `Lagoon Beach Park Mountain View I-City October compound` · `Lagoon Beach Park - Aliva compound` · `Kin Island-Crysta prices` · `Jirian - Mountain View prices` · `Lagoon Beach Park Mountain View I-City October prices` · `apartments for sale in Sidi Abdel Rahman` · `apartments for sale in Mostakbal City` · `Mountain Sidi Abdel Rahman` · `villas for sale in Sidi Abdel Rahman` · `villas for sale in Mostakbal City`

### Tatweer Misr  ·  757 units · from 6.0M
Landing: **AR** https://www.egy.deals/ar/developers/33-tatweer-misr  ·  **EN** https://www.egy.deals/developers/33-tatweer-misr
Top areas: Ain Sokhna, Ras El Hekma, Mostakbal City
Top compounds: Elva - Il Monte Galala, Salt, Maesta Il Monte Galala, Maesta Towers-Il Mont Glala, M Residence, Lakeside-Bloomfields

AR keyword seeds: `كمبوند الفا - المونت جلالة` · `كمبوند سولت` · `كمبوند مايستا المونت جلالة` · `كمبوند مايستا تاورز-المونت جلالة` · `الفا - المونت جلالة اسعار` · `سولت اسعار` · `مايستا المونت جلالة اسعار` · `شقق للبيع في العين السخنة` · `شقق للبيع في رأس الحكمة` · `شقق تقسيط العين السخنة` · `شقق تقسيط رأس الحكمة` · `تطوير مصر العين السخنة` · `تطوير مصر كمبوندات`
EN keyword seeds: `Elva - Il Monte Galala compound` · `Salt compound` · `Maesta Il Monte Galala compound` · `Maesta Towers-Il Mont Glala compound` · `Elva - Il Monte Galala prices` · `Salt prices` · `Maesta Il Monte Galala prices` · `apartments for sale in Ain Sokhna` · `apartments for sale in Ras El Hekma` · `Tatweer Ain Sokhna` · `villas for sale in Ain Sokhna` · `villas for sale in Ras El Hekma`

### PRE Group  ·  691 units · from 4.1M
Landing: **AR** https://www.egy.deals/ar/developers/111-pre-group  ·  **EN** https://www.egy.deals/developers/111-pre-group
Top areas: New Cairo, Ain Sokhna, El Sheikh Zayed
Top compounds: Ivoire East, The Brooks, Selection - Telal East, Ivoire West, Jebal El Sokhna, Covaya

AR keyword seeds: `كمبوند ايفورى القاهرة الجديدة` · `كمبوند ذا بروكس` · `كمبوند تلال ايست - سيليكشن` · `كمبوند ايفورى ويست` · `ايفورى القاهرة الجديدة اسعار` · `ذا بروكس اسعار` · `تلال ايست - سيليكشن اسعار` · `شقق للبيع في القاهرة الجديدة` · `شقق للبيع في العين السخنة` · `شقق تقسيط القاهرة الجديدة` · `شقق تقسيط العين السخنة` · `بي ار اي القاهرة الجديدة` · `بي ار اي كمبوندات`
EN keyword seeds: `Ivoire East compound` · `The Brooks compound` · `Selection - Telal East compound` · `Ivoire West compound` · `Ivoire East prices` · `The Brooks prices` · `Selection - Telal East prices` · `apartments for sale in New Cairo` · `apartments for sale in Ain Sokhna` · `PRE New Cairo` · `villas for sale in New Cairo` · `villas for sale in Ain Sokhna`

### Lasirena Group  ·  621 units · from 3.3M
Landing: **AR** https://www.egy.deals/ar/developers/215-lasirena-group  ·  **EN** https://www.egy.deals/developers/215-lasirena-group
Top areas: Ain Sokhna, Ras Sudr, Al Dabaa
Top compounds: Cape Bay Blumar Lasirena, Lasirena Bay, Lasirena North Coast, Lasirena Palm Beach

AR keyword seeds: `كمبوند كايب باي بلومار لا سيرينا` · `كمبوند لاسيرينا باي` · `كمبوند لاسيرينا الساحل الشمالي` · `كمبوند لا سيرينا بالم بيتش` · `كايب باي بلومار لا سيرينا اسعار` · `لاسيرينا باي اسعار` · `لاسيرينا الساحل الشمالي اسعار` · `شقق للبيع في العين السخنة` · `شقق للبيع في راس سدر` · `شقق تقسيط العين السخنة` · `شقق تقسيط راس سدر` · `لاسيرينا العين السخنة` · `لاسيرينا كمبوندات`
EN keyword seeds: `Cape Bay Blumar Lasirena compound` · `Lasirena Bay compound` · `Lasirena North Coast compound` · `Lasirena Palm Beach compound` · `Cape Bay Blumar Lasirena prices` · `Lasirena Bay prices` · `Lasirena North Coast prices` · `apartments for sale in Ain Sokhna` · `apartments for sale in Ras Sudr` · `Lasirena Ain Sokhna` · `villas for sale in Ain Sokhna` · `villas for sale in Ras Sudr`

### Al Ahly Sabbour Developments  ·  538 units · from 4.7M
Landing: **AR** https://www.egy.deals/ar/developers/191-al-ahly-sabbour-developments  ·  **EN** https://www.egy.deals/developers/191-al-ahly-sabbour-developments
Top areas: Mostakbal City, New Cairo, Ras El Hekma
Top compounds: The Mornings, Roofscape - At East, Youd, At East, everyday - THE MORNINGS, The RIDGE Villas

AR keyword seeds: `كمبوند ذا مورنينجز` · `كمبوند رووف اسكاب - ات ايست` · `كمبوند يود` · `كمبوند ات ايست` · `ذا مورنينجز اسعار` · `رووف اسكاب - ات ايست اسعار` · `يود اسعار` · `شقق للبيع في مدينة المستقبل` · `شقق للبيع في القاهرة الجديدة` · `شقق تقسيط مدينة المستقبل` · `شقق تقسيط القاهرة الجديدة` · `الاهلي صبور مدينة المستقبل` · `الاهلي صبور كمبوندات`
EN keyword seeds: `The Mornings compound` · `Roofscape - At East compound` · `Youd compound` · `At East compound` · `The Mornings prices` · `Roofscape - At East prices` · `Youd prices` · `apartments for sale in Mostakbal City` · `apartments for sale in New Cairo` · `Al Mostakbal City` · `villas for sale in Mostakbal City` · `villas for sale in New Cairo`

### Sky AD Developments  ·  435 units · from 3.7M
Landing: **AR** https://www.egy.deals/ar/developers/121-sky-ad-developments  ·  **EN** https://www.egy.deals/developers/121-sky-ad-developments
Top areas: New Cairo, New Capital City, Sidi Heneish
Top compounds: Bluetree, Capital avenue, Blue Walk, Sky North, Residence Eight Sky Abu Dhabi, Vallis

AR keyword seeds: `كمبوند بلوتري` · `كمبوند كابيتال افينيو` · `كمبوند بلو ووك` · `كمبوند سكاى نورث` · `بلوتري اسعار` · `كابيتال افينيو اسعار` · `بلو ووك اسعار` · `شقق للبيع في القاهرة الجديدة` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق تقسيط القاهرة الجديدة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `سكاي القاهرة الجديدة` · `سكاي كمبوندات`
EN keyword seeds: `Bluetree compound` · `Capital avenue compound` · `Blue Walk compound` · `Sky North compound` · `Bluetree prices` · `Capital avenue prices` · `Blue Walk prices` · `apartments for sale in New Cairo` · `apartments for sale in New Capital City` · `Sky New Cairo` · `villas for sale in New Cairo` · `villas for sale in New Capital City`

### Orascom Development Egypt  ·  423 units · from 7.2M
Landing: **AR** https://www.egy.deals/ar/developers/35-orascom-development-egypt  ·  **EN** https://www.egy.deals/developers/35-orascom-development-egypt
Top areas: October Gardens, 6th of October City, El Gouna
Top compounds: O Views, Core, Parkside - Owest, Midyard, Tuban El Gouna, Aden

AR keyword seeds: `كمبوند او فيوز` · `كمبوند كور` · `كمبوند بارك سايد - أو ويست` · `كمبوند ميديارد` · `او فيوز اسعار` · `كور اسعار` · `بارك سايد - أو ويست اسعار` · `شقق للبيع في حدائق اكتوبر` · `شقق للبيع في مدينة السادس من أكتوبر` · `شقق تقسيط حدائق اكتوبر` · `شقق تقسيط مدينة السادس من أكتوبر` · `اوراسكوم حدائق اكتوبر` · `اوراسكوم كمبوندات`
EN keyword seeds: `O Views compound` · `Core compound` · `Parkside - Owest compound` · `Midyard compound` · `O Views prices` · `Core prices` · `Parkside - Owest prices` · `apartments for sale in October Gardens` · `apartments for sale in 6th of October City` · `Orascom October Gardens` · `villas for sale in October Gardens` · `villas for sale in 6th of October City`

### New Plan  ·  418 units · from 3.1M
Landing: **AR** https://www.egy.deals/ar/developers/136-new-plan  ·  **EN** https://www.egy.deals/developers/136-new-plan
Top areas: El Lotus, New Capital City
Top compounds: Amara, Talah, Atika, Tonino Lamborghini Residences, Granvia Mall Serrano, Eleven

AR keyword seeds: `كمبوند امارا` · `كمبوند طله` · `كمبوند أتيكا` · `كمبوند تونينو لامبورجيني ريزيدنس` · `امارا اسعار` · `طله اسعار` · `أتيكا اسعار` · `شقق للبيع في اللوتس` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق تقسيط اللوتس` · `شقق تقسيط العاصمة الإدارية الجديدة` · `نيو بلان اللوتس` · `نيو بلان كمبوندات`
EN keyword seeds: `Amara compound` · `Talah compound` · `Atika compound` · `Tonino Lamborghini Residences compound` · `Amara prices` · `Talah prices` · `Atika prices` · `apartments for sale in El Lotus` · `apartments for sale in New Capital City` · `New El Lotus` · `villas for sale in El Lotus` · `villas for sale in New Capital City`

### Better Home  ·  326 units · from 4.5M
Landing: **AR** https://www.egy.deals/ar/developers/122-better-home  ·  **EN** https://www.egy.deals/developers/122-better-home
Top areas: New Capital City, New Cairo, New Zayed
Top compounds: Midtown Sky, Midtown condo, Midtown Sky Mall, Cairo Business Plaza, Midtown East Phase Two, Midtown Solo

AR keyword seeds: `كمبوند ميد تاون سكاي` · `كمبوند ميد تاون كوندو` · `كمبوند ميد تاون سكاي مول` · `كمبوند كايرو بيزنس بلازا` · `ميد تاون سكاي اسعار` · `ميد تاون كوندو اسعار` · `ميد تاون سكاي مول اسعار` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق للبيع في القاهرة الجديدة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `شقق تقسيط القاهرة الجديدة` · `بيتر هوم العاصمة الإدارية الجديدة` · `بيتر هوم كمبوندات`
EN keyword seeds: `Midtown Sky compound` · `Midtown condo compound` · `Midtown Sky Mall compound` · `Cairo Business Plaza compound` · `Midtown Sky prices` · `Midtown condo prices` · `Midtown Sky Mall prices` · `apartments for sale in New Capital City` · `apartments for sale in New Cairo` · `Better New Capital City` · `villas for sale in New Capital City` · `villas for sale in New Cairo`

---

## 8. Full roster — all 42 matched developers (slugs + landing pages)

Developers 15–42 = **Wave 2**: create paused, enable as budget/CPL allows. Every row already has a live bilingual page.

| # | Developer | Live units | From | Top areas | AR landing / EN landing |
|---|---|---|---|---|---|
| 1 | Madinet Masr | 2823 | 1.9M | New Cairo, New Heliopolis | /ar/developers/54-madinet-masr · /developers/54-madinet-masr |
| 2 | Palm Hills Developments | 2139 | 5.9M | New Zayed, October Gardens | /ar/developers/16-palm-hills-developments · /developers/16-palm-hills-developments |
| 3 | City Edge Developments | 2099 | 4.1M | Al Alamein, New Capital City | /ar/developers/74-city-edge-developments · /developers/74-city-edge-developments |
| 4 | Saudi Egyptian Developers (SED) | 1118 | 3.9M | Al Alamein, 6th settlement | /ar/developers/87-saudi-egyptian-developers-sed · /developers/87-saudi-egyptian-developers-sed |
| 5 | SODIC | 1020 | 9.5M | Mostakbal City, New Zayed | /ar/developers/8-sodic · /developers/8-sodic |
| 6 | Mountain View | 971 | 8.2M | Sidi Abdel Rahman, Mostakbal City | /ar/developers/6-mountain-view · /developers/6-mountain-view |
| 7 | Tatweer Misr | 757 | 6.0M | Ain Sokhna, Ras El Hekma | /ar/developers/33-tatweer-misr · /developers/33-tatweer-misr |
| 8 | PRE Group | 691 | 4.1M | New Cairo, Ain Sokhna | /ar/developers/111-pre-group · /developers/111-pre-group |
| 9 | Lasirena Group | 621 | 3.3M | Ain Sokhna, Ras Sudr | /ar/developers/215-lasirena-group · /developers/215-lasirena-group |
| 10 | Al Ahly Sabbour Developments | 538 | 4.7M | Mostakbal City, New Cairo | /ar/developers/191-al-ahly-sabbour-developments · /developers/191-al-ahly-sabbour-developments |
| 11 | Sky AD Developments | 435 | 3.7M | New Cairo, New Capital City | /ar/developers/121-sky-ad-developments · /developers/121-sky-ad-developments |
| 12 | Orascom Development Egypt | 423 | 7.2M | October Gardens, 6th of October City | /ar/developers/35-orascom-development-egypt · /developers/35-orascom-development-egypt |
| 13 | New Plan | 418 | 3.1M | El Lotus, New Capital City | /ar/developers/136-new-plan · /developers/136-new-plan |
| 14 | Better Home | 326 | 4.5M | New Capital City, New Cairo | /ar/developers/122-better-home · /developers/122-better-home |
| 15 | Inertia Egypt | 317 | 3.2M | Ras El Hekma, 6th of October City | /ar/developers/13-inertia-egypt · /developers/13-inertia-egypt |
| 16 | Gates Development | 236 | 2.6M | New Capital City, Ras El Hekma | /ar/developers/135-gates-development · /developers/135-gates-development |
| 17 | Modon Egypt | 234 | 4.4M | New Capital City, Golden Square | /ar/developers/133-modon-egypt · /developers/133-modon-egypt |
| 18 | Hyde Park | 225 | 5.7M | 6th of October City, New Cairo | /ar/developers/15-hyde-park · /developers/15-hyde-park |
| 19 | EGYGAB | 184 | 4.5M | New Capital City, New Cairo | /ar/developers/216-egygab · /developers/216-egygab |
| 20 | Taj Misr Developments | 173 | 2.7M | New Capital City, New Zayed | /ar/developers/138-taj-misr-developments · /developers/138-taj-misr-developments |
| 21 | Jadeer Realestate | 152 | 3.5M | New Cairo, New Capital City | /ar/developers/356-jadeer-realestate · /developers/356-jadeer-realestate |
| 22 | La Vista Developments | 123 | 5.9M | New Cairo, Ain Sokhna | /ar/developers/11-la-vista-developments · /developers/11-la-vista-developments |
| 23 | The Land Developers (TLD) | 119 | 3.8M | New Capital City, Mostakbal City | /ar/developers/86-the-land-developers-tld · /developers/86-the-land-developers-tld |
| 24 | Ajna Developments | 103 | 3.8M | New Cairo, Ain Sokhna | /ar/developers/91-ajna-developments · /developers/91-ajna-developments |
| 25 | Akam Developments | 95 | 7.0M | New Capital City | /ar/developers/90-akam-developments · /developers/90-akam-developments |
| 26 | Al - Borouj Misr Developments Group (ABM) | 64 | 5.3M | Sidi Abdel Rahman, New Capital City | /ar/developers/125-al-borouj-misr-developments-group-abm · /developers/125-al-borouj-misr-developments-group-abm |
| 27 | Hassan Allam Properties | 43 | 11.2M | 6th of October City, Mostakbal City | /ar/developers/22-hassan-allam-properties · /developers/22-hassan-allam-properties |
| 28 | Al Marasem Development | 31 | 11.5M | Ras El Hekma, New Zayed | /ar/developers/62-al-marasem-development · /developers/62-al-marasem-development |
| 29 | IL Cazar Developments | 31 | 4.8M | New Cairo, Ras El Hekma | /ar/developers/213-il-cazar-developments · /developers/213-il-cazar-developments |
| 30 | MAVEN DEVELOPMENTS | 31 | 6.2M | Ras El Hekma, Ain Sokhna | /ar/developers/97-maven-developments · /developers/97-maven-developments |
| 31 | Kleek Developments | 26 | 4.9M | 6th settlement | /ar/developers/429-kleek-developments · /developers/429-kleek-developments |
| 32 | Mabany Edris | 24 | 6.8M | Ras El Hekma, New Zayed | /ar/developers/187-mabany-edris · /developers/187-mabany-edris |
| 33 | Nations Of Sky | 18 | 6.6M | New Cairo, New Zayed | /ar/developers/457-nations-of-sky · /developers/457-nations-of-sky |
| 34 | Royal Development | 15 | 6.9M | Mostakbal City, 6th settlement | /ar/developers/324-royal-development · /developers/324-royal-development |
| 35 | Home Town Developments | 11 | 3.3M | New Capital City, 6th settlement | /ar/developers/137-home-town-developments · /developers/137-home-town-developments |
| 36 | Radix Development | 11 | 3.5M | New Capital City | /ar/developers/293-radix-development · /developers/293-radix-development |
| 37 | Khaled Sabry Holding | 10 | 5.6M | Mostakbal City | /ar/developers/233-khaled-sabry-holding · /developers/233-khaled-sabry-holding |
| 38 | Reedy Group | 10 | 3.7M | New Cairo | /ar/developers/104-reedy-group · /developers/104-reedy-group |
| 39 | BETA Developments | 9 | 4.9M | October Gardens, Mostakbal City | /ar/developers/399-beta-developments · /developers/399-beta-developments |
| 40 | Misr Italia Properties | 9 | 9.7M | Ain Sokhna, Ras El Hekma | /ar/developers/55-misr-italia-properties · /developers/55-misr-italia-properties |
| 41 | Naia Developments | 8 | 8.5M | Ras El Hekma | /ar/developers/253-naia-developments · /developers/253-naia-developments |
| 42 | Atric Developments | 3 | 6.8M | New Capital City, Ain Sokhna | /ar/developers/291-atric-developments · /developers/291-atric-developments |

---

## 9. Developers NOT on the site (skip until added to the catalog)

These appeared in the source list but have **no catalog page / zero live inventory**, so they can't have a developer-page campaign yet. Add them to the site first, then advertise:

`MAG` · `MBG` · `Egy Master` · `La Mirada` · `Zaeem Holding` · `Azha` · `MG` · `DM` · `Eden` · `Style Home` · `Eons` · `Roya-PRE` · `Arabian Mark` · `Al Basiony` · `QURTUBA` · `DIG` · `Founders` · `Dominar` · `New Event` · `ERG` · `Biography` · `Creek View`

---

## 10. Launch checklist (run in order)

1. Account auto-tagging **ON**; `Lead - egy.deals` conversion **Primary + Recording**; Enhanced Conversions **ON**.
2. Create the shared **10,000 EGP/day** budget + portfolio **Maximize Conversions** strategy.
3. For each Wave-1 developer: create the campaign (Search, Egypt, AR+EN, **mobile-only** via −100% desktop/tablet), the AR + EN ad groups, keywords (§7 seeds → expand with §4 patterns), RSAs (§5), shared negatives (§6), sitelinks/callouts/call extension.
4. **Enable Wave 1 live.** Create **Wave 2 paused.**
5. Verify one test click per campaign reaches the right `/ar/developers/<slug>` (AR) and `/developers/<slug>` (EN) page and that `gclid` is present in the URL.
6. After ~1 week: report **CPL per developer**, shift shared budget toward the lowest CPL, pause keywords with spend + 0 conversions, then wire the **Offline Conversion Import** (§1) to optimize toward qualified leads.

---

## 11. Facts reference

- **Site:** https://www.egy.deals · developer pages: `/developers/<slug>` (EN) · `/ar/developers/<slug>` (AR)
- **Ads account:** `AW-18195355585` ("the deal makers")
- **Conversion send_to:** `AW-18195355585/NMfzCPzfrMUcEMGvnORD` ("Lead - egy.deals")
- **Total daily budget:** 10,000 EGP · **Bidding:** Maximize Conversions → tCPA later
- **Devices:** mobile only · **Geo:** Egypt · **Languages:** AR + EN
- **Lead = ** WhatsApp click OR Call OR form OR chat handoff (all fire the conversion; all routed to brokers by the site's rotation engine)
