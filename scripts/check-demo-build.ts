import { getDemoDataReport } from '../src/data/resolve';
import { portfolioContent } from '../src/data/content';

/**
 * Pre-build check that runs the demo data report and warns or errors
 * depending on VITE_FAIL_ON_DEMO.
 */
function checkDemoBuild() {
  const report = getDemoDataReport(portfolioContent);
  const demoItems = report.filter((r) => r.isDemo);

  if (demoItems.length === 0) {
    console.log('\n[build-check] ✅ All content is 100% real. No demo data detected.\n');
    process.exit(0);
  }

  console.warn('\n' + '='.repeat(78));
  console.warn('                   ⚠️  PROMINENT BUILD WARNING: DEMO DATA ACTIVE');
  console.warn('='.repeat(78));
  console.warn(` Notice: ${demoItems.length} fields or sections are currently using DEMO DATA.\n`);
  console.warn(' Remaining Demo Fields:');
  demoItems.forEach((item) => {
    console.warn(`  • [${item.section}] ${item.field} -> ${item.remedy}`);
  });
  console.warn('\n Edit src/data/content.ts to replace placeholders with your actual details.');
  console.warn('='.repeat(78) + '\n');

  const rawVal = process.env.VITE_FAIL_ON_DEMO?.trim().toLowerCase();
  const failOnDemo = rawVal === 'true' || rawVal === '1';

  if (failOnDemo) {
    console.error('❌ Build failed because VITE_FAIL_ON_DEMO is set to true and demo data remains.\n');
    process.exit(1);
  }

  // Otherwise, allow build to continue
  process.exit(0);
}

checkDemoBuild();
