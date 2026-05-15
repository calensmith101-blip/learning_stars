import type { AgeBand, Topic, TopicId } from "./types";

export const AGE_BANDS: AgeBand[] = ["5-6", "7-8", "9-10", "11-13", "14-17", "adult"];

export const TOPICS: Topic[] = [
  { id: "english", label: "English", icon: "📚", colour: "pink", curriculumArea: "English", focus: "reading, phonics, grammar, spelling, comprehension and language choices" },
  { id: "maths", label: "Maths", icon: "➕", colour: "blue", curriculumArea: "Mathematics", focus: "number, algebra, measurement, space, statistics and probability" },
  { id: "science", label: "Science", icon: "🔬", colour: "green", curriculumArea: "Science", focus: "living things, materials, forces, energy, Earth and space" },
  { id: "poetry", label: "Poetry", icon: "🪶", colour: "purple", curriculumArea: "English / Literature", focus: "rhyme, rhythm, imagery, voice, figurative language and mood" },
  { id: "history", label: "History", icon: "🏺", colour: "orange", curriculumArea: "HASS / History", focus: "past and present, evidence, change, continuity, cause and effect" },
  { id: "geography", label: "Geography", icon: "🗺️", colour: "teal", curriculumArea: "HASS / Geography", focus: "places, maps, environments, climate, resources and sustainability" },
  { id: "health", label: "Health", icon: "💚", colour: "lime", curriculumArea: "Health and Physical Education", focus: "safety, wellbeing, relationships, movement, food and healthy choices" },
  { id: "arts", label: "Arts", icon: "🎨", colour: "rainbow", curriculumArea: "The Arts", focus: "visual arts, music, drama, dance, media arts and responding" }
];

export const TOPIC_IDS = TOPICS.map((topic) => topic.id) as TopicId[];
export const POINTS_PER_CORRECT = 2;
export const POINTS_PER_STAR = 50;
export const STARS_PER_LEVEL = 3;
export const MAX_LEVELS_PER_AGE = 220;

export const CURRICULUM_NOTES = [
  "Questions are Australian Curriculum-inspired and organised around common school learning areas.",
  "Maths uses Number, Algebra, Measurement, Space, Statistics and Probability style practice.",
  "Difficulty starts from the learner age band, then climbs slowly as stars and levels grow."
];

export const ageLabel = (age: AgeBand) => age === "adult" ? "Adult" : `Age ${age}`;
