import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import type { ContactMessage, ContactMessageStatus } from '~/types/crm'
import { apiDeleteContact, apiGetContacts, apiPatchContact } from '~/api/contacts'
import { assertGuestCanEdit } from '~/composables/useCanEdit'
import { useAuthStore } from '~/stores/auth'
import { CRM_PAGE_SIZE } from '~/utils/pagination'

export const useContactsStore = defineStore('contacts', () => {
  const items = ref<ContactMessage[]>([])
  const total = ref(0)
  const hasMore = ref(false)
  const statusFilter = ref<ContactMessageStatus | 'all'>('all')
  const loading = ref(false)
  const loadingMore = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)
  const actionLoading = ref<string | null>(null)

  function authHeaders() {
    const auth = useAuthStore()
    return { Authorization: `Bearer ${auth.token}` }
  }

  async function fetchContacts(options?: { append?: boolean; silent?: boolean }) {
    const append = options?.append ?? false
    const silent = options?.silent ?? false

    if (silent && (loading.value || loadingMore.value || actionLoading.value || append)) {
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

      const response = await apiGetContacts(
        {
          limit,
          offset: append ? items.value.length : 0,
          ...(statusFilter.value !== 'all' ? { status: statusFilter.value } : {}),
        },
        { headers: authHeaders() },
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Не удалось загрузить обращения')
      }

      items.value = append ? [...items.value, ...response.data.items] : response.data.items
      total.value = response.data.total
      hasMore.value = response.data.hasMore
    } catch (err) {
      if (!silent) {
        error.value = err instanceof Error ? err.message : 'Не удалось загрузить обращения'
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

  async function refreshContacts() {
    await fetchContacts({ silent: true })
  }

  async function loadMoreContacts() {
    if (!hasMore.value || loading.value || loadingMore.value) return
    await fetchContacts({ append: true })
  }

  async function updateStatus(id: string, status: ContactMessageStatus) {
    if (!assertGuestCanEdit()) return

    actionLoading.value = id

    try {
      const response = await apiPatchContact(id, { status }, { headers: authHeaders() })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Не удалось обновить статус')
      }

      const index = items.value.findIndex((item) => item._id === id)
      if (index !== -1) {
        items.value[index] = response.data
      }

      if (statusFilter.value !== 'all' && response.data.status !== statusFilter.value) {
        items.value = items.value.filter((item) => item._id !== id)
        total.value = Math.max(0, total.value - 1)
      }

      useToast().success('Статус обновлён')
    } finally {
      actionLoading.value = null
    }
  }

  async function deleteContact(id: string) {
    if (!assertGuestCanEdit()) return

    actionLoading.value = id

    try {
      const response = await apiDeleteContact(id, {
        headers: authHeaders(),
      })

      if (!response.success) {
        throw new Error(response.message || 'Не удалось удалить обращение')
      }

      items.value = items.value.filter((item) => item._id !== id)
      total.value = Math.max(0, total.value - 1)
      useToast().success('Обращение удалено')
    } finally {
      actionLoading.value = null
    }
  }

  function setStatusFilter(status: ContactMessageStatus | 'all') {
    statusFilter.value = status
  }

  return {
    items,
    total,
    hasMore,
    statusFilter,
    loading,
    loadingMore,
    initialized,
    error,
    actionLoading,
    authHeaders,
    fetchContacts,
    refreshContacts,
    loadMoreContacts,
    updateStatus,
    deleteContact,
    setStatusFilter,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useContactsStore, import.meta.hot))
}
