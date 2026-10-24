# ZIZ® — Interactive portfolio

An original interactive portfolio for Ziz, deployed via GitHub Pages.

**Live website:** https://buzzword365.github.io

## The experience

- Sculptural, cursor-following Weather Eyes character on the home screen.
- Full-screen animated navigation and scroll progress indicator.
- Kinetic typography, editorial storytelling, marquee and reveal transitions.
- Four interactive project cards with category filters and accessible detail dialogs.
- Original Signal Lab canvas: responsive particle network, cursor and touch interaction, tap-to-pulse, intensity slider, colour switch and reset.
- Magnetic buttons, microinteractions and custom desktop cursor treatment.
- Touch-compatible responsive layout, light/dark themes and motion controls.
- Respects the visitor's reduced-motion preference; semantic navigation and keyboard interactions.

## Local development

This is a static site; no framework, bundler, or credentials are needed. Run:

    python3 -m http.server 8000

Then open http://localhost:8000.

## Structure

| File | Purpose |
|---|---|
| index.html | Semantic content, navigation, featured projects and dialog |
| style.css | Responsive styling, animations and visual components |
| script.js | Interaction logic, preference state and canvas animation |
| assets/*.svg | Custom project illustrations |
| assets/og-cover.jpg | Social sharing artwork |
| favicon.svg | Brand mark |

## Privacy

The website contains no personal local file paths, home addresses, school timetable information, music libraries or credentials. Appearance and motion settings use browser localStorage only. There is no analytics or server-side visitor tracking in the site source.

Typography may load from Google Fonts. If it is blocked, system fonts will be used instead.

## Projects

- [Weather Eyes](https://github.com/buzzword365/weather-eyes)
- [Sonora Music](https://github.com/buzzword365/sonora-music)
- [Spoof by Ziz](https://github.com/buzzword365/spoof-by-ziz)
- [Class Notes](https://github.com/buzzword365/class-notes)

The site is an original design, inspired by the feel of expressive, motion-led digital studios rather than duplicating another company's implementation.

## Testing

Run node --check script.js. The GitHub workflow checks JavaScript syntax, local image references, project links and privacy markers. The project has also been exercised using headless Chrome with mobile and desktop interaction tests.
