"""Generate web derivatives from the untouched originals in assets-src/original.

Run with `npm run images`. Outputs go to public/images and are committed, so the
build never depends on Python. Originals are never modified.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
source = root / 'assets-src' / 'original'
output = root / 'public' / 'images'
output.mkdir(parents=True, exist_ok=True)


def save(image, name, quality=84):
    target = output / f'{name}.webp'
    image.save(target, 'WEBP', quality=quality, method=6)
    print(f'{target.relative_to(root)}: {image.width}x{image.height}, {target.stat().st_size // 1024} KB')


def resized(image, width):
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def defringe(image, erode=3):
    """Pull the alpha edge inwards and feather it.

    The generated cutouts carry a band of background colour (yellow on the
    pineapple leaves of the bag) in their semi-transparent edge pixels. Eroding
    the matte removes that band; a small blur keeps the edge from looking cut.
    """
    image = image.convert('RGBA')
    alpha = image.getchannel('A')
    alpha = alpha.filter(ImageFilter.MinFilter(erode * 2 + 1)).filter(ImageFilter.GaussianBlur(0.7))
    image.putalpha(alpha)
    return image


def trim(image, pad=8):
    box = image.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    left, top, right, bottom = box
    return image.crop((max(left - pad, 0), max(top - pad, 0), min(right + pad, image.width), min(bottom + pad, image.height)))


# Full scenes: hero alternatives, departments and the delivery story.
scenes = {
    'hero-desktop': ('heroes/tmt-desktop-hero.png', [960, 1536]),
    'hero-mobile': ('heroes/tmt-mobile-hero.png', [640, 1024]),
    'dept-fresh-produce': ('departments/fresh-produce.png', [640, 1024, 1536]),
    'dept-bakery': ('departments/bakery.png', [640, 1024, 1536]),
    'dept-pantry': ('departments/pantry.png', [640, 1024, 1536]),
    'dept-household': ('departments/household-personal-care.png', [640, 1024, 1536]),
    'delivery': ('lifestyle/delivery-concept.png', [768, 1280, 1536]),
}
for name, (relative, widths) in scenes.items():
    with Image.open(source / relative) as original:
        for width in widths:
            save(resized(original.convert('RGB'), width), f'{name}-{width}', quality=80)

# The bag is the hero's single dominant object.
with Image.open(source / 'motion/tmt-grocery-bag-cutout.png') as original:
    bag = trim(defringe(original, erode=3))
    for width in [480, 820]:
        save(resized(bag, width), f'bag-{width}', quality=88)

# Standalone product cutouts double as hero motion layers.
cutouts = ['orange', 'avocado', 'baguette', 'bananas', 'tomatoes', 'milk', 'cooking-oil']
for name in cutouts:
    with Image.open(source / f'products/{name}-cutout.png') as original:
        cut = trim(defringe(original, erode=1), pad=40)
        # Square canvas so every product tile shares one frame.
        side = max(cut.size)
        canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        canvas.paste(cut, ((side - cut.width) // 2, (side - cut.height) // 2))
        for width in [320, 640]:
            save(resized(canvas, width), f'product-{name}-{width}', quality=86)

# Individual items cropped from the department photographs. Each crop frames one
# distinct item, so no two listings share an image. Boxes are (left, top, right, bottom).
crops = {
    'pineapple': ('fresh-produce', (510, 0, 1030, 520)),
    'carrots': ('fresh-produce', (1110, 290, 1530, 710)),
    'spinach': ('fresh-produce', (900, 410, 1280, 790)),
    'cherry-tomatoes': ('fresh-produce', (20, 330, 480, 790)),
    'croissants': ('bakery', (460, 340, 1100, 980)),
    'sliced-loaf': ('bakery', (970, 50, 1530, 610)),
    'rice': ('pantry', (45, 320, 525, 800)),
    'lentils': ('pantry', (312, 430, 732, 850)),
    'pasta': ('pantry', (500, 220, 900, 620)),
    'oats': ('pantry', (755, 525, 1195, 965)),
    'flour': ('pantry', (1000, 290, 1520, 810)),
    'detergent': ('household-personal-care', (260, 30, 920, 690)),
    'dish-liquid': ('household-personal-care', (637, 170, 1237, 770)),
    'kitchen-roll': ('household-personal-care', (1090, 370, 1530, 810)),
    'bath-soap': ('household-personal-care', (65, 510, 465, 910)),
}
for name, (department, box) in crops.items():
    with Image.open(source / f'departments/{department}.png') as original:
        crop = original.convert('RGB').crop(box)
        for width in [320, 640]:
            save(crop.resize((width, width), Image.Resampling.LANCZOS), f'product-{name}-{width}', quality=82)

# Landscape social preview that names the site as an independent concept.
fonts = Path('C:/Windows/Fonts')
cream, forest, orange, ink = (247, 241, 230), (21, 61, 40), (245, 106, 22), (23, 44, 32)
og = Image.new('RGB', (1200, 630), cream)
draw = ImageDraw.Draw(og)
draw.ellipse((770, -120, 1490, 760), fill=forest)
with Image.open(source / 'motion/tmt-grocery-bag-cutout.png') as original:
    bag = trim(defringe(original, erode=3))
    bag.thumbnail((470, 560), Image.Resampling.LANCZOS)
    og.paste(bag, (800, 50), bag)
headline = ImageFont.truetype(str(fonts / 'georgiab.ttf'), 70)
body = ImageFont.truetype(str(fonts / 'arial.ttf'), 28)
label = ImageFont.truetype(str(fonts / 'arialbd.ttf'), 20)
draw.text((72, 70), 'TMT SUPERMARKET · KAMPALA', font=label, fill=orange)
draw.text((72, 130), 'FRESH FINDS.', font=headline, fill=forest)
draw.text((72, 215), 'FULL BASKETS.', font=headline, fill=forest)
draw.text((72, 350), 'Shop, basket, delivery and collection —', font=body, fill=ink)
draw.text((72, 390), 'an interactive website concept.', font=body, fill=ink)
draw.rounded_rectangle((72, 490, 600, 548), radius=29, fill=forest)
draw.text((100, 505), 'INDEPENDENT CONCEPT · NOT AFFILIATED', font=label, fill=cream)
og.save(root / 'public' / 'og-image.jpg', 'JPEG', quality=86, optimize=True)
print('public/og-image.jpg written')
