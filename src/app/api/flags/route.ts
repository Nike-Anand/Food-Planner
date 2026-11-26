import { NextResponse } from 'next/server';

// Replace FLAGSMITH_SERVER_SIDE_ENVIRONMENT_KEY with your actual Flagsmith server-side key
const FLAGSMITH_API = 'https://edge.api.flagsmith.com/api/v1/flags/';
const ENV_KEY = process.env.FLAGSMITH_SERVER_SIDE_ENVIRONMENT_KEY ?? '';

export async function GET() {
  if (!ENV_KEY) {
    // Default flags when no key is configured
    return NextResponse.json({ flags: { cook_yourself_enabled: true } });
  }

  try {
    const res = await fetch(FLAGSMITH_API, {
      headers: { 'X-Environment-Key': ENV_KEY },
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`Flagsmith responded with ${res.status}`);

    const data: { feature: { name: string }; enabled: boolean }[] = await res.json();

    const flags = Object.fromEntries(data.map((f) => [f.feature.name, f.enabled]));
    return NextResponse.json({ flags });
  } catch (err) {
    console.error('Flagsmith fetch failed:', err);
    return NextResponse.json({ flags: { cook_yourself_enabled: true } });
  }
}
