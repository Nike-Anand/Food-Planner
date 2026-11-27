import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { XMLHttpRequest } = require('xmlhttprequest');
global.XMLHttpRequest = XMLHttpRequest;
global.window = { fetch, setTimeout, clearTimeout };

const flagsmith = require('@flagsmith/flagsmith').default;

const envFilePath = path.resolve(process.cwd(), '.env.local');
let environmentId = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;

if (fs.existsSync(envFilePath)) {
  const content = fs.readFileSync(envFilePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=')) {
      environmentId = trimmed.split('=')[1]?.trim();
    }
  }
}

console.log(`=================================================================`);
console.log(`   SDK-DRIVEN 100-VISITOR SIMULATION INTO EXPERIMENT #920         `);
console.log(`=================================================================`);
console.log(`Environment Key : ${environmentId}`);
console.log(`Experiment      : Food Discovery Entry Experience (ID: 920)`);
console.log(`Using SDK       : @flagsmith/flagsmith client engine\n`);

const TOTAL_VISITORS = 100;
const CONTROL_CONVERSION_RATE = 0.35;
const VARIANT_CONVERSION_RATE = 0.55;

const stats = {
  control: { exposures: 0, conversions: 0 },
  variant: { exposures: 0, conversions: 0 },
  errors: 0,
};

async function run() {
  await flagsmith.init({
    environmentID: environmentId,
    enableEvents: true,
  });

  for (let i = 1; i <= TOTAL_VISITORS; i++) {
    // Generate clean standard UUID matching the app format
    const identity = crypto.randomUUID();

    try {
      // 1. Identify user via Flagsmith SDK
      await flagsmith.identify(identity);

      // 2. Query the experiment flag through SDK to register exposure
      const expFlag = flagsmith.getExperimentFlag('food_discovery_experiment');
      const assignedVariant = expFlag?.value || 'food_ordering';
      const isControl = assignedVariant === 'food_ordering';

      if (isControl) {
        stats.control.exposures++;
      } else {
        stats.variant.exposures++;
      }

      // 3. Conversion decision
      const prob = isControl ? CONTROL_CONVERSION_RATE : VARIANT_CONVERSION_RATE;
      const converted = Math.random() < prob;

      if (converted) {
        const action = isControl ? 'dish_added_to_cart' : 'recipe_generated';
        if (isControl) {
          stats.control.conversions++;
        } else {
          stats.variant.conversions++;
        }

        flagsmith.trackEvent('meal_action_completed', {
          identifier: identity,
          value: 1,
          metadata: {
            experiment: 'food_discovery_experiment',
            variant: assignedVariant,
            action,
            traffic_type: 'simulated',
          },
        });
      }

      // Flush events periodically
      if (i % 10 === 0 || i === TOTAL_VISITORS) {
        await flagsmith.flushEvents();
      }

      process.stdout.write(
        `\r[Enrolling in Exp #920] ${i}/${TOTAL_VISITORS} | Control: ${stats.control.exposures} (conv: ${stats.control.conversions}) | Variant: ${stats.variant.exposures} (conv: ${stats.variant.conversions})`
      );

      await new Promise((r) => setTimeout(r, 60));
    } catch (err) {
      stats.errors++;
      console.error(`\nError with ${identity}:`, err.message);
    }
  }

  // Final flush
  await flagsmith.flushEvents();

  console.log(`\n\n==================== EXPERIMENT ENROLLMENT SUMMARY ====================`);
  console.log(`Total Visitors Enrolled in Experiment: ${TOTAL_VISITORS}`);
  console.log(`-----------------------------------------------------------------------`);
  const cRate = ((stats.control.conversions / (stats.control.exposures || 1)) * 100).toFixed(1);
  const vRate = ((stats.variant.conversions / (stats.variant.exposures || 1)) * 100).toFixed(1);

  console.log(`Control (food_ordering):`);
  console.log(`  - Enrolled/Exposures: ${stats.control.exposures}`);
  console.log(`  - Conversions       : ${stats.control.conversions}`);
  console.log(`  - Conversion Rate   : ${cRate}%`);
  console.log(`-----------------------------------------------------------------------`);
  console.log(`Variant 2 (home_ingredient_recipe):`);
  console.log(`  - Enrolled/Exposures: ${stats.variant.exposures}`);
  console.log(`  - Conversions       : ${stats.variant.conversions}`);
  console.log(`  - Conversion Rate   : ${vRate}%`);
  console.log(`=======================================================================\n`);
}

run();
