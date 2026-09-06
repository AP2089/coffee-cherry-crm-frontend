<template>
  <NuxtLayout name="app">
    <LayoutAppHeader title="Заказы" subtitle="Управление статусами заказов" />

    <div ref="listEl" class="flex-1 overflow-y-auto p-4 md:p-6">
      <div class="mb-4 flex flex-wrap gap-2">
        <Button
          v-for="filter in statusFilters"
          :key="filter.value"
          size="sm"
          :variant="orders.statusFilter === filter.value ? 'magnetic-filled' : 'outline'"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </Button>
      </div>

      <p
        v-if="!orders.initialized || (orders.loading && !orders.items.length)"
        class="py-16 text-center text-sm text-muted-foreground"
      >
        Загрузка…
      </p>

      <Alert v-else-if="orders.error && !orders.items.length" variant="destructive">
        <AlertDescription>{{ orders.error }}</AlertDescription>
      </Alert>

      <div
        v-else-if="orders.initialized && !orders.items.length"
        class="rounded-sm border border-dashed border-border px-6 py-16 text-center"
      >
        <p class="font-display text-lg">Заказов нет</p>
      </div>

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="item in orders.items"
          :key="item._id"
          :to="`/orders/${item._id}`"
          class="block rounded-sm border border-border bg-card transition-colors hover:border-bronze/40"
        >
          <div class="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-medium">{{ item.customer.name }}</p>
                <Badge variant="status">{{ statusLabel(item.status) }}</Badge>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ item.customer.city }} · {{ item.items.length }}
                {{ item.items.length === 1 ? 'позиция' : 'позиции' }}
              </p>
              <p class="mt-1 text-xs text-muted-foreground">{{ formatDate(item.createdAt) }}</p>
            </div>
            <p class="font-medium">{{ formatPrice(item.totalPrice) }}</p>
          </div>
        </NuxtLink>

        <p v-if="orders.loadingMore" class="py-3 text-center text-xs text-muted-foreground">
          Загрузка…
        </p>

        <p
          v-else-if="!orders.hasMore"
          class="py-3 text-center text-[10px] uppercase tracking-[0.08em] text-muted-foreground/50"
        >
          Все заказы загружены
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types/crm'
import { formatDate, formatPrice, orderStatusLabels } from '~/utils/format'

definePageMeta({
  layout: false,
  ssr: false,
})

const orders = useOrdersStore()
const listEl = ref<HTMLElement | null>(null)

const statusFilters = [
  { value: 'all' as const, label: 'Все' },
  { value: 'pending' as const, label: 'Ожидают' },
  { value: 'confirmed' as const, label: 'Подтверждённые' },
  { value: 'shipped' as const, label: 'Отправленные' },
  { value: 'delivered' as const, label: 'Доставленные' },
  { value: 'cancelled' as const, label: 'Отменённые' },
]

useCrmInfiniteScroll({
  listEl,
  hasMore: () => orders.hasMore,
  loading: () => orders.loading,
  loadingMore: () => orders.loadingMore,
  loadMore: () => orders.loadMoreOrders(),
  itemsLength: () => orders.items.length,
})

useCrmAutoRefresh(() => orders.refreshOrders(), {
  canRefresh: () => orders.initialized && !orders.loading && !orders.loadingMore && !orders.saving,
})

function statusLabel(status: OrderStatus) {
  return orderStatusLabels[status]
}

async function setFilter(value: OrderStatus | 'all') {
  orders.setStatusFilter(value)
  await orders.fetchOrders()
}

onMounted(async () => {
  await orders.fetchOrders()
})
</script>
