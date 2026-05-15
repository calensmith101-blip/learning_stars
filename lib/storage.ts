import { createProfiles, normaliseProfile, STORAGE_KEY } from "./game";
import type { AppState } from "./types";
export type { AppState } from "./types";

export const getDefaultState = (): AppState => ({ profiles: createProfiles(), activeProfileId: "p1", activeTopicId: "english" });

export const loadState = (): AppState => {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...getDefaultState(),
      ...parsed,
      profiles: (parsed.profiles ?? []).map((p) => normaliseProfile(p as any))
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return getDefaultState();
  }
};

export const saveState = (state: AppState) => {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const exportState = (state: AppState) => JSON.stringify(state, null, 2);
export const importState = (raw: string): AppState | null => {
  try {
    const parsed = JSON.parse(raw) as AppState;
    return { ...getDefaultState(), ...parsed, profiles: parsed.profiles.map((p) => normaliseProfile(p as any)) };
  } catch {
    return null;
  }
};
