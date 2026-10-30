# Kavya — Portfolio

Personal portfolio built with React, TypeScript, Vite, Tailwind and GSAP.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Fill in your details

Everything in `[square brackets]` on the site is a placeholder.

1. **Text, projects, skills, links**: edit `src/data/content.ts` (the only content file).
   - `personal.headline` is the red tagline across the big name on the first screen.
   - Turn on social profiles with `url` + `enabled: true`.
   - Add achievements, certifications and activities to show the Highlights section.
2. **Resume**: put your PDF at `public/resume.pdf`.
3. **Contact form**: create a free access key at https://web3forms.com and paste it in
   `src/components/sections/ContactSection.tsx` in place of `YOUR_WEB3FORMS_ACCESS_KEY`.
4. **Project images**: add them to `public/images/projects/` and set `image` on each project.
5. **Photography / Art & craft pages**: drop files in `src/assets/photography/` or `src/assets/art/`,
   then set `ready: true` for that card in `content.ts`.
6. **After deploying**: replace `YOUR-DOMAIN` in `public/sitemap.xml` and set `seo.canonicalUrl` in `content.ts`.

## Intro animation

- Loader counts 0 → 100, then the name appears.
- Each letter of the name gets heavier and wider as the cursor moves near it (`src/components/sections/Hero.tsx`).
- A red glow follows the cursor across the whole site (`src/components/common/AmbientBackground.tsx`).
- Colours: accent and background are set in `src/styles/index.css` (`--accent`, `.site-bg`).
