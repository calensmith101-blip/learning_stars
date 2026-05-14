import { STORAGE_KEY, createProfiles } from "./game";
import type { LearnerProfile } from "./types";

export type AppState = {
  profiles: LearnerProfile[];
  activeProfileId: string;
  activeTopicId: import("./types").TopicId;
};

export const getDefaultState = (): AppState => ({
  profiles: createProfiles(),
  activeProfileId: "p1",
  activeTopicId: "english"
});

const normaliseProfile = (profile: LearnerProfile): LearnerProfile => ({
  ...profile,
  recentQuestionIds: profile.recentQuestionIds ?? [],
  answeredQuestionIds: profile.answeredQuestionIds ?? []
});

export const loadState = (): AppState => {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    return { ...parsed, profiles: parsed.profiles.map(normaliseProfile) };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return getDefaultState();
  }
};

export const saveState = (state: AppState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const exportState = (state: AppState) => JSON.stringify(state, null, 2);

export const importState = (raw: string): AppState | null => {
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};
