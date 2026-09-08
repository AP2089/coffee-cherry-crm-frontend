<template>
  <div v-if="!auth.ready" class="h-dvh bg-background" aria-hidden="true" />
  <template v-else>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </template>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
