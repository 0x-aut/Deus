import type { ChatMessage } from "./chat";

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: "live" | "paused";
  image: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  agentId: string | null;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ToolConnection {
  slug: string;
  status: "connected" | "pending";
  connectedAt: number;
  accountId?: string;
}

/** tool slug -> agent ids that may use it */
export type ToolAssignments = Record<string, string[]>;

interface WorkspaceState {
  agents: Agent[];
  chats: Chat[];
  connections: ToolConnection[];
  assignments: ToolAssignments;
}

const SEED_AGENTS: Agent[] = [
  { id: "sales-copilot", name: "Sales Copilot", description: "Qualifies leads and drafts follow-ups.", model: "gpt-6-luna", status: "live", image: "", createdAt: Date.now() },
  { id: "support-agent", name: "Support Agent", description: "Answers customers and triages tickets.", model: "gpt-6-sol", status: "live", image: "", createdAt: Date.now() },
];

function defaultState(): WorkspaceState {
  return { agents: [...SEED_AGENTS], chats: [], connections: [], assignments: {} };
}

function storageKey(username: string) {
  return `deus:workspace:${username || "default"}`;
}

function load(username: string): WorkspaceState {
  if (import.meta.server) return defaultState();
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    return {
      agents: Array.isArray(parsed.agents) && parsed.agents.length ? parsed.agents : [...SEED_AGENTS],
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      assignments: parsed.assignments && typeof parsed.assignments === "object" ? parsed.assignments : {},
    };
  } catch {
    return defaultState();
  }
}

export function useWorkspace(username: string) {
  const state = useState<WorkspaceState>(`workspace:${username || "default"}`, () => load(username));

  // Hydrate from localStorage on the client (SSR renders seeds).
  if (import.meta.client) {
    const stored = load(username);
    state.value = stored;
  }

  watch(
    state,
    (value) => {
      if (import.meta.server) return;
      try {
        localStorage.setItem(storageKey(username), JSON.stringify(value));
      } catch {
        // storage full / unavailable — state still works in-memory
      }
    },
    { deep: true },
  );

  const uid = (prefix: string) =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  // ---------- Agents ----------
  const agents = computed(() => state.value.agents);
  const agentById = (id: string) => state.value.agents.find((a) => a.id === id);

  function createAgent(input: Pick<Agent, "name"> & Partial<Omit<Agent, "id" | "name" | "createdAt">>) {
    const agent: Agent = {
      id: uid("agent"),
      description: "",
      model: "gpt-6-luna",
      status: "live",
      image: "",
      createdAt: Date.now(),
      ...input,
    };
    state.value.agents.push(agent);
    return agent;
  }

  function updateAgent(id: string, patch: Partial<Omit<Agent, "id" | "createdAt">>) {
    const agent = agentById(id);
    if (agent) Object.assign(agent, patch);
  }

  function deleteAgent(id: string) {
    state.value.agents = state.value.agents.filter((a) => a.id !== id);
    // drop the agent from every tool assignment
    for (const slug of Object.keys(state.value.assignments)) {
      state.value.assignments[slug] = (state.value.assignments[slug] ?? []).filter((a) => a !== id);
    }
  }

  // ---------- Chats ----------
  const chats = computed(() =>
    [...state.value.chats].sort((a, b) => b.updatedAt - a.updatedAt),
  );
  const chatById = (id: string) => state.value.chats.find((c) => c.id === id);

  function titleFromMessage(content: string) {
    const clean = content.trim().replace(/\s+/g, " ");
    return clean.length > 42 ? `${clean.slice(0, 42).trim()}…` : clean || "New chat";
  }

  function createChat(firstMessage: string, agentId: string | null = null): Chat {
    const now = Date.now();
    const chat: Chat = {
      id: uid("chat"),
      title: titleFromMessage(firstMessage),
      agentId,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    state.value.chats.unshift(chat);
    return chat;
  }

  function appendMessage(chatId: string, message: ChatMessage) {
    const chat = chatById(chatId);
    if (!chat) return;
    chat.messages.push(message);
    chat.updatedAt = Date.now();
  }

  function renameChat(chatId: string, title: string) {
    const chat = chatById(chatId);
    if (chat && title.trim()) chat.title = title.trim();
  }

  function deleteChat(chatId: string) {
    state.value.chats = state.value.chats.filter((c) => c.id !== chatId);
  }

  function clearChats() {
    state.value.chats = [];
  }

  // ---------- Tool connections ----------
  const connections = computed(() => state.value.connections);
  const isConnected = (slug: string) =>
    state.value.connections.some((c) => c.slug === slug && c.status === "connected");

  function markConnected(slug: string, accountId?: string) {
    const existing = state.value.connections.find((c) => c.slug === slug);
    if (existing) {
      existing.status = "connected";
      existing.connectedAt = Date.now();
      if (accountId) existing.accountId = accountId;
    } else {
      state.value.connections.push({ slug, status: "connected", connectedAt: Date.now(), accountId });
    }
  }

  function markPending(slug: string) {
    if (!state.value.connections.some((c) => c.slug === slug)) {
      state.value.connections.push({ slug, status: "pending", connectedAt: Date.now() });
    }
  }

  function disconnect(slug: string) {
    state.value.connections = state.value.connections.filter((c) => c.slug !== slug);
    delete state.value.assignments[slug];
  }

  // ---------- Per-agent tool scope ----------
  const agentsForTool = (slug: string): string[] => state.value.assignments[slug] ?? [];

  function setAgentsForTool(slug: string, agentIds: string[]) {
    state.value.assignments[slug] = [...agentIds];
  }

  function toggleAgentForTool(slug: string, agentId: string) {
    const current = new Set(agentsForTool(slug));
    if (current.has(agentId)) current.delete(agentId);
    else current.add(agentId);
    state.value.assignments[slug] = [...current];
  }

  const toolsForAgent = (agentId: string): string[] =>
    Object.entries(state.value.assignments)
      .filter(([, ids]) => ids.includes(agentId))
      .map(([slug]) => slug);

  return {
    state,
    agents,
    agentById,
    createAgent,
    updateAgent,
    deleteAgent,
    chats,
    chatById,
    createChat,
    appendMessage,
    renameChat,
    deleteChat,
    clearChats,
    connections,
    isConnected,
    markConnected,
    markPending,
    disconnect,
    agentsForTool,
    setAgentsForTool,
    toggleAgentForTool,
    toolsForAgent,
  };
}

export type WorkspaceApi = ReturnType<typeof useWorkspace>;

// ---------- Date grouping for the chat sidebar ----------
export interface ChatGroup {
  label: string;
  items: Chat[];
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function groupChatsByDate(chats: Chat[]): ChatGroup[] {
  const today = startOfDay(Date.now());
  const day = 24 * 60 * 60 * 1000;
  const groups: ChatGroup[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Previous 30 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const chat of chats) {
    const age = today - startOfDay(chat.updatedAt);
    if (age <= 0) groups[0]!.items.push(chat);
    else if (age <= day) groups[1]!.items.push(chat);
    else if (age <= 7 * day) groups[2]!.items.push(chat);
    else if (age <= 30 * day) groups[3]!.items.push(chat);
    else groups[4]!.items.push(chat);
  }
  return groups.filter((g) => g.items.length > 0);
}
