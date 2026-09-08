<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
    <LayoutAppHeader />

    <div class="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <div class="hidden md:flex md:shrink-0">
        <LayoutSidebar />
      </div>

      <LayoutMobileNav v-model:open="menuOpen" />

      <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const menuOpen = ref(false)

provide(mobileNavKey, {
  open: () => {
    menuOpen.value = true
  },
  close: () => {
    menuOpen.value = false
  },
})
</script>
