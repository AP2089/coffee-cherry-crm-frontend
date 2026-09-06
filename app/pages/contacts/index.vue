<template>
  <NuxtLayout name="app">
    <LayoutAppHeader title="Сообщения" subtitle="Обращения из формы на сайте" />

    <div ref="listEl" class="flex-1 overflow-y-auto p-4 md:p-6">
      <div class="mb-4 flex flex-wrap gap-2">
        <Button
          v-for="filter in statusFilters"
          :key="filter.value"
          size="sm"
          :variant="contacts.statusFilter === filter.value ? 'magnetic-filled' : 'outline'"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </Button>
      </div>

      <p
        v-if="!contacts.initialized || (contacts.loading && !contacts.items.length)"
        class="py-16 text-center text-sm text-muted-foreground"
      >
        Загрузка…
      </p>

      <Alert v-else-if="contacts.error && !contacts.items.length" variant="destructive">
        <AlertDescription>{{ contacts.error }}</AlertDescription>
      </Alert>

      <div
        v-else-if="contacts.initialized && !contacts.items.length"
        class="rounded-sm border border-dashed border-border px-6 py-16 text-center"
      >
        <p class="font-display text-lg">Обращений нет</p>
        <p class="mt-2 text-sm text-muted-foreground">
          {{
            contacts.statusFilter === 'all'
              ? 'Новые сообщения появятся здесь'
              : 'Нет обращений с выбранным статусом'
          }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <Card v-for="item in contacts.items" :key="item._id" class="border-border">
          <CardContent class="space-y-4 p-4 md:p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-medium">{{ item.name }}</p>
                  <Badge :variant="statusVariant(item.status)">{{
                    statusLabel(item.status)
                  }}</Badge>
                </div>
                <p class="mt-1 text-sm text-muted-foreground">{{ item.email }}</p>
                <p class="mt-1 text-xs text-muted-foreground">{{ formatDate(item.createdAt) }}</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <Button
                  v-if="item.status === 'new'"
                  size="sm"
                  variant="outline"
                  :disabled="contacts.actionLoading === item._id"
                  @click="onUpdateStatus(item._id, 'read')"
                >
                  Прочитано
                </Button>
                <Button
                  v-if="item.status !== 'archived'"
                  size="sm"
                  variant="outline"
                  :disabled="contacts.actionLoading === item._id"
                  @click="onUpdateStatus(item._id, 'archived')"
                >
                  В архив
                </Button>
                <Button v-if="!canEdit" size="sm" variant="destructive" @click="assertCanEdit()">
                  Удалить
                </Button>
                <AlertDialog v-else>
                  <AlertDialogTrigger as-child>
                    <Button
                      size="sm"
                      variant="destructive"
                      :disabled="contacts.actionLoading === item._id"
                    >
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить обращение?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Сообщение от {{ item.name }} будет удалено без возможности восстановления.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction @click="onDeleteContact(item._id)">
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <p class="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {{ item.message }}
            </p>
          </CardContent>
        </Card>

        <p v-if="contacts.loadingMore" class="py-3 text-center text-xs text-muted-foreground">
          Загрузка…
        </p>

        <p
          v-else-if="!contacts.hasMore"
          class="py-3 text-center text-[10px] uppercase tracking-[0.08em] text-muted-foreground/50"
        >
          Все сообщения загружены
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ContactMessageStatus } from '~/types/crm'
import { contactStatusLabels, formatDate } from '~/utils/format'

definePageMeta({
  layout: false,
  ssr: false,
})

const contacts = useContactsStore()
const listEl = ref<HTMLElement | null>(null)
const { canEdit, assertCanEdit } = useCanEdit()

const statusFilters = [
  { value: 'all' as const, label: 'Все' },
  { value: 'new' as const, label: 'Новые' },
  { value: 'read' as const, label: 'Прочитанные' },
  { value: 'archived' as const, label: 'Архив' },
]

useCrmInfiniteScroll({
  listEl,
  hasMore: () => contacts.hasMore,
  loading: () => contacts.loading,
  loadingMore: () => contacts.loadingMore,
  loadMore: () => contacts.loadMoreContacts(),
  itemsLength: () => contacts.items.length,
})

useCrmAutoRefresh(() => contacts.refreshContacts(), {
  canRefresh: () =>
    contacts.initialized && !contacts.loading && !contacts.loadingMore && !contacts.actionLoading,
})

function statusLabel(status: ContactMessageStatus) {
  return contactStatusLabels[status]
}

function statusVariant(status: ContactMessageStatus) {
  if (status === 'new') return 'unread'
  if (status === 'archived') return 'secondary'
  return 'status'
}

async function setFilter(value: ContactMessageStatus | 'all') {
  contacts.setStatusFilter(value)
  await contacts.fetchContacts()
}

function onUpdateStatus(id: string, status: ContactMessageStatus) {
  if (!assertCanEdit()) return
  void contacts.updateStatus(id, status)
}

function onDeleteContact(id: string) {
  if (!assertCanEdit()) return
  void contacts.deleteContact(id)
}

onMounted(async () => {
  await contacts.fetchContacts()
})
</script>
