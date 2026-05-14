"use client";

import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS, BOOST_MULTIPLIER, CURRICULUM_NOTES, LEVELS_PER_AGE, TOPICS } from "../lib/curriculum";
import { applyAnswer, getAccuracy, getBoostCountdown, getBoostActive, getOverallLevel, getOverallProgressPercent, getStarsToNextBoost } from "../lib/game";
import { buildQuestion, estimateQuestionCount } from "../lib/question-bank";
import { exportState, getDefaultState, importState, loadState, saveState, type AppState } from "../lib/storage";
import type { Celebration, LearnerProfile, Question, TopicId } from "../lib/types";

const download = (filename: string, data: string) => {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.href = url;
  element.download = filename;
  element.click();
  URL.revokeObjectURL(url);
};

type Screen = "home" | "quiz" | "progress" | "parent";

export default function HomePage() {
  const [state, setState] = useState<AppState>(getDefaultState);
  const [screen, setScreen] = useState<Screen>("home");
  const [question, setQuestion] = useState<Question | null>(null);
  const [result, setResult] = useState<{ correct: boolean; points: number; message: string } | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => setState(loadState()), []);
  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  const activeProfile = useMemo(
    () => state.profiles.find((profile) => profile.id === state.activeProfileId) ?? state.profiles[0],
    [state]
  );
  const activeTopic = TOPICS.find((topic) => topic.id === state.activeTopicId) ?? TOPICS[0];

  useEffect(() => {
    if (!activeProfile) return;
    setQuestion(buildQuestion(activeProfile, state.activeTopicId));
  }, [activeProfile, state.activeTopicId]);

  if (!activeProfile || !question) return null;

  const overallLevel = getOverallLevel(activeProfile);
  const accuracy = getAccuracy(activeProfile);
  const progressPercent = getOverallProgressPercent(activeProfile);
  const boostText = getBoostCountdown(activeProfile, now);
  const boostActive = getBoostActive(activeProfile, now);

  const updateProfile = (profileId: string, updater: (profile: LearnerProfile) => LearnerProfile) => {
    setState((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => (profile.id === profileId ? updater(profile) : profile))
    }));
  };

  const selectTopic = (topicId: TopicId) => {
    setResult(null);
    setState((current) => ({ ...current, activeTopicId: topicId }));
    setScreen("quiz");
  };

  const answerQuestion = (index: number) => {
    const outcome = applyAnswer(activeProfile, state.activeTopicId, question, index);
    updateProfile(activeProfile.id, () => outcome.profile);
    setResult(outcome.result);
    setCelebration(outcome.celebration);
    setQuestion(buildQuestion(outcome.profile, state.activeTopicId));
  };

  const renameProfile = (profileId: string, patch: Partial<LearnerProfile>) => {
    updateProfile(profileId, (profile) => ({ ...profile, ...patch }));
  };

  const doExport = () => download("family-learning-stars-save.json", exportState(state));
  const doImport = (text: string) => {
    const parsed = importState(text);
    if (parsed) setState(parsed);
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="heroCopy">
          <img className="appIcon" src="/icon-192.png" alt="Learning Stars app icon" />
          <div>
            <p className="eyebrow">Child learning • Offline ready • Australian curriculum inspired</p>
            <h1>Family Learning Stars</h1>
            <p className="heroText">
              Pick a child profile, choose a topic, then answer questions on a separate quiz page. Questions begin very easy for the selected age band and become harder as levels rise.
            </p>
          </div>
        </div>
        <div className="heroStats">
          <StatCard label="Question variants" value={estimateQuestionCount().toLocaleString()} />
          <StatCard label="Child age band" value={activeProfile.ageBand} />
          <StatCard label="Boost" value={boostText} />
        </div>
      </section>

      <section className="panel profilePanel">
        <div className="panelHeader">
          <h2>1. Choose the child</h2>
          <div className="buttonRow">
            <button className="ghostBtn" onClick={() => setProfileEditorOpen((open) => !open)}>{profileEditorOpen ? "Hide editor" : "Edit profiles"}</button>
            <button className="ghostBtn" onClick={() => setScreen("progress")}>Points & progress</button>
            <button className="ghostBtn" onClick={() => setScreen("parent")}>Parent view</button>
          </div>
        </div>
        <div className="profilesGrid">
          {state.profiles.map((profile) => {
            const selected = profile.id === activeProfile.id;
            return (
              <button key={profile.id} className={`profileCard ${selected ? "selected" : ""}`} onClick={() => setState((current) => ({ ...current, activeProfileId: profile.id }))}>
                <div className="profileAvatar">{profile.avatar}</div>
                <div>
                  <strong>{profile.name}</strong>
                  <div>Age {profile.ageBand}</div>
                  <div>Level {getOverallLevel(profile)} / {LEVELS_PER_AGE}</div>
                  <div>{profile.stars} stars</div>
                </div>
              </button>
            );
          })}
        </div>
        {profileEditorOpen ? (
          <div className="editorGrid">
            {state.profiles.map((profile) => (
              <div key={profile.id} className="editorCard">
                <label>Name<input value={profile.name} maxLength={20} onChange={(event) => renameProfile(profile.id, { name: event.target.value })} /></label>
                <label>Avatar<input value={profile.avatar} maxLength={2} onChange={(event) => renameProfile(profile.id, { avatar: event.target.value })} /></label>
                <label>Child age band<select value={profile.ageBand} onChange={(event) => renameProfile(profile.id, { ageBand: event.target.value as LearnerProfile["ageBand"] })}>{AGE_BANDS.map((ageBand) => <option key={ageBand} value={ageBand}>{ageBand}</option>)}</select></label>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {screen === "home" ? (
        <section className="panel">
          <div className="panelHeader"><h2>2. Choose a topic</h2><span className="pill">No repeat questions for at least 20 turns</span></div>
          <div className="topicTiles">
            {TOPICS.map((topic) => (
              <button key={topic.id} className="topicTile" onClick={() => selectTopic(topic.id)}>
                <span className="topicIcon">{topic.icon}</span>
                <strong>{topic.label}</strong>
                <small>{topic.curriculumArea}</small>
                <span>Level {activeProfile.topicLevel[topic.id]}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {screen === "quiz" ? (
        <section className="panel quizPanel">
          <div className="panelHeader">
            <button className="ghostBtn" onClick={() => setScreen("home")}>← Topics</button>
            <h2>{activeTopic.icon} {activeTopic.label}</h2>
            <button className="ghostBtn" onClick={() => setQuestion(buildQuestion(activeProfile, state.activeTopicId))}>Skip</button>
          </div>
          <div className="statsRow">
            <StatCard label="Overall level" value={`${overallLevel}/${LEVELS_PER_AGE}`} />
            <StatCard label="Topic level" value={`${activeProfile.topicLevel[state.activeTopicId]}/${LEVELS_PER_AGE}`} />
            <StatCard label="Accuracy" value={`${accuracy}%`} />
            <StatCard label="Stars" value={`${activeProfile.stars}`} />
          </div>
          <div className="progressBlock">
            <div className="progressLabel"><span>Progress to next level</span><span>{progressPercent}%</span></div>
            <div className="progressBar"><span style={{ width: `${progressPercent}%` }} /></div>
            {boostActive ? <p className="boostNote">x{BOOST_MULTIPLIER} points active now.</p> : <p className="boostNote">Next boost in {getStarsToNextBoost(activeProfile)} stars.</p>}
          </div>
          <div className={`questionCard ${question.interaction}`}>
            <div className="questionMeta"><span>Age {activeProfile.ageBand}</span><span>{question.strand}</span><span>Difficulty {question.difficulty}</span><span>{question.interaction === "fillBlank" ? "Fill the blank" : question.interaction === "wordTiles" ? "Word tiles" : question.interaction === "numberTiles" ? "Number tiles" : "Choose"}</span></div>
            <h3>{question.prompt}</h3>
            {question.interaction === "fillBlank" ? <p className="activityHint">Tap the tile that best fills the blank.</p> : null}
            {question.interaction === "wordTiles" || question.interaction === "numberTiles" ? <p className="activityHint">Pick the matching tile. The correct tile moves around each question.</p> : null}
            <div className="answersGrid">
              {question.options.map((option, index) => (
                <button key={`${question.id}-${option}`} className={`answerBtn tile${(index + question.id.charCodeAt(0) + question.id.charCodeAt(question.id.length - 1)) % 4}`} onClick={() => answerQuestion(index)}>{option}</button>
              ))}
            </div>
          </div>
          {result ? <div className={`resultCard ${result.correct ? "correct" : "wrong"}`}><strong>{result.correct ? `Correct! +${result.points} points` : "Not quite — keep going"}</strong><p>{result.message}</p></div> : null}
        </section>
      ) : null}


      {screen === "progress" ? (
        <section className="panel progressView">
          <div className="panelHeader"><h2>Points & progress</h2><button className="ghostBtn" onClick={() => setScreen("home")}>Back home</button></div>
          <p className="heroText">{activeProfile.name}'s age band is used first, then topic levels slowly increase the difficulty. Younger children stay on easier school-style questions for longer.</p>
          <div className="statsRow">
            <StatCard label="Total points" value={activeProfile.totalXp.toLocaleString()} />
            <StatCard label="Overall level" value={`${overallLevel}/${LEVELS_PER_AGE}`} />
            <StatCard label="Questions answered" value={`${activeProfile.answered}`} />
            <StatCard label="Questions seen" value={`${(activeProfile.answeredQuestionIds ?? []).length}`} />
          </div>
          <div className="progressBlock">
            <div className="progressLabel"><span>Next overall level</span><span>{progressPercent}%</span></div>
            <div className="progressBar"><span style={{ width: `${progressPercent}%` }} /></div>
          </div>
          <div className="topicProgressGrid">
            {TOPICS.map((topic) => {
              const topicXp = activeProfile.topicXp[topic.id] ?? 0;
              const topicProgress = Math.round(((topicXp % 2500) / 2500) * 100);
              return (
                <div key={topic.id} className="topicProgressCard">
                  <h3>{topic.icon} {topic.label}</h3>
                  <p>{topic.curriculumArea}</p>
                  <strong>Level {activeProfile.topicLevel[topic.id]} • {topicXp.toLocaleString()} pts</strong>
                  <div className="miniProgress"><span style={{ width: `${topicProgress}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {screen === "parent" ? (
        <section className="panel parentView">
          <div className="panelHeader"><h2>Parent summary</h2><button className="ghostBtn" onClick={() => setScreen("home")}>Back home</button></div>
          <p>This app saves progress locally on the device. It can run offline after the first browser load or inside an Android wrapper.</p>
          <div className="summaryGrid">
            {state.profiles.map((profile) => <div key={profile.id} className="summaryCard"><h4>{profile.avatar} {profile.name}</h4><p>Age band: {profile.ageBand}</p><p>Answered: {profile.answered}</p><p>Correct: {profile.correct}</p><p>Accuracy: {getAccuracy(profile)}%</p><p>Stars: {profile.stars}</p><p>Achievements: {profile.achievements.length ? profile.achievements.join(", ") : "None yet"}</p></div>)}
          </div>
          <div className="ioRow">
            <button className="primaryBtn" onClick={doExport}>Export progress</button>
            <label className="ghostBtn uploadLabel">Import progress<input type="file" accept="application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; doImport(await file.text()); }} /></label>
          </div>
        </section>
      ) : null}

      <section className="panel curriculumPanel">
        <h2>Curriculum-inspired coverage</h2>
        <div className="curriculumGrid">{TOPICS.map((topic) => <div key={topic.id} className="curriculumCard"><h3>{topic.icon} {topic.label}</h3><p><strong>Area:</strong> {topic.curriculumArea}</p><p><strong>Focus:</strong> {topic.focus}</p></div>)}</div>
        <ul className="notesList">{CURRICULUM_NOTES.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>

      {celebration ? <div className="celebrationOverlay" onClick={() => setCelebration(null)}><div className="celebrationCard" onClick={(event) => event.stopPropagation()}><div className="celebrationBurst">✨ ⭐ 🌠 ⭐ ✨</div><h2>{celebration.title}</h2><p>{celebration.subtitle}</p>{"endsAt" in celebration ? <p className="boostNote">Boost ends in {Math.max(0, Math.ceil((celebration.endsAt - now) / 1000))} seconds.</p> : null}<button className="primaryBtn" onClick={() => setCelebration(null)}>Awesome!</button></div></div> : null}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="statCard"><span>{label}</span><strong>{value}</strong></div>;
}
