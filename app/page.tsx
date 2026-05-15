"use client";

import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS, CURRICULUM_NOTES, MAX_LEVELS_PER_AGE, POINTS_PER_CORRECT, POINTS_PER_STAR, STARS_PER_LEVEL, TOPICS, ageLabel } from "../lib/curriculum";
import { accuracy, applyAnswer, completeQuestNode, defeatDavey, markSeen, progressToLevelStars, progressToStar } from "../lib/game";
import { estimateQuestionCount, pickNextQuestion } from "../lib/question-bank";
import { exportState, getDefaultState, importState, loadState, saveState, type AppState } from "../lib/storage";
import type { AgeBand, LearnerProfile, Question, TopicId } from "../lib/types";

type Screen = "home" | "topics" | "quiz" | "progress" | "settings" | "quest";

type Toast = { title: string; body: string; kind: "good" | "star" | "level" | "treasure" } | null;

const interactionName: Record<Question["interaction"], string> = {
  choose: "Pick one",
  fillBlank: "Fill the blank",
  wordTiles: "Word tiles",
  numberTiles: "Number tiles",
  trueFalse: "True or false",
  sentenceOrder: "Build it",
  match: "Match it",
  spellingBee: "Spelling bee",
  oddOneOut: "Odd one out"
};

function download(filename: string, data: string) {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [state, setState] = useState<AppState>(getDefaultState);
  const [screen, setScreen] = useState<Screen>("home");
  const [question, setQuestion] = useState<Question | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [questMode, setQuestMode] = useState(false);

  useEffect(() => setState(loadState()), []);
  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const profile = useMemo(() => state.profiles.find(p => p.id === state.activeProfileId) ?? state.profiles[0], [state]);
  const topic = TOPICS.find(t => t.id === state.activeTopicId) ?? TOPICS[0];

  useEffect(() => {
    if (profile) setQuestion(pickNextQuestion(profile, state.activeTopicId));
  }, [profile?.id, profile?.ageBand, profile?.level, state.activeTopicId]);

  const updateProfile = (profileId: string, updater: (p: LearnerProfile) => LearnerProfile) => {
    setState(current => ({ ...current, profiles: current.profiles.map(p => p.id === profileId ? updater(p) : p) }));
  };

  const chooseTopic = (topicId: TopicId) => {
    setQuestMode(false);
    setState(current => ({ ...current, activeTopicId: topicId }));
    setScreen("quiz");
  };

  const nextQuestion = (p = profile, topicId = state.activeTopicId, offset = 0) => setQuestion(pickNextQuestion(p, topicId, offset));

  const skipQuestion = () => {
    if (!question || !profile) return;
    const seen = markSeen(profile, state.activeTopicId, question);
    updateProfile(profile.id, () => seen);
    nextQuestion(seen, state.activeTopicId, 99);
  };

  const answer = (index: number) => {
    if (!question || !profile) return;
    const outcome = applyAnswer(profile, state.activeTopicId, question, index);
    let next = outcome.profile;
    if (questMode && outcome.correct) {
      const beforePieces = next.quest.pieces.filter(Boolean).length;
      if (next.streak > 0 && next.streak % 3 === 0) next = completeQuestNode(next);
      const afterPieces = next.quest.pieces.filter(Boolean).length;
      if (afterPieces > beforePieces) setToast({ title: "Treasure found!", body: `You found piece ${afterPieces} of Davey Jones' private collection.`, kind: "treasure" });
    } else if (outcome.levelUp) {
      setToast({ title: "Level up!", body: `Level ${next.level}. Questions will get a tiny bit harder.`, kind: "level" });
    } else if (outcome.starEarned) {
      setToast({ title: "New star!", body: `Every ${STARS_PER_LEVEL} stars gives a new level.`, kind: "star" });
    } else {
      setToast({ title: outcome.correct ? "Nice work!" : "Good try", body: outcome.message, kind: outcome.correct ? "good" : "good" });
    }
    updateProfile(profile.id, () => next);
    nextQuestion(next, state.activeTopicId, outcome.correct ? 7 : 13);
  };

  const setProfilePatch = (id: string, patch: Partial<LearnerProfile>) => updateProfile(id, p => ({ ...p, ...patch }));

  const startQuest = () => {
    setQuestMode(true);
    setState(current => ({ ...current, activeTopicId: "english" }));
    setScreen("quest");
    if (profile) setQuestion(pickNextQuestion(profile, "english", 777));
  };

  const battleDavey = () => {
    if (!profile) return;
    const spelling = ["treasure", "captain", "ocean", "island", "adventure", "mystery"];
    const word = spelling[(profile.answered + profile.level) % spelling.length];
    const letters = word.split("").join(" - ");
    const fake = word.slice(0, -1) + "a";
    const q: Question = {
      id: `davey-${word}`,
      key: `davey|${word}`,
      topic: "english",
      prompt: `Davey Jones spelling bee: Which spelling is correct for the word with letters ${letters}?`,
      options: [word, fake, word.replace("e", "i"), word + "e"].sort(() => Math.random() - 0.5),
      answerIndex: 0,
      correct: word,
      explanation: `${word} is the correct spelling.`,
      difficulty: 5,
      strand: "Spelling",
      interaction: "spellingBee"
    };
    q.answerIndex = q.options.findIndex(o => o === word);
    setQuestion(q);
    setQuestMode(true);
    setScreen("quest");
  };

  const answerDavey = (index: number) => {
    if (!question || !profile) return;
    if (question.key.startsWith("davey") && index === question.answerIndex) {
      const next = defeatDavey(applyAnswer(profile, "english", question, index).profile);
      updateProfile(profile.id, () => next);
      setToast({ title: "Davey defeated!", body: "You won the spelling bee and completed the collection.", kind: "treasure" });
      nextQuestion(next, "english", 333);
      return;
    }
    answer(index);
  };

  if (!profile || !question) return null;

  return <main className="appShell">
    {toast && <div className={`toast ${toast.kind}`}><strong>{toast.title}</strong><span>{toast.body}</span></div>}
    <nav className="topNav">
      <button onClick={() => setScreen("home")}>🏠 Home</button>
      <button onClick={() => setScreen("topics")}>🎯 Quiz topics</button>
      <button onClick={() => setScreen("quest")}>🗺️ Treasure quest</button>
      <button onClick={() => setScreen("progress")}>⭐ Progress</button>
      <button onClick={() => setScreen("settings")}>⚙️ Settings</button>
    </nav>

    {screen === "home" && <section className="heroScreen">
      <div className="heroCard glass">
        <div className="heroLeft">
          <img src="/icon-192.png" className="bigIcon" alt="Family Learning Stars" />
          <p className="eyebrow">Australian Curriculum-inspired learning game</p>
          <h1>Family Learning Stars</h1>
          <p className="bigLead">A colourful quiz and treasure quest for kids, teens and adults. Pick a profile, set an age, choose a topic, earn points, collect stars and level up.</p>
          <div className="ctaRow">
            <button className="primaryBtn" onClick={() => setScreen("topics")}>Choose quiz topic</button>
            <button className="questBtn" onClick={startQuest}>Start treasure quest</button>
          </div>
        </div>
        <div className="scoreOrb">
          <span>{profile.avatar}</span>
          <strong>{profile.name}</strong>
          <small>{ageLabel(profile.ageBand)} • Level {profile.level}/{MAX_LEVELS_PER_AGE}</small>
          <div className="miniStats"><b>{profile.points}</b><span>points</span></div>
          <div className="miniStats"><b>{profile.stars}</b><span>stars</span></div>
        </div>
      </div>
      <ProfileStrip state={state} setState={setState} />
      <section className="infoGrid">
        <Info title="Scoring" body={`Every correct answer is ${POINTS_PER_CORRECT} points. Every ${POINTS_PER_STAR} points earns a star. Every ${STARS_PER_LEVEL} stars gives a new level.`} />
        <Info title="Difficulty" body="The selected age starts the difficulty. Each level nudges the questions up slowly without jumping too hard." />
        <Info title="Question styles" body="The game mixes normal answers, blanks, word tiles, number tiles, true/false, matching, sentence order and odd-one-out tasks." />
      </section>
    </section>}

    {screen === "topics" && <section className="screenCard">
      <Header title="Choose your quiz topic" subtitle="These are now the only quiz topics. Tap one to open a separate quiz page." />
      <div className="topicGrid">
        {TOPICS.map(t => <button key={t.id} className={`topicCard ${t.colour}`} onClick={() => chooseTopic(t.id)}>
          <span className="topicIcon">{t.icon}</span>
          <strong>{t.label}</strong>
          <small>{t.curriculumArea}</small>
          <p>{t.focus}</p>
        </button>)}
      </div>
    </section>}

    {screen === "quiz" && <QuizPage topic={topic} profile={profile} question={question} onAnswer={answer} onSkip={skipQuestion} onBack={() => setScreen("topics")} />}

    {screen === "progress" && <ProgressPage state={state} profile={profile} />}

    {screen === "settings" && <SettingsPage state={state} setState={setState} setProfilePatch={setProfilePatch} />}

    {screen === "quest" && <section className="screenCard questScreen">
      <Header title="Treasure Map Quest" subtitle="Complete 3 correct answers in a row to find each treasure box. Find all 10 pieces of Davey Jones' private collection, then beat him in a spelling bee." />
      <div className="mapPanel">
        {profile.quest.pieces.map((found, i) => <div key={i} className={`mapNode ${found ? "found" : i === profile.quest.currentNode ? "active" : ""}`}><span>{found ? "💎" : i === profile.quest.currentNode ? "❌" : "🟫"}</span><small>{i + 1}</small></div>)}
      </div>
      <div className="questActions">
        <button className="questBtn" onClick={() => { setQuestMode(true); nextQuestion(profile, state.activeTopicId, 55); }}>Quest question</button>
        <button className="primaryBtn" disabled={!profile.quest.daveyUnlocked} onClick={battleDavey}>Battle Davey Jones</button>
      </div>
      {profile.quest.daveyDefeated && <div className="winBanner">🏆 Davey Jones is defeated. Collection complete!</div>}
      <QuizBox profile={profile} question={question} onAnswer={answerDavey} onSkip={skipQuestion} />
    </section>}
  </main>;
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="sectionHeader"><p className="eyebrow">Family Learning Stars</p><h2>{title}</h2><p>{subtitle}</p></div>;
}

function ProfileStrip({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  return <div className="profileStrip">{state.profiles.map(p => <button key={p.id} className={p.id === state.activeProfileId ? "profilePill active" : "profilePill"} onClick={() => setState(s => ({ ...s, activeProfileId: p.id }))}><span>{p.avatar}</span><b>{p.name}</b><small>{ageLabel(p.ageBand)}</small></button>)}</div>;
}

function Info({ title, body }: { title: string; body: string }) {
  return <div className="info"><strong>{title}</strong><p>{body}</p></div>;
}

function QuizPage({ topic, profile, question, onAnswer, onSkip, onBack }: any) {
  return <section className="screenCard quizScreen">
    <div className="quizTop"><button className="ghost" onClick={onBack}>← Topics</button><div><p className="eyebrow">{topic.curriculumArea}</p><h2>{topic.icon} {topic.label}</h2></div><button className="ghost" onClick={onSkip}>Skip</button></div>
    <QuizBox profile={profile} question={question} onAnswer={onAnswer} onSkip={onSkip} />
  </section>;
}

function QuizBox({ profile, question, onAnswer }: { profile: LearnerProfile; question: Question; onAnswer: (index: number) => void; onSkip?: () => void }) {
  return <div className={`quizBox ${question.interaction}`}>
    <div className="questionStats">
      <span>{ageLabel(profile.ageBand)}</span><span>Level {profile.level}</span><span>{question.strand}</span><span>{interactionName[question.interaction]}</span>
    </div>
    <h3>{question.prompt}</h3>
    <p className="hint">{hintFor(question.interaction)}</p>
    <div className="answerGrid">{question.options.map((option, index) => <button key={`${question.key}-${option}`} className={`answerTile tile${index + 1}`} onClick={() => onAnswer(index)}>{option}</button>)}</div>
  </div>;
}

function hintFor(type: Question["interaction"]) {
  if (type === "fillBlank") return "Tap the word or number that best fills the blank.";
  if (type === "sentenceOrder") return "Choose the sentence that is built in the best order.";
  if (type === "oddOneOut") return "Find the tile that does not belong.";
  if (type === "spellingBee") return "Pick the correct spelling.";
  return "The right answer moves to a different tile, so read each option carefully.";
}

function ProgressPage({ state, profile }: { state: AppState; profile: LearnerProfile }) {
  const starPercent = Math.round((progressToStar(profile) / POINTS_PER_STAR) * 100);
  const levelStars = progressToLevelStars(profile);
  return <section className="screenCard progressScreen">
    <Header title="Points & Progress" subtitle="Track points, stars, levels, accuracy and treasure quest progress." />
    <div className="progressCards">
      <Stat label="Points" value={profile.points} />
      <Stat label="Stars" value={profile.stars} />
      <Stat label="Level" value={`${profile.level}/${MAX_LEVELS_PER_AGE}`} />
      <Stat label="Accuracy" value={`${accuracy(profile)}%`} />
    </div>
    <div className="barBlock"><div><b>Next star</b><span>{progressToStar(profile)}/{POINTS_PER_STAR} points</span></div><div className="bar"><i style={{ width: `${starPercent}%` }} /></div></div>
    <div className="barBlock"><div><b>Next level</b><span>{levelStars}/{STARS_PER_LEVEL} stars</span></div><div className="bar"><i style={{ width: `${Math.round((levelStars / STARS_PER_LEVEL) * 100)}%` }} /></div></div>
    <div className="topicProgress">{TOPICS.map(t => <div key={t.id} className="topicLine"><span>{t.icon} {t.label}</span><b>{profile.topicPoints[t.id] ?? 0} pts</b><small>{profile.topicCorrect[t.id] ?? 0}/{profile.topicAnswered[t.id] ?? 0} correct</small></div>)}</div>
    <div className="notes">{CURRICULUM_NOTES.map(n => <p key={n}>• {n}</p>)}</div>
  </section>;
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="stat"><small>{label}</small><strong>{value}</strong></div>; }

function SettingsPage({ state, setState, setProfilePatch }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; setProfilePatch: (id: string, patch: Partial<LearnerProfile>) => void }) {
  return <section className="screenCard settingsScreen">
    <Header title="Settings" subtitle="Edit profiles, age difficulty, save data, reset progress or export your family save file." />
    <div className="settingsGrid">
      {state.profiles.map(p => <div key={p.id} className="settingCard">
        <label>Name<input value={p.name} onChange={e => setProfilePatch(p.id, { name: e.target.value })} /></label>
        <label>Avatar<input value={p.avatar} maxLength={2} onChange={e => setProfilePatch(p.id, { avatar: e.target.value })} /></label>
        <label>Age / difficulty starting point<select value={p.ageBand} onChange={e => setProfilePatch(p.id, { ageBand: e.target.value as AgeBand })}>{AGE_BANDS.map(a => <option key={a} value={a}>{ageLabel(a)}</option>)}</select></label>
      </div>)}
    </div>
    <div className="settingsActions">
      <button className="ghost" onClick={() => download("family-learning-stars-save.json", exportState(state))}>Export save</button>
      <label className="ghost fileBtn">Import save<input type="file" accept="application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const parsed = importState(await file.text()); if (parsed) setState(parsed); }} /></label>
      <button className="danger" onClick={() => confirm("Reset all progress?") && setState(getDefaultState())}>Reset all progress</button>
    </div>
    <div className="pwaBox"><strong>PWA ready</strong><p>This build includes manifest files, icons and a service worker for PWA Builder.</p></div>
  </section>;
}
