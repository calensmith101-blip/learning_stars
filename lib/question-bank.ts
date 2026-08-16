import { MAX_LEVELS_PER_AGE, TOPIC_IDS } from "./curriculum";
import type { AgeBand, Interaction, LearnerProfile, Question, TopicId } from "./types";

const ageBase: Record<AgeBand, number> = { "5-6": 1, "7-8": 2, "9-10": 3, "11-13": 4, "14-17": 5, adult: 6 };

const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return Math.abs(h >>> 0);
};

const shuffle = <T,>(items: T[], seed: number) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = hash(`${seed}-${i}`) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const uniq = <T,>(items: T[]) => Array.from(new Set(items));

const make = (q: Omit<Question, "answerIndex" | "id" | "key">): Question => {
  const options = uniq(q.options).slice(0, 4);
  while (options.length < 4) options.push(`Choice ${options.length + 1}`);
  const answerIndex = options.findIndex((o) => o === q.correct);
  const key = `${q.topic}|${q.prompt.trim().toLowerCase()}|${q.correct.trim().toLowerCase()}`;
  return { ...q, options, answerIndex: Math.max(0, answerIndex), id: `q-${hash(key)}`, key };
};

const opts = (correct: string, wrong: string[], seed: number) => shuffle(uniq([correct, ...wrong.filter((x) => x !== correct)]).slice(0, 4), seed);
const pick = <T,>(items: T[], seed: number) => items[hash(String(seed)) % items.length];

const WORDS = {
  easyNouns: ["cat", "dog", "sun", "hat", "book", "ball", "fish", "frog", "ship", "tree", "cake", "star", "duck", "bed", "cup", "box"],
  easyVerbs: ["run", "jump", "sit", "look", "play", "read", "sing", "draw", "hop", "cook", "walk", "clap"],
  easyAdjectives: ["big", "red", "wet", "hot", "cold", "soft", "fast", "kind", "happy", "little", "green", "round"],
  midNouns: ["library", "teacher", "planet", "insect", "garden", "weather", "machine", "island", "character", "sentence", "paragraph", "community"],
  midVerbs: ["compare", "explain", "describe", "measure", "observe", "predict", "collect", "protect", "design", "create"],
  hardWords: ["perspective", "evidence", "hypothesis", "sustainable", "interpret", "evaluate", "metaphor", "democracy", "ecosystem", "composition"],
  rhymes: [["cat", "hat"], ["dog", "frog"], ["sun", "fun"], ["star", "car"], ["cake", "snake"], ["light", "night"], ["blue", "true"]],
};

type AgeChallenge = Omit<Question, "answerIndex" | "id" | "key" | "difficulty">;

const ageChallenges: Record<AgeBand, AgeChallenge[]> = {
  "5-6": [
    { topic: "science", prompt: "A plant needs water and sunlight to grow. What else does it need?", options: ["soil", "a television", "a toy", "a shoe"], correct: "soil", explanation: "Most plants grow their roots in soil, which helps hold water and nutrients.", strand: "Living things", interaction: "choose" },
    { topic: "health", prompt: "Your body feels hot after running. What is a smart choice?", options: ["Drink water", "Put on a heavy coat", "Skip all rest", "Eat sand"], correct: "Drink water", explanation: "Water helps your body stay hydrated, especially after moving.", strand: "Healthy choices", interaction: "choose" },
    { topic: "geography", prompt: "Which tool helps you find where places are?", options: ["a map", "a pillow", "a paintbrush", "a spoon"], correct: "a map", explanation: "A map is a drawing that shows where places are.", strand: "Maps and places", interaction: "wordTiles" },
    { topic: "arts", prompt: "What makes music easier to clap along with?", options: ["a steady beat", "a silent colour", "a map key", "a calendar"], correct: "a steady beat", explanation: "A beat is the steady pulse we can hear and feel in music.", strand: "Music", interaction: "choose" }
  ],
  "7-8": [
    { topic: "science", prompt: "A shadow changes size during the day because the Sun appears to move across the sky. What causes the change?", options: ["The direction of light", "The shadow gets hungry", "Clouds make new shadows", "The ground moves closer"], correct: "The direction of light", explanation: "As the light comes from a different direction, the shadow changes position and length.", strand: "Light and shadows", interaction: "choose" },
    { topic: "history", prompt: "A photo, letter, or old object can help us learn about the past. What is it called?", options: ["a source", "a prediction", "a recipe", "a habitat"], correct: "a source", explanation: "Historical sources give us clues and evidence about people and events in the past.", strand: "Historical evidence", interaction: "wordTiles" },
    { topic: "health", prompt: "A friend is upset after a mistake. Which response shows care?", options: ["Ask if they want help", "Laugh at them", "Tell everyone", "Ignore them forever"], correct: "Ask if they want help", explanation: "Kind support helps people feel safe and able to try again.", strand: "Relationships", interaction: "choose" },
    { topic: "geography", prompt: "What is weather?", options: ["What the air is like today", "Every animal in a forest", "A map of the world", "A kind of rock"], correct: "What the air is like today", explanation: "Weather includes things like rain, wind, temperature, and clouds today.", strand: "Weather", interaction: "fillBlank" }
  ],
  "9-10": [
    { topic: "science", prompt: "Which change can usually be reversed?", options: ["Ice melting", "Wood burning", "A cake baking", "Paper tearing"], correct: "Ice melting", explanation: "Melted water can freeze again, so melting is a reversible change.", strand: "Materials", interaction: "choose" },
    { topic: "history", prompt: "Why do historians compare more than one source?", options: ["To check evidence and perspectives", "To make sources disappear", "To avoid asking questions", "To change the past"], correct: "To check evidence and perspectives", explanation: "Different sources can provide different viewpoints and help historians test claims.", strand: "Historical inquiry", interaction: "choose" },
    { topic: "geography", prompt: "Which action helps conserve water at home?", options: ["Turn off the tap while brushing", "Leave taps running", "Water the driveway", "Take extra-long showers"], correct: "Turn off the tap while brushing", explanation: "Turning off a tap when it is not needed saves a valuable resource.", strand: "Sustainability", interaction: "choose" },
    { topic: "arts", prompt: "An artist uses light colours beside dark colours to make an object stand out. What is this called?", options: ["contrast", "orbit", "migration", "nutrition"], correct: "contrast", explanation: "Contrast is a difference, such as light and dark, that makes visual features noticeable.", strand: "Visual arts", interaction: "wordTiles" }
  ],
  "11-13": [
    { topic: "science", prompt: "In a fair test, why should you change only one variable at a time?", options: ["So you can link the result to that change", "So the experiment is noisier", "So every result is random", "So there is no evidence"], correct: "So you can link the result to that change", explanation: "Controlling variables makes an investigation more reliable and helps explain the results.", strand: "Scientific inquiry", interaction: "choose" },
    { topic: "history", prompt: "A primary source is usually created during the time being studied. Which is a primary source for a 1969 event?", options: ["A newspaper printed in 1969", "A recent textbook", "A fictional movie", "A modern summary"], correct: "A newspaper printed in 1969", explanation: "A newspaper from that time is direct evidence from the period, though it can still have bias.", strand: "Sources and evidence", interaction: "choose" },
    { topic: "health", prompt: "Which is a healthy way to handle a strong feeling?", options: ["Pause and talk to a trusted person", "Post it about someone online", "Break something", "Keep it secret forever"], correct: "Pause and talk to a trusted person", explanation: "Naming feelings, pausing, and asking for support are useful self-management skills.", strand: "Wellbeing", interaction: "choose" },
    { topic: "geography", prompt: "Climate describes:", options: ["usual weather over many years", "today's temperature only", "a country border", "one storm"], correct: "usual weather over many years", explanation: "Weather is day to day; climate is the long-term pattern in a place.", strand: "Climate", interaction: "fillBlank" }
  ],
  "14-17": [
    { topic: "science", prompt: "A correlation between two things does not always prove causation. Why?", options: ["Another factor may explain both", "Numbers are never useful", "Experiments have no purpose", "Correlation is a type of planet"], correct: "Another factor may explain both", explanation: "Two patterns can occur together because of a third variable or coincidence, so evidence needs careful evaluation.", strand: "Evidence and reasoning", interaction: "choose" },
    { topic: "history", prompt: "Why should a historian consider whose voice is missing from a source collection?", options: ["Missing perspectives can change the interpretation", "It makes dates disappear", "Sources only have one meaning", "History is not evidence-based"], correct: "Missing perspectives can change the interpretation", explanation: "Power and access affect who creates and preserves sources, so gaps can shape a historical account.", strand: "Perspectives", interaction: "choose" },
    { topic: "geography", prompt: "Which response is most likely to improve a community's long-term sustainability?", options: ["Reduce waste and protect local ecosystems", "Use resources as fast as possible", "Ignore water use", "Remove all green spaces"], correct: "Reduce waste and protect local ecosystems", explanation: "Sustainability balances current needs with protecting resources and environments for the future.", strand: "Sustainability", interaction: "choose" },
    { topic: "health", prompt: "Consent in a healthy relationship should be:", options: ["freely given, informed, and ongoing", "assumed from silence", "pressured", "permanent after one yes"], correct: "freely given, informed, and ongoing", explanation: "People can set boundaries and change their minds; respect and clear communication matter.", strand: "Relationships", interaction: "choose" }
  ],
  adult: [
    { topic: "science", prompt: "Which practice makes a scientific claim more trustworthy?", options: ["Use repeatable methods and review the evidence", "Rely on one personal story", "Ignore conflicting data", "Choose an answer first"], correct: "Use repeatable methods and review the evidence", explanation: "Reliable claims are supported by transparent methods, evidence, and opportunities for checking.", strand: "Scientific literacy", interaction: "choose" },
    { topic: "history", prompt: "Historical interpretation is strongest when it:", options: ["uses evidence and acknowledges uncertainty", "treats one source as perfect", "ignores context", "avoids differing perspectives"], correct: "uses evidence and acknowledges uncertainty", explanation: "Good interpretations explain how evidence supports a conclusion and where limits remain.", strand: "Historical reasoning", interaction: "choose" },
    { topic: "health", prompt: "A reliable health decision should be based primarily on:", options: ["credible evidence and qualified advice", "a viral headline alone", "a celebrity endorsement", "an anonymous comment"], correct: "credible evidence and qualified advice", explanation: "Health information should come from reputable evidence and appropriate professionals.", strand: "Health literacy", interaction: "choose" },
    { topic: "geography", prompt: "Why are maps useful for making community decisions?", options: ["They reveal patterns across places", "They predict every event perfectly", "They replace local knowledge", "They remove all uncertainty"], correct: "They reveal patterns across places", explanation: "Mapped data can show patterns in services, hazards, land use, and environments.", strand: "Geospatial thinking", interaction: "choose" }
  ]
};

const ageChallenge = (topic: TopicId, age: AgeBand, difficulty: number, seed: number) => {
  const matches = ageChallenges[age].filter((challenge) => challenge.topic === topic);
  if (!matches.length) return [];
  const challenge = pick(matches, seed);
  return [make({ ...challenge, difficulty })];
};

const english = (age: AgeBand, difficulty: number, seed: number): Question[] => {
  const nouns = difficulty < 3 ? WORDS.easyNouns : [...WORDS.easyNouns, ...WORDS.midNouns, ...WORDS.hardWords];
  const verbs = difficulty < 3 ? WORDS.easyVerbs : [...WORDS.easyVerbs, ...WORDS.midVerbs];
  const adjs = difficulty < 3 ? WORDS.easyAdjectives : [...WORDS.easyAdjectives, "careful", "curious", "ancient", "gentle", "confident", "brave"];
  const noun = pick(nouns, seed + 1); const verb = pick(verbs, seed + 2); const adj = pick(adjs, seed + 3);
  const article = "aeiou".includes(noun[0].toLowerCase()) ? "an" : "a";
  const pair = pick(WORDS.rhymes, seed + 4);
  const qs: Question[] = [];
  qs.push(make({ topic: "english", prompt: `Fill the blank: I can see ${article} _____.`, options: opts(noun, shuffle(nouns, seed).filter(x => x !== noun), seed), correct: noun, explanation: `The word ${noun} completes the sentence.`, difficulty, strand: "Sentence meaning", interaction: "fillBlank" }));
  qs.push(make({ topic: "english", prompt: `Which word is an action word?`, options: opts(verb, [noun, adj, "the"], seed + 10), correct: verb, explanation: `${verb} is something a person or thing can do.`, difficulty, strand: "Grammar", interaction: "wordTiles" }));
  qs.push(make({ topic: "english", prompt: `Complete the sentence: The ${noun} is _____.`, options: opts(adj, [verb, "under", "because"], seed + 20), correct: adj, explanation: `${adj} describes the ${noun}.`, difficulty, strand: "Vocabulary", interaction: "fillBlank" }));
  qs.push(make({ topic: "english", prompt: `Which word rhymes with ${pair[0]}?`, options: opts(pair[1], [noun, verb, adj], seed + 30), correct: pair[1], explanation: `${pair[0]} and ${pair[1]} rhyme.`, difficulty, strand: "Phonics", interaction: "choose" }));
  qs.push(make({ topic: "english", prompt: `Build the best sentence.`, options: opts(`The ${noun} can ${verb}.`, [`${verb} the can ${noun}.`, `Can the the ${noun}.`, `${noun} ${adj} the.`], seed + 40), correct: `The ${noun} can ${verb}.`, explanation: `A sentence should make sense and have words in a clear order.`, difficulty, strand: "Sentence structure", interaction: "sentenceOrder" }));
  if (difficulty >= 3) qs.push(make({ topic: "english", prompt: `Which word would make a sentence more precise? "The explorer made a _____ map."`, options: opts("detailed", ["quickly", "because", "running"], seed + 50), correct: "detailed", explanation: `Detailed describes the map clearly.`, difficulty, strand: "Language choices", interaction: "fillBlank" }));
  return qs;
};

const maths = (age: AgeBand, difficulty: number, seed: number): Question[] => {
  const max = difficulty <= 1 ? 5 : difficulty === 2 ? 10 : difficulty === 3 ? 20 : difficulty === 4 ? 50 : 100;
  const a = 1 + (hash(`${seed}a`) % max); const b = 1 + (hash(`${seed}b`) % Math.max(3, Math.floor(max / 2)));
  const sum = a + b; const diff = Math.max(a, b) - Math.min(a, b); const product = Math.min(a, 12) * Math.min(b, 12);
  return [
    make({ topic: "maths", prompt: difficulty <= 2 ? `Fill the blank: ${a} + ${b} = ____` : `A shop has ${a} apples and gets ${b} more. How many apples now?`, options: opts(String(sum), [String(sum + 1), String(Math.max(0, sum - 1)), String(sum + 2)], seed), correct: String(sum), explanation: `${a} + ${b} = ${sum}.`, difficulty, strand: "Number", interaction: difficulty <= 2 ? "fillBlank" : "choose" }),
    make({ topic: "maths", prompt: `What number comes next? ${a}, ${a + 1}, ____`, options: opts(String(a + 2), [String(a), String(a + 1), String(a + 3)], seed + 2), correct: String(a + 2), explanation: `Counting on gives ${a + 2}.`, difficulty, strand: "Number patterns", interaction: "numberTiles" }),
    make({ topic: "maths", prompt: difficulty <= 3 ? `Fill the blank: ${Math.max(a,b)} - ${Math.min(a,b)} = ____` : `${Math.max(a,b)} items are shared and ${Math.min(a,b)} are used. How many remain?`, options: opts(String(diff), [String(diff + 1), String(Math.max(0, diff - 1)), String(diff + 2)], seed + 3), correct: String(diff), explanation: `The answer is ${diff}.`, difficulty, strand: "Number", interaction: "fillBlank" }),
    make({ topic: "maths", prompt: difficulty < 4 ? `Which shape has 3 sides?` : `${Math.min(a,12)} groups of ${Math.min(b,12)} is ____`, options: difficulty < 4 ? opts("triangle", ["square", "circle", "rectangle"], seed + 4) : opts(String(product), [String(product + 2), String(product - 1), String(product + 10)], seed + 4), correct: difficulty < 4 ? "triangle" : String(product), explanation: difficulty < 4 ? `A triangle has 3 sides.` : `Multiply the groups to get ${product}.`, difficulty, strand: difficulty < 4 ? "Space" : "Number / multiplication", interaction: difficulty < 4 ? "choose" : "numberTiles" }),
  ];
};

const topicWords: Record<Exclude<TopicId, "english" | "maths">, string[]> = {
  science: ["plant", "seed", "push", "pull", "heat", "light", "sound", "water", "habitat", "insect", "planet", "orbit", "force", "mixture", "ecosystem", "adaptation", "energy", "particle", "gravity", "friction"],
  poetry: ["rhyme", "rhythm", "line", "poem", "verse", "stanza", "image", "metaphor", "simile", "voice", "mood", "alliteration", "symbol", "tone", "imagery"],
  history: ["past", "present", "family", "artefact", "source", "timeline", "change", "community", "evidence", "migration", "colony", "federation", "democracy", "continuity", "perspective"],
  geography: ["map", "place", "near", "far", "weather", "season", "environment", "river", "coast", "mountain", "climate", "region", "resource", "sustainability", "latitude"],
  health: ["safe", "help", "water", "sleep", "food", "move", "friend", "feelings", "hygiene", "exercise", "resilience", "respect", "nutrition", "wellbeing", "consent"],
  arts: ["colour", "line", "shape", "song", "beat", "dance", "drama", "paint", "texture", "rhythm", "contrast", "character", "composition", "audience", "style"]
};

const definitions: Record<string, string> = {
  plant: "a living thing that can grow in soil", seed: "a small part that can grow into a plant", push: "a force that moves something away", pull: "a force that brings something closer", heat: "energy that can make things warmer", light: "energy that helps us see", sound: "vibrations we can hear", habitat: "a place where a living thing lives", orbit: "the path one object follows around another", ecosystem: "living and non-living things interacting in a place",
  rhyme: "words with the same ending sound", rhythm: "the beat or flow of words or music", stanza: "a group of lines in a poem", metaphor: "describing something as if it is something else", simile: "a comparison using like or as", alliteration: "nearby words starting with the same sound",
  past: "something that already happened", present: "what is happening now", artefact: "an object from the past", source: "something that gives information", timeline: "events placed in time order", migration: "movement from one place to live in another",
  map: "a drawing that shows places", weather: "what the air is like today", climate: "usual weather over a long time", sustainability: "using resources carefully so they last", latitude: "imaginary lines that help locate places north or south",
  safe: "away from danger", hygiene: "keeping clean to stay healthy", resilience: "bouncing back after challenges", nutrition: "how food helps the body", wellbeing: "overall physical and emotional health",
  colour: "what we see as red, blue, yellow and more", line: "a mark that can be straight or curved", beat: "steady pulse in music", texture: "how something looks or feels", composition: "how parts are arranged in an artwork"
};

const genericTopic = (topic: Exclude<TopicId, "english" | "maths">, age: AgeBand, difficulty: number, seed: number): Question[] => {
  const pool = topicWords[topic];
  const word = pick(pool.slice(0, Math.min(pool.length, 5 + difficulty * 3)), seed);
  const wrongs = shuffle(pool.filter(w => w !== word), seed + 9).slice(0, 3);
  const meaning = definitions[word] ?? `an important ${topic} word`;
  const qs: Question[] = [
    make({ topic, prompt: `Fill the blank: ${word[0].toUpperCase() + word.slice(1)} means _____.`, options: opts(meaning, wrongs.map(w => definitions[w] ?? `a different ${topic} idea`), seed), correct: meaning, explanation: `${word}: ${meaning}.`, difficulty, strand: "Vocabulary and concepts", interaction: "fillBlank" }),
    make({ topic, prompt: `Pick the ${topic} word.`, options: opts(word, wrongs, seed + 1), correct: word, explanation: `${word} belongs in ${topic}.`, difficulty, strand: "Key ideas", interaction: "wordTiles" }),
    make({ topic, prompt: `True or false: "${word}" is connected to ${topic}.`, options: shuffle(["True", "False", "Not enough information", "Only on weekends"], seed + 2), correct: "True", explanation: `${word} is used in ${topic} learning.`, difficulty, strand: "Concept check", interaction: "trueFalse" }),
    make({ topic, prompt: `Which one does not belong with ${topic}?`, options: opts("pizza topping", [word, ...wrongs.slice(0,2)], seed + 3), correct: "pizza topping", explanation: `Pizza topping is not a school concept for ${topic}.`, difficulty, strand: "Odd one out", interaction: "oddOneOut" })
  ];
  if (topic === "poetry") qs.push(make({ topic, prompt: `Complete the poem line: The bright star shines at _____.`, options: opts("night", ["table", "running", "because"], seed + 4), correct: "night", explanation: `Night makes sense and can rhyme with bright.`, difficulty, strand: "Rhyme and rhythm", interaction: "fillBlank" }));
  if (topic === "health") qs.push(make({ topic, prompt: `A healthy choice is to drink ____ when thirsty.`, options: opts("water", ["paint", "sand", "glue"], seed + 5), correct: "water", explanation: `Water helps the body stay hydrated.`, difficulty, strand: "Healthy choices", interaction: "fillBlank" }));
  return qs;
};

export const getDifficulty = (age: AgeBand, level: number) => Math.min(9, ageBase[age] + Math.floor(Math.max(0, level - 1) / 18));

export const generateQuestionPool = (topic: TopicId, age: AgeBand, level: number, wanted = 320): Question[] => {
  const difficulty = getDifficulty(age, level);
  const out: Question[] = [];
  for (let i = 0; i < wanted; i++) {
    const seed = hash(`${topic}-${age}-${level}-${difficulty}-${i}`);
    const batch = topic === "english" ? english(age, difficulty, seed) : topic === "maths" ? maths(age, difficulty, seed) : genericTopic(topic, age, difficulty, seed);
    out.push(...ageChallenge(topic, age, difficulty, seed), ...batch);
  }
  const map = new Map<string, Question>();
  out.forEach(q => { if (!map.has(q.key)) map.set(q.key, q); });
  return Array.from(map.values());
};

export const pickNextQuestion = (profile: LearnerProfile, topic: TopicId, questOffset = 0): Question => {
  const level = Math.min(MAX_LEVELS_PER_AGE, Math.max(1, profile.level));
  const pool = generateQuestionPool(topic, profile.ageBand, level, 420);
  const seen = new Set([...(profile.topicSeenKeys[topic] ?? []), ...profile.seenQuestionKeys]);
  const fresh = pool.filter(q => !seen.has(q.key));
  const source = fresh.length ? fresh : pool;
  const index = hash(`${profile.id}-${topic}-${profile.answered}-${profile.topicAnswered[topic] ?? 0}-${questOffset}-${Date.now()}`) % source.length;
  return source[index];
};

export const estimateQuestionCount = () => TOPIC_IDS.length * 6 * MAX_LEVELS_PER_AGE * 250;
