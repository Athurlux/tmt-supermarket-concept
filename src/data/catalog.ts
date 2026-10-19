// Demonstration catalogue. Prices (integer UGX) and availability are illustrative,
// not TMT pricing or inventory. Kept as plain typed data so a backend can replace it.

export type CategorySlug = 'fresh-produce' | 'bakery' | 'pantry' | 'household'

export type Availability = 'available' | 'limited' | 'unavailable'

export interface Category {
  slug: CategorySlug
  name: string
  shortName: string
  blurb: string
  image: string
  imageAlt: string
}

export interface ProductOption {
  id: string
  label: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  description: string
  /** Base name of the derivative in /images (product-<image>-<width>.webp). */
  image: string
  /** Cutouts sit on a tinted ground; photos fill their frame. */
  imageKind: 'cutout' | 'photo'
  imageAlt: string
  unit: string
  priceUgx: number
  availability: Availability
  keywords: string[]
  options?: { label: string; choices: ProductOption[] }
}

export const categories: Category[] = [
  {
    slug: 'fresh-produce',
    name: 'Fresh produce',
    shortName: 'Produce',
    blurb: 'Sun-ripened fruit, crisp greens and the vegetables your week is built on.',
    image: 'dept-fresh-produce',
    imageAlt: 'A wooden crate of tomatoes, pineapple, bananas, avocados, spinach and carrots',
  },
  {
    slug: 'bakery',
    name: 'Bakery',
    shortName: 'Bakery',
    blurb: 'Crusty loaves, flaky pastries and something warm for breakfast.',
    image: 'dept-bakery',
    imageAlt: 'Baguettes, a sliced farmhouse loaf and croissants on a linen cloth',
  },
  {
    slug: 'pantry',
    name: 'Pantry & dairy',
    shortName: 'Pantry',
    blurb: 'Grains, pulses, oils and milk — the staples that keep the kitchen moving.',
    image: 'dept-pantry',
    imageAlt: 'Glass jars of rice, red lentils and fusilli beside cooking oil, oats and a paper bag of flour',
  },
  {
    slug: 'household',
    name: 'Household & care',
    shortName: 'Household',
    blurb: 'Laundry, kitchen and bathroom essentials for a home that runs smoothly.',
    image: 'dept-household',
    imageAlt: 'Laundry detergent, dishwashing liquid, a paper towel roll, soap bars and a folded towel',
  },
]

export const products: Product[] = [
  {
    id: 'p-oranges', slug: 'sweet-oranges', name: 'Sweet oranges', category: 'fresh-produce',
    description: 'Juicy, thin-skinned oranges for breakfast juice, lunchboxes or a bowl on the counter.',
    image: 'orange', imageKind: 'cutout', imageAlt: 'A bright orange with a green leaf',
    unit: 'Pack of 4', priceUgx: 6000, availability: 'available', keywords: ['citrus', 'fruit', 'juice', 'vitamin c'],
  },
  {
    id: 'p-avocados', slug: 'avocados', name: 'Avocados', category: 'fresh-produce',
    description: 'Creamy avocados for toast, salads and guacamole. Choose how ripe you would like them.',
    image: 'avocado', imageKind: 'cutout', imageAlt: 'A whole avocado beside a halved avocado with its stone',
    unit: 'Pack of 3', priceUgx: 4500, availability: 'available', keywords: ['fruit', 'guacamole', 'salad', 'toast'],
    options: {
      label: 'Ripeness',
      choices: [
        { id: 'ready', label: 'Ready to eat' },
        { id: 'firm', label: 'Firm — ripen at home' },
      ],
    },
  },
  {
    id: 'p-bananas', slug: 'sweet-bananas', name: 'Sweet bananas', category: 'fresh-produce',
    description: 'Small, sweet bananas — an easy snack and a natural sweetener for porridge and smoothies.',
    image: 'bananas', imageKind: 'cutout', imageAlt: 'A bunch of ripe yellow bananas',
    unit: 'Bunch of 6', priceUgx: 3500, availability: 'available', keywords: ['fruit', 'ndizi', 'snack', 'smoothie'],
  },
  {
    id: 'p-tomatoes', slug: 'ripe-tomatoes', name: 'Ripe tomatoes', category: 'fresh-produce',
    description: 'Firm, deep-red tomatoes for stews, sauces, kachumbari and sandwiches.',
    image: 'tomatoes', imageKind: 'cutout', imageAlt: 'Three glossy red tomatoes with green stems',
    unit: 'Pack of 6', priceUgx: 4000, availability: 'available', keywords: ['vegetable', 'stew', 'sauce', 'kachumbari'],
  },
  {
    id: 'p-pineapple', slug: 'whole-pineapple', name: 'Whole pineapple', category: 'fresh-produce',
    description: 'A sweet, golden pineapple with a fresh crown — slice it for dessert or blend it into juice.',
    image: 'pineapple', imageKind: 'photo', imageAlt: 'A whole pineapple with its leafy crown in a produce crate',
    unit: 'Each', priceUgx: 5000, availability: 'available', keywords: ['fruit', 'juice', 'dessert', 'tropical'],
  },
  {
    id: 'p-carrots', slug: 'carrots', name: 'Carrots', category: 'fresh-produce',
    description: 'Crunchy carrots with their tops on, for roasting, soups and grated salads.',
    image: 'carrots', imageKind: 'photo', imageAlt: 'A bundle of orange carrots with feathery green tops',
    unit: 'Bundle of 6', priceUgx: 3000, availability: 'available', keywords: ['vegetable', 'soup', 'salad', 'roast'],
  },
  {
    id: 'p-spinach', slug: 'spinach', name: 'Spinach', category: 'fresh-produce',
    description: 'Tender green leaves to wilt into stews, stir into eggs or toss through a salad.',
    image: 'spinach', imageKind: 'photo', imageAlt: 'Fresh green spinach leaves in a produce crate',
    unit: 'Bunch', priceUgx: 2000, availability: 'available', keywords: ['greens', 'vegetable', 'leafy', 'salad'],
  },
  {
    id: 'p-cherry-tomatoes', slug: 'cherry-tomatoes-on-the-vine', name: 'Cherry tomatoes on the vine', category: 'fresh-produce',
    description: 'Sweet bite-sized tomatoes still on the vine — lovely roasted whole or straight from the punnet.',
    image: 'cherry-tomatoes', imageKind: 'photo', imageAlt: 'Clusters of small red cherry tomatoes on the vine',
    unit: '250 g punnet', priceUgx: 6500, availability: 'limited', keywords: ['vegetable', 'salad', 'snack', 'roast'],
  },
  {
    id: 'p-baguette', slug: 'crusty-baguette', name: 'Crusty baguette', category: 'bakery',
    description: 'A golden, crackling crust with a soft, open crumb. Best enjoyed the day you buy it.',
    image: 'baguette', imageKind: 'cutout', imageAlt: 'A long golden baguette with a scored crust',
    unit: 'Each', priceUgx: 4500, availability: 'available', keywords: ['bread', 'french', 'sandwich'],
  },
  {
    id: 'p-croissants', slug: 'butter-croissants', name: 'Butter croissants', category: 'bakery',
    description: 'Flaky, layered pastries baked to a deep golden brown — warm them for a slow weekend breakfast.',
    image: 'croissants', imageKind: 'photo', imageAlt: 'Two golden, flaky butter croissants',
    unit: 'Pack of 2', priceUgx: 7000, availability: 'available', keywords: ['pastry', 'breakfast', 'bread'],
  },
  {
    id: 'p-sliced-loaf', slug: 'farmhouse-sliced-loaf', name: 'Farmhouse sliced loaf', category: 'bakery',
    description: 'A soft white farmhouse loaf, pre-sliced for toast and sandwiches all week.',
    image: 'sliced-loaf', imageKind: 'photo', imageAlt: 'A farmhouse white loaf cut into thick slices',
    unit: '800 g loaf', priceUgx: 6500, availability: 'available', keywords: ['bread', 'toast', 'sandwich', 'white'],
  },
  {
    id: 'p-milk', slug: 'fresh-whole-milk', name: 'Fresh whole milk', category: 'pantry',
    description: 'Creamy whole milk for tea, coffee, porridge and cereal. Keep refrigerated.',
    image: 'milk', imageKind: 'cutout', imageAlt: 'A glass bottle of milk with a green cap',
    unit: '1 L bottle', priceUgx: 4000, availability: 'limited', keywords: ['dairy', 'tea', 'breakfast', 'chai'],
  },
  {
    id: 'p-cooking-oil', slug: 'sunflower-cooking-oil', name: 'Sunflower cooking oil', category: 'pantry',
    description: 'A light, all-purpose oil for frying, roasting and everyday cooking.',
    image: 'cooking-oil', imageKind: 'cutout', imageAlt: 'A tall glass bottle of golden cooking oil',
    unit: '1 L bottle', priceUgx: 12500, availability: 'available', keywords: ['oil', 'frying', 'cooking'],
  },
  {
    id: 'p-rice', slug: 'long-grain-white-rice', name: 'Long-grain white rice', category: 'pantry',
    description: 'Fluffy, separate grains for pilau, fried rice and everyday meals.',
    image: 'rice', imageKind: 'photo', imageAlt: 'A glass jar filled with long-grain white rice',
    unit: '1 kg pack', priceUgx: 7500, availability: 'available', keywords: ['grain', 'pilau', 'staple'],
  },
  {
    id: 'p-lentils', slug: 'red-lentils', name: 'Red lentils', category: 'pantry',
    description: 'Quick-cooking split lentils for dal, soups and hearty stews.',
    image: 'lentils', imageKind: 'photo', imageAlt: 'A glass jar of orange-red split lentils',
    unit: '500 g pack', priceUgx: 5500, availability: 'available', keywords: ['pulses', 'dal', 'soup', 'protein'],
  },
  {
    id: 'p-pasta', slug: 'fusilli-pasta', name: 'Fusilli pasta', category: 'pantry',
    description: 'Spiral pasta that holds onto sauce — ready in about ten minutes.',
    image: 'pasta', imageKind: 'photo', imageAlt: 'A glass jar packed with golden fusilli pasta spirals',
    unit: '500 g pack', priceUgx: 5000, availability: 'available', keywords: ['spaghetti', 'macaroni', 'dinner'],
  },
  {
    id: 'p-oats', slug: 'rolled-oats', name: 'Rolled oats', category: 'pantry',
    description: 'Wholegrain rolled oats for porridge, overnight oats and baking.',
    image: 'oats', imageKind: 'photo', imageAlt: 'A ceramic bowl heaped with rolled oats',
    unit: '500 g pack', priceUgx: 9000, availability: 'unavailable', keywords: ['porridge', 'breakfast', 'cereal', 'grain'],
  },
  {
    id: 'p-flour', slug: 'wheat-baking-flour', name: 'Wheat baking flour', category: 'pantry',
    description: 'All-purpose wheat flour for chapati, mandazi, cakes and bread.',
    image: 'flour', imageKind: 'photo', imageAlt: 'A brown paper bag of white flour',
    unit: '2 kg bag', priceUgx: 9500, availability: 'available', keywords: ['baking', 'chapati', 'mandazi', 'cake'],
  },
  {
    id: 'p-detergent', slug: 'laundry-liquid-detergent', name: 'Laundry liquid detergent', category: 'household',
    description: 'A concentrated liquid detergent for machine and hand washing.',
    image: 'detergent', imageKind: 'photo', imageAlt: 'A large white bottle of laundry detergent with an orange cap',
    unit: '2 L bottle', priceUgx: 24000, availability: 'available', keywords: ['laundry', 'washing', 'cleaning', 'soap'],
  },
  {
    id: 'p-dish-liquid', slug: 'dishwashing-liquid', name: 'Dishwashing liquid', category: 'household',
    description: 'A grease-cutting washing-up liquid that is gentle on hands.',
    image: 'dish-liquid', imageKind: 'photo', imageAlt: 'A clear bottle of green dishwashing liquid',
    unit: '750 ml bottle', priceUgx: 8500, availability: 'available', keywords: ['dishes', 'washing up', 'cleaning', 'kitchen'],
  },
  {
    id: 'p-kitchen-roll', slug: 'kitchen-paper-towel-roll', name: 'Kitchen paper towel roll', category: 'household',
    description: 'An absorbent, embossed paper roll for spills and wiping down surfaces.',
    image: 'kitchen-roll', imageKind: 'photo', imageAlt: 'A large white embossed paper towel roll',
    unit: 'Single roll', priceUgx: 4500, availability: 'available', keywords: ['paper', 'tissue', 'cleaning', 'kitchen'],
  },
  {
    id: 'p-bath-soap', slug: 'bath-soap-bars', name: 'Bath soap bars', category: 'household',
    description: 'Mild, paper-wrapped soap bars for everyday hand and body washing.',
    image: 'bath-soap', imageKind: 'photo', imageAlt: 'Two paper-wrapped bars of soap, one sage green and one cream',
    unit: 'Pack of 2', priceUgx: 6000, availability: 'available', keywords: ['soap', 'bath', 'body', 'personal care'],
  },
]

export const featuredProductIds = ['p-oranges', 'p-croissants', 'p-avocados', 'p-cooking-oil']
export const everydayFavouriteIds = ['p-bananas', 'p-milk', 'p-sliced-loaf', 'p-rice', 'p-tomatoes', 'p-dish-liquid']

const byId = new Map(products.map(product => [product.id, product]))
const bySlug = new Map(products.map(product => [product.slug, product]))

export const getProduct = (id: string) => byId.get(id)
export const getProductBySlug = (slug: string) => bySlug.get(slug)
export const getCategory = (slug: string | undefined) => categories.find(category => category.slug === slug)
export const productsByIds = (ids: string[]) => ids.map(id => byId.get(id)).filter((product): product is Product => Boolean(product))

/** Demo quantity ceiling per basket line; limited stock caps lower. */
export function maxQuantity(product: Product) {
  if (product.availability === 'unavailable') return 0
  return product.availability === 'limited' ? 4 : 20
}

export function optionLabel(product: Product, optionId: string | null) {
  if (!optionId || !product.options) return null
  return product.options.choices.find(choice => choice.id === optionId)?.label ?? null
}
