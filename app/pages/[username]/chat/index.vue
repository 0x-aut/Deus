<script setup lang="ts">
definePageMeta({
  layout: "app",
});

useSeoMeta({
  title: "Chat"
})

const route = useRoute()
const workspaceId = computed(() => String(route.params.workspace ?? route.params.workspaceId ?? route.path.split("/")[2] ?? ""))
const username = computed(() => String(route.params.username ?? route.path.split("/")[1] ?? ""))

</script>

<template>
  <div class="font-sans unmodified-font-sans relative mx-auto flex h-full w-full flex-col px-1 pt-0 pb-0">
    <AppsChatbox :displayName="username" class="relative z-10 min-h-0 flex-1" />
  </div>
</template>
