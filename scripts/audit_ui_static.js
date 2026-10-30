import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');

const ALLOWED_MONO_FILES = [
  path.normalize('src/components/sections/about/TerminalTile.tsx'),
  path.normalize('src/styles/tokens.css'),
  path.normalize('src/components/common/SectionHeading.tsx'),
];

const ALLOWED_RADII_TOKENS = new Set([
  '999px', '28px', '20px', '16px', '50%', 'inherit', 'initial',
  'var(--r-pill)', 'var(--r-card-lg)', 'var(--r-card-md)', 'var(--r-card)', 'var(--r-input)', 'var(--r-textarea)',
  'rounded-pill', 'rounded-card-lg', 'rounded-card-md', 'rounded-card', 'rounded-input', 'rounded-textarea', 'rounded-full',
  'rounded-[28px]', 'rounded-[20px]', 'rounded-[16px]', 'rounded-[999px]'
]);

function getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function runStaticAudit() {
  console.log('================================================================');
  console.log('RUNNING STATIC UI AUDIT (scripts/audit_ui_static.js)');
  console.log('================================================================');

  const files = getAllFiles(SRC_DIR);
  const violations = [];

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);
    const normalizedRelative = path.normalize(relativePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Skip pure comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // 1. font-mono / monospace check outside allowed files
      if (
        (line.includes('font-mono') || line.includes('monospace')) &&
        !ALLOWED_MONO_FILES.some((f) => normalizedRelative.endsWith(f))
      ) {
        // Allow inside <code> or <pre>
        if (!line.includes('<code') && !line.includes('<pre') && !line.includes('ui-monospace')) {
          violations.push({
            file: relativePath,
            line: lineNum,
            rule: 'NO_MONOSPACE_OUTSIDE_ALLOWED',
            found: trimmed,
          });
        }
      }

      // 2. border-radius check
      // Check explicit px in rounded-[...]
      const roundedMatch = line.match(/rounded-\[(\d+px)\]/g);
      if (roundedMatch) {
        for (const rm of roundedMatch) {
          const val = rm.replace('rounded-[', '').replace(']', '');
          if (!ALLOWED_RADII_TOKENS.has(val) && !ALLOWED_RADII_TOKENS.has(rm)) {
            violations.push({
              file: relativePath,
              line: lineNum,
              rule: 'INVALID_BORDER_RADIUS_TOKEN',
              found: `${rm} (allowed: 28px, 20px, 16px, 999px, 50%)`,
            });
          }
        }
      }

      // Check standard tailwind rounded utility classes not in tokens
      const twRoundedMatch = line.match(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g);
      if (twRoundedMatch) {
        for (const twm of twRoundedMatch) {
          violations.push({
            file: relativePath,
            line: lineNum,
            rule: 'INVALID_TAILWIND_ROUNDED_CLASS',
            found: twm,
          });
        }
      }

      // In CSS files, check border-radius declarations
      if (filePath.endsWith('.css')) {
        const brMatch = line.match(/border-radius:\s*([^;]+);/);
        if (brMatch) {
          const rawVal = brMatch[1].trim();
          if (
            !ALLOWED_RADII_TOKENS.has(rawVal) &&
            !rawVal.includes('var(--r-') &&
            rawVal !== 'inherit' &&
            rawVal !== '50%' &&
            rawVal !== '9999px' // fallback
          ) {
            violations.push({
              file: relativePath,
              line: lineNum,
              rule: 'INVALID_CSS_BORDER_RADIUS',
              found: `border-radius: ${rawVal}`,
            });
          }
        }
      }

      // 3. uppercase outside allowed badges and hero/footer wordmarks
      if (line.includes('uppercase') || line.includes('text-transform: uppercase')) {
        const isAllowedBadge =
          normalizedRelative.endsWith('Chip.tsx') ||
          normalizedRelative.endsWith('glass.css') ||
          line.includes('apple-glass-chip-badge') ||
          line.includes('DEMO') ||
          line.includes('Coming soon');

        const isAllowedHeroOrFooter =
          (normalizedRelative.endsWith('Hero.tsx') && (line.includes('hero-name') || line.includes('metallic-text-gradient') || line.includes('font-apple font-extrabold'))) ||
          (normalizedRelative.endsWith('Footer.tsx') && (line.includes('metallic-text-gradient')));

        if (!isAllowedBadge && !isAllowedHeroOrFooter) {
          violations.push({
            file: relativePath,
            line: lineNum,
            rule: 'NO_UPPERCASE_OUTSIDE_BADGE_OR_WORDMARK',
            found: trimmed,
          });
        }
      }

      // 4. hover/focus transforms on buttons or chips
      const hasButtonOrChip =
        line.includes('button') ||
        line.includes('Chip') ||
        line.includes('chip') ||
        line.includes('btn') ||
        line.includes('apple-glass-chip');

      if (hasButtonOrChip) {
        const hoverTransformMatch = line.match(/\b(hover|focus|active|group-hover):(scale|translate)[^\s"'>]*/g);
        if (hoverTransformMatch) {
          // Allow internal mobile/pill nav icon micro-motion if explicitly present
          const isNavException = normalizedRelative.endsWith('PillNav.tsx') || normalizedRelative.endsWith('MobileNav.tsx');
          if (!isNavException) {
            violations.push({
              file: relativePath,
              line: lineNum,
              rule: 'NO_HOVER_TRANSFORMS_ON_BUTTON_OR_CHIP',
              found: hoverTransformMatch.join(', '),
            });
          }
        }
      }

      // 5. Raw hex background colors on elements with chip/button classes
      if (
        (line.includes('apple-glass-chip') || line.includes('Chip') || line.includes('chip-')) &&
        line.match(/bg-\[#[0-9a-fA-F]{3,6}\]/)
      ) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'RAW_HEX_BG_ON_CHIP',
          found: trimmed,
        });
      }
    });
  }

  console.log('\n--- STATIC AUDIT RESULTS ---');
  if (violations.length === 0) {
    console.log('SUCCESS: 0 static UI violations found across codebase!');
  } else {
    console.log(`FAILED: ${violations.length} violations found:`);
    console.table(violations);
  }

  return violations;
}

const violations = runStaticAudit();
if (violations.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
