export type AgeBand = "5-6" | "7-8" | "9-10" | "11-13" | "14-17" | "adult";

export type TopicId =
  | "english"
  | "poetry"
  | "maths"
  | "science"
  | "history"
  | "geography"
  | "civics"
  | "health"
  | "digital"
  | "arts"
  | "languages"
  | "financial";

export type Topic = {
  id: TopicId;
  label: string;
  icon: string;
  curriculumArea: string;
  focus: string;
};

export type LearnerProfile = {
  id: string;
  name: string;
  avatar: string;
  ageBand: AgeBand;
  totalXp: number;
  stars: number;
  answered: number;
  correct: number;
  streak: number;
  boosterEndsAt: number | null;
  recentQuestionIds: string[];
  answeredQuestionIds: string[];
  topicLevel: Record<TopicId, number>;
  topicXp: Record<TopicId, number>;
  achievements: string[];
};

export type Question = {
  id: string;
  topic: TopicId;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: number;
  strand: string;
  interaction: "choose" | "fillBlank" | "wordTiles" | "numberTiles";
};

export type SessionResult = {
  correct: boolean;
  points: number;
  message: string;
};

export type Celebration =
  | {
      type: "star";
      title: string;
      subtitle: string;
    }
  | {
      type: "boost";
      title: string;
      subtitle: string;
      endsAt: number;
    };
