# Data Model

Hierarchy: **Area → Developer → Compound → Unit (property)**

Draft schema — finalised in Phase 1 after inspecting nawy's API.

```
areas
  id            uuid pk
  name          text
  slug          text unique
  city          text
  lat, lng      numeric
  created_at    timestamptz

developers
  id            uuid pk
  name          text
  slug          text unique
  logo_url      text
  created_at    timestamptz

compounds
  id            uuid pk
  name          text
  slug          text unique
  area_id       uuid fk -> areas
  developer_id  uuid fk -> developers
  lat, lng      numeric
  delivery_date date
  amenities     text[]
  description   text          -- generated, not scraped
  created_at    timestamptz

units            -- individual properties for sale
  id            uuid pk
  title         text
  slug          text unique
  compound_id   uuid fk -> compounds
  property_type text          -- apartment, villa, townhouse, chalet...
  bedrooms      int
  bathrooms     int
  area_sqm      numeric
  price         numeric
  currency      text default 'EGP'
  payment_plan  jsonb         -- down payment, years, installments
  images        text[]
  description   text          -- generated, not scraped
  status        text default 'available'
  created_at    timestamptz

leads            -- contact form submissions (the revenue path)
  id            uuid pk
  unit_id       uuid fk -> units
  name          text
  phone         text
  email         text
  message       text
  created_at    timestamptz
```

Indexes: slugs (unique), `units(area via compound)`, `units(property_type,
bedrooms, price)` for filtered search. Postgres full-text on `units.title`.
