<script setup lang="ts">
definePageMeta({
  ssr: false,
})

await navigateTo('/orders', { replace: true })
</script>
