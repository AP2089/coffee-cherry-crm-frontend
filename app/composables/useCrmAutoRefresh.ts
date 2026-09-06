import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'

const DEFAULT_INTERVAL_MS = 10_000

interface CrmAutoRefreshOptions {
  interval?: number
  /** Skip tick when busy (loading / mutations). */
  canRefresh?: () => boolean
}

export function useCrmAutoRefresh(
  refresh: () => Promise<void>,
  options: CrmAutoRefreshOptions = {},
) {
  const visibility = useDocumentVisibility()
  const interval = options.interval ?? DEFAULT_INTERVAL_MS
  let inFlight = false

  async function runRefresh() {
    if (inFlight) return
    if (visibility.value !== 'visible') return
    if (options.canRefresh && !options.canRefresh()) return

    inFlight = true
    try {
      await refresh()
    } finally {
      inFlight = false
    }
  }

  const { pause, resume } = useIntervalFn(
    () => {
      void runRefresh()
    },
    interval,
    { immediate: false },
  )

  watch(visibility, (value, previous) => {
    if (value === 'visible') {
      resume()
      if (previous === 'hidden') {
        void runRefresh()
      }
      return
    }

    pause()
  })

  onMounted(() => {
    if (visibility.value === 'visible') {
      resume()
    }
  })

  onBeforeUnmount(() => {
    pause()
  })
}
