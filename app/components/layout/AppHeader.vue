<template>
  <header
    class="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 md:gap-4 md:px-6"
  >
    <div class="flex min-w-0 items-center gap-2">
      <Button
        v-if="mobileNav"
        type="button"
        variant="ghost"
        size="icon-sm"
        class="shrink-0 md:hidden"
        aria-label="Открыть меню"
        @click="mobileNav.open()"
      >
        <Menu class="size-5" />
      </Button>

      <div class="min-w-0">
        <BrandLogo size="sm" />
        <p class="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">CRM</p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <slot name="actions" />
      <div class="hidden text-right sm:block">
        <p class="text-sm">{{ auth.user?.username }}</p>
        <p class="text-xs text-muted-foreground">{{ roleLabel }}</p>
      </div>
      <Button variant="outline" size="sm" @click="onLogout">Выйти</Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
import { UserRole } from '~/types/auth'

const auth = useAuthStore()
const mobileNav = useMobileNav()

const roleLabel = computed(() => {
  if (auth.user?.role === UserRole.Admin) return 'Администратор'
  if (auth.isGuest) return 'Гость'
  return 'Оператор'
})

async function onLogout() {
  auth.logout()
  await navigateTo('/login')
}
</script>
