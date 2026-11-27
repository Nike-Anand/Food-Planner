import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const envFilePath = path.resolve(process.cwd(), '.env.local');
let environmentId = 'XwttovMMSnU3HSHuwaDeBz';

if (fs.existsSync(envFilePath)) {
  const content = fs.readFileSync(envFilePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=')) {
      environmentId = trimmed.split('=')[1]?.trim();
    }
  }
}

async function runDirectBatch() {
  console.log(`=================================================================`);
  console.log(`   DIRECT EXPERIMENT INGESTION PIPELINE (100 VISITORS)           `);
  console.log(`=================================================================`);
  console.log(`Environment Key: ${environmentId}`);
  console.log(`Experiment ID  : 920 (Food Discovery Entry Experience)`);
  console.log(`Endpoint       : https://events.api.flagsmith.com/v1/events\n`);

  const TOTAL_VISITORS = 100;
  const events = [];
  const stats = {
    control: { exposures: 0, conversions: 0 },
    variant: { exposures: 0, conversions: 0 }
  };

  for (let i = 0; i < TOTAL_VISITORS; i++) {
    const id = crypto.randomUUID();
    const isControl = Math.random() < 0.5;
    const variantName = isControl ? 'control' : 'Variant_2';
    const variantValue = isControl ? 'food_ordering' : 'home_ingredient_recipe';
    const baseTime = Date.now() - Math.floor(Math.random() * 300000); // within last 5 minutes

    if (isControl) {
      stats.control.exposures++;
    } else {
      stats.variant.exposures++;
    }

    // 1. Mandatory Experiment Exposure Event
    events.push({
      event: '$flag_exposure',
      feature_name: 'food_discovery_experiment',
      identifier: id,
      value: variantName,
      traits: null,
      metadata: {
        experiment_id: 920,
        variant: variantName,
        sdk_version: '12.5.0',
        traffic_type: 'simulated'
      },
      timestamp: baseTime
    });

    // 2. Conversion event (~35% control, ~55% variant)
    const prob = isControl ? 0.35 : 0.55;
    if (Math.random() < prob) {
      if (isControl) {
        stats.control.conversions++;
      } else {
        stats.variant.conversions++;
      }

      const action = isControl ? 'dish_added_to_cart' : 'recipe_generated';
      const eventMeta = {
        experiment_id: 920,
        feature: 'food_discovery_experiment',
        variant: variantName,
        action,
        traffic_type: 'simulated',
        sdk_version: '12.5.0'
      };

      // Ingest both case formats so Bayesian calculator matches primary metric
      events.push({
        event: 'Meal Action Completed',
        feature_name: null,
        identifier: id,
        value: '1',
        traits: null,
        metadata: eventMeta,
        timestamp: baseTime + 1200
      });

      events.push({
        event: 'meal_action_completed',
        feature_name: null,
        identifier: id,
        value: '1',
        traits: null,
        metadata: eventMeta,
        timestamp: baseTime + 1200
      });
    }
  }

  console.log(`Generated ${events.length} total events (${stats.control.exposures + stats.variant.exposures} exposures + ${stats.control.conversions + stats.variant.conversions} conversions).`);
  console.log(`Streaming to Flagsmith Events API in batches...`);

  const BATCH_SIZE = 25;
  let totalAccepted = 0;
  let totalRejected = 0;

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const res = await fetch('https://events.api.flagsmith.com/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Environment-Key': environmentId,
        'Flagsmith-SDK-User-Agent': 'flagsmith-js-sdk/12.5.0'
      },
      body: JSON.stringify({ events: batch })
    });

    const body = await res.json();
    totalAccepted += (body.accepted || 0);
    totalRejected += (body.rejected?.length || 0);

    process.stdout.write(`\rSent batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(events.length / BATCH_SIZE)} | Accepted: ${totalAccepted} | Rejected: ${totalRejected}`);
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\n\n==================== EXPERIMENT ENROLLMENT SUMMARY ====================`);
  console.log(`Total Visitors Enrolled in Experiment: ${TOTAL_VISITORS}`);
  console.log(`Total Events Delivered to Flagsmith  : ${totalAccepted} (Rejected: ${totalRejected})`);
  console.log(`-----------------------------------------------------------------------`);
  const cRate = ((stats.control.conversions / (stats.control.exposures || 1)) * 100).toFixed(1);
  const vRate = ((stats.variant.conversions / (stats.variant.exposures || 1)) * 100).toFixed(1);

  console.log(`Control (food_ordering):`);
  console.log(`  - Enrolled/Exposures : ${stats.control.exposures}`);
  console.log(`  - Conversions        : ${stats.control.conversions}`);
  console.log(`  - Conversion Rate    : ${cRate}%`);
  console.log(`-----------------------------------------------------------------------`);
  console.log(`Variant 2 (home_ingredient_recipe):`);
  console.log(`  - Enrolled/Exposures : ${stats.variant.exposures}`);
  console.log(`  - Conversions        : ${stats.variant.conversions}`);
  console.log(`  - Conversion Rate    : ${vRate}%`);
  console.log(`=======================================================================\n`);
}

runDirectBatch().catch(console.error);
