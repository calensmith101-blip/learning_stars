import { LEVELS_PER_AGE, TOPICS } from "./curriculum";
import { getOverallLevel, getProfileAgeIndex, getTopicLevel } from "./game";
import type { AgeBand, LearnerProfile, Question, TopicId } from "./types";

const randFrom = <T,>(items: T[], seed: number): T => items[Math.abs(seed) % items.length];
const numberFrom = (seed: number, min: number, max: number) => min + (Math.abs(seed) % (max - min + 1));

const ageSettings: Record<AgeBand, {
  vocab: string[];
  poems: string[];
  science: string[];
  places: string[];
  historical: string[];
  civics: string[];
  healthy: string[];
  digital: string[];
  artWords: string[];
  languageWords: Array<{ word: string; meaning: string }>;
}> = {
  "5-6": {
    vocab: ["happy", "jump", "tiny", "garden", "friend", "bright", "story", "playful"],
    poems: ["moon", "rain", "kite", "bird", "stream", "star", "tree", "shell"],
    science: ["plant", "animal", "shadow", "weather", "seed", "day", "night", "water"],
    places: ["park", "beach", "school", "river", "farm", "town", "playground", "forest"],
    historical: ["past", "older", "yesterday", "family", "photo", "memory", "then", "long ago"],
    civics: ["sharing", "turn-taking", "kindness", "rules", "helping", "safe choice", "fairness", "respect"],
    healthy: ["sleep", "fruit", "water", "helmet", "wash hands", "walk", "rest", "kind words"],
    digital: ["screen", "button", "robot", "pattern", "password", "device", "click", "safe adult"],
    artWords: ["colour", "beat", "shape", "dance", "line", "song", "pattern", "texture"],
    languageWords: [
      { word: "hola", meaning: "hello" },
      { word: "bonjour", meaning: "hello" },
      { word: "gracias", meaning: "thank you" },
      { word: "merci", meaning: "thank you" }
    ]
  },
  "7-8": {
    vocab: ["enormous", "careful", "sparkling", "compare", "predict", "gentle", "adventure", "observe"],
    poems: ["whisper", "echo", "silver", "drift", "glow", "feather", "dance", "thunder"],
    science: ["habitat", "evaporation", "force", "material", "cycle", "energy", "magnet", "orbit"],
    places: ["desert", "coast", "mountain", "suburb", "wetland", "island", "continent", "valley"],
    historical: ["timeline", "artefact", "settlement", "tradition", "explorer", "community", "generation", "record"],
    civics: ["community", "leadership", "responsibility", "citizen", "vote", "law", "respect", "inclusion"],
    healthy: ["hydration", "exercise", "sun safety", "warm-up", "balanced meal", "mindfulness", "hygiene", "posture"],
    digital: ["algorithm", "debug", "sequence", "input", "output", "data", "pixel", "private info"],
    artWords: ["rhythm", "contrast", "melody", "character", "audience", "composition", "tempo", "focus"],
    languageWords: [
      { word: "adiós", meaning: "goodbye" },
      { word: "au revoir", meaning: "goodbye" },
      { word: "rojo", meaning: "red" },
      { word: "bleu", meaning: "blue" }
    ]
  },
  "9-10": {
    vocab: ["analyse", "precise", "confident", "curious", "evidence", "perspective", "structure", "informative"],
    poems: ["metaphor", "rhythm", "imagery", "stanza", "alliteration", "voice", "tone", "symbol"],
    science: ["adaptation", "friction", "gravity", "particle", "ecosystem", "renewable", "erosion", "rotation"],
    places: ["hemisphere", "latitude", "ecosystem", "landform", "climate", "resource", "region", "catchment"],
    historical: ["colony", "migration", "federation", "ancient", "evidence", "source", "impact", "change"],
    civics: ["representation", "debate", "justice", "equality", "council", "parliament", "decision-making", "duty"],
    healthy: ["resilience", "nutrition", "safety strategy", "teamwork", "recovery", "goal-setting", "empathy", "stress"],
    digital: ["branching", "loop", "binary", "network", "cyber safety", "spreadsheet", "pattern", "prototype"],
    artWords: ["harmony", "motif", "stagecraft", "framing", "balance", "style", "gesture", "narrative"],
    languageWords: [
      { word: "libro", meaning: "book" },
      { word: "livre", meaning: "book" },
      { word: "amistad", meaning: "friendship" },
      { word: "ami", meaning: "friend" }
    ]
  },
  "11-13": {
    vocab: ["evaluate", "synthesise", "coherent", "persuasive", "interpret", "significant", "contextual", "credible"],
    poems: ["enjambment", "imagery", "connotation", "cadence", "persona", "lyric", "motif", "juxtaposition"],
    science: ["photosynthesis", "cell", "velocity", "mixture", "tectonic", "biodiversity", "circuit", "atom"],
    places: ["urbanisation", "sustainability", "biome", "water security", "distribution", "demographic", "hazard", "land use"],
    historical: ["industrialisation", "democracy", "empire", "conflict", "rights movement", "primary source", "reform", "legacy"],
    civics: ["constitution", "legislation", "media literacy", "participation", "rights", "obligation", "advocacy", "policy"],
    healthy: ["wellbeing", "identity", "respectful relationship", "first aid", "intensity", "consent", "safety plan", "resistance"],
    digital: ["decomposition", "abstraction", "encryption", "database", "automation", "user story", "iteration", "interface"],
    artWords: ["aesthetic", "improvisation", "symbolism", "dynamic", "genre", "mise-en-scène", "texture", "interpretation"],
    languageWords: [
      { word: "escuela", meaning: "school" },
      { word: "école", meaning: "school" },
      { word: "familia", meaning: "family" },
      { word: "famille", meaning: "family" }
    ]
  },
  "14-17": {
    vocab: ["nuanced", "articulate", "discern", "hypothesis", "integrity", "justify", "resilient", "insightful"],
    poems: ["caesura", "assonance", "semantic field", "symbolism", "volta", "speaker", "form", "tone"],
    science: ["genetics", "acceleration", "stoichiometry", "plate boundary", "homeostasis", "electromagnetic", "ecosystem", "reaction"],
    places: ["globalisation", "interconnection", "climate resilience", "resource allocation", "geomorphology", "migration", "inequality", "urban density"],
    historical: ["industrial revolution", "federation", "Cold War", "rights campaign", "colonisation", "national identity", "continuity", "historical argument"],
    civics: ["electoral process", "separation of powers", "accountability", "representation", "civic action", "legislature", "executive", "judiciary"],
    healthy: ["mental health", "protective factor", "risk management", "training principle", "advocacy", "wellbeing strategy", "support service", "healthy boundary"],
    digital: ["API", "data model", "Boolean", "algorithm efficiency", "cybersecurity", "version control", "UX", "testing"],
    artWords: ["composition", "satire", "counterpoint", "devising", "choreography", "subtext", "curation", "cinematography"],
    languageWords: [
      { word: "libertad", meaning: "freedom" },
      { word: "égalité", meaning: "equality" },
      { word: "cultura", meaning: "culture" },
      { word: "langue", meaning: "language" }
    ]
  },
  "adult": {
    vocab: ["evaluate", "calibrate", "communicate", "facilitate", "sophisticated", "ethical", "analytical", "adaptive"],
    poems: ["metonymy", "irony", "cadence", "symbolic register", "intertextuality", "persona", "imagistic", "lyric"],
    science: ["evidence-based", "ecosystem services", "kinetic energy", "chemical change", "genetic inheritance", "systems thinking", "climate driver", "electrical resistance"],
    places: ["demography", "sustainability", "geopolitics", "resource management", "urban planning", "water scarcity", "hazard mitigation", "spatial distribution"],
    historical: ["historical interpretation", "continuity", "contestation", "source bias", "policy reform", "industrial change", "federation", "global conflict"],
    civics: ["referendum", "democratic institution", "accountability", "public policy", "legal principle", "participation", "media influence", "civic responsibility"],
    healthy: ["preventive health", "sleep hygiene", "stress management", "movement pattern", "nutrition choice", "consent", "support network", "long-term wellbeing"],
    digital: ["data literacy", "encryption", "automation", "computational thinking", "privacy", "phishing", "structured query", "design cycle"],
    artWords: ["aesthetic intent", "motif", "context", "interpretive lens", "contrast", "gesture", "narrative frame", "resonance"],
    languageWords: [
      { word: "aprender", meaning: "to learn" },
      { word: "apprendre", meaning: "to learn" },
      { word: "comunidad", meaning: "community" },
      { word: "communauté", meaning: "community" }
    ]
  }
};

const pickWrongOptions = (correct: string, pool: string[], seed: number) => {
  const unique = Array.from(new Set(pool.filter((item) => item !== correct)));
  const options = [correct];
  let localSeed = seed;
  while (options.length < 4 && unique.length > 0) {
    const choice = unique[Math.abs(localSeed) % unique.length];
    if (!options.includes(choice)) options.push(choice);
    localSeed += 11;
  }
  return shuffle(options, seed);
};

const shuffle = <T,>(items: T[], seed: number) => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.abs(seed + i * 31) % (i + 1);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const makeQuestion = (question: Omit<Question, "answerIndex" | "interaction"> & { correct: string; interaction?: Question["interaction"] }): Question => {
  const answerIndex = question.options.findIndex((option) => option === question.correct);
  return { ...question, interaction: question.interaction ?? "choose", answerIndex };
};

const makeMathQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const isEarly = ageBand === "5-6";
  const gentleLevel = difficulty <= 2;

  if (isEarly && gentleLevel) {
    const mode = Math.abs(seed) % 6;
    const a = numberFrom(seed, 0, 6);
    const b = numberFrom(seed * 3, 0, 4);
    const total = Math.min(10, a + b);
    if (mode === 0) {
      const correct = String(a);
      const options = pickWrongOptions(correct, [String(a + 1), String(Math.max(0, a - 1)), String(a + 2), String(Math.max(0, a - 2))], seed);
      return makeQuestion({
        id: `math-count-${ageBand}-${difficulty}-${seed}`,
        topic: "maths",
        prompt: `Count the stars: ${"⭐".repeat(Math.max(1, a))}`,
        options,
        correct,
        explanation: `There are ${a} stars.`,
        difficulty,
        strand: "Number",
        interaction: "numberTiles"
      });
    }
    if (mode === 1) {
      const correct = String(total);
      const options = pickWrongOptions(correct, [String(total + 1), String(Math.max(0, total - 1)), String(total + 2), String(Math.max(0, total - 2))], seed);
      return makeQuestion({
        id: `math-easy-add-${ageBand}-${difficulty}-${seed}`,
        topic: "maths",
        prompt: `Fill the blank: ${a} + ${b} = ____`,
        options,
        correct,
        explanation: `${a} plus ${b} makes ${correct}.`,
        difficulty,
        strand: "Number",
        interaction: "fillBlank"
      });
    }
    if (mode === 2) {
      const start = numberFrom(seed, 1, 7);
      const correct = String(start + 1);
      const options = pickWrongOptions(correct, [String(start), String(start + 2), String(Math.max(0, start - 1)), String(start + 3)], seed);
      return makeQuestion({
        id: `math-next-${ageBand}-${difficulty}-${seed}`,
        topic: "maths",
        prompt: `What number comes next? ${start}, ____`,
        options,
        correct,
        explanation: `Counting on from ${start} gives ${correct}.`,
        difficulty,
        strand: "Number sequence",
        interaction: "fillBlank"
      });
    }
    if (mode === 3) {
      const shapes = ["circle", "square", "triangle", "rectangle"];
      const correct = randFrom(shapes, seed);
      const options = pickWrongOptions(correct, shapes, seed);
      return makeQuestion({
        id: `math-shape-${ageBand}-${difficulty}-${seed}`,
        topic: "maths",
        prompt: `Pick the shape word that matches this clue: it is a ${correct}.`,
        options,
        correct,
        explanation: `${correct} is a common shape name learned in early years.`,
        difficulty,
        strand: "Space",
        interaction: "wordTiles"
      });
    }
    if (mode === 4) {
      const correct = a >= b ? "more" : "less";
      const options = pickWrongOptions(correct, ["more", "less", "same", "next"], seed);
      return makeQuestion({
        id: `math-compare-${ageBand}-${difficulty}-${seed}`,
        topic: "maths",
        prompt: `Fill the blank: ${a} is ____ than ${b}.`,
        options,
        correct,
        explanation: `${a} is ${correct} than ${b}.`,
        difficulty,
        strand: "Number comparison",
        interaction: "fillBlank"
      });
    }
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday"];
    const correct = days[Math.abs(seed) % days.length];
    const options = pickWrongOptions(correct, days.concat(["Morning", "Night"]), seed);
    return makeQuestion({
      id: `math-day-${ageBand}-${difficulty}-${seed}`,
      topic: "maths",
      prompt: `Choose a day word used when learning time.`,
      options,
      correct,
      explanation: `${correct} is a day of the week.`,
      difficulty,
      strand: "Measurement",
      interaction: "wordTiles"
    });
  }

  const maxBase = ageBand === "5-6" ? 20 : ageBand === "7-8" ? 50 : ageBand === "9-10" ? 100 : ageBand === "11-13" ? 180 : 220;
  const a = numberFrom(seed, 2, maxBase);
  const b = numberFrom(seed * 3, 1, Math.max(4, Math.floor(maxBase / 2)));
  const mode = difficulty < 3 && ageBand === "5-6" ? Math.abs(seed) % 2 : Math.abs(seed) % 5;
  if (mode === 0) {
    const correct = String(a + b);
    const pool = [String(a + b + 1), String(a + b - 1), String(a + b + 2), String(a + b - 2)];
    const options = pickWrongOptions(correct, pool, seed);
    return makeQuestion({
      id: `math-add-${ageBand}-${difficulty}-${seed}`,
      topic: "maths",
      prompt: `Fill the blank: ${a} + ${b} = ____`,
      options,
      correct,
      explanation: `${a} + ${b} = ${correct}.`,
      difficulty,
      strand: "Number",
      interaction: "fillBlank"
    });
  }
  if (mode === 1) {
    const c = Math.min(a - 1, b);
    const correct = String(a - c);
    const pool = [String(a - c + 1), String(a - c - 1), String(a - c + 2), String(Math.max(0, a - c - 2))];
    const options = pickWrongOptions(correct, pool, seed);
    return makeQuestion({
      id: `math-sub-${ageBand}-${difficulty}-${seed}`,
      topic: "maths",
      prompt: `Fill the blank: ${a} - ${c} = ____`,
      options,
      correct,
      explanation: `${a} take away ${c} = ${correct}.`,
      difficulty,
      strand: "Number",
      interaction: "fillBlank"
    });
  }
  if (mode === 2) {
    const x = numberFrom(seed, 2, ageBand === "7-8" ? 5 : ageBand === "9-10" ? 10 : 12);
    const y = numberFrom(seed * 5, 2, ageBand === "7-8" ? 5 : ageBand === "9-10" ? 10 : 12);
    const correct = String(x * y);
    const pool = [String(x * y + x), String(Math.max(0, x * y - y)), String(x * y + y), String(x + y)];
    const options = pickWrongOptions(correct, pool, seed);
    return makeQuestion({
      id: `math-mul-${ageBand}-${difficulty}-${seed}`,
      topic: "maths",
      prompt: `Pick the tile to complete: ${x} groups of ${y} = ____`,
      options,
      correct,
      explanation: `${x} groups of ${y} = ${correct}.`,
      difficulty,
      strand: "Multiplication",
      interaction: "numberTiles"
    });
  }
  if (mode === 3) {
    const parts = ageBand === "7-8" ? [2, 5] : [2, 4, 5, 10];
    const part = parts[Math.abs(seed) % parts.length];
    const correctNum = numberFrom(seed * 7, 2, ageBand === "7-8" ? 10 : 15);
    const total = correctNum * part;
    const correct = String(correctNum);
    const pool = [String(correctNum + 1), String(Math.max(1, correctNum - 1)), String(total), String(part)];
    const options = pickWrongOptions(correct, pool, seed);
    return makeQuestion({
      id: `math-div-${ageBand}-${difficulty}-${seed}`,
      topic: "maths",
      prompt: `${total} shared into ${part} equal groups gives ____ in each group.`,
      options,
      correct,
      explanation: `${total} ÷ ${part} = ${correct}.`,
      difficulty,
      strand: "Division",
      interaction: "fillBlank"
    });
  }
  const coins = [5, 10, 20, 50, 100, 200];
  const correct = `$${(coins[Math.abs(seed) % coins.length] / 100).toFixed(2)}`;
  const options = pickWrongOptions(correct, ["$0.05", "$0.10", "$0.20", "$0.50", "$1.00", "$2.00"], seed);
  return makeQuestion({
    id: `math-money-${ageBand}-${difficulty}-${seed}`,
    topic: "maths",
    prompt: `Pick the money tile: ${correct}`,
    options,
    correct,
    explanation: `Recognising Australian coins and dollars is part of money maths.`,
    difficulty,
    strand: "Money and financial mathematics",
    interaction: "numberTiles"
  });
};

const makeEnglishQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.vocab[Math.abs(seed) % bag.vocab.length];
  const mode = Math.abs(seed) % 4;
  if (mode === 0) {
    const sentence = `The ${word} puppy ran to the gate.`;
    const correct = word;
    const options = pickWrongOptions(correct, bag.vocab, seed);
    return makeQuestion({
      id: `eng-adj-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Which describing word appears in this sentence? "${sentence}"`,
      options,
      correct,
      explanation: `"${word}" describes the puppy.`,
      difficulty,
      strand: "Grammar"
    });
  }
  if (mode === 1) {
    const correct = word.toUpperCase();
    const options = pickWrongOptions(correct, [word, word.slice(0, 1).toUpperCase() + word.slice(1), word + "s", word + "ed"], seed);
    return makeQuestion({
      id: `eng-case-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Choose the version written in ALL CAPITAL letters.`,
      options,
      correct,
      explanation: `${correct} is written in capitals.`,
      difficulty,
      strand: "Conventions"
    });
  }
  if (mode === 2) {
    const correct = `The ${word} koala slept.`;
    const pool = [
      `the ${word} koala slept`,
      `The ${word} koala slept`,
      `The ${word} koala slept!`,
      `The koala ${word} slept.`
    ];
    const options = pickWrongOptions(correct, pool, seed);
    return makeQuestion({
      id: `eng-punct-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Which sentence has a capital letter and full stop?`,
      options,
      correct,
      explanation: `A sentence starts with a capital and ends with a full stop.`,
      difficulty,
      strand: "Punctuation"
    });
  }
  const correct = `A word that means ${word}`;
  const options = pickWrongOptions(correct, [
    `A word that means ${word}`,
    `A question about ${word}`,
    `A sound with ${word}`,
    `A number called ${word}`
  ], seed);
  return makeQuestion({
    id: `eng-vocab-${ageBand}-${difficulty}-${seed}`,
    topic: "english",
    prompt: `What is vocabulary?`,
    options,
    correct,
    explanation: `Vocabulary is about words and their meanings.`,
    difficulty,
    strand: "Vocabulary"
  });
};

const makePoetryQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const a = bag.poems[Math.abs(seed) % bag.poems.length];
  const b = bag.poems[(Math.abs(seed) + 2) % bag.poems.length];
  const mode = Math.abs(seed) % 4;
  if (mode === 0) {
    const correct = `${a} and ${b}`;
    const options = pickWrongOptions(correct, [`${a} and rock`, `${b} and chair`, `${a} and paper`, `${b} and table`], seed);
    return makeQuestion({
      id: `poem-image-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `Which pair of words creates the strongest image for a poem?`,
      options,
      correct,
      explanation: `Poetry often uses vivid image words like ${a} and ${b}.`,
      difficulty,
      strand: "Imagery"
    });
  }
  if (mode === 1) {
    const correct = "Words with the same ending sound";
    const options = pickWrongOptions(correct, [
      "Words with the same ending sound",
      "Words that are the same length",
      "Words that are shouted",
      "Words with numbers in them"
    ], seed);
    return makeQuestion({
      id: `poem-rhyme-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `What does rhyme mean?`,
      options,
      correct,
      explanation: `Rhyme means words have matching or similar ending sounds.`,
      difficulty,
      strand: "Rhyme"
    });
  }
  if (mode === 2) {
    const correct = "A line that repeats on purpose";
    const options = pickWrongOptions(correct, [
      "A line that repeats on purpose",
      "A random typing error",
      "A line with no meaning",
      "A maths rule"
    ], seed);
    return makeQuestion({
      id: `poem-repeat-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `What can repetition do in a poem?`,
      options,
      correct,
      explanation: `Repetition can build rhythm and emphasis.`,
      difficulty,
      strand: "Structure"
    });
  }
  const correct = `${a} ${b} shimmered softly`;
  const options = pickWrongOptions(correct, [`chair road went`, `${a} box noisy`, `run ${b} hard`, `${a} ${b} shimmered softly`], seed);
  return makeQuestion({
    id: `poem-bestline-${ageBand}-${difficulty}-${seed}`,
    topic: "poetry",
    prompt: `Which line sounds most poetic?`,
    options,
    correct,
    explanation: `The best poetic line uses sound and imagery.`,
    difficulty,
    strand: "Voice"
  });
};

const makeScienceQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const concept = bag.science[Math.abs(seed) % bag.science.length];
  const mode = Math.abs(seed) % 4;
  if (mode === 0) {
    const correct = "Observe, predict, test, explain";
    const options = pickWrongOptions(correct, [
      "Observe, predict, test, explain",
      "Guess, forget, skip, finish",
      "Hide, shout, rush, stop",
      "Paint, count, jump, laugh"
    ], seed);
    return makeQuestion({
      id: `sci-inquiry-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Which sequence sounds most like a science investigation?`,
      options,
      correct,
      explanation: `Science uses observation, prediction, testing and explanation.`,
      difficulty,
      strand: "Science Inquiry"
    });
  }
  if (mode === 1) {
    const correct = concept;
    const options = pickWrongOptions(correct, bag.science, seed);
    return makeQuestion({
      id: `sci-concept-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Choose the science word.`,
      options,
      correct,
      explanation: `${concept} is a science concept.`,
      difficulty,
      strand: "Vocabulary"
    });
  }
  if (mode === 2) {
    const correct = "A fair test changes one thing at a time";
    const options = pickWrongOptions(correct, [
      "A fair test changes one thing at a time",
      "A fair test changes everything at once",
      "A fair test never measures anything",
      "A fair test skips the results"
    ], seed);
    return makeQuestion({
      id: `sci-fairtest-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Which statement about a fair test is correct?`,
      options,
      correct,
      explanation: `Fair tests keep most things the same and change one variable.`,
      difficulty,
      strand: "Investigation"
    });
  }
  const correct = "Living things need suitable conditions to survive";
  const options = pickWrongOptions(correct, [
    "Living things need suitable conditions to survive",
    "Plants grow without light, water or air",
    "Animals never adapt to habitats",
    "Weather has no effect on ecosystems"
  ], seed);
  return makeQuestion({
    id: `sci-life-${ageBand}-${difficulty}-${seed}`,
    topic: "science",
    prompt: `Which statement is scientifically accurate?`,
    options,
    correct,
    explanation: `Living things need conditions that support survival and growth.`,
    difficulty,
    strand: "Life Science"
  });
};

const makeHistoryQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const item = bag.historical[Math.abs(seed) % bag.historical.length];
  const correct = "A timeline helps place events in order";
  const mode = Math.abs(seed) % 3;
  if (mode === 0) {
    const options = pickWrongOptions(correct, [
      "A timeline helps place events in order",
      "A timeline measures rainfall",
      "A timeline is a type of sandwich",
      "A timeline is only for future plans"
    ], seed);
    return makeQuestion({
      id: `hist-time-${ageBand}-${difficulty}-${seed}`,
      topic: "history",
      prompt: `Why do historians use timelines?`,
      options,
      correct,
      explanation: `Timelines show sequence and help explain change over time.`,
      difficulty,
      strand: "Chronology"
    });
  }
  if (mode === 1) {
    const correctItem = item;
    const options = pickWrongOptions(correctItem, bag.historical, seed);
    return makeQuestion({
      id: `hist-word-${ageBand}-${difficulty}-${seed}`,
      topic: "history",
      prompt: `Which word belongs to history learning?`,
      options,
      correct: correctItem,
      explanation: `${correctItem} is commonly used in history learning.`,
      difficulty,
      strand: "Vocabulary"
    });
  }
  const options = pickWrongOptions("An artefact can be evidence from the past", [
    "An artefact can be evidence from the past",
    "An artefact is always imaginary",
    "History never uses sources",
    "Old objects cannot tell us anything"
  ], seed);
  return makeQuestion({
    id: `hist-source-${ageBand}-${difficulty}-${seed}`,
    topic: "history",
    prompt: `Which statement about historical evidence is true?`,
    options,
    correct: "An artefact can be evidence from the past",
    explanation: `Objects, records and stories can all provide evidence.`,
    difficulty,
    strand: "Historical Sources"
  });
};

const makeGeographyQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const place = bag.places[Math.abs(seed) % bag.places.length];
  const mode = Math.abs(seed) % 3;
  if (mode === 0) {
    const correct = "Maps help us locate and describe places";
    const options = pickWrongOptions(correct, [
      "Maps help us locate and describe places",
      "Maps are only for drawing cartoons",
      "Maps cannot show direction",
      "Maps are the same as stories"
    ], seed);
    return makeQuestion({
      id: `geo-map-${ageBand}-${difficulty}-${seed}`,
      topic: "geography",
      prompt: `What is one main use of a map?`,
      options,
      correct,
      explanation: `Maps help us locate, compare and describe places.`,
      difficulty,
      strand: "Maps"
    });
  }
  if (mode === 1) {
    const correct = place;
    const options = pickWrongOptions(correct, bag.places, seed);
    return makeQuestion({
      id: `geo-place-${ageBand}-${difficulty}-${seed}`,
      topic: "geography",
      prompt: `Choose a geography place word.`,
      options,
      correct,
      explanation: `${place} is a place or environment word.`,
      difficulty,
      strand: "Place"
    });
  }
  const correct = "Sustainability means caring for resources now and in the future";
  const options = pickWrongOptions(correct, [
    "Sustainability means caring for resources now and in the future",
    "Sustainability means wasting all resources quickly",
    "Sustainability means maps are no longer needed",
    "Sustainability only matters at school"
  ], seed);
  return makeQuestion({
    id: `geo-sustain-${ageBand}-${difficulty}-${seed}`,
    topic: "geography",
    prompt: `Which statement best explains sustainability?`,
    options,
    correct,
    explanation: `Sustainability is about long-term care for environments and resources.`,
    difficulty,
    strand: "Environment"
  });
};

const makeCivicsQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.civics[Math.abs(seed) % bag.civics.length];
  const mode = Math.abs(seed) % 3;
  if (mode === 0) {
    const correct = "Rules can help people stay safe and treated fairly";
    const options = pickWrongOptions(correct, [
      "Rules can help people stay safe and treated fairly",
      "Rules are only for games and never communities",
      "Rules mean one person gets everything",
      "Rules stop people from helping each other"
    ], seed);
    return makeQuestion({
      id: `civ-rules-${ageBand}-${difficulty}-${seed}`,
      topic: "civics",
      prompt: `Why do communities use rules and laws?`,
      options,
      correct,
      explanation: `Rules and laws support safety, order and fairness.`,
      difficulty,
      strand: "Citizenship"
    });
  }
  if (mode === 1) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.civics, seed);
    return makeQuestion({
      id: `civ-word-${ageBand}-${difficulty}-${seed}`,
      topic: "civics",
      prompt: `Choose the civics word.`,
      options,
      correct,
      explanation: `${word} belongs to civics and citizenship.`,
      difficulty,
      strand: "Vocabulary"
    });
  }
  const correct = "Listening respectfully helps group decisions";
  const options = pickWrongOptions(correct, [
    "Listening respectfully helps group decisions",
    "Group decisions work best when only one person speaks",
    "Citizenship never involves responsibility",
    "Fairness means ignoring other views"
  ], seed);
  return makeQuestion({
    id: `civ-participation-${ageBand}-${difficulty}-${seed}`,
    topic: "civics",
    prompt: `Which behaviour supports democratic participation?`,
    options,
    correct,
    explanation: `Respectful listening supports good participation and decision-making.`,
    difficulty,
    strand: "Participation"
  });
};

const makeHealthQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.healthy[Math.abs(seed) % bag.healthy.length];
  const mode = Math.abs(seed) % 3;
  if (mode === 0) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.healthy, seed);
    return makeQuestion({
      id: `health-word-${ageBand}-${difficulty}-${seed}`,
      topic: "health",
      prompt: `Choose the healthy habit or wellbeing word.`,
      options,
      correct,
      explanation: `${word} is linked to healthy choices or wellbeing.`,
      difficulty,
      strand: "Wellbeing"
    });
  }
  if (mode === 1) {
    const correct = "Asking a trusted adult for help is a safe choice";
    const options = pickWrongOptions(correct, [
      "Asking a trusted adult for help is a safe choice",
      "Keeping every worry secret is always best",
      "Safety gear is not needed on bikes",
      "Rest does not matter for health"
    ], seed);
    return makeQuestion({
      id: `health-safe-${ageBand}-${difficulty}-${seed}`,
      topic: "health",
      prompt: `Which option is the safest choice?`,
      options,
      correct,
      explanation: `Trusted adults and safe choices protect wellbeing.`,
      difficulty,
      strand: "Safety"
    });
  }
  const correct = "Healthy routines can support body and mind";
  const options = pickWrongOptions(correct, [
    "Healthy routines can support body and mind",
    "Sleep only matters for sport",
    "Emotions never affect health",
    "Water is less useful than soft drink"
  ], seed);
  return makeQuestion({
    id: `health-routine-${ageBand}-${difficulty}-${seed}`,
    topic: "health",
    prompt: `Which statement is true about healthy routines?`,
    options,
    correct,
    explanation: `Healthy routines support energy, focus and wellbeing.`,
    difficulty,
    strand: "Healthy Choices"
  });
};

const makeDigitalQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.digital[Math.abs(seed) % bag.digital.length];
  const mode = Math.abs(seed) % 4;
  if (mode === 0) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.digital, seed);
    return makeQuestion({
      id: `dig-word-${ageBand}-${difficulty}-${seed}`,
      topic: "digital",
      prompt: `Choose the digital technologies word.`,
      options,
      correct,
      explanation: `${word} belongs to digital technologies learning.`,
      difficulty,
      strand: "Vocabulary"
    });
  }
  if (mode === 1) {
    const correct = "An algorithm is a set of steps to solve a problem";
    const options = pickWrongOptions(correct, [
      "An algorithm is a set of steps to solve a problem",
      "An algorithm is a random guess",
      "An algorithm is only a computer screen",
      "An algorithm means deleting every file"
    ], seed);
    return makeQuestion({
      id: `dig-algo-${ageBand}-${difficulty}-${seed}`,
      topic: "digital",
      prompt: `Which statement best describes an algorithm?`,
      options,
      correct,
      explanation: `Algorithms are ordered instructions.`,
      difficulty,
      strand: "Algorithms"
    });
  }
  if (mode === 2) {
    const correct = "Strong passwords and not sharing private details";
    const options = pickWrongOptions(correct, [
      "Strong passwords and not sharing private details",
      "Posting all personal details publicly",
      "Using the same easy password everywhere",
      "Clicking unknown links for fun"
    ], seed);
    return makeQuestion({
      id: `dig-safe-${ageBand}-${difficulty}-${seed}`,
      topic: "digital",
      prompt: `Which option is best for online safety?`,
      options,
      correct,
      explanation: `Safe online habits protect privacy and security.`,
      difficulty,
      strand: "Digital Safety"
    });
  }
  const binary = (numberFrom(seed, 2, 12)).toString(2);
  const correct = binary;
  const options = pickWrongOptions(correct, [String(parseInt(binary, 2)), binary + "1", binary.slice(0, -1) || "0", "101010"], seed);
  return makeQuestion({
    id: `dig-binary-${ageBand}-${difficulty}-${seed}`,
    topic: "digital",
    prompt: `Which option looks like a binary number?`,
    options,
    correct,
    explanation: `Binary uses only 0s and 1s.`,
    difficulty,
    strand: "Data"
  });
};

const makeArtsQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.artWords[Math.abs(seed) % bag.artWords.length];
  const mode = Math.abs(seed) % 3;
  if (mode === 0) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.artWords, seed);
    return makeQuestion({
      id: `arts-word-${ageBand}-${difficulty}-${seed}`,
      topic: "arts",
      prompt: `Choose the arts word.`,
      options,
      correct,
      explanation: `${word} is used in arts learning.`,
      difficulty,
      strand: "Arts Vocabulary"
    });
  }
  if (mode === 1) {
    const correct = "Artists make choices to create meaning";
    const options = pickWrongOptions(correct, [
      "Artists make choices to create meaning",
      "Art has only one correct answer",
      "Music and drama are not arts",
      "Colour never changes mood"
    ], seed);
    return makeQuestion({
      id: `arts-meaning-${ageBand}-${difficulty}-${seed}`,
      topic: "arts",
      prompt: `Which statement best matches arts learning?`,
      options,
      correct,
      explanation: `Artists use elements and choices to communicate ideas.`,
      difficulty,
      strand: "Responding"
    });
  }
  const correct = "Audience means the people watching, hearing or viewing a work";
  const options = pickWrongOptions(correct, [
    "Audience means the people watching, hearing or viewing a work",
    "Audience means only the painter",
    "Audience is another word for homework",
    "Audience means the backstage floor"
  ], seed);
  return makeQuestion({
    id: `arts-audience-${ageBand}-${difficulty}-${seed}`,
    topic: "arts",
    prompt: `What does audience mean in the arts?`,
    options,
    correct,
    explanation: `An audience receives and responds to artworks or performances.`,
    difficulty,
    strand: "Responding"
  });
};

const makeLanguagesQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const item = bag.languageWords[Math.abs(seed) % bag.languageWords.length];
  const correct = item.meaning;
  const options = pickWrongOptions(correct, bag.languageWords.map((entry) => entry.meaning).concat(["tree", "house", "river"]), seed);
  return makeQuestion({
    id: `lang-basic-${ageBand}-${difficulty}-${seed}`,
    topic: "languages",
    prompt: `What does "${item.word}" most likely mean?`,
    options,
    correct,
    explanation: `"${item.word}" means "${item.meaning}" in this mini vocabulary set.`,
    difficulty,
    strand: "Intercultural Communication"
  });
};

const makeFinancialQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const dollars = numberFrom(seed, 4, ageBand === "5-6" ? 30 : 120);
  const spend = numberFrom(seed * 13, 1, Math.max(2, Math.floor(dollars / 2)));
  const save = dollars - spend;
  const mode = Math.abs(seed) % 3;
  if (mode === 0) {
    const correct = String(save);
    const options = pickWrongOptions(correct, [String(save + 1), String(Math.max(0, save - 1)), String(dollars + spend), String(spend)], seed);
    return makeQuestion({
      id: `fin-save-${ageBand}-${difficulty}-${seed}`,
      topic: "financial",
      prompt: `You have $${dollars}. You spend $${spend}. How much is left?`,
      options,
      correct,
      explanation: `$${dollars} - $${spend} = $${save}.`,
      difficulty,
      strand: "Budgeting"
    });
  }
  if (mode === 1) {
    const correct = "Needs are things important for living and wellbeing";
    const options = pickWrongOptions(correct, [
      "Needs are things important for living and wellbeing",
      "Needs are always the fanciest items",
      "Needs and wants are exactly the same",
      "Needs never include food or shelter"
    ], seed);
    return makeQuestion({
      id: `fin-needs-${ageBand}-${difficulty}-${seed}`,
      topic: "financial",
      prompt: `Which statement best explains needs?`,
      options,
      correct,
      explanation: `Needs are essentials, while wants are extras.`,
      difficulty,
      strand: "Consumer Choices"
    });
  }
  const original = numberFrom(seed, 10, 80);
  const discount = 10;
  const correct = String(original - Math.floor(original * discount / 100));
  const options = pickWrongOptions(correct, [String(original), String(original - 10), String(original + 10), String(Math.floor(original * discount / 100))], seed);
  return makeQuestion({
    id: `fin-discount-${ageBand}-${difficulty}-${seed}`,
    topic: "financial",
    prompt: `An item costs $${original} and is 10% off. Which option is the sale price?`,
    options,
    correct,
    explanation: `10% off means subtract one-tenth of the original price.`,
    difficulty,
    strand: "Percentages"
  });
};

const generators: Record<TopicId, (ageBand: AgeBand, difficulty: number, seed: number) => Question> = {
  english: makeEnglishQuestion,
  poetry: makePoetryQuestion,
  maths: makeMathQuestion,
  science: makeScienceQuestion,
  history: makeHistoryQuestion,
  geography: makeGeographyQuestion,
  civics: makeCivicsQuestion,
  health: makeHealthQuestion,
  digital: makeDigitalQuestion,
  arts: makeArtsQuestion,
  languages: makeLanguagesQuestion,
  financial: makeFinancialQuestion
};

export const buildQuestion = (profile: LearnerProfile, topic: TopicId): Question => {
  const ageBand = profile.ageBand;
  const ageStart = ageBand === "5-6" ? 0 : ageBand === "7-8" ? 1 : ageBand === "9-10" ? 2 : 3;
  const difficulty = Math.min(8, Math.max(1, ageStart + Math.ceil(getTopicLevel(profile, topic) / 40)));
  const baseSeed = (getProfileAgeIndex(ageBand) + 1) * 1000 + getOverallLevel(profile) * 37 + getTopicLevel(profile, topic) * 71 + profile.answered * 19;
  const generator = generators[topic];
  const attempts = Array.from({ length: 220 }, (_, index) => generator(ageBand, difficulty, baseSeed + index * 101));
  const answered = profile.answeredQuestionIds ?? [];
  const recent = profile.recentQuestionIds ?? [];
  const neverAnswered = attempts.find((question) => !answered.includes(question.id) && !recent.includes(question.id));
  const notRecent = attempts.find((question) => !recent.includes(question.id));
  return neverAnswered ?? notRecent ?? attempts[0];
};

export const estimateQuestionCount = () => {
  const ageBands = Object.keys(ageSettings) as AgeBand[];
  return ageBands.length * TOPICS.length * LEVELS_PER_AGE * 220;
};
