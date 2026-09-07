import { defineStore } from 'pinia'
import type { Order, OrderStatus } from '~/types/crm'
import { apiGetOrder, apiGetOrders, apiPatchOrder } from '~/api/orders'
import { assertGuestCanEdit } from '~/composables/useCanEdit'
import { useAuthStore } from '~/stores/auth'
import { CRM_PAGE_SIZE } from '~/utils/pagination'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    items: [] as Order[],
    current: null as Order | null,
    total: 0,
    hasMore: false,
    statusFilter: 'all' as OrderStatus | 'all',
    loading: false,
    loadingMore: false,
    initialized: false,
    detailLoading: false,
    saving: false,
    error: null as string | null,
  }),

  actions: {
    authHeaders() {
      const auth = useAuthStore()
      return { Authorization: `Bearer ${auth.token}` }
    },

    async fetchOrders(options?: { append?: boolean; silent?: boolean }) {
      const append = options?.append ?? false
      const silent = options?.silent ?? false

      if (silent && (this.loading || this.loadingMore || this.saving || append)) {
        return
      }

      if (!silent) {
        if (append) {
          this.loadingMore = true
        } else {
          this.loading = true
        }
        this.error = null
      }

      try {
        const limit = silent
          ? Math.max(CRM_PAGE_SIZE, this.items.length || CRM_PAGE_SIZE)
          : CRM_PAGE_SIZE

        const response = await apiGetOrders(
          {
            limit,
            offset: append ? this.items.length : 0,
            ...(this.statusFilter !== 'all' ? { status: this.statusFilter } : {}),
          },
          { headers: this.authHeaders() },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось загрузить заказы')
        }

        this.items = append ? [...this.items, ...response.data.items] : response.data.items
        this.total = response.data.total
        this.hasMore = response.data.hasMore
      } catch (error) {
        if (!silent) {
          this.error = error instanceof Error ? error.message : 'Не удалось загрузить заказы'
          if (!append) {
            this.items = []
          }
        }
      } finally {
        if (!silent) {
          if (append) {
            this.loadingMore = false
          } else {
            this.loading = false
            this.initialized = true
          }
        }
      }
    },

    async refreshOrders() {
      await this.fetchOrders({ silent: true })
    },
    async loadMoreOrders() {
      if (!this.hasMore || this.loading || this.loadingMore) return
      await this.fetchOrders({ append: true })
    },

    async fetchOrder(id: string) {
      this.detailLoading = true
      this.error = null

      try {
        const response = await apiGetOrder(id, {
          headers: this.authHeaders(),
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Заказ не найден')
        }

        this.current = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Заказ не найден'
        this.current = null
      } finally {
        this.detailLoading = false
      }
    },

    async updateStatus(id: string, status: OrderStatus) {
      if (!assertGuestCanEdit()) return

      this.saving = true

      try {
        const response = await apiPatchOrder(id, { status }, { headers: this.authHeaders() })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось обновить статус')
        }

        this.current = response.data

        const index = this.items.findIndex((item) => item._id === id)
        if (index !== -1) {
          this.items[index] = response.data
        }

        if (this.statusFilter !== 'all' && response.data.status !== this.statusFilter) {
          this.items = this.items.filter((item) => item._id !== id)
          this.total = Math.max(0, this.total - 1)
        }

        useToast().success('Статус заказа обновлён')
      } finally {
        this.saving = false
      }
    },

    setStatusFilter(status: OrderStatus | 'all') {
      this.statusFilter = status
    },
  },
})
