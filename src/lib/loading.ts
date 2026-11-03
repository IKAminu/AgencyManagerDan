const appStartedAt = Date.now()
const minimumVisibleMs = 1500

export async function waitForMinimumLoadingTime() {
  const remaining = minimumVisibleMs - (Date.now() - appStartedAt)
  if (remaining > 0) await new Promise<void>((resolve) => window.setTimeout(resolve, remaining))
}
