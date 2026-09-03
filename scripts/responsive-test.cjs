const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = [
  { name: 'Mobile SE (320px)', width: 320, height: 650 },
  { name: 'iPhone X/13 Mini (375px)', width: 375, height: 812 },
  { name: 'iPhone 14/15 (390px)', width: 390, height: 844 },
  { name: 'Android / Pixel (412px)', width: 412, height: 915 },
  { name: 'iPad Portrait (768px)', width: 768, height: 1024 },
  { name: 'iPad Landscape (1024px)', width: 1024, height: 768 },
  { name: 'Desktop HD (1280px)', width: 1280, height: 800 },
  { name: 'Desktop Full (1440px)', width: 1440, height: 900 },
];

const ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/select-role',
  '/register/supporters',
  '/register/missionaries',
  '/profile',
  '/profile/sobre',
  '/profile/postagens',
  '/profile/projetos-de-impacto',
  '/profile/campanha',
  '/profile/edit-profile',
  '/profile/supporter',
  '/profile/supporter/edit-profile',
  '/profile/supporter/missionarios',
  '/profile/supporter/postagens-salvas',
  '/user/_SamiMendonca',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run() {
  console.log(`Starting Chrome Responsive Tests against: ${BASE_URL}`);
  console.log(`Testing ${ROUTES.length} routes across ${VIEWPORTS.length} viewports...`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const report = [];
  let totalIssues = 0;

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    console.log(`\nTesting Route: ${route}`);
    const page = await browser.newPage();

    // Disable transitions to stabilize layout measurements
    await page.setViewport({ width: 375, height: 812 });

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    } catch (e) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      } catch (err) {
        console.error(`Failed to load ${url}:`, err.message);
        report.push({ route, error: err.message });
        await page.close();
        continue;
      }
    }

    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      // Short delay for resize / reflow
      await new Promise((r) => setTimeout(r, 100));

      const evaluation = await page.evaluate((vpWidth) => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body ? document.body.scrollWidth : 0;
        const maxScroll = Math.max(docWidth, bodyWidth);
        const hasHorizontalOverflow = maxScroll > vpWidth + 1; // 1px margin of error

        // Find elements that bleed beyond the viewport width
        let overflowingElements = [];
        if (hasHorizontalOverflow) {
          const allEls = document.querySelectorAll('*');
          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.right > vpWidth + 2 && rect.width > 0) {
              const tag = el.tagName.toLowerCase();
              const cls = typeof el.className === 'string' ? el.className.slice(0, 50) : '';
              const id = el.id ? `#${el.id}` : '';
              overflowingElements.push({
                selector: `${tag}${id}${cls ? '.' + cls.replace(/\s+/g, '.') : ''}`,
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                overflowAmount: Math.round(rect.right - vpWidth),
              });
              if (overflowingElements.length >= 5) break;
            }
          }
        }

        return {
          scrollWidth: maxScroll,
          viewportWidth: vpWidth,
          hasHorizontalOverflow,
          overflowAmount: hasHorizontalOverflow ? maxScroll - vpWidth : 0,
          overflowingElements,
        };
      }, vp.width);

      if (evaluation.hasHorizontalOverflow) {
        totalIssues++;
        console.log(
          `  ❌ [${vp.name}] OVERFLOW: scrollWidth=${evaluation.scrollWidth}px (exceeds ${vp.width}px by +${evaluation.overflowAmount}px)`
        );
        if (evaluation.overflowingElements.length > 0) {
          evaluation.overflowingElements.forEach((el) => {
            console.log(
              `     -> Element: ${el.selector} (right: ${el.right}px, overflow: +${el.overflowAmount}px)`
            );
          });
        }
      } else {
        console.log(`  ✓ [${vp.name}] Clean layout (scrollWidth: ${evaluation.scrollWidth}px)`);
      }

      report.push({
        route,
        viewport: vp.name,
        width: vp.width,
        ...evaluation,
      });
    }

    await page.close();
  }

  await browser.close();

  console.log('\n=======================================');
  console.log(`Chrome Responsive Test Completed!`);
  console.log(`Total tests run: ${ROUTES.length * VIEWPORTS.length}`);
  console.log(`Total overflow issues: ${totalIssues}`);
  console.log('=======================================');

  fs.writeFileSync(path.join(__dirname, 'responsive-report.json'), JSON.stringify(report, null, 2));
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
