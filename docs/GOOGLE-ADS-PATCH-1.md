# Google Ads — Patch 1 (20 live developers) — egy.deals

> **Paste this whole file into the agency-ops Google Ads AI chat** (the one with
> the Google Ads API skills). Self-contained — build + launch all 20 campaigns
> from it. Grounded in live egy.deals inventory. Patch 2 (more developers) is
> added later once these are running.

---

## Task

In account **AW-18195355585 ("the deal makers", 386-792-3119)**, build and **enable LIVE** 20 **mobile-only Arabic + English Search campaigns — one per developer** below, all optimizing the **"Lead - egy.deals"** conversion, on **one shared 10,000 EGP/day budget**, **Maximize Conversions**. Each developer's ads point at that developer's own egy.deals page.

---

## 1. Conversion linking — do first, verify

- **Conversion:** `Lead - egy.deals` · `send_to = AW-18195355585/NMfzCPzfrMUcEMGvnORD`. Already fires on every WhatsApp click, Call click, lead form, and AI-chat handoff on the site.
- Verify: status **Recording conversions** · set **Primary** · **Enhanced Conversions for Leads ON** · **account auto-tagging ON** (needed so `gclid` is captured for later offline import).
- Do **not** strip URL params on the landing pages — auto-tagging carries `gclid`.

## 2. Global settings — every campaign

| Setting | Value |
|---|---|
| Type | **Search ONLY.** NO Display, NO Display Network expansion, NO Search Partners, NO Performance Max. Uncheck "Include Google Display Network" and "Include Google search partners". |
| **Devices** | **Mobile only** — desktop −100%, tablet −100% |
| **Locations** | **Egypt + the Egyptian-expat Gulf hubs** where buyers live: **Saudi Arabia, United Arab Emirates, Kuwait, Qatar, Bahrain, Oman**. Location option = **"Presence: people in your targeted locations"**. See §2a for the expat-audience layer + your own client list. |
| Languages | Arabic + English |
| **Age** | **Exclude 18–24 and 25–34.** Target **35–44, 45–54, 55–64, 65+, and "Unknown"** (keep Unknown — most Search users have no known age, excluding it kills reach). Property buyers skew 35+. |
| Bidding | **Maximize Conversions**, as a **portfolio strategy** shared across all 20 |
| Budget | **One shared 10,000 EGP/day** across all 20 (≈ the strategy pushes spend to the best performers; do NOT set 10k per campaign) |
| Match types | Phrase + Exact to start; add Broad after the conversion signal builds |
| Ad rotation | Optimize |

## 2a. Reaching Egyptians + your existing clients

- **Egyptians abroad:** the Gulf locations above already put ads in front of the large Egyptian expat buyer base. To tighten it, **layer an audience in Observation mode** (not targeting-restricting at first): affinity/in-market "real estate" + language = Arabic, and — where available — an "Egypt" expat/travel audience. Watch which locations convert, then shift budget there.
- **Your own clients (Customer Match):** upload your existing client/lead list (phone numbers + emails from the broker CRM / the site's `leads` table) as a **Customer Match audience**. Add it in **Observation** to every campaign so you can (a) see how warm contacts perform and (b) build a **similar-audience** off it. Do NOT set it to "Targeting" (that would shrink reach to only known clients).
- Keep everything **Search-only** — none of this turns on Display.

## 3. Per-developer structure — built for Quality Score (repeat ×20)

**Goal: max Quality Score = keyword ⇄ ad ⇄ landing page all tightly matched.** We do this with **Single-Theme Ad Groups (STAG)** — one tightly-themed ad group per compound — **plus Dynamic Keyword Insertion (§4)**, NOT one giant ad group per developer.

> **Why not literal 1-keyword-per-ad-group (SKAG)?** It used to be the QS trick, but it now *hurts*: (a) close-variant matching means one Exact keyword already catches all the singular/plural/word-order variants, so a separate ad group per variant is redundant; (b) our **Maximize Conversions** bidding needs conversion volume to learn — hundreds of one-keyword ad groups starve it; (c) each RSA needs impressions to optimize — splitting into 1-keyword shards under-trains every ad. **STAG + DKI gives the same keyword-in-the-ad relevance without the downsides.**

```
Campaign:  "DEV — <Developer> — Search — Mobile"
  ├─ Ad group  "<Compound 1> — AR"   → only Compound-1 AR keywords  → developer AR page
  ├─ Ad group  "<Compound 1> — EN"   → only Compound-1 EN keywords  → developer EN page
  ├─ Ad group  "<Compound 2> — AR"   → only Compound-2 AR keywords  → developer AR page
  ├─ Ad group  "<Compound 2> — EN"   → …                             (repeat for the top 3–5 compounds in §7)
  ├─ Ad group  "Brand+Area — AR"     → developer + area generic terms → developer AR page
  └─ Ad group  "Brand+Area — EN"     → developer + area generic terms → developer EN page
```

Rules that protect Quality Score:
- **One compound theme per ad group.** Put ONLY that compound's close variants (name · name+prices · كمبوند+name · name+installments) in it — Exact + Phrase. Never mix two compounds in one ad group.
- Take the **top 3–5 compounds per developer** from the `Compounds:` line in §7 (don't shard all of them — keep each RSA fed with impressions).
- The **Brand+Area** ad group catches the broad head terms (`<developer> <area>`, `apartments for sale in <area>`) that don't belong to a single compound.
- Each ad group gets its own **DKI Responsive Search Ad (§4)**, the shared negatives (§6), **sitelinks** (the developer's other compounds), **callouts** (Primary units · Flexible plans · Direct developer prices), and a **call extension** to the broker number.
- **Landing page:** the developer page (URLs in §7) — it features that compound, shows price, and is wired to the WhatsApp/Call conversion. *Optional higher-relevance upgrade:* point a compound ad group at that compound's own page `…/compounds/<slug>` (same conversion CTAs) once you confirm the slug.

## 4. RSA copy — Dynamic Keyword Insertion for top ad relevance

Each ad group's RSA is written for **that one compound**. Use **Dynamic Keyword Insertion** so the headline mirrors the exact search term (this is what drives the ad-relevance + expected-CTR halves of Quality Score):

- **Headline 1 (DKI, pinned pos 1):** `{KeyWord:<Compound>}` — Google swaps in the matched keyword; if too long it falls back to the compound name. (DKI syntax is the same in Arabic — the fallback text is just Arabic, e.g. `{KeyWord:طلاله}`.)
- Name the **developer + compound + area + starting price** across the rest. Hooks: from 5–10% down · up to 8–15-year installments · primary units, developer-direct prices · fully-finished options · WhatsApp for the price list.

- **AR headlines** (≤30 chars): `{KeyWord:<كمبوند>}` · `<كمبوند> — <منطقة>` · `شقق تقسيط 15 سنة` · `مقدم 10% وتقسيط طويل` · `<كمبوند> بأفضل سعر` · `تواصل واتساب للأسعار` · `وحدات أولية بالسعر المباشر`
- **AR description** (≤90): `وحدات أولية في <كمبوند> من <مطور>. مقدم من 10% وتقسيط حتى 15 سنة. راسلنا واتساب للأسعار.`
- **EN headlines** (≤30 chars): `{KeyWord:<Compound>}` · `<Compound> — <Area>` · `From <price> · 10% Down` · `Up to 15-Yr Installments` · `<Compound> Best Prices` · `WhatsApp for Price List`
- **EN description** (≤90): `Primary units in <Compound> by <Developer>. From 10% down, up to 15-yr plans. WhatsApp us for prices.`

Pin the DKI headline to position 1; give each RSA the compound name in ≥3 headlines so relevance stays high even when DKI doesn't fire.

## 5. Keyword patterns (expand the seeds with these)

- **AR:** `شقق للبيع في <منطقة>` · `كمبوند <كمبوند>` · `<كمبوند> اسعار` · `<مطور> <منطقة>` · `شقق تقسيط <منطقة>` · `فيلات للبيع في <منطقة>`
- **EN:** `apartments for sale in <area>` · `<compound> compound` · `<compound> prices` · `<developer> <area>` · `installments <area>` · `villas for sale in <area>`

## 6. Negative keywords (shared)

**AR:** `ايجار` · `إيجار` · `للايجار` · `مفروش` · `ريسيل` · `وظائف` · `مطلوب` · `تمويل عقاري`
**EN:** `rent` · `rental` · `for rent` · `resale` · `jobs` · `careers` · `salary` · `furnished` · `used` · `second hand`

---

## 7. The 20 campaigns — landing URLs + grounded keyword seeds

> Per developer below: the **two URLs** are the AR + EN landing pages used by *all* of that developer's ad groups. The **`Compounds:` line** is your ad-group list — build one Single-Theme Ad Group per compound (AR + EN) for the top 3–5, following §3. The **keyword lines** are the seeds — put each compound's own keywords only in that compound's ad group; the `apartments/villas for sale in <area>` + `<developer> <area>` terms go in the **Brand+Area** ad group.

### Madinet Masr  ·  2823 units · from EGP 1.9M
- **AR ad group** → https://www.egy.deals/ar/developers/54-madinet-masr
- **EN ad group** → https://www.egy.deals/developers/54-madinet-masr
- Areas: New Cairo, New Heliopolis, Mostakbal City  ·  Compounds: Talala, ELM Tree - Sarai, The Butterfly, Club Views - Sarai, Esse Residence, D2N - Sarai
- AR keywords: `كمبوند طلاله` · `كمبوند ايلم ترى - سراى` · `كمبوند ذا بترفلاى` · `كمبوند كلوب فيوز - سراى` · `طلاله اسعار` · `ايلم ترى - سراى اسعار` · `ذا بترفلاى اسعار` · `شقق للبيع في القاهرة الجديدة` · `شقق للبيع في هيليوبوليس الجديدة` · `شقق تقسيط القاهرة الجديدة` · `شقق تقسيط هيليوبوليس الجديدة` · `مدينة نصر للاسكان القاهرة الجديدة` · `مدينة نصر للاسكان كمبوندات`
- EN keywords: `Talala compound` · `ELM Tree - Sarai compound` · `The Butterfly compound` · `Club Views - Sarai compound` · `Talala prices` · `ELM Tree - Sarai prices` · `The Butterfly prices` · `apartments for sale in New Cairo` · `apartments for sale in New Heliopolis` · `Madinet New Cairo` · `villas for sale in New Cairo` · `villas for sale in New Heliopolis`

### Palm Hills Developments  ·  2139 units · from EGP 5.9M
- **AR ad group** → https://www.egy.deals/ar/developers/16-palm-hills-developments
- **EN ad group** → https://www.egy.deals/developers/16-palm-hills-developments
- Areas: New Zayed, October Gardens, 6th of October City  ·  Compounds: Jirian-Phase One, PX-Phase One, Hacienda Waters, VILLAGE DE LA CAPITALE, VILLAGE DE LA CAPITALE-Phase 1, District 2 - Moon Heights
- AR keywords: `كمبوند جريان المرحلة الاولى` · `كمبوند بي إكس المرحلة الأولى` · `كمبوند هاسيندا ووترز` · `كمبوند فيلاج دو لا كابيتال` · `جريان المرحلة الاولى اسعار` · `بي إكس المرحلة الأولى اسعار` · `هاسيندا ووترز اسعار` · `شقق للبيع في الشيخ زايد الجديدة` · `شقق للبيع في حدائق اكتوبر` · `شقق تقسيط الشيخ زايد الجديدة` · `شقق تقسيط حدائق اكتوبر` · `بالم هيلز الشيخ زايد الجديدة` · `بالم هيلز كمبوندات`
- EN keywords: `Jirian-Phase One compound` · `PX-Phase One compound` · `Hacienda Waters compound` · `VILLAGE DE LA CAPITALE compound` · `Jirian-Phase One prices` · `PX-Phase One prices` · `Hacienda Waters prices` · `apartments for sale in New Zayed` · `apartments for sale in October Gardens` · `Palm New Zayed` · `villas for sale in New Zayed` · `villas for sale in October Gardens`

### City Edge Developments  ·  2099 units · from EGP 4.1M
- **AR ad group** → https://www.egy.deals/ar/developers/74-city-edge-developments
- **EN ad group** → https://www.egy.deals/developers/74-city-edge-developments
- Areas: Al Alamein, New Capital City, New Cairo  ·  Compounds: Mazarine, New Garden City, Il Latini City Edge, Mazarine Chalet Extension, Beach Front Towers, Lush Valley
- AR keywords: `كمبوند مزارين` · `كمبوند نيو جاردن سيتى` · `كمبوند الحي اللاتيني سيتي ايدج` · `كمبوند مزارين شاليه اكستنشن` · `مزارين اسعار` · `نيو جاردن سيتى اسعار` · `الحي اللاتيني سيتي ايدج اسعار` · `شقق للبيع في العلمين` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق تقسيط العلمين` · `شقق تقسيط العاصمة الإدارية الجديدة` · `سيتي ايدج العلمين` · `سيتي ايدج كمبوندات`
- EN keywords: `Mazarine compound` · `New Garden City compound` · `Il Latini City Edge compound` · `Mazarine Chalet Extension compound` · `Mazarine prices` · `New Garden City prices` · `Il Latini City Edge prices` · `apartments for sale in Al Alamein` · `apartments for sale in New Capital City` · `City Al Alamein` · `villas for sale in Al Alamein` · `villas for sale in New Capital City`

### Saudi Egyptian Developers (SED)  ·  1118 units · from EGP 3.9M
- **AR ad group** → https://www.egy.deals/ar/developers/87-saudi-egyptian-developers-sed
- **EN ad group** → https://www.egy.deals/developers/87-saudi-egyptian-developers-sed
- Areas: Al Alamein, 6th settlement, New Capital City  ·  Compounds: Il Latini SED, Tierra, Bleu Vert, Marina 8 By The Lake, Jayd, Central New Cairo
- AR keywords: `كمبوند SED الحي اللاتيني` · `كمبوند تييرا` · `كمبوند بلو فيرت` · `كمبوند مارينا 8 باى ذا ليك` · `SED الحي اللاتيني اسعار` · `تييرا اسعار` · `بلو فيرت اسعار` · `شقق للبيع في العلمين` · `شقق للبيع في التجمع السادس` · `شقق تقسيط العلمين` · `شقق تقسيط التجمع السادس` · `السعودية المصرية العلمين` · `السعودية المصرية كمبوندات`
- EN keywords: `Il Latini SED compound` · `Tierra compound` · `Bleu Vert compound` · `Marina 8 By The Lake compound` · `Il Latini SED prices` · `Tierra prices` · `Bleu Vert prices` · `apartments for sale in Al Alamein` · `apartments for sale in 6th settlement` · `Saudi Al Alamein` · `villas for sale in Al Alamein` · `villas for sale in 6th settlement`

### SODIC  ·  1020 units · from EGP 9.5M
- **AR ad group** → https://www.egy.deals/ar/developers/8-sodic
- **EN ad group** → https://www.egy.deals/developers/8-sodic
- Areas: Mostakbal City, New Zayed, Ras El Hekma  ·  Compounds: East Vale, Karmell New Zayed, Ogami Ras El Hekma, The Estates Residence, Aquamarine-June, Water Chalet - Ogami
- AR keywords: `كمبوند ايست فالى` · `كمبوند كارميل زايد الجديدة` · `كمبوند أوجامي رأس الحكمة` · `كمبوند استيتس ريزيدينس` · `ايست فالى اسعار` · `كارميل زايد الجديدة اسعار` · `أوجامي رأس الحكمة اسعار` · `شقق للبيع في مدينة المستقبل` · `شقق للبيع في الشيخ زايد الجديدة` · `شقق تقسيط مدينة المستقبل` · `شقق تقسيط الشيخ زايد الجديدة` · `سوديك مدينة المستقبل` · `سوديك كمبوندات`
- EN keywords: `East Vale compound` · `Karmell New Zayed compound` · `Ogami Ras El Hekma compound` · `The Estates Residence compound` · `East Vale prices` · `Karmell New Zayed prices` · `Ogami Ras El Hekma prices` · `apartments for sale in Mostakbal City` · `apartments for sale in New Zayed` · `SODIC Mostakbal City` · `villas for sale in Mostakbal City` · `villas for sale in New Zayed`

### Mountain View  ·  971 units · from EGP 8.2M
- **AR ad group** → https://www.egy.deals/ar/developers/6-mountain-view
- **EN ad group** → https://www.egy.deals/developers/6-mountain-view
- Areas: Sidi Abdel Rahman, Mostakbal City, New Zayed  ·  Compounds: Kin Island-Crysta, Jirian - Mountain View, Lagoon Beach Park Mountain View I-City October, Lagoon Beach Park - Aliva, Club Park - ICity October, The Greens
- AR keywords: `كمبوند كين ايلاند-كريستا` · `كمبوند جريان - ماونتن فيو` · `كمبوند لاجون بيتش بارك ماونتن فيو اي سيتي اكتوبر` · `كمبوند لاجون بيتش بارك` · `كين ايلاند-كريستا اسعار` · `جريان - ماونتن فيو اسعار` · `لاجون بيتش بارك ماونتن فيو اي سيتي اكتوبر اسعار` · `شقق للبيع في سيدي عبد الرحمن` · `شقق للبيع في مدينة المستقبل` · `شقق تقسيط سيدي عبد الرحمن` · `شقق تقسيط مدينة المستقبل` · `ماونتن فيو سيدي عبد الرحمن` · `ماونتن فيو كمبوندات`
- EN keywords: `Kin Island-Crysta compound` · `Jirian - Mountain View compound` · `Lagoon Beach Park Mountain View I-City October compound` · `Lagoon Beach Park - Aliva compound` · `Kin Island-Crysta prices` · `Jirian - Mountain View prices` · `Lagoon Beach Park Mountain View I-City October prices` · `apartments for sale in Sidi Abdel Rahman` · `apartments for sale in Mostakbal City` · `Mountain Sidi Abdel Rahman` · `villas for sale in Sidi Abdel Rahman` · `villas for sale in Mostakbal City`

### Tatweer Misr  ·  757 units · from EGP 6.0M
- **AR ad group** → https://www.egy.deals/ar/developers/33-tatweer-misr
- **EN ad group** → https://www.egy.deals/developers/33-tatweer-misr
- Areas: Ain Sokhna, Ras El Hekma, Mostakbal City  ·  Compounds: Elva - Il Monte Galala, Salt, Maesta Il Monte Galala, Maesta Towers-Il Mont Glala, M Residence, Lakeside-Bloomfields
- AR keywords: `كمبوند الفا - المونت جلالة` · `كمبوند سولت` · `كمبوند مايستا المونت جلالة` · `كمبوند مايستا تاورز-المونت جلالة` · `الفا - المونت جلالة اسعار` · `سولت اسعار` · `مايستا المونت جلالة اسعار` · `شقق للبيع في العين السخنة` · `شقق للبيع في رأس الحكمة` · `شقق تقسيط العين السخنة` · `شقق تقسيط رأس الحكمة` · `تطوير مصر العين السخنة` · `تطوير مصر كمبوندات`
- EN keywords: `Elva - Il Monte Galala compound` · `Salt compound` · `Maesta Il Monte Galala compound` · `Maesta Towers-Il Mont Glala compound` · `Elva - Il Monte Galala prices` · `Salt prices` · `Maesta Il Monte Galala prices` · `apartments for sale in Ain Sokhna` · `apartments for sale in Ras El Hekma` · `Tatweer Ain Sokhna` · `villas for sale in Ain Sokhna` · `villas for sale in Ras El Hekma`

### PRE Group  ·  691 units · from EGP 4.1M
- **AR ad group** → https://www.egy.deals/ar/developers/111-pre-group
- **EN ad group** → https://www.egy.deals/developers/111-pre-group
- Areas: New Cairo, Ain Sokhna, El Sheikh Zayed  ·  Compounds: Ivoire East, The Brooks, Selection - Telal East, Ivoire West, Jebal El Sokhna, Covaya
- AR keywords: `كمبوند ايفورى القاهرة الجديدة` · `كمبوند ذا بروكس` · `كمبوند تلال ايست - سيليكشن` · `كمبوند ايفورى ويست` · `ايفورى القاهرة الجديدة اسعار` · `ذا بروكس اسعار` · `تلال ايست - سيليكشن اسعار` · `شقق للبيع في القاهرة الجديدة` · `شقق للبيع في العين السخنة` · `شقق تقسيط القاهرة الجديدة` · `شقق تقسيط العين السخنة` · `بي ار اي القاهرة الجديدة` · `بي ار اي كمبوندات`
- EN keywords: `Ivoire East compound` · `The Brooks compound` · `Selection - Telal East compound` · `Ivoire West compound` · `Ivoire East prices` · `The Brooks prices` · `Selection - Telal East prices` · `apartments for sale in New Cairo` · `apartments for sale in Ain Sokhna` · `PRE New Cairo` · `villas for sale in New Cairo` · `villas for sale in Ain Sokhna`

### Lasirena Group  ·  621 units · from EGP 3.3M
- **AR ad group** → https://www.egy.deals/ar/developers/215-lasirena-group
- **EN ad group** → https://www.egy.deals/developers/215-lasirena-group
- Areas: Ain Sokhna, Ras Sudr, Al Dabaa  ·  Compounds: Cape Bay Blumar Lasirena, Lasirena Bay, Lasirena North Coast, Lasirena Palm Beach
- AR keywords: `كمبوند كايب باي بلومار لا سيرينا` · `كمبوند لاسيرينا باي` · `كمبوند لاسيرينا الساحل الشمالي` · `كمبوند لا سيرينا بالم بيتش` · `كايب باي بلومار لا سيرينا اسعار` · `لاسيرينا باي اسعار` · `لاسيرينا الساحل الشمالي اسعار` · `شقق للبيع في العين السخنة` · `شقق للبيع في راس سدر` · `شقق تقسيط العين السخنة` · `شقق تقسيط راس سدر` · `لاسيرينا العين السخنة` · `لاسيرينا كمبوندات`
- EN keywords: `Cape Bay Blumar Lasirena compound` · `Lasirena Bay compound` · `Lasirena North Coast compound` · `Lasirena Palm Beach compound` · `Cape Bay Blumar Lasirena prices` · `Lasirena Bay prices` · `Lasirena North Coast prices` · `apartments for sale in Ain Sokhna` · `apartments for sale in Ras Sudr` · `Lasirena Ain Sokhna` · `villas for sale in Ain Sokhna` · `villas for sale in Ras Sudr`

### Al Ahly Sabbour Developments  ·  538 units · from EGP 4.7M
- **AR ad group** → https://www.egy.deals/ar/developers/191-al-ahly-sabbour-developments
- **EN ad group** → https://www.egy.deals/developers/191-al-ahly-sabbour-developments
- Areas: Mostakbal City, New Cairo, Ras El Hekma  ·  Compounds: The Mornings, Roofscape - At East, Youd, At East, everyday - THE MORNINGS, The RIDGE Villas
- AR keywords: `كمبوند ذا مورنينجز` · `كمبوند رووف اسكاب - ات ايست` · `كمبوند يود` · `كمبوند ات ايست` · `ذا مورنينجز اسعار` · `رووف اسكاب - ات ايست اسعار` · `يود اسعار` · `شقق للبيع في مدينة المستقبل` · `شقق للبيع في القاهرة الجديدة` · `شقق تقسيط مدينة المستقبل` · `شقق تقسيط القاهرة الجديدة` · `الاهلي صبور مدينة المستقبل` · `الاهلي صبور كمبوندات`
- EN keywords: `The Mornings compound` · `Roofscape - At East compound` · `Youd compound` · `At East compound` · `The Mornings prices` · `Roofscape - At East prices` · `Youd prices` · `apartments for sale in Mostakbal City` · `apartments for sale in New Cairo` · `Al Mostakbal City` · `villas for sale in Mostakbal City` · `villas for sale in New Cairo`

### Sky AD Developments  ·  435 units · from EGP 3.7M
- **AR ad group** → https://www.egy.deals/ar/developers/121-sky-ad-developments
- **EN ad group** → https://www.egy.deals/developers/121-sky-ad-developments
- Areas: New Cairo, New Capital City, Sidi Heneish  ·  Compounds: Bluetree, Capital avenue, Blue Walk, Sky North, Residence Eight Sky Abu Dhabi, Vallis
- AR keywords: `كمبوند بلوتري` · `كمبوند كابيتال افينيو` · `كمبوند بلو ووك` · `كمبوند سكاى نورث` · `بلوتري اسعار` · `كابيتال افينيو اسعار` · `بلو ووك اسعار` · `شقق للبيع في القاهرة الجديدة` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق تقسيط القاهرة الجديدة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `سكاي القاهرة الجديدة` · `سكاي كمبوندات`
- EN keywords: `Bluetree compound` · `Capital avenue compound` · `Blue Walk compound` · `Sky North compound` · `Bluetree prices` · `Capital avenue prices` · `Blue Walk prices` · `apartments for sale in New Cairo` · `apartments for sale in New Capital City` · `Sky New Cairo` · `villas for sale in New Cairo` · `villas for sale in New Capital City`

### Orascom Development Egypt  ·  423 units · from EGP 7.2M
- **AR ad group** → https://www.egy.deals/ar/developers/35-orascom-development-egypt
- **EN ad group** → https://www.egy.deals/developers/35-orascom-development-egypt
- Areas: October Gardens, 6th of October City, El Gouna  ·  Compounds: O Views, Core, Parkside - Owest, Midyard, Tuban El Gouna, Aden
- AR keywords: `كمبوند او فيوز` · `كمبوند كور` · `كمبوند بارك سايد - أو ويست` · `كمبوند ميديارد` · `او فيوز اسعار` · `كور اسعار` · `بارك سايد - أو ويست اسعار` · `شقق للبيع في حدائق اكتوبر` · `شقق للبيع في مدينة السادس من أكتوبر` · `شقق تقسيط حدائق اكتوبر` · `شقق تقسيط مدينة السادس من أكتوبر` · `اوراسكوم حدائق اكتوبر` · `اوراسكوم كمبوندات`
- EN keywords: `O Views compound` · `Core compound` · `Parkside - Owest compound` · `Midyard compound` · `O Views prices` · `Core prices` · `Parkside - Owest prices` · `apartments for sale in October Gardens` · `apartments for sale in 6th of October City` · `Orascom October Gardens` · `villas for sale in October Gardens` · `villas for sale in 6th of October City`

### New Plan  ·  418 units · from EGP 3.1M
- **AR ad group** → https://www.egy.deals/ar/developers/136-new-plan
- **EN ad group** → https://www.egy.deals/developers/136-new-plan
- Areas: El Lotus, New Capital City  ·  Compounds: Amara, Talah, Atika, Tonino Lamborghini Residences, Granvia Mall Serrano, Eleven
- AR keywords: `كمبوند امارا` · `كمبوند طله` · `كمبوند أتيكا` · `كمبوند تونينو لامبورجيني ريزيدنس` · `امارا اسعار` · `طله اسعار` · `أتيكا اسعار` · `شقق للبيع في اللوتس` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق تقسيط اللوتس` · `شقق تقسيط العاصمة الإدارية الجديدة` · `نيو بلان اللوتس` · `نيو بلان كمبوندات`
- EN keywords: `Amara compound` · `Talah compound` · `Atika compound` · `Tonino Lamborghini Residences compound` · `Amara prices` · `Talah prices` · `Atika prices` · `apartments for sale in El Lotus` · `apartments for sale in New Capital City` · `New El Lotus` · `villas for sale in El Lotus` · `villas for sale in New Capital City`

### Better Home  ·  326 units · from EGP 4.5M
- **AR ad group** → https://www.egy.deals/ar/developers/122-better-home
- **EN ad group** → https://www.egy.deals/developers/122-better-home
- Areas: New Capital City, New Cairo, New Zayed  ·  Compounds: Midtown Sky, Midtown condo, Midtown Sky Mall, Cairo Business Plaza, Midtown East Phase Two, Midtown Solo
- AR keywords: `كمبوند ميد تاون سكاي` · `كمبوند ميد تاون كوندو` · `كمبوند ميد تاون سكاي مول` · `كمبوند كايرو بيزنس بلازا` · `ميد تاون سكاي اسعار` · `ميد تاون كوندو اسعار` · `ميد تاون سكاي مول اسعار` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق للبيع في القاهرة الجديدة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `شقق تقسيط القاهرة الجديدة` · `بيتر هوم العاصمة الإدارية الجديدة` · `بيتر هوم كمبوندات`
- EN keywords: `Midtown Sky compound` · `Midtown condo compound` · `Midtown Sky Mall compound` · `Cairo Business Plaza compound` · `Midtown Sky prices` · `Midtown condo prices` · `Midtown Sky Mall prices` · `apartments for sale in New Capital City` · `apartments for sale in New Cairo` · `Better New Capital City` · `villas for sale in New Capital City` · `villas for sale in New Cairo`

### Inertia Egypt  ·  317 units · from EGP 3.2M
- **AR ad group** → https://www.egy.deals/ar/developers/13-inertia-egypt
- **EN ad group** → https://www.egy.deals/developers/13-inertia-egypt
- Areas: Ras El Hekma, 6th of October City  ·  Compounds: Vaya - Jefaira, Ayla Jefaira, Quayside, The Peak Joulz, Furl 2, Jefaira
- AR keywords: `كمبوند فايا - جيفيرا` · `كمبوند ايلا جيفيرا` · `كمبوند كيسايد` · `كمبوند جولز ذا بيك` · `فايا - جيفيرا اسعار` · `ايلا جيفيرا اسعار` · `كيسايد اسعار` · `شقق للبيع في رأس الحكمة` · `شقق للبيع في مدينة السادس من أكتوبر` · `شقق تقسيط رأس الحكمة` · `شقق تقسيط مدينة السادس من أكتوبر` · `إينرشيا رأس الحكمة` · `إينرشيا كمبوندات`
- EN keywords: `Vaya - Jefaira compound` · `Ayla Jefaira compound` · `Quayside compound` · `The Peak Joulz compound` · `Vaya - Jefaira prices` · `Ayla Jefaira prices` · `Quayside prices` · `apartments for sale in Ras El Hekma` · `apartments for sale in 6th of October City` · `Inertia Ras El Hekma` · `villas for sale in Ras El Hekma` · `villas for sale in 6th of October City`

### Gates Development  ·  236 units · from EGP 2.6M
- **AR ad group** → https://www.egy.deals/ar/developers/135-gates-development
- **EN ad group** → https://www.egy.deals/developers/135-gates-development
- Areas: New Capital City, Ras El Hekma, New Zayed  ·  Compounds: Catalan, Lyv Caesar - Ras El Hekma, Lugar, Venia, Space Mall, Catalan Mall
- AR keywords: `كمبوند كاتالان` · `كمبوند ليف سيزار - راس الحكمة` · `كمبوند لوجار` · `كمبوند فينيا` · `كاتالان اسعار` · `ليف سيزار - راس الحكمة اسعار` · `لوجار اسعار` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق للبيع في رأس الحكمة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `شقق تقسيط رأس الحكمة` · `جيتس العاصمة الإدارية الجديدة` · `جيتس كمبوندات`
- EN keywords: `Catalan compound` · `Lyv Caesar - Ras El Hekma compound` · `Lugar compound` · `Venia compound` · `Catalan prices` · `Lyv Caesar - Ras El Hekma prices` · `Lugar prices` · `apartments for sale in New Capital City` · `apartments for sale in Ras El Hekma` · `Gates New Capital City` · `villas for sale in New Capital City` · `villas for sale in Ras El Hekma`

### Modon Egypt  ·  234 units · from EGP 4.4M
- **AR ad group** → https://www.egy.deals/ar/developers/133-modon-egypt
- **EN ad group** → https://www.egy.deals/developers/133-modon-egypt
- Areas: New Capital City, Golden Square, 6th of October City  ·  Compounds: Lagoons New Capital, Modon Green River Tower, Boutique Village 2, The V Residence - Villagio, Golf Town, Lagoons Al Alamin
- AR keywords: `كمبوند لاجونز العاصمة` · `كمبوند مدن النهر الاخضر تاور` · `كمبوند بوتيك فيلدج 2` · `كمبوند ذا فى ريزيدنس - فيلاجيو` · `لاجونز العاصمة اسعار` · `مدن النهر الاخضر تاور اسعار` · `بوتيك فيلدج 2 اسعار` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق للبيع في جولدن سكوير` · `شقق تقسيط العاصمة الإدارية الجديدة` · `شقق تقسيط جولدن سكوير` · `مدن العاصمة الإدارية الجديدة` · `مدن كمبوندات`
- EN keywords: `Lagoons New Capital compound` · `Modon Green River Tower compound` · `Boutique Village 2 compound` · `The V Residence - Villagio compound` · `Lagoons New Capital prices` · `Modon Green River Tower prices` · `Boutique Village 2 prices` · `apartments for sale in New Capital City` · `apartments for sale in Golden Square` · `Modon New Capital City` · `villas for sale in New Capital City` · `villas for sale in Golden Square`

### Hyde Park  ·  225 units · from EGP 5.7M
- **AR ad group** → https://www.egy.deals/ar/developers/15-hyde-park
- **EN ad group** → https://www.egy.deals/developers/15-hyde-park
- Areas: 6th of October City, New Cairo, Ras El Hekma  ·  Compounds: Hyde Park Signature, Lagoon Town, Parkway Residence - Hyde Park, Hyde Park Central, Central Residence - Hyde Park Central, Garden Lakes
- AR keywords: `كمبوند هايد بارك سيجنتشر` · `كمبوند لاجون تاون` · `كمبوند بارك واي ريزيدنس - هايد بارك` · `كمبوند هايد بارك سنترال` · `هايد بارك سيجنتشر اسعار` · `لاجون تاون اسعار` · `بارك واي ريزيدنس - هايد بارك اسعار` · `شقق للبيع في مدينة السادس من أكتوبر` · `شقق للبيع في القاهرة الجديدة` · `شقق تقسيط مدينة السادس من أكتوبر` · `شقق تقسيط القاهرة الجديدة` · `هايد بارك مدينة السادس من أكتوبر` · `هايد بارك كمبوندات`
- EN keywords: `Hyde Park Signature compound` · `Lagoon Town compound` · `Parkway Residence - Hyde Park compound` · `Hyde Park Central compound` · `Hyde Park Signature prices` · `Lagoon Town prices` · `Parkway Residence - Hyde Park prices` · `apartments for sale in 6th of October City` · `apartments for sale in New Cairo` · `Hyde 6th of October City` · `villas for sale in 6th of October City` · `villas for sale in New Cairo`

### EGYGAB  ·  184 units · from EGP 4.5M
- **AR ad group** → https://www.egy.deals/ar/developers/216-egygab
- **EN ad group** → https://www.egy.deals/developers/216-egygab
- Areas: New Capital City, New Cairo, Sidi Abdel Rahman  ·  Compounds: The Islands, The Median Residences, Masaya
- AR keywords: `كمبوند ذا أيلاندز` · `كمبوند ذا ميديان ريزيدنسز` · `كمبوند مسايا` · `ذا أيلاندز اسعار` · `ذا ميديان ريزيدنسز اسعار` · `مسايا اسعار` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق للبيع في القاهرة الجديدة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `شقق تقسيط القاهرة الجديدة` · `ايجي جاب العاصمة الإدارية الجديدة` · `ايجي جاب كمبوندات`
- EN keywords: `The Islands compound` · `The Median Residences compound` · `Masaya compound` · `The Islands prices` · `The Median Residences prices` · `Masaya prices` · `apartments for sale in New Capital City` · `apartments for sale in New Cairo` · `EGYGAB New Capital City` · `villas for sale in New Capital City` · `villas for sale in New Cairo`

### Taj Misr Developments  ·  173 units · from EGP 2.7M
- **AR ad group** → https://www.egy.deals/ar/developers/138-taj-misr-developments
- **EN ad group** → https://www.egy.deals/developers/138-taj-misr-developments
- Areas: New Capital City, New Zayed  ·  Compounds: Taj Tower, De Joya 4, Dejoya Residence, Taj Tower 2, De Joya 1, Dejoya Plaza Residence
- AR keywords: `كمبوند تاج تاور` · `كمبوند دي جويا 4` · `كمبوند ديجويا ريزيدنس` · `كمبوند تاج تاور 2` · `تاج تاور اسعار` · `دي جويا 4 اسعار` · `ديجويا ريزيدنس اسعار` · `شقق للبيع في العاصمة الإدارية الجديدة` · `شقق للبيع في الشيخ زايد الجديدة` · `شقق تقسيط العاصمة الإدارية الجديدة` · `شقق تقسيط الشيخ زايد الجديدة` · `تاج مصر العاصمة الإدارية الجديدة` · `تاج مصر كمبوندات`
- EN keywords: `Taj Tower compound` · `De Joya 4 compound` · `Dejoya Residence compound` · `Taj Tower 2 compound` · `Taj Tower prices` · `De Joya 4 prices` · `Dejoya Residence prices` · `apartments for sale in New Capital City` · `apartments for sale in New Zayed` · `Taj New Capital City` · `villas for sale in New Capital City` · `villas for sale in New Zayed`

---

## 8. Launch checklist

1. Auto-tagging ON · `Lead - egy.deals` Primary + Recording · Enhanced Conversions ON.
2. Create the shared **10,000 EGP/day** budget + portfolio **Maximize Conversions**.
3. Build all 20 campaigns (Search · Egypt + Gulf · AR+EN · **mobile-only**, age 35+). Per developer, split into **Single-Theme Ad Groups per compound + a Brand+Area ad group, each language** (§3); one **DKI RSA per ad group** (§4); shared negatives (§6); sitelinks/callouts/call extension. Landing URLs per developer are in §7.
4. **Enable all 20 LIVE.**
5. Verify one test click per campaign lands on the right `/ar/developers/<slug>` (AR) / `/developers/<slug>` (EN) page with `gclid` present, and that the DKI headline renders the searched compound.
6. After ~1 week: report **CPL per developer**, shift shared budget toward the lowest CPL, pause spend-with-zero-conversion keywords.

## 9. Reference

- Site: https://www.egy.deals · dev pages `/developers/<slug>` (EN), `/ar/developers/<slug>` (AR)
- Account `AW-18195355585` · conversion `AW-18195355585/NMfzCPzfrMUcEMGvnORD`
- Budget 10,000 EGP/day shared · Maximize Conversions · mobile only · Egypt · AR+EN
- Lead = WhatsApp OR Call OR form OR chat handoff (all fire the conversion, all routed to brokers by the site's rotation engine)
- **Patch 2** (more developers, incl. ones being added to the site) comes after these are live.
