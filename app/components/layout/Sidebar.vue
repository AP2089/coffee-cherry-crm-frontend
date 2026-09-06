<template>
  <aside
    class="flex h-full w-full flex-col border-r border-border bg-sidebar text-sidebar-foreground md:w-56 lg:w-64"
  >
    <div class="border-b border-border px-4 py-5">
      <BrandLogo size="sm" />
      <p class="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">CRM</p>
    </div>

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

    <div class="border-t border-border p-3">
      <a
        :href="helpdeskUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <MessageSquare class="size-4 shrink-0 opacity-70" />
        <span>Helpdesk</span>
      </a>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Inbox, ShoppingBag, MessageSquare } from 'lucide-vue-next'

const config = useRuntimeConfig()
const helpdeskUrl = String(config.public.helpdeskUrl)

const navItems = [
  { to: '/orders', label: 'Заказы', icon: ShoppingBag },
  { to: '/contacts', label: 'Сообщения', icon: Inbox },
]
</script>
