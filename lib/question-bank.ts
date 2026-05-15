import { LEVELS_PER_AGE, TOPICS } from "./curriculum";
import { getOverallLevel, getProfileAgeIndex, getTopicLevel, getQuestionKey } from "./game";
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
  const isEarly = ageBand === "5-6";
  const word = bag.vocab[Math.abs(seed) % bag.vocab.length];
  const easyNouns = ["dog", "cat", "bird", "fish", "book", "ball", "hat", "cake", "bus", "tree"];
  const easyVerbs = ["run", "jump", "play", "read", "look", "sing", "clap", "sit", "hop", "draw"];
  const easyAdjectives = ["big", "red", "hot", "wet", "soft", "fast", "little", "happy", "blue", "kind"];
  const noun = randFrom(easyNouns, seed + 5);
  const verb = randFrom(easyVerbs, seed + 9);
  const adjective = randFrom(easyAdjectives, seed + 13);
  const mode = isEarly && difficulty <= 2 ? Math.abs(seed) % 8 : Math.abs(seed) % 10;

  if (mode === 0) {
    const correct = noun;
    const options = pickWrongOptions(correct, easyNouns, seed);
    return makeQuestion({
      id: `eng-blank-noun-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Fill the blank: I can see a ____.` ,
      options,
      correct,
      explanation: `The word ${correct} is a naming word that can complete the sentence.`,
      difficulty,
      strand: "Sentence building",
      interaction: "fillBlank"
    });
  }
  if (mode === 1) {
    const correct = verb;
    const options = pickWrongOptions(correct, easyVerbs, seed);
    return makeQuestion({
      id: `eng-action-blank-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Finish the sentence: We like to ____ at school.`,
      options,
      correct,
      explanation: `${correct} is an action word, so it makes sense in the sentence.`,
      difficulty,
      strand: "Verbs",
      interaction: "fillBlank"
    });
  }
  if (mode === 2) {
    const correct = adjective;
    const options = pickWrongOptions(correct, easyAdjectives, seed);
    return makeQuestion({
      id: `eng-describe-blank-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Pick the describing word: The ____ star shines.`,
      options,
      correct,
      explanation: `${correct} can describe the star.`,
      difficulty,
      strand: "Adjectives",
      interaction: "wordTiles"
    });
  }
  if (mode === 3) {
    const correct = `The ${noun} can ${verb}.`;
    const pool = [`the ${noun} can ${verb}.`, `The ${noun} can ${verb}`, `The ${noun} can ${verb}.`, `${noun} the can ${verb}.`];
    const options = pickWrongOptions(correct, pool, seed);
    return makeQuestion({
      id: `eng-capital-stop-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Choose the sentence with a capital letter and full stop.`,
      options,
      correct,
      explanation: `A sentence starts with a capital letter and ends with a full stop.`,
      difficulty,
      strand: "Punctuation",
      interaction: "choose"
    });
  }
  if (mode === 4) {
    const correct = `${adjective} ${noun}`;
    const options = pickWrongOptions(correct, [`${noun} ${adjective}`, `${verb} ${noun}`, `${adjective} ${verb}`, `${adjective} ${noun}`], seed);
    return makeQuestion({
      id: `eng-build-phrase-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Make a tiny phrase that sounds right.`,
      options,
      correct,
      explanation: `${adjective} ${noun} works because the describing word comes before the naming word.`,
      difficulty,
      strand: "Grammar",
      interaction: "sentenceOrder"
    });
  }
  if (mode === 5) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.vocab, seed);
    return makeQuestion({
      id: `eng-vocab-tile-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Tap the word tile that is a real vocabulary word for this level.`,
      options,
      correct,
      explanation: `${correct} is a word for this age band.`,
      difficulty,
      strand: "Vocabulary",
      interaction: "wordTiles"
    });
  }
  if (mode === 6) {
    const correct = word.toUpperCase();
    const options = pickWrongOptions(correct, [word, word.slice(0, 1).toUpperCase() + word.slice(1), word + "s", word.toUpperCase()], seed);
    return makeQuestion({
      id: `eng-caps-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Which tile shows ${word} in ALL CAPITAL letters?`,
      options,
      correct,
      explanation: `${correct} is written in capital letters.`,
      difficulty,
      strand: "Conventions",
      interaction: "wordTiles"
    });
  }
  if (mode === 7) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({
      id: `eng-true-sentence-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `True or false: A sentence can tell a complete idea.`,
      options,
      correct,
      explanation: `A sentence usually tells a complete idea.`,
      difficulty,
      strand: "Sentence meaning",
      interaction: "trueFalse"
    });
  }
  if (mode === 8) {
    const correct = `because`;
    const options = pickWrongOptions(correct, ["because", "but", "and", "so"], seed);
    return makeQuestion({
      id: `eng-connective-${ageBand}-${difficulty}-${seed}`,
      topic: "english",
      prompt: `Choose the best connecting word: I wore a hat ____ it was sunny.`,
      options,
      correct,
      explanation: `Because gives a reason.`,
      difficulty,
      strand: "Text cohesion",
      interaction: "fillBlank"
    });
  }
  const correct = "A word that means something";
  const options = pickWrongOptions(correct, [
    "A word that means something",
    "A number sentence",
    "A type of map",
    "A science test"
  ], seed);
  return makeQuestion({
    id: `eng-vocab-meaning-${ageBand}-${difficulty}-${seed}`,
    topic: "english",
    prompt: `What is vocabulary?`,
    options,
    correct,
    explanation: `Vocabulary is about words and meanings.`,
    difficulty,
    strand: "Vocabulary",
    interaction: "choose"
  });
};

const makePoetryQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const a = bag.poems[Math.abs(seed) % bag.poems.length];
  const b = bag.poems[(Math.abs(seed) + 2) % bag.poems.length];
  const easyRhymes = [
    { word: "cat", rhyme: "hat" },
    { word: "sun", rhyme: "fun" },
    { word: "star", rhyme: "car" },
    { word: "bee", rhyme: "tree" },
    { word: "cake", rhyme: "lake" },
    { word: "boat", rhyme: "goat" }
  ];
  const pair = randFrom(easyRhymes, seed);
  const mode = Math.abs(seed) % 7;
  if (mode === 0) {
    const correct = pair.rhyme;
    const options = pickWrongOptions(correct, easyRhymes.map((item) => item.rhyme).concat(["dog", "fish"]), seed);
    return makeQuestion({
      id: `poem-rhyme-tile-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `Pick the word that rhymes with ${pair.word}.`,
      options,
      correct,
      explanation: `${pair.word} and ${correct} have a matching ending sound.`,
      difficulty,
      strand: "Rhyme",
      interaction: "wordTiles"
    });
  }
  if (mode === 1) {
    const correct = `${a} and ${b}`;
    const options = pickWrongOptions(correct, [`${a} and rock`, `${b} and chair`, `${a} and paper`, `${a} and ${b}`], seed);
    return makeQuestion({
      id: `poem-image-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `Which pair of words creates a picture in your mind?`,
      options,
      correct,
      explanation: `Poetry often uses image words like ${a} and ${b}.`,
      difficulty,
      strand: "Imagery",
      interaction: "choose"
    });
  }
  if (mode === 2) {
    const correct = "Words with the same ending sound";
    const options = pickWrongOptions(correct, ["Words with the same ending sound", "Words that are the same length", "Words that are shouted", "Words with numbers in them"], seed);
    return makeQuestion({
      id: `poem-rhyme-meaning-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `What does rhyme mean?`,
      options,
      correct,
      explanation: `Rhyme means words have matching or similar ending sounds.`,
      difficulty,
      strand: "Rhyme",
      interaction: "choose"
    });
  }
  if (mode === 3) {
    const correct = "softly";
    const options = pickWrongOptions(correct, ["softly", "brick", "table", "seven"], seed);
    return makeQuestion({
      id: `poem-line-blank-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `Fill the poem line: The moon shines ____ at night.`,
      options,
      correct,
      explanation: `Softly gives the line a gentle poetic feeling.`,
      difficulty,
      strand: "Word choice",
      interaction: "fillBlank"
    });
  }
  if (mode === 4) {
    const correct = "clap, clap, clap";
    const options = pickWrongOptions(correct, ["clap, clap, clap", "chair, fish, shoe", "maths, map, milk", "blue, seven, jump"], seed);
    return makeQuestion({
      id: `poem-rhythm-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `Which tile has a repeating beat?`,
      options,
      correct,
      explanation: `Repeated words can make rhythm.`,
      difficulty,
      strand: "Rhythm",
      interaction: "wordTiles"
    });
  }
  if (mode === 5) {
    const correct = "A line that repeats on purpose";
    const options = pickWrongOptions(correct, ["A line that repeats on purpose", "A random typing error", "A line with no meaning", "A maths rule"], seed);
    return makeQuestion({
      id: `poem-repeat-${ageBand}-${difficulty}-${seed}`,
      topic: "poetry",
      prompt: `What can repetition do in a poem?`,
      options,
      correct,
      explanation: `Repetition can build rhythm and emphasis.`,
      difficulty,
      strand: "Structure",
      interaction: "choose"
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
    strand: "Voice",
    interaction: "choose"
  });
};

const makeScienceQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const concept = bag.science[Math.abs(seed) % bag.science.length];
  const isEarly = ageBand === "5-6";
  const mode = Math.abs(seed) % 7;
  if (mode === 0) {
    const correct = isEarly ? "look" : "observe";
    const options = pickWrongOptions(correct, isEarly ? ["look", "sleep", "hide", "forget"] : ["observe", "ignore", "hide", "guess only"], seed);
    return makeQuestion({
      id: `sci-observe-blank-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: isEarly ? `Fill the blank: Scientists ____ carefully.` : `Fill the blank: Scientists ____ carefully before explaining.`,
      options,
      correct,
      explanation: `Science starts with careful looking and observing.`,
      difficulty,
      strand: "Science Inquiry",
      interaction: "fillBlank"
    });
  }
  if (mode === 1) {
    const correct = concept;
    const options = pickWrongOptions(correct, bag.science, seed);
    return makeQuestion({
      id: `sci-concept-tile-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Tap the science word tile.`,
      options,
      correct,
      explanation: `${concept} is a science concept for this level.`,
      difficulty,
      strand: "Vocabulary",
      interaction: "wordTiles"
    });
  }
  if (mode === 2) {
    const correct = "Observe, predict, test, explain";
    const options = pickWrongOptions(correct, ["Observe, predict, test, explain", "Guess, forget, skip, finish", "Hide, shout, rush, stop", "Paint, count, jump, laugh"], seed);
    return makeQuestion({
      id: `sci-steps-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Which sequence sounds most like a science investigation?`,
      options,
      correct,
      explanation: `Science uses observation, prediction, testing and explanation.`,
      difficulty,
      strand: "Science Inquiry",
      interaction: "sentenceOrder"
    });
  }
  if (mode === 3) {
    const correct = "one thing";
    const options = pickWrongOptions(correct, ["one thing", "everything", "nothing", "only colours"], seed);
    return makeQuestion({
      id: `sci-fairtest-blank-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Fill the blank: A fair test changes ____ at a time.`,
      options,
      correct,
      explanation: `A fair test changes one thing while keeping other things the same.`,
      difficulty,
      strand: "Investigation",
      interaction: "fillBlank"
    });
  }
  if (mode === 4) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({
      id: `sci-living-true-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `True or false: Living things need suitable conditions to survive.`,
      options,
      correct,
      explanation: `Living things need conditions that support survival and growth.`,
      difficulty,
      strand: "Life Science",
      interaction: "trueFalse"
    });
  }
  if (mode === 5) {
    const correct = "water";
    const options = pickWrongOptions(correct, ["water", "sandwich", "keyboard", "moon"], seed);
    return makeQuestion({
      id: `sci-plant-blank-${ageBand}-${difficulty}-${seed}`,
      topic: "science",
      prompt: `Fill the blank: Many plants need light and ____ to grow.`,
      options,
      correct,
      explanation: `Many plants need water, light and air.`,
      difficulty,
      strand: "Biological sciences",
      interaction: "fillBlank"
    });
  }
  const correct = "A fair test changes one thing at a time";
  const options = pickWrongOptions(correct, ["A fair test changes one thing at a time", "A fair test changes everything at once", "A fair test never measures anything", "A fair test skips the results"], seed);
  return makeQuestion({
    id: `sci-fairtest-${ageBand}-${difficulty}-${seed}`,
    topic: "science",
    prompt: `Which statement about a fair test is correct?`,
    options,
    correct,
    explanation: `Fair tests keep most things the same and change one variable.`,
    difficulty,
    strand: "Investigation",
    interaction: "choose"
  });
};

const makeHistoryQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const item = bag.historical[Math.abs(seed) % bag.historical.length];
  const mode = Math.abs(seed) % 6;
  if (mode === 0) {
    const correct = "past";
    const options = pickWrongOptions(correct, ["past", "lunch", "weather", "sport"], seed);
    return makeQuestion({ id: `hist-blank-${ageBand}-${difficulty}-${seed}`, topic: "history", prompt: `Fill the blank: History helps us learn about the ____.`, options, correct, explanation: `History is learning about people, places and events from the past.`, difficulty, strand: "Historical knowledge", interaction: "fillBlank" });
  }
  if (mode === 1) {
    const correct = "A timeline helps place events in order";
    const options = pickWrongOptions(correct, ["A timeline helps place events in order", "A timeline measures rainfall", "A timeline is a sandwich", "A timeline only shows colours"], seed);
    return makeQuestion({ id: `hist-time-${ageBand}-${difficulty}-${seed}`, topic: "history", prompt: `Why do historians use timelines?`, options, correct, explanation: `Timelines show sequence and change over time.`, difficulty, strand: "Chronology", interaction: "choose" });
  }
  if (mode === 2) {
    const correct = item;
    const options = pickWrongOptions(correct, bag.historical, seed);
    return makeQuestion({ id: `hist-word-${ageBand}-${difficulty}-${seed}`, topic: "history", prompt: `Tap the history word tile.`, options, correct, explanation: `${correct} is commonly used in history learning.`, difficulty, strand: "Vocabulary", interaction: "wordTiles" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `hist-artefact-true-${ageBand}-${difficulty}-${seed}`, topic: "history", prompt: `True or false: An artefact can be evidence from the past.`, options, correct, explanation: `Objects, records and stories can all provide evidence.`, difficulty, strand: "Historical Sources", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "first, next, last";
    const options = pickWrongOptions(correct, ["first, next, last", "last, first, next", "next, last, first", "only today"], seed);
    return makeQuestion({ id: `hist-order-${ageBand}-${difficulty}-${seed}`, topic: "history", prompt: `Pick the tile that shows time words in a sensible order.`, options, correct, explanation: `Ordering events helps us understand what happened.`, difficulty, strand: "Chronology", interaction: "sentenceOrder" });
  }
  const correct = "photo";
  const options = pickWrongOptions(correct, ["photo", "sandwich", "jump", "purple"], seed);
  return makeQuestion({ id: `hist-source-blank-${ageBand}-${difficulty}-${seed}`, topic: "history", prompt: `Fill the blank: An old family ____ can be a historical source.`, options, correct, explanation: `Photos can help tell us about the past.`, difficulty, strand: "Sources", interaction: "fillBlank" });
};

const makeGeographyQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const place = bag.places[Math.abs(seed) % bag.places.length];
  const mode = Math.abs(seed) % 6;
  if (mode === 0) {
    const correct = "map";
    const options = pickWrongOptions(correct, ["map", "spoon", "song", "shoe"], seed);
    return makeQuestion({ id: `geo-map-blank-${ageBand}-${difficulty}-${seed}`, topic: "geography", prompt: `Fill the blank: A ____ can help us find places.`, options, correct, explanation: `Maps help us locate and describe places.`, difficulty, strand: "Maps", interaction: "fillBlank" });
  }
  if (mode === 1) {
    const correct = place;
    const options = pickWrongOptions(correct, bag.places, seed);
    return makeQuestion({ id: `geo-place-${ageBand}-${difficulty}-${seed}`, topic: "geography", prompt: `Tap the place or environment word.`, options, correct, explanation: `${place} is a place or environment word.`, difficulty, strand: "Place", interaction: "wordTiles" });
  }
  if (mode === 2) {
    const correct = "north, south, east, west";
    const options = pickWrongOptions(correct, ["north, south, east, west", "red, blue, big, tiny", "eat, sleep, run, jump", "cat, dog, fish, bird"], seed);
    return makeQuestion({ id: `geo-direction-${ageBand}-${difficulty}-${seed}`, topic: "geography", prompt: `Which tile shows direction words?`, options, correct, explanation: `Directions help describe location.`, difficulty, strand: "Location", interaction: "match" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `geo-map-true-${ageBand}-${difficulty}-${seed}`, topic: "geography", prompt: `True or false: Maps help us locate and describe places.`, options, correct, explanation: `Maps are used to locate and compare places.`, difficulty, strand: "Maps", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "future";
    const options = pickWrongOptions(correct, ["future", "rubbish", "only me", "never"], seed);
    return makeQuestion({ id: `geo-sustain-blank-${ageBand}-${difficulty}-${seed}`, topic: "geography", prompt: `Fill the blank: Sustainability means caring for places now and for the ____.`, options, correct, explanation: `Sustainability is about long-term care for environments and resources.`, difficulty, strand: "Environment", interaction: "fillBlank" });
  }
  const correct = "Sustainability means caring for resources now and in the future";
  const options = pickWrongOptions(correct, ["Sustainability means caring for resources now and in the future", "Sustainability means wasting resources quickly", "Sustainability means maps are not needed", "Sustainability only matters at school"], seed);
  return makeQuestion({ id: `geo-sustain-${ageBand}-${difficulty}-${seed}`, topic: "geography", prompt: `Which statement best explains sustainability?`, options, correct, explanation: `Sustainability is about long-term care.`, difficulty, strand: "Environment", interaction: "choose" });
};

const makeCivicsQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.civics[Math.abs(seed) % bag.civics.length];
  const mode = Math.abs(seed) % 6;
  if (mode === 0) {
    const correct = "fair";
    const options = pickWrongOptions(correct, ["fair", "loud", "messy", "hidden"], seed);
    return makeQuestion({ id: `civ-fair-blank-${ageBand}-${difficulty}-${seed}`, topic: "civics", prompt: `Fill the blank: Rules can help make games and groups ____.`, options, correct, explanation: `Fair rules help people feel safe and included.`, difficulty, strand: "Citizenship", interaction: "fillBlank" });
  }
  if (mode === 1) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.civics, seed);
    return makeQuestion({ id: `civ-word-${ageBand}-${difficulty}-${seed}`, topic: "civics", prompt: `Tap the civics and citizenship word.`, options, correct, explanation: `${word} belongs to civics and citizenship.`, difficulty, strand: "Vocabulary", interaction: "wordTiles" });
  }
  if (mode === 2) {
    const correct = "Listening respectfully helps group decisions";
    const options = pickWrongOptions(correct, ["Listening respectfully helps group decisions", "Only one person should speak", "Fairness means ignoring others", "Helping is never part of community"], seed);
    return makeQuestion({ id: `civ-participation-${ageBand}-${difficulty}-${seed}`, topic: "civics", prompt: `Which behaviour supports good group decisions?`, options, correct, explanation: `Respectful listening supports participation and decision-making.`, difficulty, strand: "Participation", interaction: "choose" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `civ-rules-true-${ageBand}-${difficulty}-${seed}`, topic: "civics", prompt: `True or false: Rules can help people stay safe and treated fairly.`, options, correct, explanation: `Rules and laws support safety, order and fairness.`, difficulty, strand: "Rules", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "share, listen, vote";
    const options = pickWrongOptions(correct, ["share, listen, vote", "push, yell, grab", "hide, ignore, quit", "sleep, eat, run"], seed);
    return makeQuestion({ id: `civ-good-choice-${ageBand}-${difficulty}-${seed}`, topic: "civics", prompt: `Which tile shows good group choice words?`, options, correct, explanation: `Sharing, listening and voting can help groups make decisions.`, difficulty, strand: "Participation", interaction: "match" });
  }
  const correct = "Rules can help people stay safe and treated fairly";
  const options = pickWrongOptions(correct, ["Rules can help people stay safe and treated fairly", "Rules are only for games", "Rules mean one person gets everything", "Rules stop people from helping"], seed);
  return makeQuestion({ id: `civ-rules-${ageBand}-${difficulty}-${seed}`, topic: "civics", prompt: `Why do communities use rules and laws?`, options, correct, explanation: `Rules and laws support safety, order and fairness.`, difficulty, strand: "Citizenship", interaction: "choose" });
};

const makeHealthQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.healthy[Math.abs(seed) % bag.healthy.length];
  const mode = Math.abs(seed) % 6;
  if (mode === 0) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.healthy, seed);
    return makeQuestion({ id: `health-word-${ageBand}-${difficulty}-${seed}`, topic: "health", prompt: `Tap the healthy habit or wellbeing word.`, options, correct, explanation: `${word} is linked to healthy choices or wellbeing.`, difficulty, strand: "Wellbeing", interaction: "wordTiles" });
  }
  if (mode === 1) {
    const correct = "trusted adult";
    const options = pickWrongOptions(correct, ["trusted adult", "stranger online", "secret forever", "unsafe dare"], seed);
    return makeQuestion({ id: `health-safe-blank-${ageBand}-${difficulty}-${seed}`, topic: "health", prompt: `Fill the blank: If I feel unsafe, I can ask a ____ for help.`, options, correct, explanation: `Asking a trusted adult is a safe choice.`, difficulty, strand: "Safety", interaction: "fillBlank" });
  }
  if (mode === 2) {
    const correct = "Healthy routines can support body and mind";
    const options = pickWrongOptions(correct, ["Healthy routines can support body and mind", "Sleep only matters for sport", "Emotions never affect health", "Water is less useful than soft drink"], seed);
    return makeQuestion({ id: `health-routine-${ageBand}-${difficulty}-${seed}`, topic: "health", prompt: `Which statement is true about healthy routines?`, options, correct, explanation: `Healthy routines support energy, focus and wellbeing.`, difficulty, strand: "Healthy Choices", interaction: "choose" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `health-water-true-${ageBand}-${difficulty}-${seed}`, topic: "health", prompt: `True or false: Drinking water can help your body.`, options, correct, explanation: `Water helps your body work well.`, difficulty, strand: "Health", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "wash hands";
    const options = pickWrongOptions(correct, ["wash hands", "touch eyes", "skip sleep", "forget water"], seed);
    return makeQuestion({ id: `health-hygiene-blank-${ageBand}-${difficulty}-${seed}`, topic: "health", prompt: `Before eating, a healthy choice is to ____.`, options, correct, explanation: `Washing hands helps keep germs away.`, difficulty, strand: "Hygiene", interaction: "fillBlank" });
  }
  const correct = "helmet, water, rest";
  const options = pickWrongOptions(correct, ["helmet, water, rest", "danger, push, yell", "password, screen, click", "map, river, mountain"], seed);
  return makeQuestion({ id: `health-match-${ageBand}-${difficulty}-${seed}`, topic: "health", prompt: `Which tile has health and safety words?`, options, correct, explanation: `Helmets, water and rest can support safety and wellbeing.`, difficulty, strand: "Safety", interaction: "match" });
};

const makeDigitalQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.digital[Math.abs(seed) % bag.digital.length];
  const mode = Math.abs(seed) % 7;
  if (mode === 0) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.digital, seed);
    return makeQuestion({ id: `dig-word-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `Tap the digital technologies word.`, options, correct, explanation: `${word} belongs to digital technologies learning.`, difficulty, strand: "Vocabulary", interaction: "wordTiles" });
  }
  if (mode === 1) {
    const correct = "steps";
    const options = pickWrongOptions(correct, ["steps", "clouds", "snacks", "noises"], seed);
    return makeQuestion({ id: `dig-algo-blank-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `Fill the blank: An algorithm is a set of ____ to solve a problem.`, options, correct, explanation: `Algorithms are ordered steps.`, difficulty, strand: "Algorithms", interaction: "fillBlank" });
  }
  if (mode === 2) {
    const correct = "Strong passwords and not sharing private details";
    const options = pickWrongOptions(correct, ["Strong passwords and not sharing private details", "Posting all personal details", "Using the same easy password", "Clicking unknown links for fun"], seed);
    return makeQuestion({ id: `dig-safe-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `Which option is best for online safety?`, options, correct, explanation: `Safe online habits protect privacy and security.`, difficulty, strand: "Digital Safety", interaction: "choose" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `dig-sequence-true-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `True or false: The order of steps can matter in an algorithm.`, options, correct, explanation: `The order of steps can change the result.`, difficulty, strand: "Algorithms", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "input, process, output";
    const options = pickWrongOptions(correct, ["input, process, output", "apple, banana, carrot", "north, south, east", "past, present, future"], seed);
    return makeQuestion({ id: `dig-ipo-match-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `Which tile sounds like a digital system pattern?`, options, correct, explanation: `Digital systems often use input, process and output.`, difficulty, strand: "Digital systems", interaction: "match" });
  }
  if (mode === 5) {
    const binary = (numberFrom(seed, 2, 12)).toString(2);
    const correct = binary;
    const options = pickWrongOptions(correct, [String(parseInt(binary, 2)), binary + "1", binary.slice(0, -1) || "0", "101010"], seed);
    return makeQuestion({ id: `dig-binary-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `Which option looks like a binary number?`, options, correct, explanation: `Binary uses only 0s and 1s.`, difficulty, strand: "Data", interaction: "numberTiles" });
  }
  const correct = "safe adult";
  const options = pickWrongOptions(correct, ["safe adult", "unknown link", "public password", "rude message"], seed);
  return makeQuestion({ id: `dig-help-blank-${ageBand}-${difficulty}-${seed}`, topic: "digital", prompt: `Fill the blank: If something online feels wrong, ask a ____.`, options, correct, explanation: `A safe adult can help with online safety.`, difficulty, strand: "Digital Safety", interaction: "fillBlank" });
};

const makeArtsQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const word = bag.artWords[Math.abs(seed) % bag.artWords.length];
  const mode = Math.abs(seed) % 6;
  if (mode === 0) {
    const correct = word;
    const options = pickWrongOptions(correct, bag.artWords, seed);
    return makeQuestion({ id: `arts-word-${ageBand}-${difficulty}-${seed}`, topic: "arts", prompt: `Tap the arts word tile.`, options, correct, explanation: `${word} is used in arts learning.`, difficulty, strand: "Arts Vocabulary", interaction: "wordTiles" });
  }
  if (mode === 1) {
    const correct = "colour";
    const options = pickWrongOptions(correct, ["colour", "division", "password", "continent"], seed);
    return makeQuestion({ id: `arts-colour-blank-${ageBand}-${difficulty}-${seed}`, topic: "arts", prompt: `Fill the blank: Artists can use ____ to show mood.`, options, correct, explanation: `Colour can change the feeling of artwork.`, difficulty, strand: "Visual Arts", interaction: "fillBlank" });
  }
  if (mode === 2) {
    const correct = "Artists make choices to create meaning";
    const options = pickWrongOptions(correct, ["Artists make choices to create meaning", "Art has only one correct answer", "Music and drama are not arts", "Colour never changes mood"], seed);
    return makeQuestion({ id: `arts-meaning-${ageBand}-${difficulty}-${seed}`, topic: "arts", prompt: `Which statement best matches arts learning?`, options, correct, explanation: `Artists use elements and choices to communicate ideas.`, difficulty, strand: "Responding", interaction: "choose" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `arts-audience-true-${ageBand}-${difficulty}-${seed}`, topic: "arts", prompt: `True or false: An audience watches, hears or views an artwork.`, options, correct, explanation: `The audience receives and responds to artworks or performances.`, difficulty, strand: "Responding", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "line, shape, colour";
    const options = pickWrongOptions(correct, ["line, shape, colour", "divide, subtract, plus", "north, east, west", "password, input, data"], seed);
    return makeQuestion({ id: `arts-match-${ageBand}-${difficulty}-${seed}`, topic: "arts", prompt: `Which tile has visual arts words?`, options, correct, explanation: `Line, shape and colour are common arts elements.`, difficulty, strand: "Elements", interaction: "match" });
  }
  const correct = "Audience means the people watching, hearing or viewing a work";
  const options = pickWrongOptions(correct, ["Audience means the people watching, hearing or viewing a work", "Audience means only the painter", "Audience is homework", "Audience means the backstage floor"], seed);
  return makeQuestion({ id: `arts-audience-${ageBand}-${difficulty}-${seed}`, topic: "arts", prompt: `What does audience mean in the arts?`, options, correct, explanation: `An audience receives and responds to artworks or performances.`, difficulty, strand: "Responding", interaction: "choose" });
};

const makeLanguagesQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const bag = ageSettings[ageBand];
  const item = bag.languageWords[Math.abs(seed) % bag.languageWords.length];
  const mode = Math.abs(seed) % 5;
  if (mode === 0) {
    const correct = item.meaning;
    const options = pickWrongOptions(correct, bag.languageWords.map((entry) => entry.meaning).concat(["tree", "house", "river"]), seed);
    return makeQuestion({ id: `lang-basic-${ageBand}-${difficulty}-${seed}`, topic: "languages", prompt: `What does "${item.word}" most likely mean?`, options, correct, explanation: `"${item.word}" means "${item.meaning}" in this mini vocabulary set.`, difficulty, strand: "Intercultural Communication", interaction: "choose" });
  }
  if (mode === 1) {
    const correct = item.meaning;
    const options = pickWrongOptions(correct, bag.languageWords.map((entry) => entry.meaning).concat(["jump", "number", "planet"]), seed);
    return makeQuestion({ id: `lang-blank-${ageBand}-${difficulty}-${seed}`, topic: "languages", prompt: `Fill the blank: "${item.word}" means ____.`, options, correct, explanation: `"${item.word}" means "${item.meaning}".`, difficulty, strand: "Vocabulary", interaction: "fillBlank" });
  }
  if (mode === 2) {
    const correct = item.word;
    const options = pickWrongOptions(correct, bag.languageWords.map((entry) => entry.word).concat(["kangaroo", "laptop", "pencil"]), seed);
    return makeQuestion({ id: `lang-word-tile-${ageBand}-${difficulty}-${seed}`, topic: "languages", prompt: `Tap the language word that means ${item.meaning}.`, options, correct, explanation: `${correct} means ${item.meaning}.`, difficulty, strand: "Vocabulary", interaction: "wordTiles" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `lang-culture-true-${ageBand}-${difficulty}-${seed}`, topic: "languages", prompt: `True or false: Learning words from other languages helps us understand people and cultures.`, options, correct, explanation: `Languages learning helps us communicate and understand culture.`, difficulty, strand: "Intercultural Understanding", interaction: "trueFalse" });
  }
  const correct = "hello, thank you, goodbye";
  const options = pickWrongOptions(correct, ["hello, thank you, goodbye", "plus, minus, equals", "map, coast, river", "run, jump, sleep"], seed);
  return makeQuestion({ id: `lang-match-${ageBand}-${difficulty}-${seed}`, topic: "languages", prompt: `Which tile shows useful language greeting words?`, options, correct, explanation: `Greetings and polite words are useful when learning languages.`, difficulty, strand: "Communication", interaction: "match" });
};

const makeFinancialQuestion = (ageBand: AgeBand, difficulty: number, seed: number): Question => {
  const dollars = numberFrom(seed, ageBand === "5-6" ? 1 : 4, ageBand === "5-6" ? 10 : ageBand === "7-8" ? 30 : 120);
  const spend = numberFrom(seed * 13, 1, Math.max(1, Math.floor(dollars / 2)));
  const save = dollars - spend;
  const mode = Math.abs(seed) % 6;
  if (mode === 0) {
    const correct = String(save);
    const options = pickWrongOptions(correct, [String(save + 1), String(Math.max(0, save - 1)), String(dollars + spend), String(spend)], seed);
    return makeQuestion({ id: `fin-save-${ageBand}-${difficulty}-${seed}`, topic: "financial", prompt: `Fill the blank: You have $${dollars}. You spend $${spend}. You have $____ left.`, options, correct, explanation: `$${dollars} - $${spend} = $${save}.`, difficulty, strand: "Budgeting", interaction: "fillBlank" });
  }
  if (mode === 1) {
    const correct = "Needs are things important for living and wellbeing";
    const options = pickWrongOptions(correct, ["Needs are things important for living and wellbeing", "Needs are always the fanciest items", "Needs and wants are exactly the same", "Needs never include food or shelter"], seed);
    return makeQuestion({ id: `fin-needs-${ageBand}-${difficulty}-${seed}`, topic: "financial", prompt: `Which statement best explains needs?`, options, correct, explanation: `Needs are essentials, while wants are extras.`, difficulty, strand: "Consumer Choices", interaction: "choose" });
  }
  if (mode === 2) {
    const correct = "save";
    const options = pickWrongOptions(correct, ["save", "waste", "forget", "hide"], seed);
    return makeQuestion({ id: `fin-save-blank-${ageBand}-${difficulty}-${seed}`, topic: "financial", prompt: `Fill the blank: Putting money aside for later is called ____ money.`, options, correct, explanation: `Saving means putting money aside for later.`, difficulty, strand: "Saving", interaction: "fillBlank" });
  }
  if (mode === 3) {
    const correct = "True";
    const options = shuffle(["True", "False"], seed);
    return makeQuestion({ id: `fin-needs-true-${ageBand}-${difficulty}-${seed}`, topic: "financial", prompt: `True or false: Food and shelter are examples of needs.`, options, correct, explanation: `Needs are things important for living and wellbeing.`, difficulty, strand: "Needs and wants", interaction: "trueFalse" });
  }
  if (mode === 4) {
    const correct = "$1, $2, $5";
    const options = pickWrongOptions(correct, ["$1, $2, $5", "cat, dog, fish", "map, river, coast", "red, blue, fast"], seed);
    return makeQuestion({ id: `fin-money-match-${ageBand}-${difficulty}-${seed}`, topic: "financial", prompt: `Which tile shows money amounts?`, options, correct, explanation: `These are Australian dollar amounts.`, difficulty, strand: "Money", interaction: "match" });
  }
  const original = numberFrom(seed, ageBand === "5-6" ? 5 : 10, ageBand === "5-6" ? 20 : 80);
  const discount = 10;
  const correct = String(original - Math.floor(original * discount / 100));
  const options = pickWrongOptions(correct, [String(original), String(original - 10), String(original + 10), String(Math.floor(original * discount / 100))], seed);
  return makeQuestion({ id: `fin-discount-${ageBand}-${difficulty}-${seed}`, topic: "financial", prompt: `An item costs $${original} and is 10% off. Which option is the sale price?`, options, correct, explanation: `10% off means subtract one-tenth of the original price.`, difficulty, strand: "Percentages", interaction: "numberTiles" });
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
  const topicLevel = getTopicLevel(profile, topic);
  const rampSize = ageBand === "5-6" ? 70 : ageBand === "7-8" ? 55 : 40;
  const difficulty = Math.min(8, Math.max(1, ageStart + Math.ceil(topicLevel / rampSize)));
  const baseSeed = (getProfileAgeIndex(ageBand) + 1) * 1000 + getOverallLevel(profile) * 37 + getTopicLevel(profile, topic) * 71 + profile.answered * 19;
  const generator = generators[topic];
  const attempts = Array.from({ length: 1200 }, (_, index) => generator(ageBand, difficulty, baseSeed + index * 101));
  const answered = new Set(profile.answeredQuestionIds ?? []);
  const seenKeys = new Set(profile.seenQuestionKeys ?? []);
  const recent = new Set(profile.recentQuestionIds ?? []);

  // Do not only check the generated ID. Some generated questions can have different IDs
  // but the same visible prompt and same correct answer. This key blocks those repeats.
  const isSeen = (question: Question) =>
    answered.has(question.id) ||
    answered.has(getQuestionKey(question)) ||
    seenKeys.has(getQuestionKey(question)) ||
    recent.has(question.id) ||
    recent.has(getQuestionKey(question));

  const fresh = attempts.find((question) => !isSeen(question));
  if (fresh) return fresh;

  // If a child has exhausted the small easy pool, move seed far ahead before repeating.
  return generator(ageBand, difficulty, baseSeed + (profile.answered + 1) * 99991);
};

export const estimateQuestionCount = () => {
  const ageBands = Object.keys(ageSettings) as AgeBand[];
  return ageBands.length * TOPICS.length * LEVELS_PER_AGE * 1200;
};
