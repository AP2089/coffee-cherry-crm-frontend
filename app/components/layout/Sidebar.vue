<script setup lang="ts">
import { Inbox, ShoppingBag } from '@lucide/vue'

const navItems = [
  { to: '/orders', label: 'Заказы', icon: ShoppingBag },
  { to: '/contacts', label: 'Сообщения', icon: Inbox },
]
</script>

<template>
  <aside
    class="flex h-full w-full flex-col border-r border-border bg-sidebar text-sidebar-foreground md:w-56 lg:w-64"
  >
    <nav class="flex-1 space-y-1 p-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        active-class="bg-sidebar-accent text-sidebar-accent-foreground"
      >
        <component :is="item.icon" class="size-4 shrink-0 opacity-70" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>
