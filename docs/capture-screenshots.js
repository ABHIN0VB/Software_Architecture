const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5000';
const OUT = path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

async function cleanUI(page, { keepChat = false } = {}) {
  await page.evaluate((keepChat) => {
    const splash = document.getElementById('app-splash-screen');
    if (splash) splash.remove();
    const panel = document.getElementById('ff-chatbot-panel');
    const toggle = document.getElementById('ff-chatbot-toggle');
    const widget = document.getElementById('ff-chatbot-widget');
    if (!keepChat) {
      if (panel) panel.classList.add('minimized');
      if (toggle) toggle.classList.remove('hidden');
      if (widget) widget.style.display = 'none';
    } else {
      if (widget) widget.style.display = '';
      if (panel) panel.classList.remove('minimized');
      if (toggle) toggle.classList.add('hidden');
    }
  }, keepChat);
}

async function shot(page, name, opts) {
  await cleanUI(page, opts);
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('saved', name);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(OUT, '01-splash.png') });
  console.log('saved 01-splash');
  await shot(page, '02-home');

  await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle2' });
  await shot(page, '03-login');
  await page.click('#btn-signup-tab');
  await new Promise(r => setTimeout(r, 250));
  await shot(page, '04-register');

  await page.click('#btn-login-tab');
  await page.evaluate(() => {
    document.getElementById('identity').value = '';
    document.getElementById('password').value = '';
  });
  await page.type('#identity', 'wrong@example.com');
  await page.type('#password', 'bad');
  await page.click('#auth-submit');
  await new Promise(r => setTimeout(r, 900));
  await shot(page, '05-login-error');

  await page.click('button[onclick="quickLogin(\'demo\')"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 400));
  await shot(page, '06-home-logged-in');

  await page.click('.profile-avatar-btn');
  await new Promise(r => setTimeout(r, 250));
  await shot(page, '07-profile-menu');

  await page.goto(`${BASE}/restaurants.html`, { waitUntil: 'networkidle2' });
  await shot(page, '08-restaurants');

  await page.goto(`${BASE}/menu-aktakeaway.html`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollTo(0, 520));
  await new Promise(r => setTimeout(r, 400));
  await shot(page, '09-menu-ak');

  const aiPredict = await page.$('.btn-ai-predict');
  if (aiPredict) {
    await aiPredict.click();
    await new Promise(r => setTimeout(r, 1100));
    await shot(page, '10-ai-ingredients');
    await page.evaluate(() => {
      const modal = document.getElementById('ai-ingredient-modal');
      if (modal) modal.remove();
    });
  }

  await page.click('.btn-add-cart');
  await new Promise(r => setTimeout(r, 400));

  await page.goto(`${BASE}/cart.html`, { waitUntil: 'networkidle2' });
  await shot(page, '11-cart');

  await page.goto(`${BASE}/tracking.html`, { waitUntil: 'networkidle2' });
  await shot(page, '12-tracking');

  await page.goto(`${BASE}/orders.html`, { waitUntil: 'networkidle2' });
  await shot(page, '13-orders');

  for (const [file, name] of [
    ['ai-agent.html', '14-ai-agent'],
    ['budget-optimizer.html', '15-budget-optimizer'],
    ['food-profile.html', '16-food-profile'],
    ['visual-search.html', '17-visual-search'],
    ['group-order.html', '18-group-order'],
    ['contact.html', '19-contact']
  ]) {
    await page.goto(`${BASE}/${file}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 300));
    await shot(page, name);
  }

  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  await shot(page, '20-chatbot', { keepChat: true });

  await browser.close();
  console.log('done');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
