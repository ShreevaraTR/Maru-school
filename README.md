# Maru School: website redesign concept

A cinematic, interactive redesign of [maru-school.com](https://maru-school.com/), the Beginner Korean course taught by Henry Ahn. It uses the same business content as the live site: same prices, guarantees, teacher bio, course structure, CTA destinations and contact email. Only the presentation and UX are new.

Built with plain HTML, CSS and JavaScript. There is no build step, no dependencies, no backend and no API keys.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also open `index.html` directly in a browser. The Vimeo lesson snippet and the Google Fonts need an internet connection.

## Deploy (free)

Any static host works. Examples:

- **GitHub Pages:** Settings → Pages → Deploy from branch → root.
- **Netlify / Cloudflare Pages / Vercel:** import the repo, leave the build command empty, and set the output directory to `/`.

## Structure

```
index.html        all content, semantic sections
styles.css        design system, layout, animations, responsive + reduced-motion rules
main.js           interactions (nav, parallax, petals, Hangul, journey tabs, RU toggle, video facade)
assets/img/       images reused from the current Maru site (teacher, course, icons, reviews)
```

## Page sections (in order)

| # | Section | Source on the current site |
|---|---------|----------------------------|
| – | Hero: hanok night scene with MARU, the 30-day promise and CTAs | "Beginner Korean course / QUICK START", "In Only 30 Days…" |
| 01 | Interactive Hangul (한글 → ㅎㅏㄴ ㄱㅡㄹ → "Hangul") | "Master the Korean writing system (Hangul)", "Master Hangul: …" |
| 02 | 30-day journey (tabs: Hangul → Pronunciation → Grammar → Travel) | The four "In Only 30 Days, You Will:" items, word for word |
| 03 | Your results after the course (3 cinematic scenes) | The three results cards and their images |
| 04 | How the Course Works: Monday → During the week → Sunday timeline, video lessons (Vimeo), teacher support and feedback audio, "The course duration is 30 days" | Weekly block (Russian original + English translation), steps 1 and 2 |
| 05 | Course options: $90 / $190 (20 spots) / $390 (5 spots) with the Circle links, plus the Russian-language options | Pricing cards; Russian cards |
| 06 | Guarantees: Guaranteed results, Lifetime access, Money-Back Guarantee | Guarantee cards |
| 07 | Henry Ahn, Your Korean Teacher: bio and the 5 student reviews shown on the site | Teacher block and review screenshots |
| 08 | How the Korean language will change your life (5 chapters with a sticky visual) | The five reasons |
| – | Final CTA and footer with info@maru-school.com | "For any questions" |

## Content notes for the Maru team

- **Hidden Russian content.** The weekly schedule (понедельник / в течение недели / воскресенье) and four Russian pricing cards are in the current site's HTML but hidden on every screen size. They are kept word for word:
  - The schedule is shown with an English translation, and a toggle shows the Russian original.
  - The pricing cards sit in a collapsible "Тарифы на русском языке" panel.
- **The Russian cards mention a Japanese native-speaker teacher and a Miyazaki lecture course.** That suggests they were carried over from another course. They are kept verbatim and flagged here.
- **Russian buttons have no destination.** On the live site, "Подробнее", "Варианты рассрочки", "Оформить", "О преподавателе" and "Как выглядит чат" open empty pop-ups with no link. In the redesign they appear as inactive labels, so no destinations were invented.
- **Student reviews.** The five reviews (Dawn, Lili, Amen, Marie, Muhsin) are images on the current site. They are transcribed word for word, including original typos, and each links to its original image.
- **Images** are copied from the current site's CDN into `assets/img/`. Two large PNGs were re-encoded to WebP. The only assets not reused are two decorative red-arrow images from the hidden weekly block.

## Accessibility and performance

- Semantic landmarks, one `h1`, ordered headings, skip link, visible focus styles.
- The journey is a proper ARIA tablist (arrow keys, Home and End). Hangul syllables are toggle buttons with `aria-pressed`. The mobile menu has a focus loop and closes on Esc.
- `prefers-reduced-motion`: turns off parallax, petals, sway and reveal animations. Content is fully visible without JavaScript.
- The Vimeo player loads only on click (facade). Audio uses `preload="none"`. Images are lazy-loaded. The petal canvas pauses when the hero is off-screen or the tab is hidden.
