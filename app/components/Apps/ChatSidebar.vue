<script setup lang="ts">
import { SmoothCorners } from "@lisse/vue";
import {
  ChatPlus,
  ChatSquare,
  Cpu,
  Plus,
  Search,
  Sparkles,
  Trash,
} from "reicon-vue";
import { groupChatsByDate, useWorkspace } from "../../composables/useWorkspace";

const route = useRoute();
const routeParts = computed(() => route.path.split("/").filter(Boolean));
const username = computed(() => String(route.params.username ?? routeParts.value[0] ?? ""));

const workspace = useWorkspace(username.value);
const search = ref("");

const base = computed(() => `/${username.value}/chat`);
const activeChatId = computed(() => String(route.params.chatId ?? ""));

const filteredChats = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return workspace.chats.value;
  return workspace.chats.value.filter((c) => c.title.toLowerCase().includes(q));
});

const groups = computed(() => groupChatsByDate(filteredChats.value));

const filteredAgents = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return workspace.agents.value;
  return workspace.agents.value.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q),
  );
});

function isNewChatRoute() {
  return route.path === base.value || route.path === `${base.value}/`;
}

function startNewChat() {
  search.value = "";
  navigateTo(base.value);
}

function openChat(id: string) {
  navigateTo(`${base.value}/${id}`);
}

function deleteChat(id: string) {
  workspace.deleteChat(id);
  if (activeChatId.value === id) navigateTo(base.value);
}
</script>

<template>
  <aside class="flex h-full w-64 shrink-0 flex-col border-r border-[#E3E3E3] bg-[#FAFAFA]">
    <!-- Search + new chat -->
    <div class="flex items-center gap-x-2 px-3 pb-3 pt-4">
      <SmoothCorners as-child :corners="{ radius: 9, smoothing: 0.6 }">
        <div
          class="flex h-9 min-w-0 flex-1 items-center gap-x-2 border border-[#E1E1E1] bg-white px-2.5 focus-within:border-[#BDBDBD]"
        >
          <Search :size="14" :stroke-width="1.8" class="shrink-0 text-[#8A8A8A]" />
          <input
            v-model="search"
            type="text"
            placeholder="Search"
            aria-label="Search chats and agents"
            class="min-w-0 flex-1 bg-transparent font-sans text-sm text-[#121212] outline-none placeholder:text-[#A2A2A2]"
          />
        </div>
      </SmoothCorners>

      <SmoothCorners as-child :corners="{ radius: 999, smoothing: 0.6 }">
        <button
          type="button"
          aria-label="New chat"
          title="New chat"
          class="flex h-9 w-9 shrink-0 items-center justify-center bg-[#121212] transition-opacity hover:opacity-85"
          @click="startNewChat"
        >
          <Plus :size="16" :stroke-width="2" class="text-white" />
        </button>
      </SmoothCorners>
    </div>

    <!-- Scrollable body -->
    <div class="noscrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Chats and agents">
      <!-- Agents first -->
      <p class="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        Agents
      </p>
      <div v-if="filteredAgents.length" class="flex flex-col gap-y-0.5">
        <div v-for="agent in filteredAgents" :key="agent.id" class="group relative">
          <SmoothCorners as-child :corners="{ radius: 0.5, smoothing: 0.6 }">
            <button
              type="button"
              class="flex w-full items-center gap-x-2.5 px-2.5 py-1.5 text-left transition-colors duration-100 hover:bg-[#EBEBEB]"
              @click="startNewChat"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <NuxtImg
                  v-if="agent.image"
                  :src="agent.image"
                  :alt="`${agent.name} avatar`"
                  class="h-full w-full object-cover"
                />
                <component :is="agent.id.includes('support') ? Cpu : Sparkles" v-else :size="14" :stroke-width="1.8" class="text-[#6B6B6B]" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate unmodified-font-sans text-sm font-normal text-[#121212]">
                  {{ agent.name }}
                </span>
                <span class="block truncate font-sans text-xs text-[#8A8A8A]">
                  {{ agent.status === "live" ? "Live" : "Paused" }}{{ agent.description ? ` · ${agent.description}` : "" }}
                </span>
              </span>
            </button>
          </SmoothCorners>
        </div>
      </div>
      <p v-else class="px-2 py-1 font-sans text-xs text-[#8A8A8A]">
        No agents match.
      </p>

      <!-- Chats by date -->
      <div class="mt-5 flex items-center justify-between px-2 pb-1.5">
        <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          Chats
        </p>
        <button
          type="button"
          class="flex items-center gap-x-1 font-sans text-xs text-[#6B6B6B] transition-colors hover:text-[#121212]"
          @click="startNewChat"
        >
          <ChatPlus :size="13" :stroke-width="1.8" />
          New
        </button>
      </div>

      <div v-if="groups.length" class="flex flex-col gap-y-4">
        <section v-for="group in groups" :key="group.label">
          <p class="px-2 pb-1 font-sans text-[11px] font-medium text-[#8A8A8A]">
            {{ group.label }}
          </p>
          <div class="flex flex-col gap-y-0.5">
            <div v-for="chat in group.items" :key="chat.id" class="group relative">
              <SmoothCorners as-child :corners="{ radius: 0.5, smoothing: 0.6 }">
                <button
                  type="button"
                  :aria-current="activeChatId === chat.id ? 'page' : undefined"
                  :class="[
                    'flex w-full items-center gap-x-2 px-2.5 py-1.5 text-left transition-colors duration-100',
                    activeChatId === chat.id ? 'bg-[#E3E3E3]' : 'hover:bg-[#EBEBEB]',
                  ]"
                  @click="openChat(chat.id)"
                >
                  <ChatSquare
                    :size="14"
                    :stroke-width="1.8"
                    :class="[
                      'shrink-0 transition-colors duration-100',
                      activeChatId === chat.id ? 'text-[#121212]' : 'text-[#6B6B6B] group-hover:text-[#121212]',
                    ]"
                  />
                  <span
                    :class="[
                      'min-w-0 flex-1 truncate unmodified-font-sans text-sm font-normal transition-colors duration-100',
                      activeChatId === chat.id ? 'text-[#121212]' : 'text-[#6B6B6B] group-hover:text-[#121212]',
                    ]"
                  >
                    {{ chat.title }}
                  </span>
                </button>
              </SmoothCorners>
              <button
                type="button"
                aria-label="Delete chat"
                title="Delete chat"
                class="absolute right-1.5 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#8A8A8A] transition-colors hover:bg-white hover:text-[#B42318] group-hover:flex"
                @click.stop="deleteChat(chat.id)"
              >
                <Trash :size="13" :stroke-width="1.8" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Empty state routes to a new chat -->
      <div
        v-else
        class="mx-1 mt-1 rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-5 text-center"
      >
        <p class="text-sm font-medium text-neutral-700">No chats yet</p>
        <p class="mt-1 text-xs leading-relaxed text-neutral-500">
          Start your first conversation — it will show up here.
        </p>
        <SmoothCorners as-child :corners="{ radius: 999, smoothing: 0.6 }">
          <button
            type="button"
            class="mx-auto mt-3 flex h-8 items-center bg-[#121212] px-3.5"
            @click="startNewChat"
          >
            <span class="unmodified-font-sans text-xs font-medium text-white">New chat</span>
          </button>
        </SmoothCorners>
      </div>

      <button
        v-if="isNewChatRoute() && !groups.length && search.trim()"
        type="button"
        class="mt-2 w-full px-2 text-left font-sans text-xs text-[#8A8A8A] hover:text-[#121212]"
        @click="startNewChat"
      >
        Clear search
      </button>
    </div>
  </aside>
</template>
