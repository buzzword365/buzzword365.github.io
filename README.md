# ZIZ — Interactive portfolio

An original interactive portfolio for Ziz, deployed via GitHub Pages.

**Live website:** https://buzzword365.github.io

## The experience

- Sculptural Weather Eyes character on the home screen. The **entire pair of white eyes**, the pupils, and the face's slight tilt now follow pointer movement in sync; touch interactions work on the hero as well.
- Full-screen animated navigation and scroll progress indicator.
- Kinetic typography, editorial storytelling, marquee and reveal transitions.
- Four interactive project cards with category filters and a live, keyboard-accessible project archive. Project details include features, technology, next/previous navigation (also via arrow keys) and real GitHub source links. The project count follows the active filter.
- **3D Object Study:** an original glossy reflective torus-knot sculpture rendered in real time using Three.js. Drag to rotate with mouse or finger, or use arrow keys while the canvas is focused.
- Three material finishes: Liquid Lime, Mirror Chrome and Obsidian. Reset the viewpoint, pause auto-rotation or save a PNG.
- The moving neon-green banner is seamless and always wider than the viewport.
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
| script.js | Navigation, project filtering, modals and motion preferences |
| sculpture.source.js | Editable 3D scene, materials, lighting and drag controls |
| assets/sculpture.bundle.js | Self-hosted browser build, no runtime CDN dependency |
| assets/THREE-LICENSE.txt | Unmodified Three.js MIT license |
| assets/*.svg | Custom project illustrations |
| assets/og-cover.jpg | Social sharing artwork |
| favicon.svg | Brand mark |

## Privacy

The website contains no personal local file paths, home addresses, school timetable information, music libraries or credentials. Appearance and motion settings use browser localStorage only. There is no analytics or server-side visitor tracking in the site's own source.

The website disables ordinary text selection as a presentation choice. This is NOT copy protection: HTML, code, text and screenshots are still accessible.

No registered-trade-mark claim is made for the nickname “Ziz”. Original material and third-party components retain their applicable rights. See [Privacy & Site Notes](privacy.html) for what the browser saves and third-party requests.

Typography uses system font stacks, with no external font requests. A restrictive Content Security Policy helps prevent accidental third-party tracking or script loading.

## Projects

- [Weather Eyes](https://github.com/buzzword365/weather-eyes)
- [Sonora Music](https://github.com/buzzword365/sonora-music)
- [Spoof by Ziz](https://github.com/buzzword365/spoof-by-ziz)
- [Class Notes](https://github.com/buzzword365/class-notes)

The site is an original design, inspired by the feel of expressive, motion-led digital studios rather than duplicating another company's implementation.

## Testing

Use npm ci, npm run build and npm run check to rebuild the Three.js bundle. Deployed visitors need no npm installation. The GitHub workflow checks reproducibility, script syntax, third-party license, project links and personal-data markers. Browser regression tests cover rotation, marquee continuity, mobile, keyboard input and reduced-motion support.
