import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// 1. Read environment key from .env.local
const envFilePath = path.resolve(process.cwd(), '.env.local');
let environmentId = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;

if (!environmentId && fs.existsSync(envFilePath)) {
  const content = fs.readFileSync(envFilePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=')) {
      environmentId = trimmed.split('=')[1]?.trim();
    }
  }
}

if (!environmentId) {
  console.error('Error: NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is missing from .env.local.');
  process.exit(1);
}

console.log(`Starting Flagsmith 100-Visitor Simulation`);
console.log(`Live Environment ID: ${environmentId}`);
console.log(`-----------------------------------------------------------------`);

const TOTAL_VISITORS = 100;
const CONTROL_CONVERSION_RATE = 0.32; // ~32%
const VARIANT_CONVERSION_RATE = 0.52; // ~52%

const stats = {
  control: { exposures: 0, conversions: 0 },
  variant: { exposures: 0, conversions: 0 },
  errors: 0,
};

async function runSimulation() {
  for (let i = 1; i <= TOTAL_VISITORS; i++) {
    const uuid = crypto.randomUUID();
    const identifier = `sim-visitor-${uuid}`;

    try {
      // 1. Evaluate Identity against Flagsmith Edge API
      const edgeUrl = `https://edge.api.flagsmith.com/api/v1/identities/?identifier=${identifier}`;
      const edgeRes = await fetch(edgeUrl, {
        headers: { 'X-Environment-Key': environmentId },
      });

      if (!edgeRes.ok) {
        throw new Error(`Edge API returned HTTP ${edgeRes.status}`);
      }

      const edgeData = await edgeRes.json();
      const expFlag = edgeData.flags?.find(
        (f) => f.feature?.name === 'food_discovery_experiment'
      );

      const assignedVariant = expFlag?.feature_state_value || 'food_ordering';
      const isControl = assignedVariant === 'food_ordering';

      if (isControl) {
        stats.control.exposures++;
      } else {
        stats.variant.exposures++;
      }

      // 2. Flip weighted coin for conversion
      const probability = isControl ? CONTROL_CONVERSION_RATE : VARIANT_CONVERSION_RATE;
      const converted = Math.random() < probability;

      if (converted) {
        const action = isControl ? 'dish_added_to_cart' : 'recipe_generated';

        // 3. Post to Events API
        const eventRes = await fetch('https://events.api.flagsmith.com/v1/events', {
          method: 'POST',
          headers: {
            'X-Environment-Key': environmentId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: [
              {
                identifier,
                event: 'meal_action_completed',
                timestamp: Date.now(),
                value: 1,
                metadata: {
                  experiment: 'food_discovery_experiment',
                  variant: assignedVariant,
                  action,
                  traffic_type: 'simulated',
                },
              },
            ],
          }),
        });

        if (eventRes.ok) {
          if (isControl) {
            stats.control.conversions++;
          } else {
            stats.variant.conversions++;
          }
        }
      }

      process.stdout.write(
        `\rSimulating visitor ${i}/${TOTAL_VISITORS} | Control: ${stats.control.exposures} (conv: ${stats.control.conversions}) | Variant: ${stats.variant.exposures} (conv: ${stats.variant.conversions})`
      );

      // Brief delay to be polite to the network
      await new Promise((resolve) => setTimeout(resolve, 80));
    } catch (err) {
      stats.errors++;
      console.error(`\nFailed for ${identifier}:`, err.message);
    }
  }

  console.log(`\n\n==================== SIMULATION SUMMARY ====================`);
  console.log(`Total Simulated Visitors: ${TOTAL_VISITORS}`);
  console.log(`------------------------------------------------------------`);
  const controlRate = ((stats.control.conversions / (stats.control.exposures || 1)) * 100).toFixed(1);
  const variantRate = ((stats.variant.conversions / (stats.variant.exposures || 1)) * 100).toFixed(1);

  console.log(`Control (food_ordering):`);
  console.log(`  - Exposures:   ${stats.control.exposures}`);
  console.log(`  - Conversions: ${stats.control.conversions}`);
  console.log(`  - Conv Rate:   ${controlRate}% (Target ~32%)`);
  console.log(`------------------------------------------------------------`);
  console.log(`Variant 2 (home_ingredient_recipe):`);
  console.log(`  - Exposures:   ${stats.variant.exposures}`);
  console.log(`  - Conversions: ${stats.variant.conversions}`);
  console.log(`  - Conv Rate:   ${variantRate}% (Target ~52%)`);
  console.log(`------------------------------------------------------------`);
  const lift = (
    ((parseFloat(variantRate) - parseFloat(controlRate)) / parseFloat(controlRate)) *
    100
  ).toFixed(1);
  console.log(`Relative Conversion Lift: +${lift}%`);
  console.log(`============================================================\n`);

  // Output JSON for README update
  const summaryJson = {
    totalVisitors: TOTAL_VISITORS,
    control: {
      exposures: stats.control.exposures,
      conversions: stats.control.conversions,
      rate: `${controlRate}%`,
    },
    variant: {
      exposures: stats.variant.exposures,
      conversions: stats.variant.conversions,
      rate: `${variantRate}%`,
    },
    lift: `+${lift}%`,
  };

  fs.writeFileSync('simulation-results.json', JSON.stringify(summaryJson, null, 2));
}

runSimulation();
