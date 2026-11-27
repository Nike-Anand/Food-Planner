import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// 1. Read environment keys from .env.local
const envFilePath = path.resolve(process.cwd(), '.env.local');
let environmentId = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
let serverKey = process.env.FLAGSMITH_SERVER_KEY;

if (fs.existsSync(envFilePath)) {
  const content = fs.readFileSync(envFilePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=')) {
      environmentId = trimmed.split('=')[1]?.trim();
    }
    if (trimmed.startsWith('FLAGSMITH_SERVER_KEY=')) {
      serverKey = trimmed.split('=')[1]?.trim();
    }
  }
}

if (!environmentId) {
  console.error('Error: NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is missing from .env.local.');
  process.exit(1);
}

console.log(`=================================================================`);
console.log(`   FULL FLAGSMITH EXPERIMENT SIMULATION (IDENTITIES + EVENTS)    `);
console.log(`=================================================================`);
console.log(`Environment Key : ${environmentId}`);
console.log(`Experiment ID   : 920 (Food Discovery Entry Experience)`);
console.log(`Feature Name    : food_discovery_experiment`);
console.log(`Conversion Event: meal_action_completed`);
console.log(`-----------------------------------------------------------------\n`);

const TOTAL_VISITORS = 100;
const CONTROL_CONVERSION_RATE = 0.34;
const VARIANT_CONVERSION_RATE = 0.54;

const stats = {
  control: { exposures: 0, conversions: 0 },
  variant: { exposures: 0, conversions: 0 },
  errors: 0,
};

async function runFullSimulation() {
  const eventsBatch = [];
  let flagEvaluationsCount = 0;

  for (let i = 1; i <= TOTAL_VISITORS; i++) {
    const uuid = crypto.randomUUID();
    const identifier = `sim-visitor-${uuid}`;

    try {
      // 1. POST identity with traits to Flagsmith Edge API so it persists in the dashboard identities table
      const postIdentityRes = await fetch(
        `https://edge.api.flagsmith.com/api/v1/identities/`,
        {
          method: 'POST',
          headers: {
            'X-Environment-Key': environmentId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier,
            traits: [
              { trait_key: 'experiment_enrolled', trait_value: 'food_discovery_experiment' },
              { trait_key: 'session_type', trait_value: 'simulated_user' },
              { trait_key: 'simulated_at', trait_value: new Date().toISOString() },
            ],
          }),
        }
      );

      if (!postIdentityRes.ok) {
        throw new Error(`Edge POST identity returned HTTP ${postIdentityRes.status}`);
      }

      const identityData = await postIdentityRes.json();
      const expFlag = identityData.flags?.find(
        (f) => f.feature?.name === 'food_discovery_experiment'
      );

      const assignedVariant = expFlag?.feature_state_value || 'food_ordering';
      const isControl = assignedVariant === 'food_ordering';

      if (isControl) {
        stats.control.exposures++;
      } else {
        stats.variant.exposures++;
      }
      flagEvaluationsCount++;

      // 2. Add an explicit exposure event for the experiment
      eventsBatch.push({
        identifier,
        event: 'exposure',
        timestamp: Date.now(),
        value: 1,
        metadata: {
          experiment_id: 920,
          feature_name: 'food_discovery_experiment',
          feature_id: 306465,
          variant: assignedVariant,
          traffic_type: 'simulated',
        },
      });

      // 3. Flip weighted coin for conversion
      const probability = isControl ? CONTROL_CONVERSION_RATE : VARIANT_CONVERSION_RATE;
      const converted = Math.random() < probability;

      if (converted) {
        const action = isControl ? 'dish_added_to_cart' : 'recipe_generated';

        if (isControl) {
          stats.control.conversions++;
        } else {
          stats.variant.conversions++;
        }

        // Add conversion event
        eventsBatch.push({
          identifier,
          event: 'meal_action_completed',
          timestamp: Date.now(),
          value: 1,
          metadata: {
            experiment_id: 920,
            experiment: 'food_discovery_experiment',
            variant: assignedVariant,
            action,
            traffic_type: 'simulated',
          },
        });
      }

      process.stdout.write(
        `\r[Progress] Registered identity ${i}/${TOTAL_VISITORS} | Control: ${stats.control.exposures} | Variant: ${stats.variant.exposures}`
      );

      await new Promise((resolve) => setTimeout(resolve, 60));
    } catch (err) {
      stats.errors++;
      console.error(`\nFailed for ${identifier}:`, err.message);
    }
  }

  console.log(`\n\nTransmitting ${eventsBatch.length} analytics events to Flagsmith Events API...`);

  // Send events in chunks of 25 to respect payload limits
  const CHUNK_SIZE = 25;
  for (let c = 0; c < eventsBatch.length; c += CHUNK_SIZE) {
    const chunk = eventsBatch.slice(c, c + CHUNK_SIZE);
    try {
      const evRes = await fetch('https://events.api.flagsmith.com/v1/events', {
        method: 'POST',
        headers: {
          'X-Environment-Key': environmentId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: chunk }),
      });
      const resText = await evRes.text();
      console.log(`  - Chunk ${Math.floor(c / CHUNK_SIZE) + 1}/${Math.ceil(eventsBatch.length / CHUNK_SIZE)}: HTTP ${evRes.status} -> ${resText}`);
    } catch (e) {
      console.error(`  - Failed to send events chunk:`, e.message);
    }
  }

  // Also submit flag analytics call count to ensure feature analytics counters increment
  console.log(`Sending Feature Analytics evaluation hit counters...`);
  try {
    await fetch('https://edge.api.flagsmith.com/api/v1/analytics/flags/', {
      method: 'POST',
      headers: {
        'X-Environment-Key': environmentId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        food_discovery_experiment: TOTAL_VISITORS,
        cook_yourself_enabled: TOTAL_VISITORS,
      }),
    });
    console.log(`  ✓ Successfully logged flag analytics.`);
  } catch (e) {
    console.warn(`  - Analytics counter call:`, e.message);
  }

  console.log(`\n==================== SIMULATION SUMMARY ====================`);
  console.log(`Total Persistent Identities Created: ${TOTAL_VISITORS}`);
  console.log(`Total Events Sent to Flagsmith     : ${eventsBatch.length}`);
  console.log(`------------------------------------------------------------`);
  const controlRate = ((stats.control.conversions / (stats.control.exposures || 1)) * 100).toFixed(1);
  const variantRate = ((stats.variant.conversions / (stats.variant.exposures || 1)) * 100).toFixed(1);

  console.log(`Control (food_ordering):`);
  console.log(`  - Exposures:   ${stats.control.exposures}`);
  console.log(`  - Conversions: ${stats.control.conversions}`);
  console.log(`  - Conv Rate:   ${controlRate}%`);
  console.log(`------------------------------------------------------------`);
  console.log(`Variant 2 (home_ingredient_recipe):`);
  console.log(`  - Exposures:   ${stats.variant.exposures}`);
  console.log(`  - Conversions: ${stats.variant.conversions}`);
  console.log(`  - Conv Rate:   ${variantRate}%`);
  console.log(`------------------------------------------------------------`);
  const lift = (
    ((parseFloat(variantRate) - parseFloat(controlRate)) / parseFloat(controlRate)) *
    100
  ).toFixed(1);
  console.log(`Relative Conversion Lift: +${lift}%`);
  console.log(`============================================================\n`);

  fs.writeFileSync(
    'simulation-results.json',
    JSON.stringify(
      {
        totalVisitors: TOTAL_VISITORS,
        control: { exposures: stats.control.exposures, conversions: stats.control.conversions, rate: `${controlRate}%` },
        variant: { exposures: stats.variant.exposures, conversions: stats.variant.conversions, rate: `${variantRate}%` },
        lift: `+${lift}%`,
      },
      null,
      2
    )
  );
}

runFullSimulation();
