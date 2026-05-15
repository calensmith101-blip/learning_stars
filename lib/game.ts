import { POINTS_PER_CORRECT, POINTS_PER_STAR, STARS_PER_LEVEL, TOPIC_IDS } from "./curriculum";
import type { AnswerOutcome, LearnerProfile, Question, QuestState, TopicId } from "./types";

export const STORAGE_KEY = "family-learning-stars-v7-map-no-repeats";

const blankTopicRecord = <T,>(value: T): Record<TopicId, T> =>
  TOPIC_IDS.reduce((acc, id) => ({ ...acc, [id]: Array.isArray(value) ? [...value] : value }), {} as Record<TopicId, T>);

const defaultQuest = (): QuestState => ({ pieces: Array.from({ length: 10 }, () => false), currentNode: 0, daveyUnlocked: false, daveyDefeated: false });

export const createProfiles = (): LearnerProfile[] => [
  makeProfile("p1", "Learner 1", "⭐", "5-6"),
  makeProfile("p2", "Learner 2", "🚀", "7-8"),
  makeProfile("p3", "Learner 3", "🌈", "9-10"),
  makeProfile("p4", "Adult", "🧠", "adult")
];

export function makeProfile(id: string, name: string, avatar: string, ageBand: LearnerProfile["ageBand"]): LearnerProfile {
  return {
    id,
    name,
    avatar,
    ageBand,
    points: 0,
    stars: 0,
    level: 1,
    answered: 0,
    correct: 0,
    streak: 0,
    seenQuestionKeys: [],
    topicSeenKeys: blankTopicRecord<string[]>([]),
    topicPoints: blankTopicRecord<number>(0),
    topicAnswered: blankTopicRecord<number>(0),
    topicCorrect: blankTopicRecord<number>(0),
    quest: defaultQuest()
  };
}

const trimSeen = (keys: string[]) => Array.from(new Set(keys)).slice(-12000);

export const normaliseProfile = (profile: Partial<LearnerProfile> & { id: string }): LearnerProfile => {
  const base = makeProfile(profile.id, profile.name ?? "Learner", profile.avatar ?? "⭐", profile.ageBand ?? "5-6");
  const merged = { ...base, ...profile } as LearnerProfile;
  merged.level = Math.max(1, Math.floor((merged.stars ?? 0) / STARS_PER_LEVEL) + 1);
  merged.seenQuestionKeys = trimSeen(merged.seenQuestionKeys ?? []);
  merged.topicSeenKeys = { ...base.topicSeenKeys, ...(merged.topicSeenKeys ?? {}) };
  merged.topicPoints = { ...base.topicPoints, ...(merged.topicPoints ?? {}) };
  merged.topicAnswered = { ...base.topicAnswered, ...(merged.topicAnswered ?? {}) };
  merged.topicCorrect = { ...base.topicCorrect, ...(merged.topicCorrect ?? {}) };
  merged.quest = { ...base.quest, ...(merged.quest ?? {}) };
  if (!Array.isArray(merged.quest.pieces) || merged.quest.pieces.length !== 10) merged.quest.pieces = Array.from({ length: 10 }, (_, i) => Boolean(merged.quest.pieces?.[i]));
  return merged;
};

export const markSeen = (profile: LearnerProfile, topic: TopicId, question: Question): LearnerProfile => ({
  ...profile,
  seenQuestionKeys: trimSeen([...profile.seenQuestionKeys, question.key]),
  topicSeenKeys: { ...profile.topicSeenKeys, [topic]: trimSeen([...(profile.topicSeenKeys[topic] ?? []), question.key]) }
});

export const applyAnswer = (profile: LearnerProfile, topic: TopicId, question: Question, answerIndex: number): AnswerOutcome => {
  const isCorrect = answerIndex === question.answerIndex;
  const oldStars = profile.stars;
  const oldLevel = profile.level;
  const earnedPoints = isCorrect ? POINTS_PER_CORRECT : 0;
  const points = profile.points + earnedPoints;
  const stars = Math.floor(points / POINTS_PER_STAR);
  const level = Math.floor(stars / STARS_PER_LEVEL) + 1;
  const seen = markSeen(profile, topic, question);
  const next: LearnerProfile = {
    ...seen,
    points,
    stars,
    level,
    answered: seen.answered + 1,
    correct: seen.correct + (isCorrect ? 1 : 0),
    streak: isCorrect ? seen.streak + 1 : 0,
    topicPoints: { ...seen.topicPoints, [topic]: (seen.topicPoints[topic] ?? 0) + earnedPoints },
    topicAnswered: { ...seen.topicAnswered, [topic]: (seen.topicAnswered[topic] ?? 0) + 1 },
    topicCorrect: { ...seen.topicCorrect, [topic]: (seen.topicCorrect[topic] ?? 0) + (isCorrect ? 1 : 0) }
  };
  return {
    profile: next,
    correct: isCorrect,
    earnedPoints,
    starEarned: stars > oldStars,
    levelUp: level > oldLevel,
    message: isCorrect ? `Correct! +${earnedPoints} points` : `Good try. The answer was ${question.correct}.`
  };
};

export const progressToStar = (profile: LearnerProfile) => profile.points % POINTS_PER_STAR;
export const progressToLevelStars = (profile: LearnerProfile) => profile.stars % STARS_PER_LEVEL;
export const accuracy = (profile: LearnerProfile) => profile.answered ? Math.round((profile.correct / profile.answered) * 100) : 0;

export const completeQuestNode = (profile: LearnerProfile): LearnerProfile => {
  const nextPiece = profile.quest.pieces.findIndex((piece) => !piece);
  if (nextPiece < 0) return { ...profile, quest: { ...profile.quest, daveyUnlocked: true } };
  const pieces = [...profile.quest.pieces];
  pieces[nextPiece] = true;
  return {
    ...profile,
    quest: {
      ...profile.quest,
      pieces,
      currentNode: Math.min(9, nextPiece + 1),
      daveyUnlocked: pieces.every(Boolean),
    }
  };
};

export const defeatDavey = (profile: LearnerProfile): LearnerProfile => ({ ...profile, quest: { ...profile.quest, daveyDefeated: true } });
