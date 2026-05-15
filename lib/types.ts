export type AgeBand = "5-6" | "7-8" | "9-10" | "11-13" | "14-17" | "adult";

export type TopicId = "english" | "maths" | "science" | "poetry" | "history" | "geography" | "health" | "arts";

export type Topic = {
  id: TopicId;
  label: string;
  icon: string;
  colour: string;
  curriculumArea: string;
  focus: string;
};

export type Interaction = "choose" | "fillBlank" | "wordTiles" | "numberTiles" | "trueFalse" | "sentenceOrder" | "match" | "spellingBee" | "oddOneOut";

export type Question = {
  id: string;
  key: string;
  topic: TopicId;
  prompt: string;
  options: string[];
  answerIndex: number;
  correct: string;
  explanation: string;
  difficulty: number;
  strand: string;
  interaction: Interaction;
};

export type LearnerProfile = {
  id: string;
  name: string;
  avatar: string;
  ageBand: AgeBand;
  points: number;
  stars: number;
  level: number;
  answered: number;
  correct: number;
  streak: number;
  seenQuestionKeys: string[];
  topicSeenKeys: Record<TopicId, string[]>;
  topicPoints: Record<TopicId, number>;
  topicAnswered: Record<TopicId, number>;
  topicCorrect: Record<TopicId, number>;
  quest: QuestState;
};

export type QuestState = {
  pieces: boolean[];
  currentNode: number;
  daveyUnlocked: boolean;
  daveyDefeated: boolean;
};

export type AppState = {
  profiles: LearnerProfile[];
  activeProfileId: string;
  activeTopicId: TopicId;
};

export type AnswerOutcome = {
  profile: LearnerProfile;
  correct: boolean;
  earnedPoints: number;
  starEarned: boolean;
  levelUp: boolean;
  message: string;
};
