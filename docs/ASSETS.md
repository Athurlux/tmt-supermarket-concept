# Asset record

All imagery in this project is **AI-generated concept art** supplied in `TMT_Supermarket_Concept_Assets.zip`
(see `assets-src/original/README.txt`). None of it documents TMT Supermarket's real products, packaging,
staff or premises. The TMT wordmark on the bag is a proposed concept treatment, not an official logo file.

## Originals

`assets-src/original/` holds the 16 original PNGs exactly as supplied, with the kit's `asset-manifest.json`
and `README.txt`. They are never modified. Web derivatives are produced by `npm run images`
(`scripts/optimize-images.py`, needs Python 3 with Pillow) and committed to `public/images/`.

## Derivatives

| Use | Source | Output | Treatment |
| --- | --- | --- | --- |
| Hero bag (motion layer) | `motion/tmt-grocery-bag-cutout.png` | `bag-480/820.webp` | Alpha eroded 3px and feathered to remove the yellow fringe on the pineapple leaves; trimmed |
| Product cutouts (cards + hero/story layers) | `products/*-cutout.png` (7) | `product-<name>-320/640.webp` | 1px alpha clean-up, trimmed, centred on a square transparent canvas |
| Department imagery | `departments/*.png` (4) | `dept-*-640/1024/1536.webp` | Resized only |
| Delivery story | `lifestyle/delivery-concept.png` | `delivery-768/1280/1536.webp` | Resized only; captioned as illustrative wherever shown large |
| About page | `heroes/tmt-desktop-hero.png`, `heroes/tmt-mobile-hero.png` | `hero-desktop-*`, `hero-mobile-*` | Resized; served art-directed via `<picture>` so a phone downloads only the mobile scene |
| Social preview | bag cutout + live text | `public/og-image.jpg` | Composed 1200×630, labelled "Independent concept · Not affiliated" |

`social/fresh-finds-cover.png` is preserved but not used: it is a flattened poster, not a website screen.

## Product crops from department photographs

Only seven standalone product images exist, so fifteen further listings use a square crop of one distinct
item from a department photograph. Each crop frames a different item, so no two listings share an image.
Boxes are `(left, top, right, bottom)` in source pixels.

| Product | Source | Box |
| --- | --- | --- |
| Whole pineapple | fresh-produce | 510, 0, 1030, 520 |
| Carrots | fresh-produce | 1110, 290, 1530, 710 |
| Spinach | fresh-produce | 900, 410, 1280, 790 |
| Cherry tomatoes on the vine | fresh-produce | 20, 330, 480, 790 |
| Butter croissants | bakery | 460, 340, 1100, 980 |
| Farmhouse sliced loaf | bakery | 970, 50, 1530, 610 |
| Long-grain white rice | pantry | 45, 320, 525, 800 |
| Red lentils | pantry | 312, 430, 732, 850 |
| Fusilli pasta | pantry | 500, 220, 900, 620 |
| Rolled oats | pantry | 755, 525, 1195, 965 |
| Wheat baking flour | pantry | 1000, 290, 1520, 810 |
| Laundry liquid detergent | household-personal-care | 260, 30, 920, 690 |
| Dishwashing liquid | household-personal-care | 637, 170, 1237, 770 |
| Kitchen paper towel roll | household-personal-care | 1090, 370, 1530, 810 |
| Bath soap bars | household-personal-care | 65, 510, 465, 910 |

Neighbouring items are visible at the edges of some crops (for example, the lentil jar beside the rice);
alt text describes the featured item. Product photography from the store should replace these before any
real use.

## Licence

The artwork is **not** covered by any open-source licence and may not be reused outside this portfolio
concept. The TMT name and any resemblance to its branding belong to their owner.
