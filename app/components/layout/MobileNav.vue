<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Навигация"
    >
      <button
        type="button"
        class="absolute inset-0 bg-background/75 backdrop-blur-sm"
        aria-label="Закрыть меню"
        @click="close"
      />
      <div
        class="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] max-w-full animate-in slide-in-from-left duration-300"
      >
        <LayoutSidebar class="w-full shadow-lg" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

function close() {
  open.value = false
}

const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

watch(open, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }
  window.addEventListener('keydown', onKeydown)
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  })
})
</script>
