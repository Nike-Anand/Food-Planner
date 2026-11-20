import { Flagsmith } from '@flagsmith/nodejs'

let client: InstanceType<typeof Flagsmith> | null = null

async function getClient() {
  if (!client) {
    client = new Flagsmith({
      environmentKey: process.env.FLAGSMITH_SERVER_KEY!,
    })
  }
  return client
}

export async function isCookYourselfEnabled(): Promise<boolean> {
  const flagsmith = await getClient()
  const flags = await flagsmith.getEnvironmentFlags()
  return flags.isFeatureEnabled('cook_yourself_enabled')
}
