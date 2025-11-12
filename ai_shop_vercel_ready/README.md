# AI Shop (Vercel-ready, geen lokale installatie nodig)

Dit is een kant-en-klare Next.js shop die je **rechtstreeks via GitHub + Vercel** kunt deployen.
Er zijn **geen environment variables** en **geen betaalde API's** nodig.

## Snelle deploy (zo doe je alles via de browser)
1. Ga naar **GitHub** → klik **New repository** → maak bijv. `ai-free-shop` aan.
2. Upload alle bestanden van deze map naar die repo (via de **Upload files** knop in GitHub).
3. Ga naar **Vercel** → **New Project** → **Continue with GitHub** → kies je repo → **Deploy**.
4. Klaar! Je krijgt een `https://...vercel.app` URL.

## Wat zit erin?
- Next.js (App Router) + Tailwind
- Productoverzicht en productdetail
- Demo “checkout” die een order-id teruggeeft (geen echte betaling, geen database)
- Afbeeldingen via https://picsum.photos (gratis)
- SEO: `robots.txt` en `sitemap.xml`

## Aanpassen (optioneel, later)
- Teksten/prijzen staan in `products.json`.
- Shopnaam/teksten in `app/layout.tsx` en `app/page.tsx`.