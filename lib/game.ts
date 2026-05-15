import { AGE_BANDS, BOOST_DURATION_MS, BOOST_MULTIPLIER, LEVELS_PER_AGE, STAR_EVERY_LEVELS, STARS_FOR_BOOST, TOPICS, XP_PER_LEVEL } from "./curriculum";
import type { AgeBand, Celebration, LearnerProfile, Question, SessionResult, TopicId } from "./types";

export const STORAGE_KEY = "family-learning-stars-production-v3";

export const getQuestionKey = (question: Question) =>
  `${question.topic}|${question.prompt}`
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const createTopicRecord = (): Record<TopicId, number> =>
  Object.fromEntries(TOPICS.map((topic) => [topic.id, 1])) as Record<TopicId, number>;

const createTopicXpRecord = (): Record<TopicId, number> =>
  Object.fromEntries(TOPICS.map((topic) => [topic.id, 0])) as Record<TopicId, number>;

export const createProfiles = (): LearnerProfile[] => [
  { id: "p1", name: "Alex", avatar: "🦘", ageBand: "5-6", totalXp: 0, stars: 0, answered: 0, correct: 0, streak: 0, boosterEndsAt: null, recentQuestionIds: [], answeredQuestionIds: [], seenQuestionKeys: [], topicLevel: createTopicRecord(), topicXp: createTopicXpRecord(), achievements: [] },
  { id: "p2", name: "Bailey", avatar: "🌟", ageBand: "7-8", totalXp: 0, stars: 0, answered: 0, correct: 0, streak: 0, boosterEndsAt: null, recentQuestionIds: [], answeredQuestionIds: [], seenQuestionKeys: [], topicLevel: createTopicRecord(), topicXp: createTopicXpRecord(), achievements: [] },
  { id: "p3", name: "Casey", avatar: "🐨", ageBand: "9-10", totalXp: 0, stars: 0, answered: 0, correct: 0, streak: 0, boosterEndsAt: null, recentQuestionIds: [], answeredQuestionIds: [], seenQuestionKeys: [], topicLevel: createTopicRecord(), topicXp: createTopicXpRecord(), achievements: [] },
  { id: "p4", name: "Morgan", avatar: "🚀", ageBand: "11-13", totalXp: 0, stars: 0, answered: 0, correct: 0, streak: 0, boosterEndsAt: null, recentQuestionIds: [], answeredQuestionIds: [], seenQuestionKeys: [], topicLevel: createTopicRecord(), topicXp: createTopicXpRecord(), achievements: [] }
];

export const getTopicLevel = (profile: LearnerProfile, topic: TopicId) => profile.topicLevel[topic];

export const getProfileAgeIndex = (ageBand: AgeBand) => AGE_BANDS.indexOf(ageBand);

export const getBoostActive = (profile: LearnerProfile, now = Date.now()) =>
  typeof profile.boosterEndsAt === "number" && profile.boosterEndsAt > now;

export const getBoostCountdown = (profile: LearnerProfile, now = Date.now()) => {
  if (!getBoostActive(profile, now)) return "No active boost";
  const ms = (profile.boosterEndsAt ?? now) - now;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")} of x${BOOST_MULTIPLIER}`;
};

export const getAccuracy = (profile: LearnerProfile) =>
  profile.answered ? Math.round((profile.correct / profile.answered) * 100) : 0;

export const getOverallLevel = (profile: LearnerProfile) =>
  Math.min(LEVELS_PER_AGE, Math.max(1, Math.floor(profile.totalXp / XP_PER_LEVEL) + 1));

export const getOverallProgressPercent = (profile: LearnerProfile) => {
  const withinBandXp = profile.totalXp % XP_PER_LEVEL;
  return Math.max(0, Math.min(100, Math.round((withinBandXp / XP_PER_LEVEL) * 100)));
};

export const getStarsToNextBoost = (profile: LearnerProfile) => {
  const remainder = profile.stars % STARS_FOR_BOOST;
  return remainder === 0 ? STARS_FOR_BOOST : STARS_FOR_BOOST - remainder;
};

export const applyAnswer = (
  profile: LearnerProfile,
  topic: TopicId,
  question: Question,
  selectedIndex: number
): { profile: LearnerProfile; result: SessionResult; celebration: Celebration | null } => {
  const isCorrect = selectedIndex === question.answerIndex;
  const now = Date.now();
  const boostActive = getBoostActive(profile, now);
  const previousOverallLevel = getOverallLevel(profile);
  const previousTopicLevel = profile.topicLevel[topic];
  const basePoints = 12 + question.difficulty * 4 + Math.min(profile.streak, 10) * 2;
  const awardedPoints = isCorrect ? basePoints * (boostActive ? BOOST_MULTIPLIER : 1) : 0;

  const next: LearnerProfile = {
    ...profile,
    answered: profile.answered + 1,
    correct: profile.correct + (isCorrect ? 1 : 0),
    streak: isCorrect ? profile.streak + 1 : 0,
    totalXp: profile.totalXp + awardedPoints,
    topicXp: {
      ...profile.topicXp,
      [topic]: profile.topicXp[topic] + awardedPoints
    },
    recentQuestionIds: [question.id, ...(profile.recentQuestionIds ?? [])].slice(0, 20),
    answeredQuestionIds: Array.from(new Set([question.id, ...(profile.answeredQuestionIds ?? [])])).slice(0, 4000),
    seenQuestionKeys: Array.from(new Set([getQuestionKey(question), ...(profile.seenQuestionKeys ?? [])])).slice(0, 4000)
  };

  const computedTopicLevel = Math.min(
    LEVELS_PER_AGE,
    Math.max(1, Math.floor(next.topicXp[topic] / XP_PER_LEVEL) + 1)
  );
  next.topicLevel = {
    ...profile.topicLevel,
    [topic]: computedTopicLevel
  };

  const nextOverallLevel = getOverallLevel(next);
  let celebration: Celebration | null = null;

  if (nextOverallLevel > previousOverallLevel && nextOverallLevel % STAR_EVERY_LEVELS === 0) {
    next.stars += 1;
    celebration = {
      type: "star",
      title: "⭐ New Star Unlocked! ⭐",
      subtitle: `${next.name} reached level ${nextOverallLevel} and earned a celebration star.`
    };
  }

  if (next.stars > 0 && next.stars % STARS_FOR_BOOST === 0 && next.stars !== profile.stars) {
    next.boosterEndsAt = now + BOOST_DURATION_MS;
    celebration = {
      type: "boost",
      title: "🌠 9x Super Boost Activated! 🌠",
      subtitle: `${next.name} collected ${next.stars} stars. All correct answers are worth x${BOOST_MULTIPLIER} points for 3 minutes.`,
      endsAt: next.boosterEndsAt
    };
  }

  const unlockedBadge = getAchievement(next, topic, previousTopicLevel, computedTopicLevel);
  if (unlockedBadge && !next.achievements.includes(unlockedBadge)) {
    next.achievements = [...next.achievements, unlockedBadge];
  }

  return {
    profile: next,
    result: {
      correct: isCorrect,
      points: awardedPoints,
      message: isCorrect ? question.explanation : `Not quite. ${question.explanation}`
    },
    celebration
  };
};

export const markQuestionSeen = (profile: LearnerProfile, question: Question): LearnerProfile => ({
  ...profile,
  recentQuestionIds: Array.from(new Set([question.id, getQuestionKey(question), ...(profile.recentQuestionIds ?? [])])).slice(0, 80),
  seenQuestionKeys: Array.from(new Set([getQuestionKey(question), ...(profile.seenQuestionKeys ?? [])])).slice(0, 4000)
});

const getAchievement = (
  profile: LearnerProfile,
  topic: TopicId,
  previousTopicLevel: number,
  nextTopicLevel: number
): string | null => {
  if (nextTopicLevel >= 25 && previousTopicLevel < 25) return `${topic}-trailblazer`;
  if (nextTopicLevel >= 100 && previousTopicLevel < 100) return `${topic}-centurion`;
  if (profile.correct >= 50 && profile.correct - 1 < 50) return `50-correct`;
  if (profile.correct >= 250 && profile.correct - 1 < 250) return `250-correct`;
  return null;
};
