<script setup lang="ts">
import {
  Home6,
  FolderFiles,
  Envelope2,
  ChatSquare,
  Settings2,
  Cpu,
  Sparkles,
  MoreH,
  Logout,
} from "reicon-vue";

const route = useRoute();
const routeParts = computed(() => route.path.split("/").filter(Boolean));
const username = computed(() => String(route.params.username ?? routeParts.value[0] ?? ""));

const appNavigation = computed(() => [
  {
    name: "Overview",
    to: `/${username.value}/overview`,
    icon: Home6,
  },
  {
    name: "Chat",
    to: `/${username.value}/chat`,
    icon: ChatSquare,
  },
  {
    name: "Email",
    to: `/${username.value}/email`,
    icon: Envelope2,
  },
  {
    name: "Files",
    to: `/${username.value}/files`,
    icon: FolderFiles,
  },
  {
    name: "Manage",
    to: `/${username.value}/manage`,
    icon: Settings2,
  },
]);

// agentNavigation is for the agents created to be there, especially based on usage.
// Each agent can carry an `image` (avatar/logo). When absent we fall back to `icon`.
const agentNavigation = computed(() => [
  {
    name: "Sales Copilot",
    to: `/${username.value}/agents/sales-copilot`,
    image: "",
    icon: Sparkles,
    status: "live" as const,
  },
  {
    name: "Support Agent",
    to: `/${username.value}/agents/support-agent`,
    image: "",
    icon: Cpu,
    status: "live" as const,
  },
]);

const isActive = (to: string) => {
  if (!to) return false;
  return route.path === to || route.path.startsWith(`${to}/`);
};

// Logo image slot: drop your file at `public/logo.png`.
// Falls back to the "D" monogram if the file is missing.
const logoFailed = ref(false);

// Profile card slot: wire to auth/user store when ready.
const profile = ref({
  name: "Alex",
  business: "Northbeam Ltd",
  email: "alex@northbeam.com",
  avatar: "",
  plan: "Business",
});
const avatarFailed = ref(false);
</script>

<template>
  <div class="flex min-h-screen bg-white font-sans text-neutral-900 antialiased">
    <!-- ============ Sidebar (smaller column) ============ -->
    <aside
      class="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-neutral-200 bg-white md:flex"
    >
      <!-- Brand: logo image + platform name -->
      <div class="flex items-center gap-3 px-5 pb-5 pt-6">
        <div
          class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-900 font-display text-lg text-white"
        >
          <span class="select-none">D</span>
          <!-- Replace src with your product logo. Expected at `public/logo.png` -->
          <NuxtImg
            v-if="!logoFailed"
            src="/logo.png"
            alt="deus logo"
            class="absolute inset-0 h-full w-full object-cover"
            @error="logoFailed = true"
          />
        </div>
        <div class="min-w-0 leading-tight">
          <p class="truncate font-display text-[22px]">deus</p>
        </div>
      </div>

      <!-- Scrollable nav region -->
      <nav class="flex-1 overflow-y-auto px-3 pb-4 noscrollbar" aria-label="Primary">
        <ul class="space-y-1">
          <li v-for="item in appNavigation" :key="item.name">
            <NuxtLink
              :to="item.to"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              :class="[
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive(item.to)
                  ? 'bg-neutral-900 font-medium text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'h-5 w-5 shrink-0',
                  isActive(item.to) ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700',
                ]"
              />
              <span class="truncate">{{ item.name }}</span>
            </NuxtLink>
          </li>
        </ul>

        <!-- Agents created by the user -->
        <div class="mt-7 px-3 pb-2">
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Agent
          </p>
        </div>

        <ul v-if="agentNavigation.length" class="space-y-1">
          <li v-for="agent in agentNavigation" :key="agent.name">
            <NuxtLink
              :to="agent.to"
              :aria-current="isActive(agent.to) ? 'page' : undefined"
              :class="[
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive(agent.to)
                  ? 'bg-neutral-100 font-medium text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              ]"
            >
              <!-- Agent image slot with icon fallback -->
              <span
                class="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <NuxtImg
                  v-if="agent.image"
                  :src="agent.image"
                  :alt="`${agent.name} avatar`"
                  class="h-full w-full object-cover"
                />
                <component :is="agent.icon ?? Cpu" v-else class="h-4.5 w-4.5 text-neutral-500" />
                <span
                  class="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500"
                  title="Live"
                />
              </span>
              <span class="min-w-0 flex-1 truncate">{{ agent.name }}</span>
            </NuxtLink>
          </li>
        </ul>
        <div
          v-else
          class="mx-1 rounded-xl border border-dashed border-neutral-200 px-3 py-4 text-center"
        >
          <p class="text-sm font-medium text-neutral-700">No agents yet</p>
          <p class="mt-1 text-xs leading-relaxed text-neutral-500">
            Create your first agent to handle sales, support, or ops.
          </p>
        </div>
      </nav>

      <!-- Profile card: pinned to the bottom -->
      <div class="mt-auto border-t border-neutral-200 p-3">
        <div
          class="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <!-- Avatar image slot -->
          <span
            class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[7.5px] bg-neutral-900 text-sm font-semibold text-white"
          >
            <template v-if="profile.avatar && !avatarFailed">
              <NuxtImg
                :src="profile.avatar"
                :alt="profile.name"
                class="h-full w-full object-cover"
                @error="avatarFailed = true"
              />
            </template>
            <template v-else>A</template>
            <span
              class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-neutral-50 bg-emerald-500"
            />
          </span>
          <div class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-sm font-semibold text-neutral-900">{{ profile.name }}</p>
            <p class="truncate text-xs text-neutral-500">{{ profile.email }}</p>
            <span
              class="mt-1.5 inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-600"
            >
              {{ profile.plan }}
            </span>
          </div>
          <div class="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              aria-label="Account options"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700"
            >
              <MoreH class="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Log out"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700"
            >
              <Logout class="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- ============ Main content (larger column) ============ -->
    <div class="min-w-0 flex-1">
      <main class="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
