# Customising the design

The default look is an original "enchanted library" theme: a dark indigo background, cream parchment panels, gold details, serif type and a starry night mode. Everything visual lives in the board page (`web/index.html`, and `apps-script/Index.html` if you open the Google link directly), so you can restyle it without touching the data side.

There are four layers you can change, from easiest to most involved.

## 1. Colours and fonts

Colours are plain hex values in the `<style>` block and the render functions. The main ones:

| Colour | Used for |
|---|---|
| `#1C1A2E` | page background |
| `#F3E9D2` | main text |
| `#C9B37E` | gold labels and headings |
| `#A9A2C6` | muted text |
| `#F1E6CC` | parchment panels (behind the texture) |
| `#D9574C` | route-change alert |

Use your editor's find-and-replace to swap a colour everywhere. Each person's colour and tint come from `PEOPLE` in `Config.gs`, so you don't need to change the page for those.

Fonts are **Cinzel** (headings, numbers) and **EB Garamond** (text), both free from Google Fonts and loaded by the `<link>` at the top of the page. To change them, replace that link with other Google Fonts and update the `font-family` lines.

## 2. Icons

Icons are drawn in code, so they stay sharp and can be any colour. They live in the `HFICONS` list in the page: each entry is the inside of an SVG drawn on a 1024×1024 grid, using `currentColor` so the board can tint it.

**To replace one** (e.g. `fuel`):
1. Get an SVG of the icon (see below for where).
2. Open it in a text editor. Copy everything **between** `<svg …>` and `</svg>`.
3. Change any `fill="#000000"` (or other colour) to `fill="currentColor"`. For outline-style icons, use `stroke="currentColor"` instead.
4. Paste it as the value for `fuel` in `HFICONS`.
5. If the icon's `viewBox` isn't `0 0 1024 1024` (most icon sets use `0 0 24 24`), add it to `HFVIEW`, e.g. `fuel: '0 0 24 24'`.

Icon names in use: `cat`, `car`, `candle` (the house), `bin`, `sun`, `moon`, `cloud`, `rain`, `snow`, `fog`, `storm`, `frost`, `fuel`, `alert`, `dinner`, `cake`. To give a person a different icon, add a new name here and use it in `PEOPLE` in `Config.gs`.

**Tip:** solid, chunky icons read far better across a kitchen than thin outlines. Thin line icons looked washed out on the real tablet.

## 3. Background artwork

Four images make up the textures, listed in `ART` near the top of the script:

| Key | File | Shown |
|---|---|---|
| `parchment` | `assets/art/parchment.png` | behind the cream panels |
| `dayBg` | `assets/art/day-background.png` | behind the daytime board (darkened so text stays readable) |
| `nightSky` | `assets/art/night-sky.png` | night mode |
| `corner` | `assets/art/corner.svg` | gold flourish in two corners of the week panel |

To use your own, either point `ASSET_BASE` at your own fork/host or replace individual URLs. Set one to `''` to use a plain colour instead. Keep backgrounds dark and low-detail so text stays readable from across a room. Around 1280×800 at 1–2 MB is plenty.

## 4. Layout

The board is designed at **1280×800** (a 10-inch tablet in landscape) and scales itself to fit any screen. The layout is plain HTML and CSS in the page (`#day` with a left and right column, `#night` for night mode). Edit those blocks to move panels around.

---

## How the original was made (Higgsfield)

All the artwork and icons were generated in **[Higgsfield](https://higgsfield.ai)** with the **GPT Image 2.6** model, about 0.25 credits per image:

- **Icons** were generated as **SVG output** (a real vector file, not a picture), so they could be pasted straight into `HFICONS`. Every icon used the same prompt pattern so the set matches:

  > A single bold app icon glyph of **[a petrol pump with a hose, a display window near the top]**. Solid filled silhouette in pure black #000000 on a transparent background, **[the display window]** as a cut-out hole. No outline-only strokes, no gradients, no shading, no texture, no text. Thick chunky shapes, rounded corners, minimal detail so it stays crisp and readable at 24 pixels. Centered, filling about 85% of a square canvas.

  Only the bracketed parts change from icon to icon.

- **Textures** were generated as PNGs with prompts along these lines:

  > Seamless aged parchment paper texture, warm cream, subtle fibres and soft vignette, evenly lit, no text, no objects, flat top-down, 16:10.

  > Deep indigo night sky full of tiny soft stars and faint nebula haze, calm and dark, no moon, no landscape, no text, 16:10.

  > Dark moody library interior, out-of-focus shelves and candlelight, very low contrast, deep indigo and gold tones, no people, no text, 16:10.

- **The corner flourish** was made the same way as an SVG, from a prompt like "gold engraved corner ornament, scrolling filigree, single colour #C9A44C, transparent background".

## Doing it without Higgsfield

You don't need any paid tool:

- **AI images (free):** ChatGPT, Google Gemini and Microsoft Designer / Bing Image Creator can all make textures and backgrounds from the prompts above. For icons, ask for "a flat black silhouette icon on a white background", then convert it to SVG with a free tracer like the one built into [Inkscape](https://inkscape.org) (Path → Trace Bitmap) or an online "PNG to SVG" converter.
- **Ask an AI to write the SVG:** chat assistants can write simple SVG icons directly. Ask for "an SVG icon of X on a 1024×1024 viewBox, single solid fill, chunky shapes, no strokes".
- **Free icon libraries:** [Tabler Icons](https://tabler.io/icons), [Phosphor](https://phosphoricons.com) (has a *Fill* style), [Material Symbols](https://fonts.google.com/icons) (set *Fill* on) and [Lucide](https://lucide.dev). Download the SVG and follow the "replace one" steps above. Filled styles look best on the board.
- **Free photos and textures:** [Unsplash](https://unsplash.com) and [Pexels](https://www.pexels.com) have paper, night sky and interior photos you can use. Darken them a little in any photo editor.
- **Draw your own:** Figma (free), Inkscape or even PowerPoint can export shapes as SVG.

**Keep it original.** Avoid copying a film, game or brand's artwork or characters, especially if you share your version. Describe the *mood* you want ("cosy wizard library", "retro arcade", "Scandi minimal") rather than naming a franchise.

### Theme ideas

- **Scandi minimal:** off-white panels, charcoal text, one accent colour, no textures (`ART` entries set to `''`).
- **Retro arcade:** black background, neon pink and cyan, a pixel font such as *Press Start 2P*.
- **Garden:** sage green, botanical line-art corners, a watercolour paper texture.
