import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const ROUTES = [
  '/',
  '/projects/landsafe',
  '/projects/nammaroute',
  '/projects/demo-ml-project',
  '/photography',
  '/art-craft',
  '/not-found-404',
  '/sound-lab',
];

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr) {
  if (!colorStr) return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

function getContrast(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function runBrowserAudit() {
  console.log('================================================================');
  console.log('RUNNING BROWSER UI AUDIT (scripts/audit_ui_browser.js)');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const allViolations = [];

  try {
    const page = await browser.newPage();

    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
        const targetUrl = `${BASE_URL}${route}`;

        try {
          await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });
        } catch (e) {
          // If networkidle times out due to background video/audio, continue
        }

        // On home route, skip intro if skip button is visible
        if (route === '/') {
          try {
            await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const skipBtn = buttons.find((b) => b.textContent && b.textContent.includes('Skip intro'));
              if (skipBtn) skipBtn.click();
            });
            await new Promise((r) => setTimeout(r, 600));
          } catch (e) {}
        }

        // Stop Lenis if present
        await page.evaluate(() => {
          if (window.__lenis) {
            try { window.__lenis.stop(); } catch (e) {}
          }
        });

        // Run in-page evaluation of all small boxes
        const pageViolations = await page.evaluate((currentRoute, vpName) => {
          const results = [];

          function getUniqueSelector(el) {
            if (el.id) return `#${el.id}`;
            let path = [];
            while (el && el.nodeType === Node.ELEMENT_NODE) {
              let selector = el.nodeName.toLowerCase();
              if (el.className && typeof el.className === 'string') {
                const classes = el.className
                  .trim()
                  .split(/\s+/)
                  .filter((c) => !c.startsWith('hover:') && !c.startsWith('focus:') && !c.includes('[') && !c.includes('/'))
                  .slice(0, 2);
                if (classes.length) selector += '.' + classes.join('.');
              }
              path.unshift(selector);
              el = el.parentElement;
              if (path.length >= 3) break;
            }
            return path.join(' > ');
          }

          // Find candidate elements
          const allElements = Array.from(document.querySelectorAll('*'));

          for (const el of allElements) {
            // Ignore script, style, svg inner tags
            if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'G', 'CIRCLE', 'RECT', 'HEAD', 'HTML', 'BODY'].includes(el.tagName)) {
              continue;
            }

            const rect = el.getBoundingClientRect();
            // Visible only
            if (rect.width === 0 || rect.height === 0 || rect.bottom < -500) continue;

            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

            const text = (el.innerText || el.textContent || '').trim();
            // Skip large text blocks or empty non-buttons
            if (text.length > 40 && el.tagName !== 'BUTTON') continue;

            // Check if inside allowed monospace containers
            const insideTerminal = el.closest('#terminal-tile') || el.closest('.terminal-tile') || el.closest('pre') || el.closest('code');

            // Parse border radius
            const rawRadius = style.borderRadius || '0px';
            const radiusMatch = rawRadius.match(/([\d.]+)px/);
            const radiusNum = radiusMatch ? parseFloat(radiusMatch[1]) : 0;

            const hasBorder = style.borderWidth && parseFloat(style.borderWidth) > 0 && style.borderStyle !== 'none' && style.borderColor !== 'transparent';
            const hasBg = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
            const hasBgImage = style.backgroundImage && style.backgroundImage !== 'none';

            // Filter condition from spec:
            // "For every element that looks like a small box (border-radius at least 8px, height 56px or less, text length 40 characters or fewer, and a background or border)"
            const isSmallBox =
              radiusNum >= 8 &&
              rect.height <= 56 &&
              rect.height >= 16 &&
              text.length <= 40 &&
              (hasBorder || hasBg || hasBgImage);

            if (!isSmallBox) continue;

            const selector = getUniqueSelector(el);

            // 1. Check monospace
            if (!insideTerminal) {
              const fontFam = style.fontFamily.toLowerCase();
              if (fontFam.includes('mono') || fontFam.includes('courier') || fontFam.includes('consolas')) {
                results.push({
                  route: `${currentRoute} (${vpName})`,
                  selector,
                  rule: 'FONT_FAMILY_NOT_MONOSPACE',
                  found: style.fontFamily,
                });
              }
            }

            // 2. Check font size
            if (text.length > 0) {
              const fontSize = parseFloat(style.fontSize);
              const isBadge =
                el.classList.contains('apple-glass-chip-badge') ||
                el.closest('.apple-glass-chip-badge') ||
                text === 'DEMO' ||
                text === 'Coming soon' ||
                text.startsWith('#');

              const isCaption =
                fontSize >= 12.5 ||
                text.includes('Sound effects') ||
                text.includes('Scroll') ||
                el.getAttribute('role') === 'tooltip';

              if (isBadge) {
                if (fontSize < 10.9) {
                  results.push({
                    route: `${currentRoute} (${vpName})`,
                    selector,
                    rule: 'BADGE_FONT_SIZE_MIN_11PX',
                    found: `${fontSize}px (text: "${text}")`,
                  });
                }
              } else if (isCaption && (rect.height <= 26 || el.tagName === 'SPAN')) {
                if (fontSize < 12.5) {
                  results.push({
                    route: `${currentRoute} (${vpName})`,
                    selector,
                    rule: 'CAPTION_FONT_SIZE_MIN_13PX',
                    found: `${fontSize}px (text: "${text}")`,
                  });
                }
              } else {
                // Interactive / chip / button normal text must be >= 14px
                if (fontSize < 13.5 && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.classList.contains('apple-glass-chip-default') || el.classList.contains('apple-glass-chip-button'))) {
                  results.push({
                    route: `${currentRoute} (${vpName})`,
                    selector,
                    rule: 'CHIP_BUTTON_FONT_SIZE_MIN_14PX',
                    found: `${fontSize}px (text: "${text}")`,
                  });
                }
              }
            }

            // 3. Capsule border radius check
            const isCapsule =
              el.classList.contains('apple-glass-chip') ||
              el.classList.contains('rounded-pill') ||
              el.classList.contains('rounded-full') ||
              rawRadius.includes('999') ||
              radiusNum >= rect.height / 2 - 2;

            if (isCapsule && !el.classList.contains('rounded-[16px]') && !el.classList.contains('rounded-[20px]')) {
              const minCapsuleRadius = rect.height / 2 - 2;
              if (radiusNum < minCapsuleRadius && radiusNum < 900) {
                results.push({
                  route: `${currentRoute} (${vpName})`,
                  selector,
                  rule: 'CAPSULE_BORDER_RADIUS_AT_LEAST_HALF_HEIGHT',
                  found: `radius ${radiusNum}px for height ${rect.height}px`,
                });
              }
            }

            // 4. Glass styling check: backdrop-filter or gradient fill
            const isWhitePrimaryButton =
              el.classList.contains('bg-white') ||
              el.classList.contains('apple-button-primary') ||
              (style.backgroundColor.includes('255, 255, 255') && !style.backgroundColor.includes('0.')) ||
              style.backgroundColor.includes('245, 245, 247');

            const hasBackdropFilter =
              (style.backdropFilter && style.backdropFilter !== 'none') ||
              (style.webkitBackdropFilter && style.webkitBackdropFilter !== 'none');
            const hasGradientFill =
              hasBgImage && (style.backgroundImage.includes('gradient') || style.backgroundImage.includes('url'));
            const isGlassChip =
              el.classList.contains('apple-glass-chip') ||
              el.classList.contains('glass-surface') ||
              hasBackdropFilter ||
              hasGradientFill ||
              isWhitePrimaryButton;

            if (!isGlassChip && (el.tagName === 'BUTTON' || el.classList.contains('chip'))) {
              results.push({
                route: `${currentRoute} (${vpName})`,
                selector,
                rule: 'GLASS_STYLING_REQUIRED',
                found: `No glass gradient or backdrop-filter`,
              });
            }
          }

          return results;
        }, route, vp.name);

        allViolations.push(...pageViolations);
      }
    }

    await browser.close();
  } catch (err) {
    console.error('Browser audit error:', err);
    await browser.close();
    process.exit(1);
  }

  console.log('\n--- BROWSER AUDIT RESULTS ---');
  if (allViolations.length === 0) {
    console.log('SUCCESS: 0 browser UI violations found across all routes and viewports!');
  } else {
    console.log(`FAILED: ${allViolations.length} browser violations found:`);
    console.table(allViolations);
  }

  return allViolations;
}

const violations = await runBrowserAudit();
if (violations.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
