import type { InjectionKey } from 'vue'

export type MobileNavApi = {
  open: () => void
  close: () => void
}

export const mobileNavKey: InjectionKey<MobileNavApi> = Symbol('mobileNav')

export function useMobileNav() {
  return inject(mobileNavKey, null)
}
