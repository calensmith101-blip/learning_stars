import type { AgeBand, Topic } from "./types";

export const AGE_BANDS: AgeBand[] = ["5-6", "7-8", "9-10", "11-13"];
export const LEVELS_PER_AGE = 240;
export const STAR_EVERY_LEVELS = 3;
export const STARS_FOR_BOOST = 6;
export const BOOST_MULTIPLIER = 9;
export const BOOST_DURATION_MS = 3 * 60 * 1000;
export const XP_PER_LEVEL = 2500;

export const TOPICS: Topic[] = [
  { id: "english", label: "English", icon: "📚", curriculumArea: "English", focus: "reading, grammar, spelling, comprehension, speaking" },
  { id: "poetry", label: "Poetry", icon: "🪶", curriculumArea: "English / Literature", focus: "rhythm, rhyme, imagery, metaphor, voice" },
  { id: "maths", label: "Maths", icon: "➕", curriculumArea: "Mathematics", focus: "number, algebra, measurement, data, probability" },
  { id: "science", label: "Science", icon: "🔬", curriculumArea: "Science", focus: "biology, chemistry, physics, earth and space" },
  { id: "history", label: "History", icon: "🏺", curriculumArea: "HASS", focus: "chronology, evidence, cause and effect, continuity and change" },
  { id: "geography", label: "Geography", icon: "🗺️", curriculumArea: "HASS", focus: "place, environment, maps, climate, sustainability" },
  { id: "civics", label: "Civics", icon: "🏛️", curriculumArea: "HASS", focus: "democracy, fairness, law, community, rights and responsibilities" },
  { id: "health", label: "Health", icon: "💚", curriculumArea: "Health and Physical Education", focus: "wellbeing, relationships, safety, movement, choices" },
  { id: "digital", label: "Digital Tech", icon: "💻", curriculumArea: "Technologies", focus: "algorithms, data, systems, online safety, design" },
  { id: "arts", label: "Arts", icon: "🎨", curriculumArea: "The Arts", focus: "visual art, music, drama, dance, media arts" },
  { id: "languages", label: "Languages", icon: "🗣️", curriculumArea: "Languages", focus: "vocabulary, meaning, communication, culture" },
  { id: "financial", label: "Money Skills", icon: "💰", curriculumArea: "Mathematics / Work Studies", focus: "budgeting, saving, needs, wants, percentages" }
];

export const CURRICULUM_NOTES = [
  "Structured around Australian Curriculum Version 9 style learning areas and child year-level expectations.",
  "Maths questions follow the six Mathematics strands: Number, Algebra, Measurement, Space, Statistics and Probability.",
  "Difficulty starts very easy for the selected child age band, then rises slowly as points and topic levels increase."
];
