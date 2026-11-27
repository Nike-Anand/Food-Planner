'use client'

import flagsmith from '@flagsmith/flagsmith'

export const FOOD_DISCOVERY_EXPERIMENT_FLAG = 'food_discovery_experiment'
export const MEAL_ACTION_COMPLETED_EVENT = 'meal_action_completed'

export type FoodDiscoveryVariant = 'food_ordering' | 'home_ingredient_recipe'
export type FoodDiscoveryAction = 'dish_added_to_cart' | 'recipe_generated'

export interface FoodDiscoveryAssignment {
  identity: string
  variant: FoodDiscoveryVariant
}

const IDENTITY_STORAGE_KEY = 'food_planner_anon_id'
const CONVERSION_STORAGE_KEY = 'food_planner_food_discovery_conversion'
const IDENTITY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FLAGSMITH_REQUEST_TIMEOUT_MS = 10_000

let initialization: Promise<void> | null = null
let activeIdentity: string | null = null
let identityRequest: { identifier: string; promise: Promise<void> } | null = null
let lastEventApiResponseStatus: number | null = null
const pendingConversions = new Set<string>()

function withFlagsmithTimeout<T>(request: Promise<T>): Promise<T> {
  let timeoutId: number
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(
      () => reject(new Error('Flagsmith request timed out after 10 seconds.')),
      FLAGSMITH_REQUEST_TIMEOUT_MS
    )
  })

  return Promise.race([request, timeout]).finally(() => {
    window.clearTimeout(timeoutId)
  })
}

async function flagsmithFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await window.fetch(input, init)
  const requestUrl = new URL(
    input instanceof Request ? input.url : input.toString()
  )

  if (
    requestUrl.hostname === 'events.api.flagsmith.com' &&
    requestUrl.pathname.endsWith('/v1/events')
  ) {
    lastEventApiResponseStatus = response.status
  }

  return response
}

function getAnonymousIdentity(): string {
  const storedIdentity = window.localStorage.getItem(IDENTITY_STORAGE_KEY)
  if (storedIdentity && IDENTITY_PATTERN.test(storedIdentity)) {
    return storedIdentity
  }

  const identity = window.crypto.randomUUID()
  window.localStorage.setItem(IDENTITY_STORAGE_KEY, identity)
  return identity
}

async function initializeFlagsmith(identity: string): Promise<void> {
  const environmentID = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID?.trim()
  if (!environmentID) {
    throw new Error('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is not configured.')
  }

  if (!initialization) {
    initialization = withFlagsmithTimeout(
      flagsmith.init({
        environmentID,
        enableEvents: true,
        fetch: flagsmithFetch,
      })
    )
      .catch((error: unknown) => {
        initialization = null
        throw error
      })
  }

  await initialization

  if (activeIdentity === identity) {
    return
  }

  if (identityRequest?.identifier === identity) {
    await identityRequest.promise
    return
  }

  const promise = withFlagsmithTimeout(flagsmith.identify(identity))
  identityRequest = { identifier: identity, promise }
  try {
    await promise
    activeIdentity = identity
  } finally {
    if (identityRequest?.promise === promise) {
      identityRequest = null
    }
  }
}

export async function loadFoodDiscoveryAssignment(): Promise<FoodDiscoveryAssignment> {
  const identity = getAnonymousIdentity()
  await initializeFlagsmith(identity)

  const flag = flagsmith.getAllFlags()[FOOD_DISCOVERY_EXPERIMENT_FLAG]
  if (!flag?.enabled || !flag.experiment?.inExperiment) {
    throw new Error(
      'This identity is not enrolled in a running food_discovery_experiment.'
    )
  }

  const variant = flag.value
  if (variant !== 'food_ordering' && variant !== 'home_ingredient_recipe') {
    throw new Error(
      'food_discovery_experiment must return food_ordering or home_ingredient_recipe.'
    )
  }

  if (
    variant === 'home_ingredient_recipe' &&
    !flagsmith.hasFeature('cook_yourself_enabled')
  ) {
    throw new Error(
      'The home-ingredient recipe variant requires cook_yourself_enabled to be on.'
    )
  }

  const experimentFlag = flagsmith.getExperimentFlag(
    FOOD_DISCOVERY_EXPERIMENT_FLAG
  )
  if (
    !experimentFlag?.enabled ||
    !experimentFlag.experiment?.inExperiment ||
    experimentFlag.value !== variant
  ) {
    throw new Error('Flagsmith could not confirm this experiment assignment.')
  }

  await withFlagsmithTimeout(flagsmith.flushEvents())
  return { identity, variant }
}

export async function recordFoodDiscoveryConversion(
  assignment: FoodDiscoveryAssignment,
  action: FoodDiscoveryAction
): Promise<boolean> {
  if (
    (assignment.variant === 'food_ordering' && action !== 'dish_added_to_cart') ||
    (assignment.variant === 'home_ingredient_recipe' &&
      action !== 'recipe_generated')
  ) {
    throw new Error('The action does not match the assigned experiment variant.')
  }

  if (activeIdentity !== assignment.identity || !flagsmith.eventsEnabled) {
    throw new Error('Flagsmith experiment event tracking is not initialized.')
  }

  const conversionKey = `${CONVERSION_STORAGE_KEY}:${assignment.identity}`
  if (window.localStorage.getItem(conversionKey) === 'completed') {
    return false
  }
  if (pendingConversions.has(assignment.identity)) {
    return false
  }

  pendingConversions.add(assignment.identity)
  try {
    lastEventApiResponseStatus = null
    flagsmith.trackEvent(MEAL_ACTION_COMPLETED_EVENT, {
      identifier: assignment.identity,
      value: 1,
      metadata: {
        experiment: FOOD_DISCOVERY_EXPERIMENT_FLAG,
        variant: assignment.variant,
        action,
      },
    })
    await withFlagsmithTimeout(flagsmith.flushEvents())
    if (
      lastEventApiResponseStatus === null ||
      lastEventApiResponseStatus < 200 ||
      lastEventApiResponseStatus >= 300
    ) {
      throw new Error(
        lastEventApiResponseStatus === null
          ? 'Flagsmith did not return an Events API response.'
          : `Flagsmith rejected the conversion event with HTTP ${lastEventApiResponseStatus}.`
      )
    }

    window.localStorage.setItem(conversionKey, 'completed')
    return true
  } finally {
    pendingConversions.delete(assignment.identity)
  }
}
