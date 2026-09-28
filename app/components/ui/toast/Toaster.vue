<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2"
    aria-live="polite"
    aria-relevant="additions"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-premium"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-premium"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-sm border border-primary/35 bg-ink-soft px-4 py-3 text-sm font-medium text-foreground shadow-[0_12px_40px_rgba(0,0,0,0.72),0_0_0_1px_rgba(166,124,82,0.12)] backdrop-blur-sm"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>
