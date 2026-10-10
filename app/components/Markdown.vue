<script setup lang="ts">
// Placeholder until the real Markdown renderer lands.
// Renders plain text so Chatbox can render.
defineProps<{
  value: string;
  streaming?: boolean;
  caret?: boolean;
}>();
</script>

<template>
  <div class="whitespace-pre-wrap wrap-break-words">{{ value }}</div>
</template>
