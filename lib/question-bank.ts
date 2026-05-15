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
    out.push(...batch);
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
