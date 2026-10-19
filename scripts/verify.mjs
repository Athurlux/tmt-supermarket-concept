// End-to-end journey verification against a running build.
//   npm run build && npm run preview      (then, in another terminal)
//   npm run verify                         (local, also writes screenshots)
//   VERIFY_URL=https://… npm run verify    (deployed site, no screenshots)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = (process.env.VERIFY_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
const SCREENSHOTS = !process.env.VERIFY_URL
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const ALLOWED_HOSTS = new Set([new URL(BASE).host, 'fonts.googleapis.com', 'fonts.gstatic.com'])

const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-gpu'] })
const failures = []
const passes = []
const requests = []

function check(condition, message) {
  if (condition) passes.push(message)
  else failures.push(message)
}

async function newPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, ...options })
  const page = await context.newPage()
  page.errors = []
  page.on('pageerror', error => page.errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') page.errors.push(message.text()) })
  page.on('request', request => requests.push({ method: request.method(), url: request.url() }))
  page.on('response', response => { if (response.status() >= 400) page.errors.push(`${response.status()} ${response.url()}`) })
  return page
}

const go = (page, path) => page.goto(BASE + path, { waitUntil: 'networkidle' })
const basketCount = page => page.locator('.basket-button__count').innerText().then(Number)
const ugx = text => Number(text.replace(/[^0-9]/g, ''))

async function journey(name, run) {
  const before = failures.length
  try {
    await run()
  } catch (error) {
    failures.push(`${name}: threw ${error.message.split('\n')[0]}`)
  }
  console.log(`${failures.length === before ? 'PASS' : 'FAIL'}  ${name}`)
}

// 1. Homepage → shop → search/filter → product → add to basket
await journey('1 home → shop → search/filter → product → add', async () => {
  const page = await newPage()
  await go(page, '/')
  await page.getByRole('link', { name: 'Start shopping' }).first().click()
  await page.waitForURL('**/shop')
  await page.waitForFunction(() => document.title === 'Shop · TMT Supermarket concept').catch(() => {})
  check(await page.title() === 'Shop · TMT Supermarket concept', 'shop title updates')
  await page.getByLabel('Search products').fill('banana')
  await page.waitForURL(/q=banana/)
  check((await page.locator('.product-card').count()) === 1, 'search narrows to bananas')
  await page.getByRole('navigation', { name: 'Filter by department' }).getByRole('link', { name: 'Fresh produce' }).click()
  await page.waitForURL(/\/shop\/fresh-produce\?q=banana/)
  check(true, 'category filter preserves search in URL')
  await page.getByRole('button', { name: 'Remove search: banana' }).click()
  await page.getByLabel('Sort').selectOption('price-asc')
  await page.waitForURL(/sort=price-asc/)
  const prices = await page.locator('.product-card .price').allInnerTexts()
  const values = prices.map(ugx)
  check(values.every((value, index) => index === 0 || value >= values[index - 1]), 'price sort ascending')
  await page.getByRole('link', { name: 'Sweet oranges' }).click()
  await page.waitForURL('**/product/sweet-oranges')
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await page.getByRole('button', { name: /Add to basket/ }).click()
  check((await page.locator('.toast').innerText()).includes('Added 2 × Sweet oranges'), 'add feedback announces quantity')
  check(await basketCount(page) === 2, 'basket count shows 2')
  check(page.errors.length === 0, `no runtime errors on journey 1 (${page.errors.join('; ')})`)

  // 2. Same product from another page merges
  await go(page, '/shop')
  await page.getByRole('button', { name: 'Add Sweet oranges to basket' }).click()
  check(await basketCount(page) === 3, 'adding from shop card merges count to 3')
  await go(page, '/cart')
  check((await page.locator('.basket-line').count()) === 1, 'merged into a single basket line')
  check(await page.locator('.basket-line .stepper__input').inputValue() === '3', 'merged line quantity is 3')

  // 3. Cart quantity editing and totals
  const input = page.locator('.basket-line .stepper__input')
  await input.fill('25')
  await input.press('Enter')
  check(await input.inputValue() === '20', 'direct entry above limit clamps to 20')
  check(await page.locator('.stepper__message').isVisible(), 'limit message shown')
  await input.fill('2')
  await input.press('Enter')
  await page.locator('.basket-line').getByRole('button', { name: 'Increase quantity' }).click()
  const subtotal = ugx(await page.locator('.order-summary .summary-row').first().innerText())
  check(subtotal === 3 * 6000, `subtotal recalculates (got ${subtotal})`)
  check(ugx(await page.locator('.basket-line__total').innerText()) === 18000, 'line total recalculates')
  await page.getByRole('button', { name: 'Remove Sweet oranges from basket' }).click()
  check(await page.getByRole('heading', { name: 'Your basket is empty.' }).isVisible(), 'empty cart state after removal')
  await page.context().close()
})

// 4. Delivery checkout with validation and sample details
await journey('4 delivery checkout → validation → sample → review → complete', async () => {
  const page = await newPage()
  await go(page, '/product/butter-croissants')
  await page.getByRole('button', { name: /Add to basket/ }).click()
  await page.getByRole('button', { name: /^Basket/ }).click()
  await page.getByRole('dialog').getByRole('link', { name: /Checkout/ }).click()
  await page.waitForURL('**/checkout*')
  await page.getByRole('button', { name: 'Continue to details' }).click()
  check(await page.locator('#error-summary').evaluate(el => el === document.activeElement), 'error summary receives focus')
  check(await page.locator('#method-error').isVisible(), 'fulfilment method error is shown')
  await page.getByLabel(/^Delivery/).check()
  await page.getByLabel(/^Muyenga/).check()
  await page.getByRole('button', { name: 'Continue to details' }).click()
  await page.waitForURL(/step=details/)
  check(await page.locator('h2.stage-title').evaluate(el => el === document.activeElement), 'focus moves to stage heading')
  await page.getByLabel('Phone number').fill('12345')
  await page.getByLabel('Preferred delivery date').fill('2020-01-01')
  await page.getByRole('button', { name: 'Review checkout' }).click()
  check(await page.locator('#fullName-error').isVisible(), 'name required')
  check((await page.locator('#phone-error').innerText()).includes('Ugandan number'), 'invalid phone rejected')
  check((await page.locator('#date-error').innerText()).includes('Kampala time'), 'past date rejected')
  check(await page.locator('#address-error').isVisible(), 'delivery address required')
  await page.getByRole('button', { name: 'Use sample details' }).click()
  await page.getByRole('button', { name: 'Review checkout' }).click()
  await page.waitForURL(/step=review/)
  const review = await page.locator('.review-totals').innerText()
  check(review.includes('Demo delivery fee') && review.includes('UGX 5,000'), 'review shows demo delivery fee')
  check(review.includes('UGX 12,000'), 'review total = 7,000 + 5,000')
  check(await page.getByText('Demonstration only. No payment is collected and no order is sent.').isVisible(), 'demo note beside final action')
  // Two activations in the same tick must still produce exactly one completion.
  await page.getByRole('button', { name: 'Complete demo checkout' }).evaluate(button => { button.click(); button.click() })
  await page.waitForURL(/\/order-demo\/DEMO-/)
  await page.waitForTimeout(300)
  check(await page.evaluate(() => history.length) <= 6 && /\/order-demo\/DEMO-[A-Z0-9]{6}$/.test(page.url()), 'double activation completes once')
  check(await page.getByRole('heading', { name: 'Your demo checkout is complete.' }).isVisible(), 'confirmation heading')
  check(await page.getByText('This is not a real order.').isVisible(), 'not-a-real-order notice')
  check(await page.getByRole('button', { name: 'Print summary' }).isVisible(), 'print action')
  check(await basketCount(page) === 0, 'basket cleared after completion')
  check(await page.evaluate(() => localStorage.getItem('tmt-concept-basket')) === null, 'persisted basket cleared')
  check(!(await page.content()).includes('staff were notified'), 'no false notification claim')
  if (SCREENSHOTS) await page.screenshot({ path: 'docs/screenshots/confirmation-1280.png', fullPage: true })
  // Refreshing the confirmation falls back gracefully.
  await page.reload({ waitUntil: 'networkidle' })
  check(await page.getByRole('heading', { name: 'This demo summary isn’t available.' }).isVisible(), 'refreshed confirmation shows fallback')
  check(page.errors.length === 0, `no runtime errors on journey 4 (${page.errors.join('; ')})`)
  await page.context().close()
})

// 5 + 8. Branch preference → collection checkout without delivery fields
await journey('5/8 branch preference → collection checkout', async () => {
  const page = await newPage()
  await go(page, '/branches')
  await page.locator('#bukoto').getByRole('button', { name: 'Shop for collection here' }).click()
  await page.waitForURL('**/shop')
  check((await page.locator('.shop-hero__pref').innerText()).replace(/\s+/g, ' ').includes('Collecting from Bukoto'), 'shop shows collection branch')
  check((await page.locator('.branch-chip').innerText()).includes('Bukoto'), 'header shows preferred branch')
  await page.getByRole('button', { name: 'Add Fusilli pasta to basket' }).click()
  await go(page, '/checkout')
  check(await page.getByLabel(/^Click and collect/).isChecked(), 'collection preselected from branch page')
  check(await page.getByLabel(/^Bukoto/).isChecked(), 'Bukoto preselected')
  await page.getByRole('button', { name: 'Continue to details' }).click()
  await page.waitForURL(/step=details/)
  check(await page.locator('#address').count() === 0 && await page.locator('#landmark').count() === 0, 'delivery fields hidden for collection')
  await page.getByRole('button', { name: 'Use sample details' }).click()
  await page.getByRole('button', { name: 'Review checkout' }).click()
  await page.waitForURL(/step=review/)
  const totals = await page.locator('.review-totals').innerText()
  check(totals.includes('Collection fee') && totals.includes('UGX 0'), 'collection fee shown as UGX 0')
  check(totals.includes('Demo total') && totals.match(/UGX 5,000/g)?.length >= 2, 'collection total equals subtotal')
  check(!(await page.locator('.review-grid').innerText()).includes('Address'), 'no address in collection summary')
  await page.context().close()
})

// 6 + 9. Back/forward keeps values; refresh keeps basket but not personal data
await journey('6/9 back-forward coherence and refresh privacy', async () => {
  const page = await newPage()
  await go(page, '/product/sweet-bananas')
  await page.getByRole('button', { name: /Add to basket/ }).click()
  await go(page, '/checkout')
  await page.getByLabel(/^Delivery/).check()
  await page.getByLabel(/^Muyenga/).check()
  await page.getByRole('button', { name: 'Continue to details' }).click()
  await page.waitForURL(/step=details/)
  await page.getByLabel('Full name').fill('Back Button Tester')
  await page.goBack()
  await page.waitForURL(/\/checkout(\?step=fulfilment)?$/)
  check(await page.getByLabel(/^Delivery/).isChecked(), 'fulfilment choice kept after Back')
  await page.goForward()
  await page.waitForURL(/step=details/)
  check(await page.getByLabel('Full name').inputValue() === 'Back Button Tester', 'typed name kept after Forward')
  check(await basketCount(page) === 1, 'basket coherent through history navigation')
  await page.reload({ waitUntil: 'networkidle' })
  check(await basketCount(page) === 1, 'basket survives refresh')
  check(!(await page.url()).includes('Tester'), 'no personal data in URL')
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }))
  check(!stored.includes('Tester'), 'no personal data in storage')
  check(await page.locator('#fullName').count() === 0 || await page.getByLabel('Full name').inputValue() === '', 'personal fields empty after refresh')
  await page.context().close()
})

// 7. Contact enquiry → preview → demo confirmation
await journey('7 contact enquiry → preview → confirmation', async () => {
  const page = await newPage()
  await go(page, '/contact')
  await page.getByRole('button', { name: 'Preview enquiry' }).click()
  check((await page.locator('#contact-error').innerText()).includes('email address or a phone number'), 'requires email or phone')
  await page.getByLabel('Name', { exact: true }).fill('Amara Demo')
  await page.getByLabel('Topic').selectOption('occasion')
  check(await page.getByLabel('Date of your occasion').isVisible(), 'occasion date field appears conditionally')
  await page.getByLabel(/^Phone/).fill('0772 123 456')
  await page.getByLabel('Message').fill('Planning a family introduction for about forty guests.')
  await page.getByRole('button', { name: 'Preview enquiry' }).click()
  check(await page.locator('#eventDate-error').isVisible(), 'occasion date required')
  const date = await page.getByLabel('Date of your occasion').getAttribute('min')
  await page.getByLabel('Date of your occasion').fill(date)
  await page.getByRole('button', { name: 'Preview enquiry' }).click()
  check(await page.getByRole('heading', { name: 'Review your enquiry' }).isVisible(), 'review step shown')
  check((await page.locator('.review-list').innerText()).includes('+256772123456'), 'phone normalised in review')
  await page.getByRole('button', { name: 'Edit enquiry' }).click()
  check(await page.getByLabel('Name', { exact: true }).inputValue() === 'Amara Demo', 'values preserved when editing')
  await page.getByRole('button', { name: 'Preview enquiry' }).click()
  await page.getByRole('button', { name: 'Complete demo enquiry' }).click()
  check(await page.getByRole('heading', { name: 'Your demo enquiry is complete.' }).isVisible(), 'enquiry confirmation')
  check(await page.getByText('Nothing was sent.').isVisible(), 'enquiry not-sent notice')
  await page.context().close()
})

// 10 + 11. Direct URLs and empty / unknown states
await journey('10/11 direct routes, empty and unknown states', async () => {
  const page = await newPage()
  const direct = [
    ['/product/sweet-oranges', 'Sweet oranges'],
    ['/shop/bakery', 'Bakery'],
    ['/checkout', 'Your basket is empty.'],
    ['/order-demo/DEMO-ABCDEF', 'This demo summary isn’t available.'],
    ['/cart', 'Your basket is empty.'],
    ['/product/not-a-product', 'We couldn’t find that product.'],
    ['/shop/not-a-department', 'We couldn’t find that department.'],
    ['/definitely/missing', 'This aisle doesn’t exist.'],
    ['/delivery', 'Your shopping, your way.'],
    ['/branches', 'Two neighbourhoods. One basket.'],
    ['/about', 'The neighbourhood shop, made a little more beautiful.'],
  ]
  for (const [path, heading] of direct) {
    const response = await go(page, path)
    check(response.status() === 200, `${path} serves 200`)
    check(await page.getByRole('heading', { level: 1, name: heading }).isVisible(), `${path} renders “${heading}”`)
  }
  await go(page, '/shop?q=zzzz')
  check(await page.getByRole('heading', { name: /No products match/ }).isVisible(), 'no-results state')
  await go(page, '/product/rolled-oats')
  check(await page.getByRole('button', { name: /Add to basket/ }).count() === 0, 'unavailable product cannot be added')
  check(page.errors.length === 0, `no runtime errors on direct routes (${page.errors.join('; ')})`)
  await page.context().close()
})

// 12. Reduced motion, keyboard, mobile navigation and drawer focus
await journey('12 reduced motion, keyboard, mobile menu, drawer focus', async () => {
  const reduced = await newPage({ reducedMotion: 'reduce' })
  await go(reduced, '/')
  const state = await reduced.evaluate(() => {
    const line = document.querySelector('[data-hero="line"]')
    return { opacity: getComputedStyle(line).opacity, transform: line.style.transform, pending: document.documentElement.classList.contains('hero-pending') }
  })
  check(state.opacity === '1' && !state.transform && !state.pending, 'reduced motion shows static hero immediately')
  const deptOpacity = await reduced.locator('[data-anim="dept"]').first().evaluate(el => getComputedStyle(el).opacity)
  check(deptOpacity === '1', 'reduced motion leaves departments visible without scrolling')
  await reduced.context().close()

  const mobile = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await go(mobile, '/')
  await mobile.keyboard.press('Tab')
  check(await mobile.evaluate(() => document.activeElement?.textContent) === 'Skip to content', 'first Tab reaches skip link')
  const menu = mobile.getByRole('button', { name: 'Open menu' })
  await menu.click()
  check(await mobile.getByRole('button', { name: 'Close menu' }).getAttribute('aria-expanded') === 'true', 'menu exposes expanded state')
  await mobile.keyboard.press('Escape')
  check(await menu.getAttribute('aria-expanded') === 'false', 'Escape closes menu')
  await menu.click()
  await mobile.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Delivery' }).click()
  await mobile.waitForURL('**/delivery')
  check(await mobile.getByRole('button', { name: 'Open menu' }).getAttribute('aria-expanded') === 'false', 'menu closes after navigation')

  const basket = mobile.getByRole('button', { name: /^Basket/ })
  await basket.focus()
  await mobile.keyboard.press('Enter')
  check(await mobile.getByRole('dialog').isVisible(), 'drawer opens from keyboard')
  check(await mobile.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null), 'focus moves into drawer')
  for (let i = 0; i < 6; i++) await mobile.keyboard.press('Tab')
  check(await mobile.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null), 'focus trapped in drawer')
  await mobile.keyboard.press('Escape')
  check(await mobile.getByRole('dialog').count() === 0, 'Escape closes drawer')
  check(await basket.evaluate(el => el === document.activeElement), 'focus restored to basket button')
  await mobile.context().close()
})

// Responsive overflow, images and layout at every target width
await journey('responsive: overflow and images at 360–1440', async () => {
  if (SCREENSHOTS) mkdirSync('docs/screenshots', { recursive: true })
  const routes = ['/', '/shop', '/product/avocados', '/cart', '/checkout', '/delivery', '/branches', '/contact', '/about']
  for (const width of [360, 390, 768, 1024, 1440]) {
    const page = await newPage({ viewport: { width, height: width < 700 ? 800 : 900 } })
    await go(page, '/product/sweet-oranges')
    await page.getByRole('button', { name: /Add to basket/ }).click()
    for (const route of routes) {
      await go(page, route)
      await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager' }))
      await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        broken: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
      }))
      check(result.overflow <= 0, `${route} @${width}px has no horizontal overflow (${result.overflow}px)`)
      check(result.broken.length === 0, `${route} @${width}px images load (${result.broken.join(', ')})`)
    }
    if (width <= 390) {
      await go(page, '/')
      const ctaBottom = await page.getByRole('link', { name: 'Start shopping' }).first().evaluate(el => el.getBoundingClientRect().bottom)
      check(ctaBottom < 800, `primary CTA visible in first screen at ${width}px`)
    }
    if (SCREENSHOTS && [390, 1440].includes(width)) {
      const label = width === 1440 ? 'desktop' : 'mobile'
      for (const [route, name] of [['/', 'home'], ['/shop', 'shop'], ['/checkout?step=fulfilment', 'checkout'], ['/delivery', 'delivery']]) {
        await go(page, route)
        await page.waitForTimeout(1800)
        await page.screenshot({ path: `docs/screenshots/${name}-${label}.png` })
      }
    }
    check(page.errors.length === 0, `no runtime errors @${width}px (${page.errors.join('; ')})`)
    await page.context().close()
  }
})

// Nothing may leave the browser except page assets and fonts.
const nonGet = requests.filter(request => request.method !== 'GET')
const foreign = requests.filter(request => !ALLOWED_HOSTS.has(new URL(request.url).host) && !request.url.startsWith('data:'))
check(nonGet.length === 0, `no non-GET requests (${nonGet.map(r => `${r.method} ${r.url}`).join(', ')})`)
check(foreign.length === 0, `no third-party requests (${[...new Set(foreign.map(r => new URL(r.url).host))].join(', ')})`)

await browser.close()
console.log(`\n${passes.length} checks passed, ${failures.length} failed.`)
if (failures.length) {
  console.log('\nFailures:\n- ' + failures.join('\n- '))
  process.exit(1)
}
