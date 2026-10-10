<script setup lang="ts">
definePageMeta({
  layout: "app"
})

const route = useRoute();
const routeParts = computed(() => route.path.split("/").filter(Boolean));
const username = computed(() => String(route.params.username ?? routeParts.value[0] ?? ""));

await navigateTo(`/${username.value}/overview`)

</script>

<template>
  <main>Here you are</main>
</template>