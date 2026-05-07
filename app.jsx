/* eslint-disable */
const { useState, useEffect, useMemo, useRef } = React;

const D = window.AOSP_DATA;

// Translate helper
const useT = (lang) => (obj) => {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) return obj.map((p) => (typeof p === "string" ? p : p[lang])).join("");
  return obj[lang] ?? obj.en ?? obj.zh ?? "";
};

function TopBar({ lang, setLang }) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot"></span>
        <span>AOSP × Agentic AI</span>
        <small>· Pixel 8 Workflow Visualizer</small>
      </div>
      <div className="lang-toggle" role="tablist" aria-label="language">
        <button className={lang === "zh" ? "on" : ""} onClick={() => setLang("zh")}>繁中</button>
        <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
      </div>
    </div>
  );
}

function Hero({ lang }) {
  const t = useT(lang);
  const titleParts = D.hero.title[lang];
  return (
    <div className="hero">
      <div className="hero-card tilt">
        <span className="kicker">{t(D.hero.kicker)}</span>
        <h1>
          {titleParts.map((p, i) =>
            i === 1 || i === 3 ? <em key={i}>{p}</em> : <span key={i}>{p}</span>
          )}
        </h1>
        <p className="hero-sub">{t(D.hero.sub)}</p>
        <div className="hero-meta">
          {D.hero.chips[lang].map((c, i) => (
            <span className="chip" key={i}>
              <span className="swatch" style={{ background: ["var(--accent)","var(--accent-2)","var(--accent-3)","var(--accent-4)"][i % 4] }}></span>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="hero-card hero-stat">
        <h3>{lang === "zh" ? "時間預算 · Time budget" : "Time budget"}</h3>
        <div className="stat-grid">
          {D.hero.stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="num">{s.num}</div>
              <div className="lbl">{t(s.lbl)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ num, title, sub }) {
  return (
    <div className="section-head">
      <span className="num">{num}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function AlignmentSection({ lang }) {
  const t = useT(lang);
  const [aligned, setAligned] = useState(true);
  return (
    <section data-screen-label="01 Alignment">
      <SectionHead num="01" title={t(D.alignment.head)} sub={t(D.alignment.sub)} />
      <div className="align-wrap">
        <div className="align-tracks">
          {D.alignment.tracks.map((tr, i) => (
            <div className="track" key={tr.key} style={{ borderColor: "var(--ink)" }}>
              <div className="head">
                <div className="icon-circ" style={{ background: tr.color, color: "var(--paper)" }}>{i + 1}</div>
                <span className="label">{t(tr.label)}</span>
              </div>
              <h4>{tr.icon} {t(tr.title)}</h4>
              <div className="val" style={{ background: aligned ? "#FFFCF5" : "#FEE2E2" }}>
                {aligned ? tr.valueOk : (i === 0 ? tr.valueOk : tr.valueBad)}
              </div>
              <div className="src">↳ {t(tr.src)}</div>
            </div>
          ))}
        </div>
        <div className={"align-status " + (aligned ? "ok" : "bad")}>
          <span style={{ fontSize: 22 }}>{aligned ? "✅" : "💥"}</span>
          <span>{aligned ? t(D.alignment.okMsg) : t(D.alignment.badMsg)}</span>
        </div>
        <div className="align-controls">
          <button className={"btn " + (aligned ? "primary" : "")} onClick={() => setAligned(true)}>
            {lang === "zh" ? "對齊狀態" : "Aligned"}
          </button>
          <button className={"btn " + (!aligned ? "danger" : "")} onClick={() => setAligned(false)}>
            {lang === "zh" ? "故意對不齊" : "Force mismatch"}
          </button>
        </div>
        {!aligned && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {D.alignment.why.map((w, i) => (
              <div className="tip warn" key={i}>⚠ {t(w)}</div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BenefitsSection({ lang }) {
  const t = useT(lang);
  const f = D.benefits.formula;
  return (
    <section data-screen-label="02 Benefits">
      <SectionHead num="02" title={t(D.benefits.head)} sub={t(D.benefits.sub)} />
      <div className="benefits-wrap">
        <div className="benefits-formula">
          <div className="formula-pill input">
            <span className="top">👤 {t(f.lhs)}</span>
            <span className="val">{f.input}</span>
          </div>
          <span className="formula-arrow">→</span>
          <div className="formula-pill engine">
            <span className="top" style={{ color: "#fbbf24" }}>🤖 Agent Skill</span>
            <span className="val">aosp-build</span>
          </div>
          <span className="formula-arrow">→</span>
          <div className="formula-pill output">
            <span className="top">📦 {t(f.rhs)}</span>
            <span className="val">{t(f.output)}</span>
          </div>
        </div>
        <div className="benefit-grid">
          {D.benefits.cards.map((c, i) => (
            <div className="benefit-card" key={i}>
              <div className="b-ico">{c.ico}</div>
              <h4>{t(c.title)}</h4>
              <p>{t(c.body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection({ lang }) {
  const t = useT(lang);
  const stages = D.pipeline;
  const [active, setActive] = useState(0);
  const [states, setStates] = useState(() => stages.map((_, i) => (i === 0 ? "running" : "pending")));
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const stepDurations = [800, 1000, 1600, 1200, 2000, 1500, 1500];

  const advance = (i, ss) => {
    if (i >= stages.length) {
      setRunning(false);
      return;
    }
    // Pause for the human step (unlock)
    if (stages[i].assignee === "human") {
      const next = ss.slice();
      next[i] = "paused";
      setStates(next);
      setActive(i);
      setRunning(false);
      return;
    }
    const next = ss.slice();
    next[i] = "running";
    setStates(next);
    setActive(i);
    timerRef.current = setTimeout(() => {
      const finished = next.slice();
      finished[i] = "done";
      if (i + 1 < stages.length) finished[i + 1] = stages[i + 1].assignee === "human" ? "paused" : "running";
      setStates(finished);
      setActive(i + 1 < stages.length ? i + 1 : i);
      advance(i + 1, finished);
    }, stepDurations[i] || 1200);
  };

  const start = () => {
    clearTimeout(timerRef.current);
    setRunning(true);
    const fresh = stages.map((_, i) => (i === 0 ? "running" : "pending"));
    setStates(fresh);
    setActive(0);
    advance(0, fresh);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setRunning(false);
    setStates(stages.map((_, i) => (i === 0 ? "running" : "pending")));
    setActive(0);
  };

  const confirmHuman = () => {
    const idx = states.indexOf("paused");
    if (idx < 0) return;
    const next = states.slice();
    next[idx] = "done";
    if (idx + 1 < stages.length) next[idx + 1] = "running";
    setStates(next);
    setActive(idx + 1 < stages.length ? idx + 1 : idx);
    setRunning(true);
    advance(idx + 1, next);
  };

  const doneCount = states.filter((s) => s === "done").length;
  const progress = (doneCount / stages.length) * 100;

  const cur = stages[active] || stages[0];
  const isPaused = states[active] === "paused";

  return (
    <section data-screen-label="03 Pipeline">
      <SectionHead
        num="03"
        title={lang === "zh" ? "互動式 Pipeline 模擬" : "Interactive pipeline simulation"}
        sub={lang === "zh" ? "點 ▶ 模擬整條 pipeline。AI 自動推進，遇到 human-only 步驟會暫停等你按確認。" : "Hit ▶ to simulate. The AI advances on its own; on a human-only step it pauses for your confirmation."}
      />
      <div className="pipeline-shell">
        <div className="pipeline-controls">
          <button className="btn primary" onClick={start} disabled={running}>
            {running ? "▶ running…" : "▶ Run pipeline"}
          </button>
          {isPaused && (
            <button className="btn danger" onClick={confirmHuman}>
              🔓 {lang === "zh" ? "我已確認，繼續" : "I've confirmed, continue"}
            </button>
          )}
          <button className="btn ghost" onClick={reset}>↺ reset</button>
          <div className="pipeline-progress">
            <div className="bar" style={{ width: progress + "%" }}></div>
          </div>
          <span className="muted" style={{ minWidth: 60, textAlign: "right" }}>
            {doneCount}/{stages.length}
          </span>
        </div>

        <div className="pipeline-stages">
          {stages.map((s, i) => (
            <div
              key={s.id}
              className={"stage " + (active === i ? "active" : "")}
              data-state={states[i]}
              onClick={() => setActive(i)}
            >
              <div className="step-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-name">{t(s.name)}</div>
              <div className="step-time">⏱ {s.time}</div>
            </div>
          ))}
        </div>

        <div className="stage-detail">
          <div>
            <div className="row" style={{ marginBottom: 8 }}>
              <span className={"assignee " + cur.assignee}>
                {cur.assignee === "ai" ? "🤖 AI" : "👤 Human"}
              </span>
              <span className="muted">⏱ {cur.time}</span>
              <span className="muted">· stage {String(active + 1).padStart(2, "0")} / {stages.length}</span>
            </div>
            <h4>{cur.icon} {t(cur.name)}</h4>
            <p className="desc">{t(cur.desc)}</p>
            <div className={"tip " + (cur.warn ? "warn" : "")} dangerouslySetInnerHTML={{ __html: t(cur.tip) }}></div>
          </div>
          <div>
            <div className="cmd" dangerouslySetInnerHTML={{ __html: cur.cmd }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HumanAISection({ lang }) {
  const t = useT(lang);
  const ai = D.human_ai.ai;
  const human = D.human_ai.human;
  return (
    <section data-screen-label="04 Boundary">
      <SectionHead num="04" title={t(D.human_ai.head)} sub={t(D.human_ai.sub)} />
      <div className="split">
        <div className="split-side ai">
          <span className="role-tag">🤖 {t(ai.role)}</span>
          <h3>{t(ai.title)}</h3>
          <ul>
            {ai.items.map((it, i) => (
              <li key={i}><span className="ico">{it.ico}</span><span>{t(it)}</span></li>
            ))}
          </ul>
        </div>
        <div className="split-divider"><div className="vs">VS</div></div>
        <div className="split-side human">
          <span className="role-tag">👤 {t(human.role)}</span>
          <h3>{t(human.title)}</h3>
          <ul>
            {human.items.map((it, i) => (
              <li key={i}><span className="ico">{it.ico}</span><span>{t(it)}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="tip" style={{ marginTop: 16, fontSize: 14 }}>
        🔑 {lang === "zh"
          ? "關鍵原則：凡是 不可逆 的操作，或是 需要上下文判斷 的問題，AI 不自動執行，一律暫停等人確認。"
          : "Key rule: Anything irreversible, or anything needing contextual judgement, must pause for human confirmation."}
      </div>
    </section>
  );
}

function Timeline({ rows, totalSegs = 100 }) {
  return (
    <div className="shift-timelines">
      {rows.map((r, i) => {
        const total = r.segs.reduce((a, [_, w]) => a + w, 0);
        return (
          <div className="timeline-row" key={i}>
            <span className="name">{r.name}</span>
            <div className="timeline-bar">
              {r.segs.map(([cls, w, label], j) => (
                <div key={j} className={"seg " + cls} style={{ flex: w + " 0 0" }}>{label}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ShiftSection({ lang }) {
  const t = useT(lang);
  return (
    <section data-screen-label="05 Shift">
      <SectionHead num="05" title={t(D.shift.head)} sub={t(D.shift.sub)} />
      <div className="shift">
        <div className="shift-card before">
          <span className="role">{t(D.shift.before.role)}</span>
          <h3 style={{ marginTop: 8 }}>{t(D.shift.before.title)} · 1×</h3>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-soft)" }}>{t(D.shift.before.desc)}</p>
          <Timeline rows={D.shift.before.timelines} />
        </div>
        <div className="shift-card after">
          <span className="role">{t(D.shift.after.role)}</span>
          <h3 style={{ marginTop: 8 }}>{t(D.shift.after.title)} · 3×</h3>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-soft)" }}>{t(D.shift.after.desc)}</p>
          <Timeline rows={D.shift.after.timelines} />
        </div>
      </div>
    </section>
  );
}

function SlotsSection({ lang }) {
  const t = useT(lang);
  const [slot, setSlot] = useState("a");
  const [flashing, setFlashing] = useState(false);

  const flipSlot = () => {
    setFlashing(true);
    setTimeout(() => {
      setSlot((s) => (s === "a" ? "b" : "a"));
      setFlashing(false);
    }, 700);
  };

  return (
    <section data-screen-label="06 Slots">
      <SectionHead num="06" title={t(D.slots.head)} sub={t(D.slots.sub)} />
      <div className="slots-wrap">
        <div className="slots-card">
          <div className="phone">
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#94a3b8", marginBottom: 8, textAlign: "center" }}>
              Pixel 8 · current slot: <b style={{ color: flashing ? "#fbbf24" : "#86efac" }}>{flashing ? "flashing…" : slot.toUpperCase()}</b>
            </div>
            <div className="partition-list">
              <div className="partition" style={{ background: "transparent", border: "none", padding: "2px 10px" }}>
                <div className="p-name" style={{ color: "#94a3b8", fontSize: 10 }}>partition</div>
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 10 }}>slot A</div>
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 10 }}>slot B</div>
              </div>
              {D.slots.partitions.map((p, i) => (
                <div className="partition" key={i}>
                  <div className="p-name">{p.name}</div>
                  {p.shared ? (
                    <>
                      <div className="slot" style={{ gridColumn: "span 2", background: "#1e3a5f", borderColor: "#3b82f6", color: "#93c5fd" }}>
                        shared
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={"slot " + (slot === "a" ? "active" : "")}>{slot === "a" ? "active" : "ready"}</div>
                      <div className={"slot " + (slot === "b" ? "active" : "")}>{slot === "b" ? "active" : "ready"}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="slot-controls">
            <button className="btn primary" onClick={flipSlot} disabled={flashing}>
              ⚡ fastboot flashall
            </button>
            <button className="btn" onClick={() => setSlot("a")} disabled={flashing}>boot slot A</button>
            <button className="btn" onClick={() => setSlot("b")} disabled={flashing}>boot slot B</button>
          </div>
        </div>
        <div className="slots-card slot-explain">
          <h4>{lang === "zh" ? "fail-safe 設計" : "fail-safe design"}</h4>
          <p>{lang === "zh"
            ? "兩份完整的系統分區（A/B），fastboot flashall 把新 image 寫進非當前 slot 並切過去；下次再寫回另一邊。壞了就切回去，這就是內建的救磚機制。"
            : "Two full sets of system partitions (A/B). flashall writes the new image to the inactive slot and switches over; next time it writes back. If a slot is broken, switch — built-in brick-recovery."}
          </p>
          <ul>
            {D.slots.explain.map((e, i) => <li key={i}>{t(e)}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ErrorsSection({ lang }) {
  const t = useT(lang);
  return (
    <section data-screen-label="07 Errors">
      <SectionHead num="07" title={t(D.errors.head)} sub={lang === "zh" ? "點卡片看修法。最右側貼出實際指令或檔案路徑。" : "Click a card to inspect the fix — actual commands and file paths inside."} />
      <div className="err-grid">
        {D.errors.items.map((e, i) => (
          <div className="err-card" key={i}>
            <span className="err-tag">{e.tag}</span>
            <h4>{typeof e.msg === "string" ? e.msg : t(e.msg)}</h4>
            <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>↳ {t(e.cause)}</div>
            <div className="fix">
              <span className="label">{lang === "zh" ? "修法" : "Fix"}</span>
              {typeof e.fix === "string" && e.fix.includes("<")
                ? <div className="cmd" dangerouslySetInnerHTML={{ __html: e.fix }}></div>
                : <div>{t(e.fix)}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ lang }) {
  return (
    <div className="footer">
      <div>
        <span className="tag">SOURCES</span>{"  "}
        <a href="https://alanhc.github.io/til/docs/aosp_pixel_full_workflow" target="_blank">alanhc.github.io · AOSP full workflow</a>
        {"  ·  "}
        <a href="https://hackmd.io/@alanhc/Sk6u4igp-e" target="_blank">HackMD · Firmware Dev & Agentic AI</a>
      </div>
      <div style={{ opacity: 0.7, fontSize: 13 }}>
        {lang === "zh" ? "「讓 AI 跑 Build。你來解難題。」" : "\"Let AI handle the builds. You solve the hard parts.\""}
      </div>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState("zh");
  return (
    <div className="app">
      <TopBar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <AlignmentSection lang={lang} />
      <BenefitsSection lang={lang} />
      <PipelineSection lang={lang} />
      <HumanAISection lang={lang} />
      <ShiftSection lang={lang} />
      <SlotsSection lang={lang} />
      <ErrorsSection lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
