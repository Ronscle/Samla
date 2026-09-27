/* ============================================================
   SHARED v3 — primitives + note card
   type tiers: title 38 · card 22 · small 17 · body 16 · sub 14 · label 11
   ============================================================ */
(function () {
  const { friend, circle, MODES } = window.SamlaData;
  const I = window.Icons;
  const h = React.createElement;

  function Avatar({ id, size = 34, ring }) {
    const f = friend(id) || { initials: "?", color: "#5E788E" };
    const fs = Math.max(10, Math.round(size * 0.34));
    return h("span", { className: "av", "aria-hidden": "true",
      style: { width: size, height: size, background: f.color, fontSize: fs, textTransform: "uppercase", boxShadow: ring ? `0 0 0 2px ${ring}` : undefined } }, f.initials);
  }

  function AvatarStack({ ids, size = 30, max = 4 }) {
    const shown = ids.slice(0, max);
    const extra = ids.length - shown.length;
    return h("div", { className: "av-stack" },
      shown.map((id) => h(Avatar, { key: id, id, size })),
      extra > 0 && h("span", { key: "more", className: "av", style: { width: size, height: size, background: "var(--cream)", color: "var(--ink)", fontSize: Math.round(size * 0.32), marginLeft: -9, boxShadow: "0 0 0 2px var(--paper)" } }, "+" + extra));
  }

  function clock() { const d = new Date(); const m = d.getMinutes(); return d.getHours() + ":" + (m < 10 ? "0" + m : m); }

  function StatusBar({ dark }) {
    const [now, setNow] = React.useState(clock);
    React.useEffect(() => { const id = setInterval(() => setNow(clock()), 30000); return () => clearInterval(id); }, []);
    return h("div", { className: "statusbar" + (dark ? " on-dark" : "") },
      h("span", { className: "time" }, now),
      h("span", { className: "sys" }, h(I.StatusSys, { color: dark ? "var(--paper)" : "var(--ink)" })));
  }

  function ScreenHead({ onBack, title, eyebrow, eyebrowTone = "dusk", right, accent }) {
    return h("div", { className: "pad", style: { paddingTop: 6, paddingBottom: 14 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 12, minHeight: 30 } },
        onBack && h("button", { onClick: onBack, "aria-label": "back", className: "back-btn" }, h(I.Back, { size: 26 })),
        right && h("div", { style: { marginLeft: "auto" } }, right)),
      eyebrow && h("div", { className: `eyebrow ${eyebrowTone}`, style: { marginTop: 14 } }, eyebrow),
      title && h("h1", { className: "t-title", style: { marginTop: 8 } }, title),
      accent && h("p", { className: "t-accent", style: { marginTop: 10 } }, accent));
  }

  function ModeTag({ mode }) { const m = MODES[mode]; return h("span", { className: `note-mode ${m.cls}` }, m.label); }

  function namesLine(ids) {
    const n = (ids || []).map((id) => id === "you" ? "you" : (friend(id) || {}).name).filter(Boolean);
    if (!n.length) return "";
    if (n.length === 1) return n[0];
    return n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
  }
  // only ever shown to the author — a friend never sees your other circles
  function audience(b) {
    const cids = b.circles && b.circles.length ? b.circles : (b.circle ? [b.circle] : []);
    const cs = cids.map(circle).filter(Boolean).map((c) => c.name);
    const ps = (b.people || []).map((id) => (friend(id) || {}).name).filter(Boolean);
    return [...cs, ...ps].join(" \u00b7 ");
  }
  const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const ACCENTS = { morning: "first coffee.", afternoon: "slow afternoon.", evening: "golden hour.", night: "late and easy." };
  function dayPart(d = new Date()) {
    const hr = d.getHours();
    const part = hr < 5 ? "night" : hr < 12 ? "morning" : hr < 17 ? "afternoon" : hr < 22 ? "evening" : "night";
    return { part, label: DAYS[d.getDay()] + " " + part, accent: ACCENTS[part] };
  }
  function expiryFor(mode, day, now = Date.now()) {
    const d = new Date(now);
    const endOf = (days) => { const e = new Date(d); e.setDate(e.getDate() + days); e.setHours(23, 59, 59, 999); return e.getTime(); };
    if (mode === "now") return now + 3 * 3600e3;
    if (mode === "later") return endOf(0);
    if (day === "tomorrow") return endOf(1);
    if (day === "saturday") return endOf((6 - d.getDay() + 7) % 7);
    if (day === "sunday" || day === "this weekend") return endOf((7 - d.getDay()) % 7);
    return endOf(0);
  }
  function fadesLine(b) {
    if (!b.expiresAt) return "fades on its own when the day is done.";
    const e = new Date(b.expiresAt), n = new Date();
    const sameDay = e.toDateString() === n.toDateString();
    if (sameDay && e.getHours() === 23 && e.getMinutes() === 59) return "fades on its own at midnight.";
    if (sameDay) { const m = e.getMinutes(); return "fades on its own around " + e.getHours() + ":" + (m < 10 ? "0" + m : m) + "."; }
    return "fades on its own after " + DAYS[e.getDay()] + ".";
  }
  function upFor(b) { const v = b.phrase === "going" ? "going to" : "up for"; return b.mine ? "you’re " + v : ((friend(b.author) || {}).name || "someone") + " is " + v; }

  /* words roll up in place — transform-only, widest word sets the width */
  function RollWords({ words, every = 3000, index, className }) {
    const [auto, setAuto] = React.useState(0);
    const controlled = typeof index === "number";
    React.useEffect(() => {
      if (controlled || !every) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const t = setInterval(() => setAuto((i) => (i + 1) % words.length), every);
      return () => clearInterval(t);
    }, [controlled, every, words.length]);
    const i = controlled ? index : auto;
    return h("span", { className: "roll" + (className ? " " + className : ""), "aria-live": controlled ? "polite" : "off" },
      h("span", { className: "roll-track", style: { transform: `translateY(${-i * 100 / words.length}%)` } },
        words.map((w, k) => h("span", { key: k, className: "roll-w", "aria-hidden": k !== i }, w))));
  }

  /* note card: place fragment on top, then who · title · line */
  function NoteCard({ b, onOpen, delay = 0 }) {
    const { PlaceArt, detectActivity } = window.SamlaActivity;
    const taggers = (b.taggedAlong || []).filter((x) => x !== "you");
    return h("article", {
      className: "note note-v3" + (b.mine ? " mine" : ""), onClick: onOpen, role: "button", tabIndex: 0,
      onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen && onOpen(); } },
      style: { animation: `rise 600ms var(--ease) ${delay}ms both` } },
      h("div", { style: { position: "relative" } },
        h(PlaceArt, { place: b.place, mode: b.mode, kind: b.kind || detectActivity(b.title), height: 96 }),
        h("span", { className: "place-art-mode" }, h(ModeTag, { mode: b.mode }))),
      h("div", { className: "note-v3-body" },
        h("div", { className: "note-who" },
          !b.mine && h(Avatar, { id: b.author, size: 22 }),
          h("span", { className: "t-label" }, upFor(b)),
          h("span", { className: "t-label", style: { marginLeft: "auto", textAlign: "right" } }, b.timeLabel)),
        h("h3", { className: "t-card", style: { marginTop: 8 } }, b.title),
        b.note && h("p", { className: "t-sub clamp-2", style: { marginTop: 6 } }, b.note),
        b.mine && h("p", { className: "t-sub", style: { marginTop: 10, display: "flex", alignItems: "center", gap: 8 } },
          taggers.length ? h(React.Fragment, null, h(AvatarStack, { ids: taggers, size: 22 }), namesLine(taggers) + " tagging along") : "quiet so far \u2014 give it time.")));
  }

  window.Samla = window.Samla || {};
  Object.assign(window.Samla, { Avatar, AvatarStack, StatusBar, ScreenHead, ModeTag, NoteCard, namesLine, audience, dayPart, expiryFor, fadesLine, upFor, RollWords });
})();
