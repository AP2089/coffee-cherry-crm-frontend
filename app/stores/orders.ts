import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, OrderStatus } from '~/types/crm'
import { apiGetOrder, apiGetOrders, apiPatchOrder } from '~/api/orders'
import { assertGuestCanEdit } from '~/composables/useCanEdit'
import { useAuthStore } from '~/stores/auth'
import { CRM_PAGE_SIZE } from '~/utils/pagination'

export const useOrdersStore = defineStore('orders', () => {
  const items = ref<Order[]>([])
  const current = ref<Order | null>(null)
  const total = ref(0)
  const hasMore = ref(false)
  const statusFilter = ref<OrderStatus | 'all'>('all')
  const loading = ref(false)
  const loadingMore = ref(false)
  const initialized = ref(false)
  const detailLoading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  function authHeaders() {
    const auth = useAuthStore()
    return { Authorization: `Bearer ${auth.token}` }
  }

  async function fetchOrders(options?: { append?: boolean; silent?: boolean }) {
    const append = options?.append ?? false
    const silent = options?.silent ?? false

    if (silent && (loading.value || loadingMore.value || saving.value || append)) {
      return
    }

    if (!silent) {
      if (append) {
        loadingMore.value = true
      } else {
        loading.value = true
      }
      error.value = null
    }

    try {
      const limit = silent
        ? Math.max(CRM_PAGE_SIZE, items.value.length || CRM_PAGE_SIZE)
        : CRM_PAGE_SIZE

      const response = await apiGetOrders(
        {
          limit,
          offset: append ? items.value.length : 0,
          ...(statusFilter.value !== 'all' ? { status: statusFilter.value } : {}),
        },
        { headers: authHeaders() },
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Не удалось загрузить заказы')
      }

      items.value = append ? [...items.value, ...response.data.items] : response.data.items
      total.value = response.data.total
      hasMore.value = response.data.hasMore
    } catch (err) {
      if (!silent) {
        error.value = err instanceof Error ? err.message : 'Не удалось загрузить заказы'
        if (!append) {
          items.value = []
        }
      }
    } finally {
      if (!silent) {
        if (append) {
          loadingMore.value = false
        } else {
          loading.value = false
          initialized.value = true
        }
      }
    }
  }

  async function refreshOrders() {
    await fetchOrders({ silent: true })
  }

  async function loadMoreOrders() {
    if (!hasMore.value || loading.value || loadingMore.value) return
    await fetchOrders({ append: true })
  }

  async function fetchOrder(id: string) {
    detailLoading.value = true
    error.value = null

    try {
      const response = await apiGetOrder(id, {
        headers: authHeaders(),
      })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Заказ не найден')
      }

      current.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Заказ не найден'
      current.value = null
    } finally {
      detailLoading.value = false
    }
  }

  async function updateStatus(id: string, status: OrderStatus) {
    if (!assertGuestCanEdit()) return

    saving.value = true

    try {
      const response = await apiPatchOrder(id, { status }, { headers: authHeaders() })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Не удалось обновить статус')
      }

      current.value = response.data

      const index = items.value.findIndex((item) => item._id === id)
      if (index !== -1) {
        items.value[index] = response.data
      }

      if (statusFilter.value !== 'all' && response.data.status !== statusFilter.value) {
        items.value = items.value.filter((item) => item._id !== id)
        total.value = Math.max(0, total.value - 1)
      }

      useToast().success('Статус заказа обновлён')
    } finally {
      saving.value = false
    }
  }

  function setStatusFilter(status: OrderStatus | 'all') {
    statusFilter.value = status
  }

  return {
    items,
    current,
    total,
    hasMore,
    statusFilter,
    loading,
    loadingMore,
    initialized,
    detailLoading,
    saving,
    error,
    authHeaders,
    fetchOrders,
    refreshOrders,
    loadMoreOrders,
    fetchOrder,
    updateStatus,
    setStatusFilter,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrdersStore, import.meta.hot))
}
