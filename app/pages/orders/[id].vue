<template>
  <NuxtLayout name="app">
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <div v-if="orders.detailLoading" class="space-y-4">
        <Skeleton class="h-10 w-40" />
        <Skeleton class="h-80 w-full" />
      </div>

      <Alert v-else-if="orders.error && !orders.current" variant="destructive">
        <AlertDescription>{{ orders.error }}</AlertDescription>
      </Alert>

      <template v-else-if="orders.current">
        <Button variant="outline" size="sm" class="mb-6" @click="navigateTo('/orders')">
          ← К списку
        </Button>

        <div class="grid gap-4 lg:grid-cols-3">
          <Card class="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle class="flex flex-wrap items-center gap-2 text-lg">
                {{ orders.current.customer.name }}
                <Badge variant="status">{{ statusLabel(orders.current.status) }}</Badge>
              </CardTitle>
              <CardDescription>{{ formatDate(orders.current.createdAt) }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">Телефон</p>
                  <p class="mt-1 text-sm">{{ orders.current.customer.phone }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email</p>
                  <p class="mt-1 text-sm">{{ orders.current.customer.email }}</p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">Адрес</p>
                  <p class="mt-1 text-sm">
                    {{ orders.current.customer.city }}, {{ orders.current.customer.address }}
                  </p>
                </div>
                <div v-if="orders.current.customer.comment" class="sm:col-span-2">
                  <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Комментарий
                  </p>
                  <p class="mt-1 whitespace-pre-wrap text-sm">
                    {{ orders.current.customer.comment }}
                  </p>
                </div>
              </div>

              <Separator />

              <div class="space-y-3">
                <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">Позиции</p>
                <div
                  v-for="(item, index) in orders.current.items"
                  :key="`${item.slug}-${item.weight}-${index}`"
                  class="flex items-center justify-between gap-4 rounded-sm border border-border px-4 py-3"
                >
                  <div>
                    <p class="font-medium capitalize">{{ item.name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ item.weight }} г × {{ item.quantity }}
                    </p>
                  </div>
                  <p class="text-sm">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              </div>

              <div class="flex justify-between border-t border-border pt-4">
                <span class="font-medium">Итого</span>
                <span class="font-display text-lg">{{
                  formatPrice(orders.current.totalPrice)
                }}</span>
              </div>
            </CardContent>
          </Card>

          <Card class="border-border h-fit">
            <CardHeader>
              <CardTitle class="text-base">Статус заказа</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Button
                v-for="status in statusOptions"
                :key="status"
                class="w-full justify-start"
                size="sm"
                :variant="orders.current.status === status ? 'magnetic-filled' : 'outline'"
                :disabled="orders.saving"
                @click="updateStatus(status)"
              >
                {{ statusLabel(status) }}
              </Button>
            </CardContent>
          </Card>
        </div>
      </template>
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

const route = useRoute()
const orders = useOrdersStore()
const { assertCanEdit } = useCanEdit()
const orderId = computed(() => String(route.params.id))

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function statusLabel(status: OrderStatus) {
  return orderStatusLabels[status]
}

async function updateStatus(status: OrderStatus) {
  if (!orders.current || orders.current.status === status) return
  if (!assertCanEdit()) return
  await orders.updateStatus(orderId.value, status)
}

onMounted(async () => {
  await orders.fetchOrder(orderId.value)
})
</script>
