<script setup lang="ts">
import { SmoothCorners } from "@lisse/vue";
import { ArrowUp, Plus, SliderHorizontal } from "reicon-vue";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const isLoading = ref(false);
const isFocused = ref(false);
const message = ref("");
const requestError = ref<string | null>(null);
const displayName = ref("Demi");
const selectedModel = ref("gpt-6-luna");

const messageListRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Sample messages so the list renders. Not wired to anything yet.
const messages = ref<ChatMessage[]>([
  { id: "sample-1", role: "user", content: "What can you help my business with?" },
  { id: "sample-2", role: "assistant", content: "I can help with sales, support, and ops. Ask me anything to get started." },
]);

const hasMessages = computed(() => messages.value.length > 0);
const canSend = computed(() => !isLoading.value && message.value.trim().length > 0);

function adjustHeight() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
}

// Placeholders — intentionally do nothing for now.
function handleKeyDown(_event: KeyboardEvent) {}
function handleSend() {}
function abort() {}
</script>

<template>
  <div class="flex w-full justify-center">
    <div
      :class="[
        'flex w-full max-w-2xl flex-col px-2 py-8',
        hasMessages
          ? 'h-[calc(100dvh-2.75rem)] justify-between gap-y-5'
          : 'justify-center',
      ]"
    >
      <!-- Message list -->
      <div
        v-if="hasMessages"
        ref="messageListRef"
        class="flex min-h-0 noscrollbar flex-1 flex-col gap-y-5 overflow-y-auto px-1 py-2"
        aria-live="polite"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
        >
          <!-- User bubble -->
          <ElementsUserMessageBubble
            v-if="msg.role === 'user'"
            :content="msg.content"
          />

          <!-- Assistant bubble — Markdown rendered, streams token-by-token -->
          <div v-else class="flex max-w-[85%] flex-col">
            <Markdown
              :key="msg.id"
              :value="msg.content"
              :streaming="isLoading"
              :caret="isLoading"
              class="font-sans text-sm text-[#1a1a1a] leading-6 prose prose-sm"
            />
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <span class="text-sm font-sans text-[#696969]">
            Deus is thinking<span class="animate-pulse">…</span>
          </span>
        </div>

        <!-- Error -->
        <div v-if="requestError" class="flex justify-start">
          <div class="rounded-2xl rounded-bl-md bg-[#FFF1F1] px-4 py-2.5 text-sm font-sans text-[#B42318]">
            {{ requestError }}
          </div>
        </div>
      </div>

      <!-- Input bar -->
      <div class="shrink-0">
        <SmoothCorners
          as-child
          :corners="{ radius: 0, smoothing: 0.6 }"
          :middle-border="isFocused
            ? { width: 1.5, color: { type: 'solid', color: '#D0D0D0' }, opacity: 1 }
            : { width: 1, color: { type: 'linear', angle: 180, stops: [{ offset: 0, color: '#E5E5E5' }, { offset: 1, color: '#F4F4F4' }] }, opacity: 0.6 }"
        >
          <div
            class="flex flex-col font-sans gap-y-0.5 bg-[#FFFFFF] p-1.5"
            @focusin="isFocused = true"
            @focusout="isFocused = false"
          >
            <textarea
              ref="textareaRef"
              v-model="message"
              rows="1"
              :placeholder="`Ask ${displayName ?? 'Demi'} anything`"
              :aria-label="`Message ${displayName ?? 'Demi'}`"
              class="max-h-[200px] resize-none overflow-y-auto bg-transparent px-1.5 py-1 text-sm font-medium text-[#1a1a1a] outline-none placeholder:text-[#A0A0A0]"
              @input="adjustHeight"
              @keydown="handleKeyDown"
            />

            <div class="flex w-full items-center justify-between">
              <button
                type="button"
                aria-label="Add context"
                class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F0F0F0]"
              >
                <Plus :size="18" color="#5a5a5a" />
              </button>

              <div class="flex items-center gap-x-1.5">
                <button
                  type="button"
                  aria-label="Chat settings"
                  class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F0F0F0]"
                >
                  <SliderHorizontal :size="18" color="#5a5a5a" />
                </button>

                <!-- ModelCard now emits its selection up -->
                <ElementsModelCard @select="selectedModel = $event" />

                <!-- Stop button while streaming -->
                <button
                  v-if="isLoading"
                  type="button"
                  aria-label="Stop generation"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-[#121212]"
                  @click="abort"
                >
                  <span class="h-3 w-3 rounded-sm bg-white" />
                </button>

                <!-- Send button -->
                <button
                  v-else
                  type="button"
                  aria-label="Send message"
                  :disabled="!canSend"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-[#121212] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                  @mousedown.prevent="handleSend"
                >
                  <ArrowUp :size="16" color="#fff" class="-ml-px" />
                </button>
              </div>
            </div>
          </div>
        </SmoothCorners>
      </div>
    </div>
  </div>
</template>