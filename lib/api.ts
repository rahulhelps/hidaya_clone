// Thin fetch wrapper around the platform_api backend, sharing the ThinkFast
// response envelope: { success, statusCode, message, data, timestamp }.
//
// PHASE 1: the OTP send/verify functions run in MOCK mode (no backend needed)
// so the premium gate is fully demoable. Set NEXT_PUBLIC_MOCK_OTP=false once the
// platform `/api/v1/hidayah/auth/otp/*` endpoints are live - the function
// signatures already match the frozen contract in platform_api-planning.

import { loadAuth, saveAuth, clearAuth, type AuthState } from "./auth-store";

// Prod-safe default: the live platform_api host. Local dev overrides this to
// localhost via .env.development; .env.production pins the live host for builds.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://apiv2.thinkfastbd.com/api/v1";
// Real backend by default now that platform_api is wired. Set
// NEXT_PUBLIC_MOCK_OTP=true to demo the UI standalone (no backend / no reminders).
const MOCK_OTP = (process.env.NEXT_PUBLIC_MOCK_OTP ?? "false") === "true";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
};

// ─── Silent refresh ─────────────────────────────────────────────────────────
// When an authed request 401s (access token lapsed), exchange the refresh token
// for a fresh pair once and retry. A module-level promise makes this
// single-flight, so concurrent 401s share one refresh round-trip rather than
// stampeding the rotation endpoint (which would invalidate the token family).
// saveAuth/clearAuth fire `hidayah-auth-change`, so the AuthGate re-syncs.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (MOCK_OTP) return false; // mock tokens are synthetic - no real refresh
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const auth = loadAuth();
    if (!auth?.refreshToken) return false;
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });
      const env = (await res.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; phoneNumber: string };
      }>;
      if (!res.ok || !env.success || !env.data) {
        // Refresh token rejected (expired / rotated / reused) → session is dead.
        clearAuth();
        return false;
      }
      saveAuth({
        accessToken: env.data.accessToken,
        refreshToken: env.data.refreshToken,
        phoneNumber: env.data.user?.phoneNumber ?? auth.phoneNumber,
        userId: env.data.user?.id ?? auth.userId,
      });
      return true;
    } catch {
      // Network error - keep the session; let the original error surface.
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; _retried?: boolean } = {}
): Promise<T> {
  const doFetch = (): Promise<Response> => {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (init.auth) {
      const auth = loadAuth();
      if (!auth) throw new Error("You need to verify your phone number first.");
      headers.set("Authorization", `Bearer ${auth.accessToken}`);
    }
    return fetch(`${BASE_URL}${path}`, { ...init, headers });
  };

  let res = await doFetch();

  // Access token lapsed → refresh once and retry the same request.
  if (res.status === 401 && init.auth && !init._retried) {
    if (await refreshSession()) {
      init._retried = true;
      res = await doFetch();
    }
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON body - a gateway timeout (504) is the common case, so keep the
    // status attached or callers can't tell it apart from a generic failure.
    throw apiError(`Server returned ${res.status}.`, res.status);
  }
  if (!res.ok || !envelope.success) {
    throw apiError(envelope.message || `Request failed (${res.status}).`, res.status);
  }
  return envelope.data as T;
}

/** An Error carrying the HTTP status, so callers can branch on 429/503/504. */
function apiError(message: string, status: number): Error & { status?: number } {
  const err = new Error(message) as Error & { status?: number };
  err.status = status;
  return err;
}

// ─── OTP (BDApps subscription) ──────────────────────────────────────────────
export type SendOtpResult =
  | { alreadyRegistered: false; referenceNo: string; expiresInSeconds: number }
  | {
      alreadyRegistered: true;
      user: { id: string; phoneNumber: string; role: "user" | "admin" };
      accessToken: string;
      refreshToken: string;
      isNewUser: boolean;
    };

export type VerifyOtpResult = {
  user: { id: string; phoneNumber: string; role: "user" | "admin" };
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendOtp(phoneNumber: string): Promise<SendOtpResult> {
  if (MOCK_OTP) {
    await delay(700);
    if (!/^01\d{9}$/.test(phoneNumber)) {
      throw new Error("Enter a valid 11-digit Bangladesh mobile number.");
    }
    return { alreadyRegistered: false, referenceNo: "MOCK-REF", expiresInSeconds: 60 };
  }
  return request<SendOtpResult>("/hidayah/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function verifyOtp(
  phoneNumber: string,
  referenceNo: string,
  code: string
): Promise<VerifyOtpResult> {
  if (MOCK_OTP) {
    await delay(700);
    // Demo rule: any 6-digit code verifies except an obviously wrong one.
    if (code === "000000") throw new Error("Invalid OTP code. Please try again.");
    return {
      user: { id: "mock-user", phoneNumber, role: "user" },
      accessToken: mockJwt(phoneNumber),
      refreshToken: "mock-refresh",
      isNewUser: true,
    };
  }
  return request<VerifyOtpResult>("/hidayah/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phoneNumber, referenceNo, code }),
  });
}

export async function unsubscribeUser(): Promise<{ alreadyUnsubscribed: boolean }> {
  if (MOCK_OTP) {
    await delay(400);
    return { alreadyUnsubscribed: false };
  }
  return request<{ alreadyUnsubscribed: boolean }>("/hidayah/auth/unsubscribe", {
    method: "POST",
    auth: true,
  });
}

// ─── Story of the day ───────────────────────────────────────────────────────
export type StoryOfDay = {
  activeDate: string;
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
  source: string;
};

/** Today's Islamic story, or null if none is scheduled. Requires login. */
export async function getStoryOfDay(): Promise<StoryOfDay | null> {
  if (MOCK_OTP) {
    await delay(300);
    return {
      activeDate: new Date().toISOString().slice(0, 10),
      titleBn: "মাকড়সার জাল",
      titleEn: "The Spider's Web",
      bodyBn:
        "হিজরতের সময় রাসূল ﷺ ও আবু বকর রাঃ সাওর গুহায় আশ্রয় নেন। আল্লাহর হুকুমে গুহামুখে মাকড়সা জাল বুনে দেয় ও কবুতর বাসা বাঁধে। কুরাইশরা ভাবল ভেতরে কেউ নেই, আর আল্লাহর সাহায্যে তাঁরা নিরাপদ থাকেন।",
      bodyEn:
        "During the Hijrah, the Prophet ﷺ and Abu Bakr (RA) took refuge in the Cave of Thawr. By Allah's command a spider spun its web across the entrance and a dove nested there, so the pursuing Quraysh believed no one had entered, and by Allah's protection they were kept safe.",
      source: "Seerah",
    };
  }
  return request<StoryOfDay | null>("/hidayah/story/today", { auth: true });
}

// ─── AI Chat ────────────────────────────────────────────────────────────────
// The provider key never reaches the browser: platform_api proxies every call,
// enforces the per-user daily cap, and owns the conversation history.
//
// Phase 1 is buffered - one JSON reply after 5-25s. When SSE lands, add a
// `streamChatMessage` alongside `sendChatMessage` with the same signature plus
// an onDelta callback; nothing else in the UI has to change.

/** Every conversation is scoped to a product; this app only ever sends its own. */
const CHAT_PRODUCT = "hidayah";

export type ChatModel = {
  id: string;
  label: string;
  description: string;
  descriptionBn: string;
  contextWindow: number;
  isDefault: boolean;
  goodFor: string[];
};

export type ChatModelList = { defaultModelId: string; models: ChatModel[] };

export type ChatQuota = {
  limit: number;
  used: number;
  remaining: number;
  /** Next Dhaka midnight as a UTC ISO string. Never recompute this client-side. */
  resetsAt: string;
  timezone: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  modelId: string | null;
  createdAt: string;
  error: string | null;
};

export type Conversation = {
  id: string;
  title: string;
  product: string;
  modelId: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
};

export type ConversationDetail = Conversation & { messages: ChatMessage[] };

export type ConversationPage = {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
};

export type SendMessageResult = {
  conversationId: string;
  title: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  quota: Pick<ChatQuota, "limit" | "used" | "remaining">;
  disclaimer: string;
  disclaimerBn: string;
};

export function getChatModels(): Promise<ChatModelList> {
  if (MOCK_OTP) return Promise.resolve(mockModels());
  return request<ChatModelList>("/ai/chat/models", { auth: true });
}

export function getChatQuota(): Promise<ChatQuota> {
  if (MOCK_OTP) return Promise.resolve(mockQuota());
  return request<ChatQuota>("/ai/chat/quota", { auth: true });
}

export function listConversations(page = 1, limit = 20): Promise<ConversationPage> {
  if (MOCK_OTP) {
    const conversations = mockThreads.map(stripMessages);
    return Promise.resolve({ conversations, total: conversations.length, page, limit });
  }
  return request<ConversationPage>(
    `/ai/chat/conversations?product=${CHAT_PRODUCT}&page=${page}&limit=${limit}`,
    { auth: true }
  );
}

export function getConversation(id: string): Promise<ConversationDetail> {
  if (MOCK_OTP) {
    const found = mockThreads.find((t) => t.id === id);
    if (!found) return Promise.reject(apiError("Conversation not found.", 404));
    return Promise.resolve(found);
  }
  return request<ConversationDetail>(`/ai/chat/conversations/${id}`, { auth: true });
}

export function renameConversation(id: string, title: string): Promise<Conversation> {
  if (MOCK_OTP) {
    const found = mockThreads.find((t) => t.id === id);
    if (!found) return Promise.reject(apiError("Conversation not found.", 404));
    found.title = title;
    return Promise.resolve(stripMessages(found));
  }
  return request<Conversation>(`/ai/chat/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
    auth: true,
  });
}

export function deleteConversation(id: string): Promise<{ deleted: boolean }> {
  if (MOCK_OTP) {
    const index = mockThreads.findIndex((t) => t.id === id);
    if (index >= 0) mockThreads.splice(index, 1);
    return Promise.resolve({ deleted: true });
  }
  return request<{ deleted: boolean }>(`/ai/chat/conversations/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * Send one turn. Pass `conversationId: null` to start a thread - the backend
 * creates it in the same call, so a double-tap can't produce two threads.
 */
export function sendChatMessage(
  input: { conversationId: string | null; content: string; modelId: string },
  signal?: AbortSignal
): Promise<SendMessageResult> {
  if (MOCK_OTP) return mockSend(input, signal);
  return request<SendMessageResult>("/ai/chat/messages", {
    method: "POST",
    body: JSON.stringify({ ...input, product: CHAT_PRODUCT }),
    auth: true,
    signal,
  });
}

// ─── AI Chat mocks (NEXT_PUBLIC_MOCK_OTP=true) ──────────────────────────────
// Enough fidelity to build the whole surface offline: markdown in replies, a
// working quota that eventually 429s, and escape hatches for each error path.
const MOCK_CHAT_LIMIT = 20;
let mockUsed = 0;
const mockThreads: ConversationDetail[] = [];

function stripMessages(thread: ConversationDetail): Conversation {
  const { messages: _messages, ...rest } = thread;
  return rest;
}

function mockModels(): ChatModelList {
  return {
    defaultModelId: "google/gemma-4-26b-a4b-it:free",
    models: [
      {
        id: "google/gemma-4-26b-a4b-it:free",
        label: "Gemma 4 26B",
        description: "Best all-round answers, strong Bangla.",
        descriptionBn: "সবচেয়ে ভালো উত্তর, বাংলায় দক্ষ।",
        contextWindow: 262144,
        isDefault: true,
        goodFor: ["general", "bangla"],
      },
      {
        id: "nvidia/nemotron-3-nano-30b-a3b:free",
        label: "Nemotron Nano 30B",
        description: "Very fast, good for short questions.",
        descriptionBn: "খুব দ্রুত, ছোট প্রশ্নের জন্য ভালো।",
        contextWindow: 256000,
        isDefault: false,
        goodFor: ["quick"],
      },
    ],
  };
}

function mockQuota(): ChatQuota {
  const reset = new Date();
  reset.setUTCHours(18, 0, 0, 0); // 00:00 Dhaka
  return {
    limit: MOCK_CHAT_LIMIT,
    used: mockUsed,
    remaining: Math.max(0, MOCK_CHAT_LIMIT - mockUsed),
    resetsAt: reset.toISOString(),
    timezone: "Asia/Dhaka",
  };
}

const MOCK_REPLY = `## সংক্ষেপে

ফজরের নামাজ সময়মতো পড়ার **কয়েকটি ফজিলত**:

- আল্লাহর বিশেষ সুরক্ষা ও রহমত
- সারাদিনের বরকত
- ফেরেশতাদের সাক্ষ্য

> এটি সাধারণ তথ্য, ফতোয়া নয়।

\`\`\`text
Fajr → Sunrise
\`\`\`

আরও জানতে [এখানে দেখুন](https://example.com)।`;

function mockSend(
  input: { conversationId: string | null; content: string; modelId: string },
  signal?: AbortSignal
): Promise<SendMessageResult> {
  return new Promise<SendMessageResult>((resolve, reject) => {
    const abort = () => reject(new DOMException("Aborted", "AbortError"));
    if (signal?.aborted) return abort();
    signal?.addEventListener("abort", abort, { once: true });

    setTimeout(() => {
      if (signal?.aborted) return;
      // Escape hatches so every error branch is reachable without a backend.
      for (const code of [429, 503, 504, 409] as const) {
        if (input.content.includes(String(code))) {
          return reject(apiError(`Mock ${code}.`, code));
        }
      }
      if (mockUsed >= MOCK_CHAT_LIMIT) {
        return reject(apiError("You have used all 20 messages for today.", 429));
      }
      mockUsed += 1;

      const now = new Date().toISOString();
      const id = input.conversationId ?? `mock-${mockThreads.length + 1}`;
      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: input.content,
        modelId: null,
        createdAt: now,
        error: null,
      };
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: MOCK_REPLY,
        modelId: input.modelId,
        createdAt: now,
        error: null,
      };

      let thread = mockThreads.find((t) => t.id === id);
      if (!thread) {
        thread = {
          id,
          title: input.content.slice(0, 60),
          product: CHAT_PRODUCT,
          modelId: input.modelId,
          messageCount: 0,
          lastMessageAt: now,
          createdAt: now,
          messages: [],
        };
        mockThreads.unshift(thread);
      }
      thread.messages.push(userMessage, assistantMessage);
      thread.messageCount = thread.messages.length;
      thread.lastMessageAt = now;
      thread.modelId = input.modelId;

      resolve({
        conversationId: thread.id,
        title: thread.title,
        userMessage,
        assistantMessage,
        quota: {
          limit: MOCK_CHAT_LIMIT,
          used: mockUsed,
          remaining: Math.max(0, MOCK_CHAT_LIMIT - mockUsed),
        },
        disclaimer:
          "AI answers can be mistaken. This is general information, not a fatwa.",
        disclaimerBn:
          "এআই-এর উত্তরে ভুল থাকতে পারে। এটি সাধারণ তথ্য, ফতোয়া নয় — দ্বীনি বিধানের জন্য যোগ্য আলেমের পরামর্শ নিন।",
      });
    }, 1800);
  });
}

// ─── Subscription status ────────────────────────────────────────────────────
export async function getSubscriptionStatus(): Promise<{ active: boolean }> {
  if (MOCK_OTP) return { active: localStorage.getItem("hidayah_premium") === "active" };
  return request<{ active: boolean }>("/hidayah/subscription", { auth: true });
}

// ─── Cross-device sync ────────────────────────────────────────────────────────
export function syncPull(): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>("/hidayah/sync", { auth: true });
}

export function syncPush(key: string, data: unknown): Promise<null> {
  return request<null>(`/hidayah/sync/${key}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
    auth: true,
  });
}

// ─── Web Push ─────────────────────────────────────────────────────────────────
export function getVapidKey(): Promise<{ publicKey: string }> {
  return request<{ publicKey: string }>("/hidayah/push/vapid");
}

export type PushSettingsPayload = {
  enabled: boolean;
  minutesBefore: number;
  prayers: Record<string, boolean>;
  latitude: number | null;
  longitude: number | null;
  method: number;
  tzOffsetMinutes: number;
  lang: string;
};

export function pushSubscribe(
  subscription: PushSubscriptionJSON,
  settings: PushSettingsPayload
): Promise<null> {
  return request<null>("/hidayah/push/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription, settings }),
    auth: true,
  });
}

export function pushUnsubscribe(endpoint?: string): Promise<null> {
  return request<null>("/hidayah/push/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
    auth: true,
  });
}

export function pushTest(): Promise<{ sent: number }> {
  return request<{ sent: number }>("/hidayah/push/test", { method: "POST", auth: true });
}

function mockJwt(phone: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: phone, role: "user" }));
  return `${header}.${payload}.mock`;
}

export function authStateFromVerify(v: VerifyOtpResult): AuthState {
  return {
    accessToken: v.accessToken,
    refreshToken: v.refreshToken,
    phoneNumber: v.user.phoneNumber,
    userId: v.user.id,
  };
}

export function authStateFromSend(
  s: Extract<SendOtpResult, { alreadyRegistered: true }>
): AuthState {
  return {
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    phoneNumber: s.user.phoneNumber,
    userId: s.user.id,
  };
}
