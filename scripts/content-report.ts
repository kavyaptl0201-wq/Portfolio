import { getDemoDataReport } from '../src/data/resolve';
import { portfolioContent } from '../src/data/content';

/**
 * CLI Reporter for Demo Data in Portfolio
 * Run via: npm run content:report
 */
function runReport() {
  console.log('\n================================================================================');
  console.log('               PORTFOLIO CONTENT & DEMO DATA AUDIT REPORT');
  console.log('================================================================================\n');

  const report = getDemoDataReport(portfolioContent);
  const demoItems = report.filter((r) => r.isDemo);
  const realItems = report.filter((r) => !r.isDemo);

  console.log(`Overview: ${realItems.length} Real fields | ${demoItems.length} Demo fields remaining\n`);

  console.table(
    report.map((item) => ({
      Section: item.section,
      Field: item.field,
      Status: item.isDemo ? '⚠️ DEMO' : '✅ REAL',
      'Current Value': item.value.length > 35 ? item.value.slice(0, 32) + '...' : item.value,
      'How to Replace': item.isDemo ? item.remedy : 'Already provided',
    }))
  );

  if (demoItems.length > 0) {
    console.log('\n💡 Summary of sections with Demo Data remaining:');
    const sections = Array.from(new Set(demoItems.map((d) => d.section)));
    sections.forEach((sec) => {
      const count = demoItems.filter((d) => d.section === sec).length;
      console.log(`  - ${sec}: ${count} field(s)`);
    });
    console.log('\nTo replace these, edit: src/data/content.ts');
  } else {
    console.log('\n🎉 Congratulations! All fields and sections are using 100% verified real data!');
  }

  console.log('================================================================================\n');
}

runReport();
