import { router } from "expo-router";

const lastPush = new Map<string, number>();
const SAME_WINDOW_MS = 1500; // bam lap cung dich den
const GLOBAL_WINDOW_MS = 700; // bam nhanh bat ky dich den nao: chi nhan lan dau
let lastAny = 0;

// Bo qua bam lap / bam nhanh de khong bi chong nhieu man hinh
export function safePush(...args: Parameters<typeof router.push>) {
  const href = args[0];
  const key = typeof href === "string" ? href : JSON.stringify(href);
  const now = Date.now();
  if (now - lastAny < GLOBAL_WINDOW_MS) return;
  if (now - (lastPush.get(key) ?? 0) < SAME_WINDOW_MS) return;
  lastAny = now;
  lastPush.set(key, now);
  router.push(...args);
}